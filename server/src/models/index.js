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
    console.log("Loading:", file);
    try {
      const imported = require(path.join(modelsPath, file));
      console.log("Type:", typeof imported);
      
      if (typeof imported !== 'function') {
        console.log("Loading status: FAILED (Not a function)");
        return;
      }
      
      const model = imported(sequelize, DataTypes);
      db[model.name] = model;
      console.log("Loading status: SUCCESS");
    } catch (err) {
      console.log("Loading status: FAILED with error:", err.message);
      throw err;
    }
  });

Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;

