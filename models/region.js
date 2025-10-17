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
        }
    }
)

module.exports = region;