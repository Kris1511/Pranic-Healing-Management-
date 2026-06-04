const { v4: uuidv4 } = require("uuid");

module.exports = (sequelize, DataTypes) => {
  const Patient = sequelize.define(
    "Patient",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: () => uuidv4(),
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      patientId: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      age: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      gender: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      phone: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      address: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "active",
      },
      branchId: {
        type: DataTypes.UUID,
        allowNull: true,
      },
      dob: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },

      bloodGroup: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      occupation: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      email: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      emergencyContact: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      medicalHistory: {
        type: DataTypes.TEXT,
        allowNull: true,
      },

      treatmentType: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      healerId: {
        type: DataTypes.UUID,
        allowNull: true,
      },

      username: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      password: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      medicalReport: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      labReport: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      prescription: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      idProof: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      tableName: "patients",
      timestamps: true,
      underscored: true,
    },
  );

  Patient.associate = (models) => {
    Patient.belongsTo(models.Branch, { foreignKey: "branchId", as: "branch" });
    Patient.belongsTo(models.Healer, { foreignKey: "healerId", as: "healer" });
    Patient.hasMany(models.Session, {
      foreignKey: "patientId",
      as: "sessions",
    });
    Patient.hasMany(models.Document, {
      foreignKey: "patientId",
      as: "documents",
    });
  };

  return Patient;
};
