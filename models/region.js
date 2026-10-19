const {Sequelize, DataTypes } = require("sequelize");
const connection = require("../context/appContext");

const region = connection.define(
    "region",
    {
        idRegion:{
            type: DataTypes.INTEGER,
            autoIncrement: true,
            allowNull: false,
            primaryKey: true,
        },
        region:{
            type: DataTypes.STRING(50),
            allowNull: false,
            validate: { notEmpty: true, len: [1, 50],
              notBlank(value) { if (!value.trim()) throw new Error("El nombre no puede estar vacío"); } },
        }
    }
)

module.exports = region;
