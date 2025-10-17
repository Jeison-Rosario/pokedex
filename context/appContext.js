const { Sequelize } = require('sequelize');

const connection = new Sequelize('pokedex', 'root', 'zNNkrztxGBOGJYhHVxKboIlmwjVohCLI', {
    dialect: 'mysql',
    host: 'mysql.railway.internal',
    port: 3306
});

module.exports = connection;