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
            validate: { notEmpty: true, len: [1, 50],
              notBlank(value) { if (!value.trim()) throw new Error("El nombre no puede estar vacío"); } },
        }
    }
)

module.exports = tipo;
