'use strict';
module.exports = (sequelize, DataTypes) => {
  const Role = sequelize.define('Role', {
    role: DataTypes.STRING
  }, {});
  Role.associate = function (models) {
    // associations can be defined here
    Role.hasMany(models.User, { onDelete: 'CASCADE', hooks: true })
  };
  return Role;
};