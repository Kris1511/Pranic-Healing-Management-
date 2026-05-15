const { sequelize } = require('../config/db.config');
const { Sequelize, DataTypes } = require('sequelize');
const fs = require('fs');
const path = require('path');

const db = {};
const modelsPath = __dirname;

fs.readdirSync(modelsPath)
  .filter((file) => {
    return (
      file.indexOf('.') !== 0 && 
      file !== 'index.js' && 
      file.slice(-9) === '.model.js'
    );
  })
  .forEach((file) => {
    const model = require(path.join(modelsPath, file))(sequelize, DataTypes);
    db[model.name] = model;
  });

Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
