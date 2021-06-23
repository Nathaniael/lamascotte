module.exports.run = (client,message,args, serverQueue) => {
  message.channel.send('Loading data').then (async (msg) =>{
    msg.delete()
    message.channel.send(`🏓 Ta latance est ${msg.createdTimestamp - message.createdTimestamp}ms. Celle de l'API est ${Math.round(client.ws.ping)} ms`);})
};

module.exports.help = {
  name: "ping",
  description: "Donne ton ping",
  cooldown: 10,
  args: false
};