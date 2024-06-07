const { Sequelize } = require('sequelize');
const config = require('./config.json');

const db = (database) => {
  const server = {
    database: config[database].database,
    username: config[database].username,
    password: config[database].password,
    config: config[database]
  };

  return new Sequelize(server.database, server.username, server.password, server.config);
}

exports.checkDatabaseConnection = async (sequelize) => {
  try {
    await sequelize.authenticate();
    console.log('Database connected successfully.');
  } catch (error) {
    console.error('Error connecting to database:', error.message);
  } 
};

exports.test = db('test');
exports.production = db('production'); 