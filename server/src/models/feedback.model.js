const { v4: uuidv4 } = require('uuid');

module.exports = (sequelize, DataTypes) => {
  const Feedback = sequelize.define('Feedback', {
    id: {
      type: DataTypes.UUID,
      defaultValue: () => uuidv4(),
      primaryKey: true,
    },
    patientId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    rating: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 5,
      },
    },
    comment: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    branchId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
  }, {
    tableName: 'feedbacks',
    timestamps: true,
    underscored: true,
  });

  Feedback.associate = (models) => {
    Feedback.belongsTo(models.Patient, { foreignKey: 'patientId', as: 'patient' });
    Feedback.belongsTo(models.Branch, { foreignKey: 'branchId', as: 'branch' });
  };

  return Feedback;
};
