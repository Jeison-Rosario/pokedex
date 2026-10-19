const test = require('node:test');
const assert = require('node:assert/strict');
Object.assign(process.env, { MYSQLHOST: 'localhost', MYSQLDATABASE: 'test', MYSQLUSER: 'test', ADMIN_ENABLED: 'false' });
const { Pokemon, Region, Tipo } = require('../models');
test('model names reject empty, blank and overlong values without a database', async () => {
  await Pokemon.build({ namePokemon: 'Demo', imagePokemon: '/image.png', regionPokemonId: 1, tipoPokemonId: 1 }).validate();
  for (const [Model, field] of [[Pokemon,'namePokemon'],[Region,'region'],[Tipo,'tipo']]) {
    for (const invalid of ['', '   ', 'x'.repeat(51)]) {
      const values = { [field]: invalid }; if (Model === Pokemon) Object.assign(values, { imagePokemon: '/image.png', regionPokemonId: 1, tipoPokemonId: 1 });
      await assert.rejects(Model.build(values).validate(), err => err.errors.some(e => e.path === field));
    }
  }
});
