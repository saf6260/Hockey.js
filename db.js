const Sequelize = require('sequelize');
const winston = require('winston');

const logger = winston.createLogger({
  transports: [
    new winston.transports.Console(),
    //new winston.transports.File({ filename: 'AL_db.log', level: 'debug' }),
  ],
  format: winston.format.printf((log) => `[${log.level.toUpperCase()}] ${new Date().toLocaleString()} - ${log.message}`),
});

const sequelize = new Sequelize({
  dialect: 'sqlite',
  logging: (msg) => logger.debug(msg),
  storage: 'db.sqlite3',
});

// eslint-disable-next-line no-unused-vars
const Guild = require('./models/guilds')(sequelize, Sequelize.DataTypes);
const Permissions = require('./models/permissions')(sequelize, Sequelize.DataTypes);
const Watch = require('./models/watch')(sequelize, Sequelize.DataTypes);

const force = process.argv.includes('--force') || process.argv.includes('-f');
logger.debug(`Force set to: ${force}`);

// Add { force: true } to reset the DB every time
sequelize.sync({ force }).then(async () => {
  logger.info('Database Synched');
}).catch(logger.error);

Guild.prototype.init = async (GuildID, OwnerID) => Guild.create({ GuildID, OwnerID });

Guild.prototype.findGuild = async (attributes, GuildID) => {
  const guild = await Guild.findOne({
    attributes,
    where: { GuildID },
  });
  if (guild.length === 0) {
    return undefined;
  }
  return guild;
}

Guild.prototype.setChannel = async (ChannelID, GuildID) => {
  return await Guild.update({ ChannelID }, { where: { GuildID }});
}

Guild.prototype.gatherPermissions = async (attributes, GuildID) => {
  const permissions = await Permissions.findAll({
    attributes,
    where: { GuildID }
  });
  return permissions;
}

Guild.prototype.adjustPermission = async (RoleID, PermLevel, GuildID) => {
  return await Permissions.upsert({ RoleID, PermLevel, GuildID });
}

Guild.prototype.updateRoleID = async (OldRoleID, NewRoleID, GuildID) => {
  return await Permissions.update({ RoleID: NewRoleID },
    { where: { RoleID: OldRoleID, GuildID } }
  );
}

Guild.prototype.removeRoleID = async (RoleID, GuildID) => {
  return await Permissions.destroy({ where: { RoleID, GuildID } });
}

module.exports = { Guild };
