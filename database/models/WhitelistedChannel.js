const { DataTypes } = require('sequelize');
const sequelize = require('../connection');

const WhitelistedChannel = sequelize.define('WhitelistedChannel', {
  guild_id: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  channel_id: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
}, {
  tableName: 'whitelisted_channels',
});

module.exports = WhitelistedChannel;
