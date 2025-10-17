const pokemon = require("../models/pokemon");
const region = require("../models/region");
const tipo = require("../models/tipo");
const upload = require("../middlewares/upload");

exports.GetPokemones = (req, res, next) => {
  pokemon.findAll({
      include: [{ model: region }, { model: tipo }]
  })
  .then((result) => {
      const pokemones = result.map((pokemon) => ({
          id: pokemon.idPokemon,
          name: pokemon.namePokemon,
          tipo: pokemon.tipo ? pokemon.tipo.tipo : "Desconocido", 
          region: pokemon.region ? pokemon.region.region : "Desconocido",
          image: pokemon.imagePokemon 
      }));     

      res.render("pokemones/pokemones-list", {
          pageTitle: "Pokemones",
          pokemonActive: true,
          pokemones: pokemones,
          hasPokemones: pokemones.length > 0
      });
  })
  .catch((err) => {
      console.log(err);
      res.status(500).send("Error al obtener los pokemones"); 
  });
};

exports.GetCreatePokemones = (req, res, next) => {
  Promise.all([pokemon.findAll(), region.findAll(), tipo.findAll()])
      .then(([pokemonesData, regionesData, tiposData]) => {
          const pokemones = pokemonesData.map(pokemon => pokemon.dataValues);
          const regiones = regionesData.map(region => region.dataValues);
          const tipos = tiposData.map(tipo => tipo.dataValues);

          res.render("pokemones/create-pokemones", {
              pageTitle: "Agregar Pokemones",
              pokemonActive: true,
              editMode: false,
              pokemones: pokemones,
              hasPokemones: pokemones.length > 0,
              regiones: regiones,
              hasRegiones: regiones.length > 0,
              tipos: tipos,
              hasTipos: tipos.length > 0,
              imagePokemon: pokemones.imagePokemon
          });
      })
      .catch((err) => {
          console.error("Error al obtener pokemones:", err);
      });
};

exports.PostCreatePokemones = (req, res, next) => {
  console.log("Datos recibidos:", req.body);
  console.log("Archivo recibido:", req.file); 

  const pokemonName = req.body.pokemonName; 
  const pokemonRegion = req.body.regionPokemonId;  
  const pokemonTipo = req.body.tipoPokemonId;

  if (!pokemonRegion || !pokemonTipo) {
      return res.status(400).send("Por favor, selecciona una región y un tipo.");
  }

  const imagePokemon = req.file ? `/uploads/${req.file.filename}` : "/uploads/default.png";

  pokemon.create({
      namePokemon: pokemonName,
      regionPokemonId: pokemonRegion,   
      tipoPokemonId: pokemonTipo,
      imagePokemon: imagePokemon,
  })
  .then(() => {
      res.redirect("/pokemones-list"); 
  })
  .catch((err) => {
      console.log("Error al crear el Pokémon:", err);
      res.status(500).send("Error al crear el Pokémon");
  });
};

exports.GetEditPokemones = (req, res, next) => {
    const pokemonId = req.params.pokemonId;
    
    Promise.all([
        pokemon.findByPk(pokemonId, {
            include: [
                { model: region },
                { model: tipo }
            ]
        }),
        region.findAll(),
        tipo.findAll()
    ])
    .then(([pokemonData, regionesData, tiposData]) => {
        const pokemon = pokemonData ? pokemonData.dataValues : null;
        const regiones = regionesData.map((r) => r.dataValues);
        const tipos = tiposData.map((t) => t.dataValues);

        res.render("pokemones/create-pokemones", {
            pageTitle: "Editar Pokémon",
            editMode: true,
            pokemon: pokemon,
            regiones: regiones,
            tipos: tipos,
            hasRegiones: regiones.length > 0,
            hasTipos: tipos.length > 0
        });
    })
    .catch((err) => {
        console.error("Error al obtener el Pokémon o regiones:", err);
        res.status(500).send("Error al obtener los datos");
    });
};

exports.PostEditPokemones = (req, res, next) => {
  upload.single('pokemonImage')(req, res, function (err) {
      if (err) {
          return res.status(500).send("Error al subir la imagen.");
      }

      const Name = req.body.pokemonName;
      const region = req.body.regionPokemonId;
      const tipo = req.body.tipoPokemonId;
      const pokemonId = req.body.pokemonId;
      
      const imagePokemon = req.file ? `/uploads/${req.file.filename}`:null;

      pokemon.update(
        { 
          namePokemon: Name, 
          regionPokemonId: region, 
          tipoPokemonId: tipo,
          imagePokemon: imagePokemon
        }, 
        { where: { idPokemon: pokemonId } }
      )
      .then(() => res.redirect("/pokemones-list"))
      .catch(err => {
          console.log(err);
          res.status(500).send("Error al editar el pokemon");
      });
  });
};

exports.PostDeletePokemones = (req, res, next) => {
    const pokemonId = req.body.pokemonId;

    pokemon.destroy({ where: { idPokemon: pokemonId } })
      .then((result) => {
        return res.redirect("/pokemones-list");
      })
      .catch((err) => {
        console.log(err);
        res.status(500).send("Error al eliminar el pokemon");
      });
};
