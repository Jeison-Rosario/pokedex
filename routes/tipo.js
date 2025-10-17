const express = require("express");

const router = express.Router();

const tipoController = require("../controllers/tipoController");

router.get("/tipos-list", tipoController.GetTiposList);
router.get("/create-tipos", tipoController.GetCreateTipos);
router.post("/create-tipos", tipoController.PostCreateTipos);
router.get("/edit-tipos/:tipoId", tipoController.GetEditTipos);
router.post("/edit-tipos", tipoController.PostEditTipos);
router.post("/delete-tipos", tipoController.PostDeleteTipos);

module.exports = router;