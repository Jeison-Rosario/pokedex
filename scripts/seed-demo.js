const connection = require('../context/appContext');
const { Pokemon, Region, Tipo } = require('../models');
async function seed() {
  try {
    await connection.transaction(async transaction => {
      if (await Pokemon.count({ transaction }) + await Region.count({ transaction }) + await Tipo.count({ transaction })) {
        throw new Error('NONEMPTY');
      }
      const region = await Region.create({ region: 'Kanto' }, { transaction });
      const definitions = [
        ['Pikachu', 'Eléctrico', 'pikachu-1760643142068.png'],
        ['Charizard', 'Fuego', 'Charizard-1760649844788.png'],
        ['Squirtle', 'Agua', 'squirtle-1760649912828.png']
      ];
      for (const [name, type, image] of definitions) {
        const tipo = await Tipo.create({ tipo: type }, { transaction });
        await Pokemon.create({ namePokemon: name, imagePokemon: '/uploads/' + image,
          regionPokemonId: region.idRegion, tipoPokemonId: tipo.idTipo }, { transaction });
      }
    });
    console.log('Demo preparada con Pikachu, Charizard y Squirtle.');
  } catch (error) {
    console.error(error.message === 'NONEMPTY' ? 'Seed cancelado: utiliza una base vacía. No se modificaron datos.' : 'No se pudo preparar la demo. Revisa conexión y ejecuta db:sync.');
    process.exitCode = 1;
  } finally { await connection.close(); }
}
seed();
