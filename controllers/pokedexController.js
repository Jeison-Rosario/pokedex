const pokemon = require("../models/pokemon");
const region = require("../models/region");
const tipo = require("../models/tipo");

exports.GetPokedexList = (req, res, next) => {
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
  
        res.render("pokedex/pokedex", {
            pageTitle: "Pokemones",
            homeActive: true,
            pokemones: pokemones,
            hasPokemones: pokemones.length > 0
        });
    })
    .catch((err) => {
        console.log(err);
        res.status(500).send("Error al obtener los pokemones"); 
    });
}
