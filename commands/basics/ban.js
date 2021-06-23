module.exports.run = (client,message,args, serverQueue) => {
    let member_to_ban = message.mentions.users.first();
    if (message.member.hasPermission("BAN_MEMBERS") || message.member.hasPermission("ADMINISTRATOR")) {
        if (member_to_ban) {
            const user = message.guild.member(member_to_ban);
            if (user) {
                user
                    .ban({reason: 'Banni par le bot'})
                    .then(() => {
                        message.reply(`L'utilisateur ${user.name} à été ban avec succès !`);})
                    .catch(err => {
                        message.reply(`Impossible de ban ${user.name}`);
                        console.error(err); });
            }
        } else
            message.reply("Utilisateur inexistant.");
    } else
            message.reply("Tu n'as pas la permission de ban " + message.mentions.users.first().displayName);
};

module.exports.help = {
  name: "ban",
  description: "ban une personne",
  usage: "@utilisateur",
  args: true
};