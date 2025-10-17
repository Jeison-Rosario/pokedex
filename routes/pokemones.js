const express = require("express");

const router = express.Router();

const pokemonesController = require("../controllers/pokemonesController");
const upload = require("../middlewares/upload");

router.get("/pokemones-list", pokemonesController.GetPokemones);
router.get("/create-pokemones", pokemonesController.GetCreatePokemones);
router.post("/create-pokemones", upload.single('pokemonImage'), pokemonesController.PostCreatePokemones);
router.get("/edit-pokemones/:pokemonId", pokemonesController.GetEditPokemones);
router.post("/edit-pokemones", pokemonesController.PostEditPokemones);
router.post("/delete-pokemones", pokemonesController.PostDeletePokemones);

module.exports = router;