const PERMISSION_LEVELS = {
  Configure: 'Configure',
  Watch: 'Watch',
  Interact: 'Interact',
  None: 'None',
};

const gatherPermissions = async (level, Guild, guildID) => {
  const where = level === 'any' ? {} : { PermLevel: level };
  where.GuildID = guildID;
  const permissions = await Guild.prototype.gatherPermissions(['RoleID', 'PermLevel'], where);
  return permissions;
};

module.exports = { PERMISSION_LEVELS, gatherPermissions };