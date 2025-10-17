const Pokemon = require("./pokemon");
const Region = require("./region");
const Tipo = require("./tipo");

Region.hasMany(Pokemon, { foreignKey: "regionPokemonId", onDelete: "CASCADE" });
Pokemon.belongsTo(Region, { foreignKey: "regionPokemonId" });

Tipo.hasMany(Pokemon, { foreignKey: "tipoPokemonId", onDelete: "CASCADE" });
Pokemon.belongsTo(Tipo, { foreignKey: "tipoPokemonId" });

module.exports = { Pokemon, Region, Tipo };