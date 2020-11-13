/**
 * Module imports
 */

const { Client, Collection } = require('discord.js');
const { readdirSync } = require("fs");
const { join } = require("path");

let TOKEN, PREFIX;
try {
  const auth = require('./auth.json');
  TOKEN = auth.token;
  PREFIX = auth.prefix;
  ADMINROLE = auth.authorized;
} catch (error) {
  TOKEN = process.env.TOKEN;
  PREFIX = process.env.PREFIX;
}

const client = new Client({ disableMentions: "everyone" });
client.login(TOKEN);
client.commands = new Collection();
client.prefix = PREFIX;
const cooldowns = new Collection();
const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");


/**
  * Client Events to login and define prefix
  */
client.on("ready", () => {
  console.log(`${client.user.username} ready!`);
});
client.on("warn", (info) => console.log(info));
client.on("error", console.error);

/**
 * Initializes all commands
 */
 const commandFiles = readdirSync(join(__dirname, "commands")).filter((file) => file.endsWith(".js"));
 for (const file of commandFiles) {
   const command = require(join(__dirname, "commands", `${file}`));
   client.commands.set(command.name, command);
 }


 /**
  * Message handler
  */
client.on("message", async message => { //Main message handler
	if(message.author.bot) return; //Returns out of function if it's a bot message
  if(!message.guild) return;

  const prefixRegex = new RegExp(`^(<@!?${client.user.id}>|${escapeRegex(PREFIX)})\\s*`);
  if (!prefixRegex.test(message.content)) return;

  const [, matchedPrefix] = message.content.match(prefixRegex);

  const args = message.content.slice(matchedPrefix.length).trim().split(/ +/);
  const commandName = args.shift().toLowerCase();

  const command =
     client.commands.get(commandName) ||
     client.commands.find((cmd) => cmd.aliases && cmd.aliases.includes(commandName));

   if (!command) return;

   if (!cooldowns.has(command.name)) {
     cooldowns.set(command.name, new Collection());
   }

   const now = Date.now();
   const timestamps = cooldowns.get(command.name);
   const cooldownAmount = (command.cooldown || 1) * 1000;

   if (timestamps.has(message.author.id)) {
     const expirationTime = timestamps.get(message.author.id) + cooldownAmount;

     if (now < expirationTime) {
       var timeLeft = (expirationTime - now) / 1000;
       if (timeLeft < 60) {
         return message.reply(
           `Cooldown: ${timeLeft.toFixed(1)}seconds  for \`${command.name}\` command. `
         );
       } else {
         timeLeft = timeLeft / 60;
         return message.reply(
           `Cooldown: ${timeLeft.toFixed(1)}minutes  for \`${command.name}\` command. `
         );
       }
     }
   }

   timestamps.set(message.author.id, now);
   setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);


   try {
     command.execute(message, args);
   } catch (error) {
     console.error(error);
     message.reply("There was an error executing that command.").catch(console.error);
   }


});
