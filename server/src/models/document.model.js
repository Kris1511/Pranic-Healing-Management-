const { v4: uuidv4 } = require('uuid');

module.exports = (sequelize, DataTypes) => {
  const Document = sequelize.define('Document', {
    id: {
      type: DataTypes.UUID,
      defaultValue: () => uuidv4(),
      primaryKey: true,
    },
    patientId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    fileName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    originalName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    filePath: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    fileType: {
      type: DataTypes.STRING, // reports, consultations, etc.
      allowNull: false,
    },
    mimeType: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  }, {
    tableName: 'documents',
    timestamps: true,
    underscored: true,
  });

  Document.prototype.toJSON = function () {
    const values = Object.assign({}, this.get());
    values.original_name = values.originalName;
    return values;
  };

  Document.associate = (models) => {
    Document.belongsTo(models.Patient, { foreignKey: 'patientId', as: 'patient' });
  };

  return Document;
};
