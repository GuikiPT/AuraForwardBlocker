const { DataTypes } = require('sequelize');
const sequelize = require('../connection');

const ForwardConfig = sequelize.define('ForwardConfig', {
  guild_id: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  forward_automod_enabled: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },
  log_channel_id: {
    type: DataTypes.STRING,
    allowNull: true,
  },
}, {
  tableName: 'forward_config',
});

module.exports = ForwardConfig;
