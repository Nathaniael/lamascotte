module.exports.run = (client, message, args, serverQueue) => {
    if (message.member.hasPermission('ADMINISTRATOR')) {
        client.user
            .setActivity(`${args}`, { type: 'PLAYING' })
            .then(presence =>
                console.log(`Activity set to ${presence.activities[0].name}`),
            )
            .catch(console.error);
    } else
        message.reply(
            "Vous n'avez pas la permission de changer l'activité du bot.",
        );
};

module.exports.help = {
    name: 'activity',
    description: "Change l'activité du bot",
    args: true,
    usage: '<statut>',
};
