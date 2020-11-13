
module.exports ={
  name: "ping",
  cooldown: 0,
  description: "Shows latency",
  execute(message) {
    message.channel.send(`Pong! Current latency ${Date.now() - message.createdTimestamp}ms.`).catch(console.error);
  }
};
