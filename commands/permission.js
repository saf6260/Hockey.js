const { PERMISSION_LEVELS } = require('../util');

module.exports = {
  name: 'permission',
  description: 'Command for setting the permissions of a role',
  async execute(msg, args, Guild, ownerID, handler, logger) {
    if (args.length < 2) {
      logger.debug('Not enough arguments supplied for permission command');
      // send error message
      return;
    }
    const guild = msg.channel.guild;
    const DBGuild = await Guild.prototype.findGuild(['ChannelID', 'Daily'], guild.id);
    if (DBGuild === undefined) {
      logger.error(`GuildID: ${guild.id} not in DB!`);
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
      // send error message
      return;
    }
    const commandLevel = args[1].charAt(0).toUpperCase() + args[1].slice(1);
    const level = PERMISSION_LEVELS[commandLevel];
    const fields = [];
    let footer = '';
    if (level === undefined) {
      logger.debug(`${commandLevel} not a defined configuration level`);
      // send error message
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