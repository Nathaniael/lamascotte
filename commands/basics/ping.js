module.exports.run = (client,message,args, serverQueue) => {
  message.channel.send("Pong fdp");
};

module.exports.help = {
  name: "ping",
  description: "Renvoie pong!",
  cooldown: 10,
  args: false
};