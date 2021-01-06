const PERMISSION_LEVELS = {
  Configure: "Configure",
  Watch: "Watch",
  Interact: "Interact",
}

const gatherPermissions = async (level, Guild, guildID) => {
  const where = level === 'any' ? {}: { PermLevel: level };
  const permissions = await Guild.prototype.gatherPermissions(['RoleID', 'PermLevel'],
    guildID,
    where);
  return permissions;
}

module.exports = { PERMISSION_LEVELS, gatherPermissions }