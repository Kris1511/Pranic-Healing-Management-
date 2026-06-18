const { v4: uuidv4 } = require('uuid');

module.exports = (sequelize, DataTypes) => {
  const Worker = sequelize.define('Worker', {
    id: {
      type: DataTypes.UUID,
      defaultValue: () => uuidv4(),
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    salary: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'active',
    },
    branchId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
  }, {
    tableName: 'workers',
    timestamps: true,
    underscored: true,
  });

  Worker.associate = (models) => {
    Worker.belongsTo(models.Branch, { foreignKey: 'branchId', as: 'branch' });
  };

  return Worker;
};
