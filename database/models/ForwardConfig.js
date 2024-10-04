const { DataTypes } = require('sequelize');
const sequelize = require('../connection');

const ForwardConfig = sequelize.define('ForwardConfig', {
  guild_id: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  forward_enabled: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },
  max_forwards_per_message: {
    type: DataTypes.INTEGER,
    defaultValue: 5,
  },
}, {
  tableName: 'forward_config',
});

module.exports = ForwardConfig;
