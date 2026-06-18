const { v4: uuidv4 } = require('uuid');

module.exports = (sequelize, DataTypes) => {
  const Finance = sequelize.define('Finance', {
    id: {
      type: DataTypes.UUID,
      defaultValue: () => uuidv4(),
      primaryKey: true,
    },
    type: {
      type: DataTypes.STRING, // income, expense
      allowNull: false,
    },
    category: {
      type: DataTypes.STRING, // salary, rent, treatment, etc.
      allowNull: false,
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    date: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    branchId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
  }, {
    tableName: 'finance',
    timestamps: true,
    underscored: true,
  });

  Finance.associate = (models) => {
    Finance.belongsTo(models.Branch, { foreignKey: 'branchId', as: 'branch' });
  };

  return Finance;
};
