const fs = require('fs');
const { PERMISSION_LEVELS, checkConfigLevel } = require('../util');
const { RESPONSE_FILE } = process.env;

module.exports = {
  name: 'permission',
  description: 'Command for setting the permissions of a role',
  // eslint-disable-next-line no-unused-vars
  async execute(msg, args, Guild, ownerID, handler, logger) {
    const guild = msg.channel.guild;
    const responseData = JSON.parse(fs.readFileSync(RESPONSE_FILE));
    if (args.length < 2) {
      if (args.length > 0 && args[0] == '-h') {
        logger.debug(`Sending help response for permission command to guild ${guild.id}`);
        handler.messageResponse(msg, responseData.permissionHelp);
        return;
      }
      logger.debug('Not enough arguments supplied for permission command');
      handler.messageResponse(msg, responseData.errorParams);
      return;
    }
    const DBGuild = await Guild.prototype.findGuild(['ChannelID', 'Daily'], guild.id);
    if (DBGuild === undefined) {
      logger.error(`GuildID: ${guild.id} not in DB!`);
      handler.messageResponse(msg, responseData.errorExecution);
      return;
    }
    const commandRole = args[0];
    let systemRole;
    if (commandRole.includes('<@&')) {
      const role = commandRole.split('<@&')[1].split('>')[0];
      systemRole = guild.roles.cache.get(role);
    } else {
      systemRole = guild.roles.cache.find((x) => {
        return x.name.toLowerCase() === commandRole.trim().toLowerCase();
      });
    }
    if (systemRole === undefined) {
      logger.debug(`No role in guild ${guild.id} found for ${commandRole}`);
      handler.messageResponse(msg, responseData.errorParams);
      return;
    }
    if (ownerID !== msg.author.id && !checkConfigLevel(msg, Guild, guild.id, logger)) {
      logger.debug(`${msg.author.username} doesn't have adequate permissions found for ${commandRole}`);
      handler.messageResponse(msg, responseData.errorPermissions);
      return;
    }
    const commandLevel = args[1].charAt(0).toUpperCase() + args[1].slice(1);
    const level = PERMISSION_LEVELS[commandLevel];
    const fields = [];
    let footer = '';
    if (level === undefined) {
      logger.debug(`${commandLevel} not a defined configuration level`);
      handler.messageResponse(msg, responseData.errorParams);
      return;
    } else if (level === PERMISSION_LEVELS.None) {
      logger.debug(`Removing permissions for ${systemRole.name} in guild ${guild.id}`);
      await Guild.prototype.removePermission(systemRole.id, guild.id);
      fields.push(handler.genField('Adjustments:', `${systemRole.name} has all permissions removed`));
      footer = 'Use any other level to add permissions back to the role';
    } else {
      logger.debug(`Adding ${level} level permissions to ${systemRole.name} in guild ${guild.id}`);
      await Guild.prototype.adjustPermission(systemRole.id, level, guild.id);
      fields.push(handler.genField('Adjustments:', `${systemRole.name} has ${level} permissions`));
      footer = `Use level ${PERMISSION_LEVELS.None} to remove a role's permissions entirely`;
    }
    const res = handler.genMain('*trumpet* ba ba ba baaaaa', 'permissions adjusted', fields, footer);
    await handler.messageResponse(msg, res);
  },
};