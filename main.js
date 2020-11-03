const { Client, Collection } = require('discord.js');
const { TOKEN, PREFIX } = require('./config.js');
const { readdirSync } = require("fs");
const ytdl = require("ytdl-core");

const client = new Client();
["commands", "cooldowns"].forEach(x => client[x] = new Collection());

const queue = new Map();

const loadCommands = (dir = "./commands/") => {
  readdirSync(dir).forEach(dirs => {
    const commands = readdirSync(`${dir}/${dirs}/`).filter(files => files.endsWith(".js"));
    
    for (const file of commands) {
      const getFileName = require(`${dir}/${dirs}/${file}`);
      client.commands.set(getFileName.help.name, getFileName);
      console.log(`Commande chargée: ${getFileName.help.name}`);
    };
  });
};

loadCommands();

client.on('message', async message => {
  if (!message.content.startsWith(PREFIX) || message.author.bot) return;

  const serverQueue = queue.get(message.guild.id);
  if (message.content.startsWith(`${PREFIX}play`)) {
    execute(message, serverQueue); // On appel execute qui soit initialise et lance la musique soit ajoute à la queue la musique
    return;
  }
  else if (message.content.startsWith(`${PREFIX}skip`)) {
    skip(message, serverQueue); // Permettra de passer à la musique suivante
    return;
  }
  else if (message.content.startsWith(`${PREFIX}stop`)) {
    stop(message, serverQueue); // Permettra de stopper la lecture
    return;
}
  
  const args = message.content.slice(PREFIX.length).split(/ +/);
  const commandName = args.shift().toLowerCase();
  
  if (!client.commands.has(commandName)) return;
  const command = client.commands.get(commandName);
  
  if (command.help.args && !args.lenght) {
    let noArgsReply = `Cette commande à besoin d'arguments pour fonctionner, ${message.author}!`;
    if(command.help.usage) noArgsReply += `\nUtilisation: \`${PREFIX}${command.help.name} ${command.help.usage}\``;
    return message.channel.send(noArgsReply)
  }

  if (!client.cooldowns.has(command.help.name)) {
    client.cooldowns.set(command.help.name, new Collection());
  }

  const timeNow = Date.now();
  const tStamps = client.cooldowns.get(command.help.name);
  const cdAmount = (command.help.cooldown || 5) * 1000;
  console.log(client.cooldowns);

  if (tStamps.has(message.author.id)) {
    const cdExpirationTime = tStamps.get(message.author.id) + cdAmount;

    if (timeNow < cdExpirationTime) {
      timeLeft = (cdExpirationTime - timeNow) / 1000;
      return message.reply(`Merci d'attendre ${timeLeft.toFixed(0)} seconde(s) avant de ré-utiliser la commande \`${command.help.name}\`.`);
    }
  }

  tStamps.set(message.author.id, timeNow);
  setTimeout(() =>tStamps.delete(message.author.id), cdAmount);

  command.run(client,message,args, serverQueue);
});

async function execute(message, serverQueue) {
  const args = message.content.split(" "); // On récupère les arguments dans le message pour la suite

  const voiceChannel = message.member.voice.channel;
  if (!voiceChannel) // Si l'utilisateur n'est pas dans un salon vocal
  {
          return message.channel.send(
              "Vous devez être dans un salon vocal!"
          );
  }
  const permissions = voiceChannel.permissionsFor(message.client.user); // On récupère les permissions du bot pour le salon vocal
  if (!permissions.has("CONNECT") || !permissions.has("SPEAK")) { // Si le bot n'a pas les permissions
          return message.channel.send(
              "J'ai besoin des permissions pour rejoindre le salon et pour y jouer de la musique!"
          );
  }

  const songInfo = await ytdl.getInfo(args[1]);
  const song     = {
          title: songInfo.videoDetails.title,
          url  : songInfo.videoDetails.video_url,
  };

  if (!serverQueue) {
          const queueConstruct = {
                  textChannel : message.channel,
                  voiceChannel: voiceChannel,
                  connection  : null,
                  songs       : [],
                  volume      : 1,
                  playing     : true,
          };

          // On ajoute la queue du serveur dans la queue globale:
          queue.set(message.guild.id, queueConstruct);
          // On y ajoute la musique
          queueConstruct.songs.push(song);

          try {
                  // On connecte le bot au salon vocal et on sauvegarde l'objet connection
                  var connection           = await voiceChannel.join();
                  queueConstruct.connection = connection;
                  // On lance la musique
                  play(message.guild, queueConstruct.songs[0]);
          }
          catch (err) {
                  //On affiche les messages d'erreur si le bot ne réussi pas à se connecter, on supprime également la queue de lecture
                  console.log(err);
                  queue.delete(message.guild.id);
                  return message.channel.send(err);
          }
  }
  else {
          serverQueue.songs.push(song);
          console.log(serverQueue.songs);
          return message.channel.send(`${song.title} has been added to the queue!`);
  }

}

function skip(message, serverQueue) {
  if (!message.member.voice.channel) // on vérifie que l'utilisateur est bien dans un salon vocal pour skip
  {
          return message.channel.send(
              "Vous devez être dans un salon vocal pour passer une musique!"
          );
  }
  if (!serverQueue) // On vérifie si une musique est en cours
  {
          return message.channel.send("Aucune lecture de musique en cours !");
  }
  serverQueue.connection.dispatcher.end(); // On termine la musique courante, ce qui lance la suivante grâce à l'écoute d'événement
                                           // finish
}

function stop(message, serverQueue) {
  if (!message.member.voice.channel) // on vérifie que l'utilisateur est bien dans un salon vocal pour skip
  {
          return message.channel.send(
              "Vous devez être dans un salon vocal pour stopper la lecture!"
          );
  }
  if (!serverQueue) // On vérifie si une musique est en cours
  {
          return message.channel.send("Aucune lecture de musique en cours !");
  }
  serverQueue.songs = [];
  serverQueue.connection.dispatcher.end();
}

function play(guild, song) {
  console.log(song);
  const serverQueue = queue.get(guild.id); // On récupère la queue de lecture
  if (!song) { // Si la musique que l'utilisateur veux lancer n'existe pas on annule tout et on supprime la queue de lecture
          serverQueue.voiceChannel.leave();
          queue.delete(guild.id);
          return;
  }
  // On lance la musique
  const dispatcher = serverQueue.connection
      .play(ytdl(song.url, { filter: 'audioonly' }))
      .on("finish", () => { // On écoute l'événement de fin de musique
              serverQueue.songs.shift(); // On passe à la musique suivante quand la courante se termine
              play(guild, serverQueue.songs[0]);
      })
      .on("error", error => console.error(error));
  dispatcher.setVolume(1); // On définie le volume
  serverQueue.textChannel.send(`Démarrage de la musique: **${song.title}**`);
}

client.on('ready', () => console.log(`Connecté en tant que ${client.user.tag}!`));
client.once('reconnecting', () => {console.log('Reconnecting!');});
client.once('disconnect', () => {console.log('Disconnect!');});
client.login(TOKEN);