const fs = require('fs');
const { checkConfigLevel } = require('../util');

const TITLE = 'Channel Settings Updated';
const FOOTER = 'Use !config to see other settings';
const { RESPONSE_FILE } = process.env;

module.exports = {
  name: 'channel',
  description: 'Command for setting the channel to display information from the bot',
  async execute(msg, args, Guild, ownerID, handler, logger) {
    const responseData = JSON.parse(fs.readFileSync(RESPONSE_FILE));
    if (args.length < 1) {
      logger.debug('Not enough arguments supplied for channel command');
      handler.messageResponse(msg, responseData.errorParams);
      return;
    }
    let channel = args[0];
    if (channel.includes('<#')) {
      channel = channel.split('<#')[1].split('>')[0];
    }
    const guild = msg.channel.guild;
    const DBGuild = await Guild.prototype.findGuild(['ChannelID', 'OwnerID'], guild.id);
    if (DBGuild === undefined) {
      logger.error(`GuildID: ${guild.id} not in DB!`);
      handler.messageResponse(msg, responseData.errorExecution);
      return;
    }
    let hasPerm = false;
    if (ownerID === msg.author.id) {
      logger.debug(`Channel command ran by server owner for guild ${guild.id}`);
      hasPerm = true;
    } else {
      hasPerm = checkConfigLevel(msg, Guild, guild.id, logger);
    }
    if (hasPerm) {
      const guildChannel = guild.channels.cache.get(channel);
      let resp;
      if (guildChannel === undefined) {
        logger.debug(`Channel ${channel} not found in system`);
        // send error
      } else {
        logger.debug(`Setting channelID to ${channel} for guild ${guild.id}`);
        await Guild.prototype.setChannel(channel, guild.id);
        resp = handler.genMain(TITLE, `channel set to ${guildChannel}`, [], FOOTER);
      }
      handler.messageResponse(msg, resp);
      return;
    }
    handler.messageResponse(msg, responseData.errorPermissions);
  },
};
