const { v4: uuidv4 } = require('uuid');

module.exports = (sequelize, DataTypes) => {
  const Branch = sequelize.define('Branch', {
    id: {
      type: DataTypes.UUID,
      defaultValue: () => uuidv4(),
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isEmail: true,
      },
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'active',
    },
    addressLine1: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'address_line1',
    },
    addressLine2: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'address_line2',
    },
    city: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    district: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    state: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    pincode: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    details: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  }, {
    tableName: 'branches',
    timestamps: true,
    underscored: true,
  });

  Branch.associate = (models) => {
    Branch.hasMany(models.User, { foreignKey: 'branchId', as: 'users' });
  };

  return Branch;
};
