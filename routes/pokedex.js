const express = require("express");

const router = express.Router();

const pokedexController = require("../controllers/pokedexController");

router.get("/", pokedexController.GetPokedexList);

module.exports = router;