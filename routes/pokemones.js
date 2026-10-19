const express = require("express");

const router = express.Router();

const pokemonesController = require("../controllers/pokemonesController");
const upload = require("../middlewares/upload");
const { csrfProtection } = require("../middlewares/csrf");

router.get("/pokemones-list", pokemonesController.GetPokemones);
router.get("/create-pokemones", pokemonesController.GetCreatePokemones);
router.post("/create-pokemones", upload.single('pokemonImage'), csrfProtection, upload.persistImage, pokemonesController.PostCreatePokemones);
router.get("/edit-pokemones/:pokemonId", pokemonesController.GetEditPokemones);
router.post("/edit-pokemones", upload.single("pokemonImage"), csrfProtection, upload.persistImage, pokemonesController.PostEditPokemones);
router.post("/delete-pokemones", pokemonesController.PostDeletePokemones);

module.exports = router;
