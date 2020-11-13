let ADMINROLE;
try {
  const auth = require('../auth.json');
  ADMINROLE = auth.authorized;
} catch (error) {
  ADMINROLE = process.env.ADMINROLE;
}

module.exports ={
  name: "nuke",
  cooldown: 600,
  aliases: ["n"],
  description: "Removes everyone else except author from current Voice Channel",
  execute(message, args) {

    var authorized = false;

    ADMINROLE.forEach((roleId) => {
      if (message.member.roles.cache.has(roleId)) {
        authorized = true;
      }
    });

    if (!authorized) {
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
  		  message.channel.send(`I see ${member.displayName} in ${currentChannel}, Perish.`).catch(console.error);
  		  member.voice.kick()
  		  .then(() => console.log(`Killed ${member.user.tag}.`))
  		  .catch(console.error);
      }
    }

  }
};
