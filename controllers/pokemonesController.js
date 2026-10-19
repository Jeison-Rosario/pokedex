const { appUrl } = require('../util/urls');
const pokemon = require("../models/pokemon");
const region = require("../models/region");
const tipo = require("../models/tipo");


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
      next(err); 
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
          next(err);
      });
};

exports.PostCreatePokemones = (req, res, next) => {
 

  const pokemonName = req.body.pokemonName; 
  const pokemonRegion = req.body.regionPokemonId;  
  const pokemonTipo = req.body.tipoPokemonId;

  if (!pokemonRegion || !pokemonTipo) {
      return res.status(400).send("Por favor, selecciona una región y un tipo.");
  }

  const imagePokemon = req.file ? `/uploads/${req.file.filename}` : "/assets/images/pokemon-placeholder.svg";

  pokemon.create({
      namePokemon: pokemonName,
      regionPokemonId: pokemonRegion,   
      tipoPokemonId: pokemonTipo,
      imagePokemon: imagePokemon,
  })
  .then(() => {
      res.redirect(appUrl("/pokemones-list")); 
  })
  .catch((err) => {
      next(err);
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
        if (!pokemonData) return res.status(404).send("Pokémon no encontrado.");
        const pokemon = pokemonData.dataValues;
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
        next(err);
    });
};

exports.PostEditPokemones = async (req, res, next) => {


      const Name = req.body.pokemonName;
      const region = req.body.regionPokemonId;
      const tipo = req.body.tipoPokemonId;
      const pokemonId = req.body.pokemonId;
      
      let current;
      try { current = await pokemon.findByPk(pokemonId); }
      catch (error) { return next(error); }
      if (!current) return res.status(404).send("Pokémon no encontrado.");
      const imagePokemon = req.file ? `/uploads/${req.file.filename}` : current.imagePokemon;

      pokemon.update(
        { 
          namePokemon: Name, 
          regionPokemonId: region, 
          tipoPokemonId: tipo,
          imagePokemon: imagePokemon
        }, 
        { where: { idPokemon: pokemonId } }
      )
      .then(() => res.redirect(appUrl("/pokemones-list")))
      .catch(err => {
          next(err);
      });
};

exports.PostDeletePokemones = (req, res, next) => {
    const pokemonId = req.body.pokemonId;

    pokemon.destroy({ where: { idPokemon: pokemonId } })
      .then((result) => {
        return res.redirect(appUrl("/pokemones-list"));
      })
      .catch((err) => {
        next(err);
      });
};
