const { v4: uuidv4 } = require('uuid');

module.exports = (sequelize, DataTypes) => {
  const Attendance = sequelize.define('Attendance', {
    id: {
      type: DataTypes.UUID,
      defaultValue: () => uuidv4(),
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    checkIn: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    checkOut: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    status: {
      type: DataTypes.STRING, // present, absent, late, etc.
      allowNull: false,
      defaultValue: 'present',
    },
  }, {
    tableName: 'attendance',
    timestamps: true,
    underscored: true,
  });

  Attendance.associate = (models) => {
    Attendance.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
  };

  return Attendance;
};
