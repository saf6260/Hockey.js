module.exports = (sequelize, DataTypes) => sequelize.define('Guilds', {
  GuildID: {
    type: DataTypes.STRING,
    unique: true,
    primaryKey: true,
    allowNull: false,
    get() {
      return this.getDataValue('GuildID');
    }
  },
  OwnerID: {
    type: DataTypes.STRING,
    unique: false,
    allowNull: false,
    get() {
      return this.getDataValue('OwnerID');
    }
  },
  ChannelID: {
    type: DataTypes.STRING,
    get() {
      return this.getDataValue('ChannelID');
    }
  },
  Daily: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    get() {
      return this.getDataValue('Daily');
    }
  },
});
