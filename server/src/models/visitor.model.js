const { v4: uuidv4 } = require('uuid');

module.exports = (sequelize, DataTypes) => {
  const Visitor = sequelize.define('Visitor', {
    id: {
      type: DataTypes.UUID,
      defaultValue: () => uuidv4(),
      primaryKey: true,
    },
    visitorId: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
      field: 'visitor_id',
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
    referenceSource: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'reference_source',
      get() {
        const rawValue = this.getDataValue('referenceSource');
        if (!rawValue) return [];
        try {
          if (rawValue.startsWith('[') && rawValue.endsWith(']')) {
            return JSON.parse(rawValue);
          }
          return rawValue.split(',').map(s => s.trim()).filter(Boolean);
        } catch (e) {
          return rawValue ? [rawValue] : [];
        }
      },
      set(value) {
        if (Array.isArray(value)) {
          this.setDataValue('referenceSource', JSON.stringify(value));
        } else if (typeof value === 'string') {
          this.setDataValue('referenceSource', value);
        } else {
          this.setDataValue('referenceSource', null);
        }
      }
    },
    gender: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    referralName: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'reference_name',
    },
    idProof: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'id_proof',
    },
    address: {
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
