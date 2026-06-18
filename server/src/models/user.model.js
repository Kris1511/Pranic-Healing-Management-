const { v4: uuidv4 } = require('uuid');

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.UUID,
      defaultValue: () => uuidv4(),
      primaryKey: true,
    },
    firebaseUid: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'user',
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'active',
    },
    phoneNumber: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    branchId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  }, {
    tableName: 'users',
    timestamps: true,
    underscored: true,
  });

  User.associate = (models) => {
    User.belongsTo(models.Branch, { foreignKey: 'branchId', as: 'branch' });
    User.hasOne(models.BranchAdmin, { foreignKey: 'userId', as: 'branchAdminProfile' });
  };

  return User;
};
