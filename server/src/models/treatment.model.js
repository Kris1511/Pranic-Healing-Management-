const { v4: uuidv4 } = require('uuid');

module.exports = (sequelize, DataTypes) => {
  const Treatment = sequelize.define('Treatment', {
    id: {
      type: DataTypes.UUID,
      defaultValue: () => uuidv4(),
      primaryKey: true,
    },
    sessionId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    treatmentName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    cost: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  }, {
    tableName: 'treatments',
    timestamps: true,
    underscored: true,
  });

  Treatment.associate = (models) => {
    Treatment.belongsTo(models.Session, { foreignKey: 'sessionId', as: 'session' });
  };

  return Treatment;
};
