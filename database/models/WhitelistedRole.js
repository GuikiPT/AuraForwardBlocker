const { DataTypes } = require('sequelize');
const sequelize = require('../connection');

const WhitelistedRole = sequelize.define('WhitelistedRole', {
  guild_id: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  role_id: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
}, {
  tableName: 'whitelisted_roles',
});

module.exports = WhitelistedRole;
