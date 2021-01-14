module.exports = (sequelize, DataTypes) => sequelize.define('Watch', {
  GuildID: {
    type: DataTypes.STRING,
    allowNull: false,
    primaryKey: true,
    references: {
      model: 'Guilds',
      key: 'GuildID',
    },
    get() {
      return this.getDataValue('GuildID');
    },
  },
  GameID: {
    type: DataTypes.STRING,
    allowNull: false,
    primaryKey: true,
    get() {
      return this.getDataValue('GameID');
    },
  },
  GameStart: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    get() {
      return this.getDataValue('GameStart');
    },
  },
  GameTime: {
    type: DataTypes.DATE,
    allowNull: false,
    get() {
      return this.getDataValue('GameTime');
    },
  },
  GameUpdate: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    get() {
      return this.getDataValue('GameUpdate');
    },
  },
  UpdateWindow: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 3,
    get() {
      return this.getDataValue('PermLevel');
    },
  },
});
