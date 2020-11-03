var Discord = require('discord.js');
var auth = require('./auth.json');

const client = new Discord.Client();
const prefix = "!"; //Defines the prefix for all commands
const adminRoleID = '104403705876463616';

client.on('ready', () => {
  console.log('I am ready!');
});

client.on("message", async message => { //Main message handler
	if(message.author.bot) return; //Returns out of function if it's a bot message
	if(!message.content.startsWith(prefix)) return;
	
	if(message.content.startsWith("!ping")) {
		const timeTaken = Date.now() - message.createdTimestamp;
		message.reply(`Pong! Current latency ${timeTaken}ms.`);
	}
	
	if(message.content.startsWith("!nuke")) {
		
		if (!message.member.roles.cache.has(adminRoleID)) {
			message.reply(` tried to use the nuke command without proper permissions, Perish.`);
			message.member.voice.kick()
					.then(() => console.log(`Killed ${message.member.user.tag}.`))
					.catch(console.error);
			return;
		}
		
		const currentChannel = message.member.voice.channel;
		if (currentChannel) {
			for (const[memberID, member] of currentChannel.members) {
				if (member == message.member) continue; 
				message.reply(`I see ${member.displayName} in ${currentChannel}, Perish.`);
				member.voice.kick()
					.then(() => console.log(`Killed ${member.user.tag}.`))
					.catch(console.error);
			}
		}
	}
	
});

client.login(auth.token);
