const { PERMISSION_LEVELS } = require('../util');

module.exports = {
  name: 'permission',
  description: 'Command for setting the permissions of a role',
  async execute(msg, args, Guild, ownerID, handler, logger) {
    if (args.length < 2) {
      logger.debug('Not enough arguments supplied for permission command');
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
    if (commandRole.includes("<@&")) {
      const role = commandRole.split("<@&")[1].split(">")[0];
      systemRole = guild.roles.cache.get(role);
    } else {
      systemRole = guild.roles.cache.find((x) => {
        return x.name.toLowerCase() === commandRole.trim().toLowerCase();
      })
    }
    if (systemRole === undefined) {
      logger.debug(`No role in guild ${guild.id} found for ${commandRole}`);
      return;
    }
    const commandLevel = args[1].charAt(0).toUpperCase() + args[1].slice(1);
    const level = PERMISSION_LEVELS[commandLevel];
    if (level === undefined) {
      logger.debug(`${commandLevel} not a defined configuration level`);
      return;
    }
    logger.debug(`Adding ${level} level permissions to ${systemRole.name} in guild ${guild.id}`);
    await Guild.prototype.adjustPermission(systemRole.id, level, guild.id);
  }
}