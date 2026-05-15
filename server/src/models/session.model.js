const { v4: uuidv4 } = require('uuid');

module.exports = (sequelize, DataTypes) => {
  const Session = sequelize.define('Session', {
    id: {
      type: DataTypes.UUID,
      defaultValue: () => uuidv4(),
      primaryKey: true,
    },
    patientId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    healerId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    branchId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    sessionDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'scheduled', // scheduled, completed, cancelled
    },
    totalAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
  }, {
    tableName: 'sessions',
    timestamps: true,
    underscored: true,
  });

  Session.associate = (models) => {
    Session.belongsTo(models.Patient, { foreignKey: 'patientId', as: 'patient' });
    Session.belongsTo(models.Healer, { foreignKey: 'healerId', as: 'healer' });
    Session.belongsTo(models.Branch, { foreignKey: 'branchId', as: 'branch' });
    Session.hasMany(models.Treatment, { foreignKey: 'sessionId', as: 'treatments' });
    Session.hasOne(models.Payment, { foreignKey: 'sessionId', as: 'payment' });
  };

  return Session;
};
