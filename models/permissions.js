module.exports = (sequelize, DataTypes) => sequelize.define('Permissions', {
  GuildID: {
    type: DataTypes.STRING,
    allowNull: false,
    references: {
      model: 'Guilds',
      key: 'GuildID',
    },
    get() {
      return this.getDataValue('GuildID');
    }
  },
  RoleID: {
    type: DataTypes.STRING,
    unique: true,
    primaryKey: true,
    allowNull: false,
    get() {
      return this.getDataValue('RoleID');
    }
  },
  PermLevel: {
    type: DataTypes.STRING,
    allowNull: false,
    get() {
      return this.getDataValue('PermLevel');
    }
  },
});
