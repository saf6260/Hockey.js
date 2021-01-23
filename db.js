const Sequelize = require('sequelize');
const winston = require('winston');
const moment = require('moment-timezone');
moment.tz.setDefault('America/New_York');
const { DATE_CONFIG } = require('./util');

const logger = winston.createLogger({
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'hockey_bot_db.log', level: 'debug' }),
  ],
  format: winston.format.printf(log => `[${log.level.toUpperCase()}] ${new Date(moment().format()).toLocaleDateString(undefined, DATE_CONFIG)} - ${log.message}`),
});

const sequelize = new Sequelize({
  dialect: 'sqlite',
  logging: (msg) => logger.debug(msg),
  storage: 'db.sqlite3',
});

const Guild = require('./models/guilds')(sequelize, Sequelize.DataTypes);
const Permissions = require('./models/permissions')(sequelize, Sequelize.DataTypes);
// eslint-disable-next-line no-unused-vars
const Watch = require('./models/watch')(sequelize, Sequelize.DataTypes);

const force = process.argv.includes('--force') || process.argv.includes('-f');
logger.debug(`Force set to: ${force}`);

// Add { force: true } to reset the DB every time
sequelize.sync({ force }).then(async () => {
  logger.info(`Database Ready. Resynced: ${force}`);
}).catch(logger.error);

Guild.prototype.init = async (GuildID, OwnerID) => Guild.create({ GuildID, OwnerID });

Guild.prototype.findGuild = async (attributes, GuildID) => {
  const guild = await Guild.findOne({
    attributes,
    where: { GuildID },
  });
  if (guild === null) {
    return undefined;
  }
  if (guild.length === 0) {
    return undefined;
  }
  return guild;
};

Guild.prototype.setChannel = async (ChannelID, GuildID) => {
  return await Guild.update({ ChannelID }, { where: { GuildID } });
};

Guild.prototype.gatherPermissions = async (attributes, where) => {
  const permissions = await Permissions.findAll({
    attributes,
    where,
  });
  return permissions;
};

Guild.prototype.adjustPermission = async (RoleID, PermLevel, GuildID) => {
  return await Permissions.upsert({ RoleID, PermLevel, GuildID });
};

Guild.prototype.updateRoleID = async (OldRoleID, NewRoleID, GuildID) => {
  return await Permissions.update({ RoleID: NewRoleID },
    { where: { RoleID: OldRoleID, GuildID } },
  );
};

Guild.prototype.removePermission = async (RoleID, GuildID) => {
  return await Permissions.destroy({ where: { RoleID, GuildID } });
};

Guild.prototype.removeRoleID = async (RoleID, GuildID) => {
  return await Permissions.destroy({ where: { RoleID, GuildID } });
};

Guild.prototype.getDaily = async (GuildID) => {
  return await Guild.prototype.findGuild(['Daily', 'DailyTime', 'DailySent'], GuildID);
};

Guild.prototype.toggleDaily = async (GuildID) => {
  const dailyVals = await Guild.prototype.getDaily(GuildID);
  return await Guild.update({ Daily: !dailyVals.get('Daily') },
    { where: { GuildID } });
};

Guild.prototype.setDailyTime = async (GuildID, timestamp) => {
  return await Guild.update({ DailyTime: timestamp }, { where: { GuildID } });
};

Guild.prototype.collectDailys = async () => {
  const trueDailys = await Guild.findAll({
    attributes: ['GuildID', 'ChannelID', 'DailyTime', 'DailySent'],
    where: { Daily: true },
  });
  return trueDailys.filter((daily) => daily.get('ChannelID') !== null)
    .filter((daily) => !daily.get('DailySent'));
};

Guild.prototype.toggleSent = async (GuildID, sent) => {
  return await Guild.update({ DailySent: sent }, { where: { GuildID } });
};

Guild.prototype.resetSent = async () => {
  return await Guild.update({ DailySent: false }, { where: { DailySent: true } });
};

module.exports = { Guild };
