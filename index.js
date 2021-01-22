// Establishing env for system usage
require('dotenv').config();

// Package Installations
const Discord = require('discord.js');
const winston = require('winston');
const fs = require('fs');

// Other File Dependencies
const Daily = require('./controllers/daily');
const { Guild } = require('./db');
const { MessageHandler } = require('./controllers/messageHandler');
const { checkInteraction, performDBChecks } = require('./util');

// Global Variables
const client = new Discord.Client({ partials: ['MESSAGE', 'CHANNEL', 'REACTION'] });
const daily = new Daily();
const debug = process.argv.includes('--verbose') || process.argv.includes('-v');
const logger = winston.createLogger({
  transports: [
    new winston.transports.Console({ level: debug ? 'debug' : 'info' }),
    new winston.transports.File({ filename: 'AL.log', level: 'debug' }),
  ],
  format: winston.format.printf(log => `[${log.level.toUpperCase()}] ${new Date().toLocaleString()} - ${log.message}`),
});
const msgHandler = new MessageHandler();
const prefix = '!';

client.on('warn', (m) => logger.warn(m));
client.on('error', (m) => logger.error(m));

// Establishing System Commands
client.commands = new Discord.Collection();
client.dailySchedules = new Discord.Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
commandFiles.forEach((file) => {
  const command = require(`./commands/${file}`);
  client.commands.set(command.name, command);
});

let tomorrow = null;

const confiureDaily = async () => {
  const now = new Date();
  if (tomorrow === null) {
    tomorrow = new Date();
    tomorrow.setDate(now.getDate() + 1);
  }
  if (now.getDate() === tomorrow) {
    await Guild.prototype.resetSent();
  }
  await performDBChecks(client, Guild, logger, daily);
  const nextPull = new Date();
  nextPull.setMinutes(now.getMinutes() + 15);
  // Midnight
  logger.debug(`Waiting ${nextPull - now} ms before next daily config`);
  setTimeout(confiureDaily, (nextPull - now));
};

// Base Online Response
client.on('ready', async () => {
  client.user.setPresence({
    activity: {
      name: 'HAWKEY',
      type: 'WATCHING',
    },
    status: 'Online',
  });
  logger.info('The bot is online and ready!');
  confiureDaily();
});

// Channel Deletion Handler, for ensuring the DB is updated when a channel is removed
client.on('channelDelete', async (channel) => {
  const dbChan = await Guild.prototype.findGuild(['ChannelID'], channel.guild.id);
  if (channel.id === dbChan.dataValues.ChannelID) {
    logger.debug(`Guild ${channel.guild.id} just deleted their set channel ${channel.name}`);
    await Guild.prototype.setChannel(null, channel.guild.id);
  }
});

// Message Handler
client.on('message', async (msg) => {
  if (msg.author.bot || !msg.content.startsWith(prefix)) { return; }
  if (msg.partial) {
    try {
      await msg.fetch();
    } catch (error) {
      logger.error(`Error in fetch of partial message: ${error}`);
      return;
    }
  }
  const guild = msg.channel.guild;
  let ownerID = await Guild.prototype.findGuild(['OwnerID'], guild.id);
  if (ownerID === undefined) {
    logger.debug(`New guild registered: ${guild.id}`);
    await Guild.prototype.init(guild.id, guild.ownerID);
    ownerID = guild.ownerID;
  } else {
    ownerID = ownerID.get('OwnerID');
  }
  if (ownerID !== msg.author.id && !checkInteraction(msg, Guild, guild.id, logger)) {
    return;
  }
  const args = msg.content.slice(prefix.length).trim().split(/ +/);
  const command = args.shift().toLowerCase();
  if (!client.commands.has(command)) {
    return;
  }
  try {
    client.commands.get(command).execute(msg, args, Guild, ownerID, msgHandler, logger);
  } catch (err) {
    logger.error(`Error executing command ${command}: ${err}`);
    msg.reply('Error in command execution!');
  }
});

// Reaction Handler
client.on('messageReactionAdd', async (react, user) => {
  if (user.bot) { return; }
  if (react.partial) {
    try {
      await react.fetch();
    } catch (error) {
      logger.error(`Error in fetch of partial react: ${error}`);
      return;
    }
  }
  if (react.message.embeds.length !== 0) {
    const msgEmbed = react.message.embeds[0];
    if (msgEmbed.title.includes('Schedule')) {
      const channel = await client.channels.cache.get('795718890395140130');
      await daily.fetchGameDetails(react.emoji.name, channel);
    }
  }
});

// Role Deletion Handler, for ensuring the DB is updated when a role is removed
client.on('roleDelete', async (role) => {
  await Guild.prototype.removeRoleID(role.id, role.guild.id);
  logger.debug(`${role.name} (if existed in DB) removed from guild ${role.guild.id}`);
});

// Role Update Handler, for ensuring the DB is updated whena role is changed
client.on('roleUpdate', async (oldRole, newRole) => {
  await Guild.prototype.updateRoleID(oldRole.id, newRole.id, oldRole.guild.id);
  logger.debug(`${oldRole.name} (if existed in DB) updated to ${newRole.name} for guild ${oldRole.guild.id}`);
});

// Establish Bot Login
client.login(process.env.BOT_TOKEN);
