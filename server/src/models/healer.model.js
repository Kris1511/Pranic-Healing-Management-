// const { v4: uuidv4 } = require('uuid');

// module.exports = (sequelize, DataTypes) => {
//   const Healer = sequelize.define('Healer', {
//     id: {
//       type: DataTypes.UUID,
//       defaultValue: () => uuidv4(),
//       primaryKey: true,
//     },
//     name: {
//       type: DataTypes.STRING,
//       allowNull: false,
//     },
//     specialization: {
//       type: DataTypes.STRING,
//       allowNull: true,
//     },
//     phone: {
//       type: DataTypes.STRING,
//       allowNull: true,
//     },
//     email: {
//       type: DataTypes.STRING,
//       allowNull: true,
//       validate: {
//         isEmail: true,
//       },
//     },
//     status: {
//       type: DataTypes.STRING,
//       allowNull: false,
//       defaultValue: 'active',
//     },
//     branchId: {
//       type: DataTypes.UUID,
//       allowNull: true,
//     },
//   }, {
//     tableName: 'healers',
//     timestamps: true,
//     underscored: true,
//   });

//   Healer.associate = (models) => {
//     Healer.belongsTo(models.Branch, { foreignKey: 'branchId', as: 'branch' });
//     Healer.hasMany(models.Session, { foreignKey: 'healerId', as: 'sessions' });
//   };

//   return Healer;
// };


const { v4: uuidv4 } = require('uuid');

module.exports = (sequelize, DataTypes) => {
  const Healer = sequelize.define(
    'Healer',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: () => uuidv4(),
        primaryKey: true,
      },

      healerId: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },

      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      gender: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      dob: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },

      mobile: {
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

      address: {
        type: DataTypes.TEXT,
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

      status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'Active',
      },

      certLevel: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      specialization: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      experience: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },

      languages: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      verificationStatus: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      profilePhoto: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      idProof: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      certification: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      branchId: {
        type: DataTypes.UUID,
        allowNull: true,
      },
    },
    {
      tableName: 'healers',
      timestamps: true,
      underscored: true,
    }
  );

  Healer.associate = (models) => {
    Healer.belongsTo(models.Branch, {
      foreignKey: 'branchId',
      as: 'branch',
    });

    Healer.hasMany(models.Session, {
      foreignKey: 'healerId',
      as: 'sessions',
    });
  };

  return Healer;
};