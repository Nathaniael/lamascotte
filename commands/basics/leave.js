module.exports.run = async (client,message,args, serverQueue) => { 
  if (!message.guild) return;
    // Only try to join the sender's voice channel if they are in one themselves
  if (message.member.voice.channel) {
    const connection = await message.member.voice.channel.leave();
  } else {
      message.reply('I\'m not in a channel!');
  }
}

module.exports.help = {
  name: "leave",
  description: "Permet au bot de leave le channel de la personne ayant utilisé la commande",
  args: false
};