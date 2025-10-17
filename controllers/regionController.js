const region = require("../models/region");

exports.GetRegionesList = (req, res, next) => {
    region.findAll()
      .then((result) => {
        const regiones = result.map((r) => r.dataValues);  
  
        res.render("regiones/regiones-list", {
          pageTitle: "Regiones",
          regionActive: true,
          regiones: regiones,  
          hasRegiones: regiones.length > 0,
        });
      })
      .catch((err) => {
        console.log(err);
        res.status(500).send("Error al obtener las regiones"); 
      });
};

  exports.GetCreateRegiones = (req, res, next) => {
    region.findAll()
        .then((result) => {
            const regiones = result.map((r) => r.dataValues);

            res.render("regiones/create-regiones", {
                pageTitle: "Agregar regiones",
                regionActive: true,
                editMode: false,
                regiones: regiones, 
                hasRegiones: regiones.length > 0,
            });
        })
        .catch((err) => {
            console.error("Error al obtener regiones:", err);
        });
};

exports.PostCreateRegiones = (req, res, next) => {
    const regionName = req.body.Name; 
  
    region.create({ region: regionName }) 
      .then((result) => {
        res.redirect("/regiones-list");
      })
      .catch((err) => {
        console.log(err);
        res.status(500).send("Error al crear la región");
      });
};

exports.GetEditRegiones = (req, res, next) => {
    const edit = req.query.edit;
    const regionId = req.params.regionId;  
  
    if (!edit) {
      return res.redirect("/regiones-list");
    }
  
    region.findOne({ where: { idRegion: regionId } })  
      .then((result) => {

        if (!result) {
          return res.redirect("/regiones");
        }
  
        res.render("regiones/create-regiones", {
          pageTitle: "Editar Región",
          regionActive: true,
          editMode: edit,
          region: result.dataValues,
        });
      })
      .catch((err) => {
        console.log(err);
        res.status(500).send("Error al obtener la región para editar");
      });
};

exports.PostEditRegiones = (req, res, next) => {
    const regionName = req.body.Name; 
    const regionId = req.body.regionId;  
  
    region.update({ region: regionName }, { where: { idRegion: regionId } })
      .then((result) => {
        res.redirect("/regiones-list");
      })
      .catch((err) => {
        console.log(err);
        res.status(500).send("Error al editar la región");
      });
};

exports.PostDeleteRegiones = (req, res, next) => {
    const regionId = req.body.regionId;
  
    if (!regionId) {
        return res.status(400).send("ID de región no proporcionado");
    }

    region.destroy({ where: { idRegion: regionId } })
      .then((result) => {
        return res.redirect("/regiones-list");
      })
      .catch((err) => {
        console.log(err);
        res.status(500).send("Error al eliminar la región");
      });
};