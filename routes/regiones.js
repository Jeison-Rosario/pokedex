const express = require("express");

const router = express.Router();

const regionController = require("../controllers/regionController");

router.get("/regiones-list", regionController.GetRegionesList);
router.get("/create-regiones", regionController.GetCreateRegiones);
router.post("/create-regiones", regionController.PostCreateRegiones);
router.get("/edit-regiones/:regionId", regionController.GetEditRegiones);
router.post("/edit-regiones", regionController.PostEditRegiones);
router.post("/delete-regiones", regionController.PostDeleteRegiones);

module.exports = router;