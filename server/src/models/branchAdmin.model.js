const { v4: uuidv4 } = require('uuid');

module.exports = (sequelize, DataTypes) => {
  const BranchAdmin = sequelize.define('BranchAdmin', {
    id: {
      type: DataTypes.UUID,
      defaultValue: () => uuidv4(),
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'user_id',
    },
    branchId: {
      type: DataTypes.UUID,
      allowNull: true,
      field: 'branch_id',
    },
    name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    phoneNumber: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'phone_number',
    },
    dob: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    gender: {
      type: DataTypes.STRING,
      allowNull: true,
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
    idProof: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'id_proof',
    },
    status: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: 'active',
    },
    user_id: {
      type: DataTypes.VIRTUAL,
      get() {
        return this.userId;
      }
    }
  }, {
    tableName: 'branch_admins',
    timestamps: true,
    underscored: true,
  });

  BranchAdmin.associate = (models) => {
    BranchAdmin.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
    BranchAdmin.belongsTo(models.Branch, { foreignKey: 'branchId', as: 'branch' });
  };

  return BranchAdmin;
};
