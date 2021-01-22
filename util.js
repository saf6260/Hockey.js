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

const checkPerms = (permissions, roleCache, username, logger, guildID) => {
  const res = permissions.map(perm => perm.get('RoleID'))
    .filter(role => roleCache.has(role));
  if (res.length === 0) {
    return false;
  }
  logger.debug(`${username} has config perm due to role ${res[0]} in guild ${guildID}`);
  return true;
};

const checkInteraction = async (msg, Guild, guildID, logger) => {
  const permissions = await gatherPermissions(PERMISSION_LEVELS.Interact, Guild, guildID);
  await gatherPermissions(PERMISSION_LEVELS.Watch, Guild, guildID)
    .then(newPerms => {
      newPerms.forEach(perm => permissions.push(perm));
    });
  await gatherPermissions(PERMISSION_LEVELS.Configure, Guild, guildID)
    .then(newPerms => {
      newPerms.forEach(perm => permissions.push(perm));
    });
  if (permissions.length === 0) {
    logger.debug(`Only owner can modify system and ${msg.author.id} is not owner of guild ${guildID}`);
    return false;
  }
  return checkPerms(permissions, msg.member.roles.cache, msg.author.username, logger, guildID);
};

const checkConfigLevel = async (msg, Guild, guildID, logger) => {
  const permissions = await gatherPermissions(PERMISSION_LEVELS.Configure, Guild, guildID);
  if (permissions.length === 0) {
    logger.debug(`Only owner can modify system and ${msg.author.id} is not owner of guild ${guildID}`);
    return false;
  }
  return checkPerms(permissions, msg.member.roles.cache, msg.author.username, logger, guildID);
};

const guildSchedule = async (client, channel, Guild, guildID, logger, Daily) => {
  const dailyCheck = await Guild.prototype.getDaily(guildID);
  if (!dailyCheck.get('Daily')) {
    logger.info(`Daily update toggled off before schedule send for guild ${guildID}`);
  } else {
    logger.info(`Sending daily schedule for guild ${guildID}`);
    Daily.fetchSchedule(channel, logger);
    Guild.prototype.toggleSent(guildID, true);
  }
  if (client.dailySchedules.has(guildID)) {
    const timeout = client.dailySchedules.get(guildID);
    clearTimeout(timeout);
  }
};

const determineOffset = async (goalTime) => {
  const now = new Date();
  const goal = new Date(goalTime);
  goal.setDate(now.getDate());
  goal.setMonth(now.getMonth());
  goal.setFullYear(now.getFullYear());
  return (goal - now);
};

const performDBChecks = async (client, Guild, logger, Daily) => {
  client.dailySchedules.forEach((gID) => {
    const timeout = client.dailySchedules.get(gID);
    clearTimeout(timeout);
  });
  const dailys = await Guild.prototype.collectDailys();
  dailys.forEach(async (daily) => {
    const guildID = daily.get('GuildID');
    const offset = await determineOffset(daily.get('DailyTime'));
    const discChannel = client.channels.cache.get(daily.get('ChannelID'));
    if (offset <= 0) {
      logger.debug(`Daily scheduled time has passed or is now for guild ${guildID}`);
      guildSchedule(client, discChannel, Guild, guildID, logger, Daily);
    } else {
      logger.debug(`Daily scheduled time is ${offset} ms away from now for guild ${guildID}`);
      client.dailySchedules.set(guildID, setTimeout(guildSchedule, offset, client, discChannel, Guild,
        guildID, logger, Daily));
    }
  });
};

module.exports = { PERMISSION_LEVELS, gatherPermissions, checkConfigLevel, checkInteraction, performDBChecks };
