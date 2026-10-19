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
            validate: { notEmpty: true, len: [1, 50],
              notBlank(value) { if (!value.trim()) throw new Error("El nombre no puede estar vacío"); } },
        },
        imagePokemon: {
            type: DataTypes.STRING,  
            allowNull: false,         
        }
    }
);

module.exports = pokemon;
