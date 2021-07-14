const { Client, Collection } = require('discord.js');
const { TOKEN, PREFIX, CAT_API_KEY, CAT_API_URL } = require('./config.js');
const { readdirSync } = require("fs");

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

  const args = message.content.slice(PREFIX.length).trim().split(' ');
  const commandName = args.shift().toLowerCase();


  if (!client.commands.has(commandName)) return;
  const command = client.commands.get(commandName);

  if (command.help.args && !args.length) {
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

client.on('ready', () => console.log(`Connecté en tant que ${client.user.tag}!`));
client.once('reconnecting', () => {console.log('Reconnecting!');});
client.once('disconnect', () => {console.log('Disconnect!');});
client.login(process.env.TOKEN);
