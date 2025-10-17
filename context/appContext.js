require('dotenv').config();
const { Sequelize } = require('sequelize');

const connection = new Sequelize(process.env.MYSQLDATABASE, process.env.MYSQLUSER, process.env.MYSQLPASSWORD, {
  dialect: 'mysql',
  host: process.env.MYSQLHOST,
  port: process.env.MYSQLPORT,
});

module.exports = connection;