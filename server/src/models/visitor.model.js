const { v4: uuidv4 } = require('uuid');

module.exports = (sequelize, DataTypes) => {
  const Visitor = sequelize.define('Visitor', {
    id: {
      type: DataTypes.UUID,
      defaultValue: () => uuidv4(),
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    purpose: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    visitorType: {
      type: DataTypes.STRING, // from constants
      allowNull: false,
    },
    branchId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    checkIn: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    checkOut: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  }, {
    tableName: 'visitors',
    timestamps: true,
    underscored: true,
  });

  Visitor.associate = (models) => {
    Visitor.belongsTo(models.Branch, { foreignKey: 'branchId', as: 'branch' });
  };

  return Visitor;
};
