const {Sequelize, DataTypes } = require("sequelize");
const connection = require("../context/appContext");

const tipo = connection.define(
    "tipo",
    {
        idTipo:{
            type: DataTypes.INTEGER,
            autoIncrement: true,
            allowNull: false,
            primaryKey: true,
        },
        tipo:{
            type: DataTypes.STRING(50),
            allowNull: false,
        }
    }
)

module.exports = tipo;