const test = require('node:test');
const assert = require('node:assert/strict');
const { once } = require('node:events');
Object.assign(process.env, { MYSQLHOST: 'localhost', MYSQLDATABASE: 'test', MYSQLUSER: 'test', DEMO_MODE: 'true', ADMIN_ENABLED: 'false' });
const { Op } = require('sequelize');
const { Pokemon, Region, Tipo } = require('../models');
let query;
const entry = { idPokemon: 1, namePokemon: 'Pikachu', imagePokemon: '/uploads/pikachu-1760643142068.png', region: { region: 'Kanto' }, tipo: { tipo: 'Eléctrico' } };
Region.findAll = async () => [{ idRegion: 1, dataValues: { idRegion: 1, region: 'Kanto' } }];
Tipo.findAll = async () => [{ idTipo: 2, dataValues: { idTipo: 2, tipo: 'Eléctrico' } }];
Pokemon.findAll = async () => [entry];
Pokemon.findAndCountAll = async options => { query = options; return { rows: [entry], count: 50 }; };
const app = require('../app');
test('catalog filters, pagination, assets and anonymous access', async t => {
  const server = app.listen(0, '127.0.0.1'); await once(server, 'listening');
  t.after(() => new Promise(resolve => server.close(resolve)));
  const base = `http://127.0.0.1:${server.address().port}`;
  let response = await fetch(base + '/?search=Pika&region=1&tipo=2&page=2');
  assert.equal(response.status, 200); let html = await response.text();
  assert.match(html, /Pikachu/); assert.match(html, /Kanto/); assert.match(html, /Eléctrico/);
  assert.match(html, /Página 2 de 3/); assert.match(html, /name="search"[^>]*value="Pika"/);
  assert.match(html, /value="1" selected/); assert.match(html, /value="2" selected/);
  assert.doesNotMatch(html, /href="\/edit-pokemones/); assert.doesNotMatch(html, /action="\/delete-pokemones/);
  assert.equal(query.where.namePokemon[Op.like], '%Pika%');
  assert.equal(query.where.regionPokemonId, 1); assert.equal(query.where.tipoPokemonId, 2);
  assert.equal(query.limit, 24); assert.equal(query.offset, 24);
  assert.match(html.replaceAll('&#x3D;', '='), /search=Pika&amp;region=1&amp;tipo=2&amp;page=3/);
  for (const suffix of ['?region=no','?tipo=-1','?page=0','?page=10001','?search[]=a']) assert.equal((await fetch(base + '/' + suffix)).status, 400, suffix);
  for (const route of ['/pokemones-list','/regiones-list','/tipos-list']) assert.equal((await fetch(base + route)).status, 200, route);
  for (const file of ['/assets/css/bootstrap/bootstrap.min.css','/assets/css/style.css','/assets/js/bootstrap/bootstrap.bundle.min.js','/assets/images/pokemon-placeholder.svg','/uploads/pikachu-1760643142068.png','/uploads/Charizard-1760649844788.png','/uploads/squirtle-1760649912828.png']) assert.equal((await fetch(base + file)).status, 200, file);
  for (const entity of ['pokemones','regiones','tipos']) for (const action of ['create','edit','delete']) {
    assert.equal((await fetch(base + `/${action}-${entity}`, { method: 'POST' })).status, 403);
  }
  assert.equal((await fetch(base + '/create-pokemones')).status, 403);
  assert.deepEqual(await (await fetch(base + '/healthz')).json(), { status: 'ok', demo: true });
  Pokemon.findAndCountAll = async () => ({ rows: [], count: 0 });
  html = await (await fetch(base + '/')).text(); assert.match(html, /No se encontraron Pokémon/);
  assert.equal((await fetch(base + '/missing')).status, 404);
});
