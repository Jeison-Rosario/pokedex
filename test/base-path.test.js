const test = require('node:test');
const assert = require('node:assert/strict');
const { once } = require('node:events');
const fs = require('node:fs/promises');
const path = require('node:path');
const { hashPassword } = require('../services/passwordService');
const { readConfig } = require('../config/runtime');
const cookieFrom = r => r.headers.getSetCookie().map(x => x.split(';')[0]).join('; ');
const tokenFrom = html => { const m = html.match(/name="_csrf" value="([a-f0-9]{64})"/); assert.ok(m); return m[1]; };
function checkLinks(html) {
  for (const m of html.matchAll(/(?:href|src|action)="(\/[^"]*)"/g)) assert.ok(m[1].startsWith('/pokedex/'), m[1]);
}
test('BASE_PATH rejects unsafe paths and normalizes a trailing slash', () => {
  const env = { MYSQLHOST:'localhost', MYSQLDATABASE:'demo', MYSQLUSER:'demo' };
  assert.equal(readConfig({...env,BASE_PATH:'/pokedex/'}).basePath, '/pokedex');
  assert.equal(readConfig({...env,BASE_PATH:'/'}).basePath, '');
  for (const value of ['//other.test','pokedex','/../other','/pokedex?x=1','/a%2fb','/a b']) assert.throws(() => readConfig({...env,BASE_PATH:value}), /BASE_PATH/);
});
test('prefixed deployment supports preserved and trimmed proxy paths', async t => {
  Object.assign(process.env, { MYSQLHOST:'localhost', MYSQLDATABASE:'test', MYSQLUSER:'test', DEMO_MODE:'true',
    BASE_PATH:'/pokedex/', ADMIN_ENABLED:'true', ADMIN_USERNAME:'tester', ADMIN_PASSWORD_HASH:await hashPassword('prefix-test-only-password'),
    SESSION_SECRET:'prefix-test-secret-with-more-than-32-characters', COOKIE_SECURE:'false', TRUST_PROXY:'false', NODE_ENV:'test' });
  const { Pokemon, Region, Tipo } = require('../models');
  const region={idRegion:1,region:'Kanto',dataValues:{idRegion:1,region:'Kanto'}};
  const tipo={idTipo:1,tipo:'Agua',dataValues:{idTipo:1,tipo:'Agua'}};
  const pokemon={idPokemon:1,namePokemon:'Squirtle',imagePokemon:'/uploads/squirtle-1760649912828.png',region,tipo,
    dataValues:{idPokemon:1,namePokemon:'Squirtle',imagePokemon:'/uploads/squirtle-1760649912828.png',regionPokemonId:1,tipoPokemonId:1}};
  Region.findAll=async()=>[region]; Tipo.findAll=async()=>[tipo];
  Region.findOne=async()=>region; Tipo.findOne=async()=>tipo;
  Pokemon.findAll=async()=>[pokemon]; Pokemon.findByPk=async()=>pokemon;
  Pokemon.findAndCountAll=async()=>({rows:[pokemon],count:50});
  let uploaded;
  Pokemon.create=async value=>{uploaded=value;return value;};
  Pokemon.update=async()=>[1]; Pokemon.destroy=async()=>1;
  Region.create=async v=>v; Tipo.create=async v=>v;
  const app=require('../app');const server=app.listen(0,'127.0.0.1');await once(server,'listening');
  t.after(async()=>{app.locals.sessionStore.stopInterval();await new Promise(resolve=>server.close(resolve));});
  const base=`http://127.0.0.1:${server.address().port}`;
  const canonical=await fetch(base+'/pokedex?search=Squirtle',{redirect:'manual'});
  assert.equal(canonical.status,308);assert.equal(canonical.headers.get('location'),'/pokedex/?search=Squirtle');
  for (const mode of ['preserved','trimmed']) {
    const internal=url=>mode==='preserved'?'/pokedex'+url:url;
    const get=(url,headers={})=>fetch(base+internal(url),{headers,redirect:'manual'});
    const post=(url,cookie,data)=>fetch(base+internal(url),{method:'POST',redirect:'manual',headers:{cookie,'content-type':'application/x-www-form-urlencoded'},body:new URLSearchParams(data)});
    let response=await get('/?search=Squirtle&region=1&tipo=1');let html=await response.text();assert.equal(response.status,200);checkLinks(html);
    assert.match(html,/\/pokedex\/uploads\/squirtle/);assert.match(html,/href="\/pokedex\/\?search/);
    for(const asset of ['/assets/css/style.css','/assets/css/bootstrap/bootstrap.min.css','/assets/js/bootstrap/bootstrap.bundle.min.js','/uploads/squirtle-1760649912828.png']) assert.equal((await get(asset)).status,200,mode+asset);
    assert.equal((await get('/healthz')).status,200);
    response=await get('/create-pokemones');assert.equal(response.headers.get('location'),'/pokedex/admin/login');
    response=await get('/admin/login');html=await response.text();checkLinks(html);const cookie=cookieFrom(response),token=tokenFrom(html);
    assert.match(response.headers.get('set-cookie'),/Path=\/pokedex\//);
    response=await post('/admin/login',cookie,{_csrf:token,username:'tester',password:'prefix-test-only-password'});
    assert.equal(response.status,302,mode);assert.equal(response.headers.get('location'),'/pokedex/');const adminCookie=cookieFrom(response);
    response=await get('/edit-pokemones/1?edit=true',{cookie:adminCookie});html=await response.text();assert.equal(response.status,200);checkLinks(html);const csrf=tokenFrom(html);
    for(const entity of ['regiones','tipos']) {
      response=await get(`/create-${entity}`,{cookie:adminCookie});assert.equal(response.status,200);checkLinks(await response.text());
      response=await post(`/create-${entity}`,adminCookie,{_csrf:csrf,Name:'Demo'});assert.equal(response.headers.get('location'),`/pokedex/${entity}-list`);
    }
    const image=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aWQAAAABJRU5ErkJggg==','base64');
    const form=new FormData();form.set('_csrf',csrf);form.set('pokemonName','Demo');form.set('regionPokemonId','1');form.set('tipoPokemonId','1');form.set('pokemonImage',new Blob([image],{type:'image/png'}),'demo.png');
    response=await fetch(base+internal('/create-pokemones'),{method:'POST',headers:{cookie:adminCookie},body:form,redirect:'manual'});
    assert.equal(response.status,302);assert.equal(response.headers.get('location'),'/pokedex/pokemones-list');
    assert.ok(uploaded.imagePokemon.startsWith('/uploads/'),'stored paths must not contain BASE_PATH');
    const file=path.join(__dirname,'..',uploaded.imagePokemon);t.after(()=>fs.unlink(file).catch(()=>{}));
    assert.deepEqual(await fs.readFile(file),image);
    response=await post('/edit-pokemones',adminCookie,{_csrf:csrf,pokemonId:'1',pokemonName:'Demo',regionPokemonId:'1',tipoPokemonId:'1'});assert.equal(response.headers.get('location'),'/pokedex/pokemones-list');
    response=await post('/admin/logout',adminCookie,{_csrf:csrf});assert.equal(response.headers.get('location'),'/pokedex/');assert.match(response.headers.get('set-cookie'),/Path=\/pokedex\//);
    assert.equal((await post('/delete-pokemones',adminCookie,{_csrf:csrf,pokemonId:'1'})).status,403);
  }
  const {withBasePath}=require('../util/urls');
  assert.equal(withBasePath('/pokedex','/pokedex/uploads/image.png'),'/pokedex/uploads/image.png');
  assert.equal(withBasePath('/pokedex','https://example.invalid/image.png'),'https://example.invalid/image.png');
  assert.equal(withBasePath('','/assets/image.png'),'/assets/image.png');
});
