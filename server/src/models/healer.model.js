const { v4: uuidv4 } = require('uuid');

module.exports = (sequelize, DataTypes) => {
  const Healer = sequelize.define('Healer', {
    id: {
      type: DataTypes.UUID,
      defaultValue: () => uuidv4(),
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    specialization: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isEmail: true,
      },
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'active',
    },
    branchId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
  }, {
    tableName: 'healers',
    timestamps: true,
    underscored: true,
  });

  Healer.associate = (models) => {
    Healer.belongsTo(models.Branch, { foreignKey: 'branchId', as: 'branch' });
    Healer.hasMany(models.Session, { foreignKey: 'healerId', as: 'sessions' });
  };

  return Healer;
};
