const express = require("express");
const fs = require('fs');
const path = require("path");
const { engine } = require("express-handlebars");
const mysql = require('mysql');
require('dotenv').config();

const { Pokemon, Region, Tipo } = require("./models/index");

const pokedexRouter = require("./routes/pokedex");
const pokemonRouter = require("./routes/pokemones");
const regionRouter = require("./routes/regiones");
const tipoRouter = require("./routes/tipo");
const errorController = require("./controllers/errorController");

const app = express();

const compareHelpers = require("./util/helpers/hbs/compare");

app.engine(
    "hbs",
    engine({
        layoutsDir: "views/layouts/",
        defaultLayout: "mainLayout",
        extname: "hbs",
        helpers: {
            equalValue: compareHelpers.EqualValue,
        },
    })
);

app.set("view engine", "hbs");
app.set("views", "views");

app.use(express.urlencoded({ extended: false }));

app.use(express.static(path.join(__dirname, "public")));

const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use(pokedexRouter);
app.use(pokemonRouter);
app.use(regionRouter);
app.use(tipoRouter);
app.use(errorController.Get404);

const connection = mysql.createConnection({
  host: process.env.MYSQLHOST,
  user: process.env.MYSQLUSER,
  password: process.env.MYSQLPASSWORD,
  database: process.env.MYSQLDATABASE,
  port: process.env.MYSQLPORT,
});

connection.connect((err) => {
  if (err) {
    console.error('Error connecting to the database:', err);
    return;
  }
  console.log('Connected to the MySQL database!');
});

connection
    .sync()
    .then(() => {
        app.listen(3000);
    })
    .catch((err) => {
        console.error("Error al sincronizar la base de datos:", err);
    });