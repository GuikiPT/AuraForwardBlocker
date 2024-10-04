const { DataTypes } = require('sequelize');
const sequelize = require('../connection');

const WhitelistedUser = sequelize.define('WhitelistedUser', {
  guild_id: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  user_id: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
}, {
  tableName: 'whitelisted_users',
});

module.exports = WhitelistedUser;
