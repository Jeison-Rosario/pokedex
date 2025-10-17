const { Sequelize, DataTypes } = require("sequelize");
const connection = require("../context/appContext");

const pokemon = connection.define(
    "pokemon",
    {
        idPokemon: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            allowNull: false,
            primaryKey: true,
        },
        namePokemon: {
            type: DataTypes.STRING(50),
            allowNull: false,
        },
        imagePokemon: {
            type: DataTypes.STRING,  
            allowNull: false,         
        }
    }
);

module.exports = pokemon;