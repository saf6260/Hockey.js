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
      channel = channel.split("<#")[1].split(">")[0];
    }
    const guild = msg.channel.guild;
    const DBGuild = await Guild.prototype.findGuild(['ChannelID', 'OwnerID'], guild.id);
    if (DBGuild === undefined) {
      logger.error(`GuildID: ${guild.id} not in DB!`);
      return;
    }
    if (ownerID === msg.author.id) {
      logger.debug("Channel command ran by server owner");
      const guildChannel = guild.channels.cache.get(channel);
      let resp;
      if (guildChannel === undefined) {
        logger.debug(`Channel ${channel} not found in system`);
      } else {
        logger.debug(`Setting channelID to ${channel} for guild ${guild.id}`);
        await Guild.prototype.setChannel(channel, guild.id);
        resp = handler.genMain(TITLE, `channel set to ${guildChannel}`, [], FOOTER);
      }
      handler.messageResponse(msg, resp);
      return;
    }
    const permissions = await gatherPermissions(PERMISSION_LEVELS.Configure, Guild, guild.id);
    if (permissions.length === 0) {
      logger.debug("Only owner can modify results");
    } else {
      logger.debug(`Other users found with permissions: ${permissions}`);
    }
    console.log(msg);
    console.log(permissions);
    console.log(DBGuild);
  //   const fields = [];
  //   fields.push(handler.genField('Announcement channel:', channelName, true));
  //   fields.push(handler.genField('Daily updates:', DBGuild.get('Daily') ? 'On':'Off', true));
  //   if (msg.author.id === ownerID) {
  //     fields.push(handler.genField('Permissions:', 'You have permissions to update'));
  //   } else {
  //     fields.push(handler.genField('Permissions:', 'Please talk to your server owner for setup'));
  //   }
  //   const resp = handler.genMain(TITLE, DESC, fields, FOOTER);
  //   handler.messageResponse(msg, resp);
  // }
  }
}
