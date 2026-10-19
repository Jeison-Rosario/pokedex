const tipo = require("../models/tipo");

exports.GetTiposList = (req, res, next) => {
    tipo.findAll()
      .then((result) => {
        const tipos = result.map((r) => r.dataValues);  
  
        res.render("tipos/tipos-list", {
          pageTitle: "Tipos de pokemones",
          tipoActive: true,
          tipos: tipos,  
          hasTipos: tipos.length > 0,
        });
      })
      .catch((err) => {
        next(err); 
      });
};

exports.GetCreateTipos = (req, res, next) => {
    tipo.findAll()
        .then((result) => {
            const tipos = result.map((r) => r.dataValues);

            res.render("tipos/create-tipos", {
                pageTitle: "Agregar tipos de pokemones",
                tipoActive: true,
                editMode: false,
                tipos: tipos, 
                hasTipos: tipos.length > 0,
            });
        })
        .catch((err) => {
            next(err);
        });
};

exports.PostCreateTipos = (req, res, next) => {
    const tipoName = req.body.Name; 
  
    tipo.create({ tipo: tipoName }) 
      .then((result) => {
        res.redirect("/tipos-list");
      })
      .catch((err) => {
        next(err);
      });
};

exports.GetEditTipos = (req, res, next) => {
    const edit = req.query.edit;
    const tipoId = req.params.tipoId;  

    if (!edit) {
        return res.redirect("/tipos-list");
    }

    tipo.findOne({ where: { idTipo: tipoId } })
        .then((result) => {
            if (!result) { 
                return res.redirect("/tipos-list");
            }

            res.render("tipos/create-tipos", {
                pageTitle: "Editar Tipo",
                tipoActive: true,
                editMode: edit,
                tipo: result.dataValues,
            });
        })
        .catch((err) => {
            next(err);
        });
};

exports.PostEditTipos = (req, res, next) => {
    const tipoName = req.body.Name;
    const tipoId = req.body.tipoId;  

    tipo.update({ tipo: tipoName }, { where: { idTipo: tipoId } })  
        .then((result) => {
            res.redirect("/tipos-list");
        })
        .catch((err) => {
            next(err);
        });
};

exports.PostDeleteTipos = (req, res, next) => {
    const tipoId = req.body.tipoId;

    if (!tipoId) {
        return res.status(400).send("ID de tipo no proporcionado");  
    }

    tipo.destroy({ where: { idTipo: tipoId } })
        .then((result) => {
            return res.redirect("/tipos-list");
        })
        .catch((err) => {
            next(err);
        });
};
