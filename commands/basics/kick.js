module.exports.run = (client,message,args, serverQueue) => {
    let member_to_kick = message.mentions.users.first();
    if (message.member.hasPermission("KICK_MEMBERS") || message.member.hasPermission("ADMINISTRATOR")) {
        if (member_to_kick) {
            const user = message.guild.member(member_to_kick);
            if (user) {
                user
                    .kick("kick par le bot")
                    .then(() => {
                        message.reply(`L'utilisateur ${user.name} à été kick avec succès !`);})
                    .catch(err => {
                        message.reply(`Impossible de kick ${user.name}`);
                        console.error(err); });
            }
        } else
            message.reply("Utilisateur inexistant.");
    } else
            message.reply("Tu n'as pas la permission de kick " + message.mentions.users.first().displayName);
};

module.exports.help = {
  name: "kick",
  description: "Kick une personne",
  usage: "@utilisateur",
  args: true
};