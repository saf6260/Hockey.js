const TITLE = 'Channel Settings Updated';
const FOOTER = 'Use !config to see other settings';
const { PERMISSION_LEVELS, gatherPermissions } = require('../util');

module.exports = {
  name: 'channel',
  description: 'Command for setting the channel to display information from the bot',
  async execute(msg, args, Guild, ownerID, handler, logger) {
    if (args.length < 1) {
      logger.debug('Not enough arguments supplied for channel command');
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
      return;
    }
    let hasPerm = false;
    if (ownerID === msg.author.id) {
      logger.debug('Channel command ran by server owner');
      hasPerm = true;
    } else {
      const permissions = await gatherPermissions(PERMISSION_LEVELS.Configure, Guild, guild.id);
      if (permissions.length === 0) {
        logger.debug(`Only owner can modify results and ${msg.author.id} is not owner of guild ${guild.id}`);
      } else {
        permissions.forEach(async (perm) => {
          const permID = perm.get('RoleID');
          if (msg.member.roles.cache.has(perm.get('RoleID'))) {
            logger.debug(`${msg.author.username} has config perm due to role ${permID} in guild ${guild.id}`);
            hasPerm = true;
          }
        });
      }
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
    } else {
      // send lacking permission response
    }
  },
};
