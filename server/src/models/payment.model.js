const { v4: uuidv4 } = require('uuid');

module.exports = (sequelize, DataTypes) => {
  const Payment = sequelize.define('Payment', {
    id: {
      type: DataTypes.UUID,
      defaultValue: () => uuidv4(),
      primaryKey: true,
    },
    sessionId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    paymentMethod: {
      type: DataTypes.STRING, // cash, card, upi, etc.
      allowNull: false,
    },
    paymentDate: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    status: {
      type: DataTypes.STRING, // paid, pending, failed
      allowNull: false,
      defaultValue: 'paid',
    },
    branchId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
  }, {
    tableName: 'payments',
    timestamps: true,
    underscored: true,
  });

  Payment.associate = (models) => {
    Payment.belongsTo(models.Session, { foreignKey: 'sessionId', as: 'session' });
    Payment.belongsTo(models.Branch, { foreignKey: 'branchId', as: 'branch' });
  };

  return Payment;
};
