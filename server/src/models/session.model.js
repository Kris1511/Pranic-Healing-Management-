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
      type: DataTypes.DATEONLY,
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
    paymentStatus: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: 'pending',
    },
    paymentMethod: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    treatmentType: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    startTime: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    endTime: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    followupRequired: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    followupPriority: {
      type: DataTypes.ENUM('NONE', 'PENDING', 'URGENT'),
      allowNull: true,
      defaultValue: 'NONE',
    },
    followupDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    sessionFee: {
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
