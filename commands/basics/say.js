module.exports.run = (client,message,args, serverQueue) => {
  message.channel.send(args.join(" "));
};

module.exports.help = {
  name: "say",
  description: "Répète le message d'un utilisateur",
  cooldown: 10,
  usage: "<votre message>",
  args: true
};