const Pokemon = require("./pokemon");
const Region = require("./region");
const Tipo = require("./tipo");

Region.hasMany(Pokemon, { foreignKey: { name: "regionPokemonId", allowNull: false }, onDelete: "RESTRICT" });
Pokemon.belongsTo(Region, { foreignKey: { name: "regionPokemonId", allowNull: false }, onDelete: "RESTRICT" });

Tipo.hasMany(Pokemon, { foreignKey: { name: "tipoPokemonId", allowNull: false }, onDelete: "RESTRICT" });
Pokemon.belongsTo(Tipo, { foreignKey: { name: "tipoPokemonId", allowNull: false }, onDelete: "RESTRICT" });

module.exports = { Pokemon, Region, Tipo };
