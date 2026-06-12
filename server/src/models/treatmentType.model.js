const { v4: uuidv4 } = require('uuid');

module.exports = (sequelize, DataTypes) => {
  const TreatmentType = sequelize.define('TreatmentType', {
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
    category: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    code: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    sessionDuration: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: '30 min',
      field: 'session_duration',
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'Active',
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    totalSessions: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      field: 'total_sessions',
    },
  }, {
    tableName: 'treatment_types',
    timestamps: true,
    underscored: true,
  });

  TreatmentType.associate = (models) => {
    // Add associations here if needed
  };

  return TreatmentType;
};
