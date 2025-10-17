const express = require("express");
const fs = require('fs');
const path = require("path");
const { engine } = require("express-handlebars");
const { Sequelize } = require('sequelize');


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

const connection = new Sequelize(process.env.MYSQLDATABASE, process.env.MYSQLUSER, process.env.MYSQLPASSWORD, {
  host: process.env.MYSQLHOST,
  dialect: 'mysql',
  port: process.env.MYSQLPORT,
  logging: console.log,
});

connection.sync()
  .then(() => {
    console.log('Database synced successfully!');
    app.listen(3000, () => {
      console.log('Server is running on port 3000');
    });
  })
  .catch((err) => {
    console.error('Error syncing the database:', err);
  });