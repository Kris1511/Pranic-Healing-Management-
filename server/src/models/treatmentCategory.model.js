const { v4: uuidv4 } = require('uuid');

module.exports = (sequelize, DataTypes) => {
  const TreatmentCategory = sequelize.define('TreatmentCategory', {
    id: {
      type: DataTypes.UUID,
      defaultValue: () => uuidv4(),
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    code: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'Active',
    },
    treatmentCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
  }, {
    tableName: 'treatment_categories',
    timestamps: true,
    underscored: true,
  });

  TreatmentCategory.associate = (models) => {
    // Add associations here if needed
  };

  return TreatmentCategory;
};
