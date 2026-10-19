const test = require('node:test');
const assert = require('node:assert/strict');
const { once } = require('node:events');
const fs = require('node:fs/promises');
const path = require('node:path');
const { hashPassword, verifyPassword } = require('../services/passwordService');
const cookieFrom = r => r.headers.getSetCookie().map(x => x.split(';')[0]).join('; ');
const tokenFrom = html => { const m = html.match(/name="_csrf" value="([a-f0-9]{64})"/); assert.ok(m, 'token CSRF'); return m[1]; };
test('admin login, CSRF, CRUD, image uploads and logout', async t => {
  const password = 'pokedex-test-only-password'; const hash = await hashPassword(password);
  assert.equal(await verifyPassword(password, hash), true); assert.equal(await verifyPassword('wrong', hash), false);
  Object.assign(process.env, { MYSQLHOST:'localhost', MYSQLDATABASE:'test', MYSQLUSER:'test', DEMO_MODE:'true', ADMIN_ENABLED:'true',
    ADMIN_USERNAME:'tester', ADMIN_PASSWORD_HASH:hash, SESSION_SECRET:'test-only-secret-with-more-than-32-characters', COOKIE_SECURE:'false', TRUST_PROXY:'false', NODE_ENV:'test' });
  const { Pokemon, Region, Tipo } = require('../models');
  const region = { idRegion:1, region:'Kanto', dataValues:{idRegion:1,region:'Kanto'} };
  const tipo = { idTipo:1, tipo:'Eléctrico', dataValues:{idTipo:1,tipo:'Eléctrico'} };
  const pokemon = { idPokemon:1, namePokemon:'Pikachu', imagePokemon:'/uploads/pikachu-1760643142068.png', region, tipo,
    dataValues:{idPokemon:1,namePokemon:'Pikachu',imagePokemon:'/uploads/pikachu-1760643142068.png',regionPokemonId:1,tipoPokemonId:1} };
  Region.findAll = async () => [region]; Region.findOne = async () => region;
  Tipo.findAll = async () => [tipo]; Tipo.findOne = async () => tipo;
  Pokemon.findAll = async () => [pokemon]; Pokemon.findByPk = async () => pokemon;
  Pokemon.findAndCountAll = async () => ({ rows:[pokemon], count:1 });
  const writes=[];
  for(const Model of [Pokemon,Region,Tipo]) {
    Model.create = async value => { writes.push(value);return value; };
    Model.update = async value => { writes.push(value);return [1]; };
    Model.destroy = async () => { writes.push('delete');return 1; };
  }
  const app=require('../app');const server=app.listen(0,'127.0.0.1');await once(server,'listening');
  t.after(async()=>{app.locals.sessionStore.stopInterval();await new Promise(resolve=>server.close(resolve));});
  const base=`http://127.0.0.1:${server.address().port}`;
  const post=(url,cookie,data)=>fetch(base+url,{method:'POST',redirect:'manual',headers:{cookie,'content-type':'application/x-www-form-urlencoded'},body:new URLSearchParams(data)});
  let response=await fetch(base+'/admin/login');const anonymousCookie=cookieFrom(response),token=tokenFrom(await response.text());
  assert.equal((await post('/admin/login',anonymousCookie,{username:'tester',password})).status,403);
  assert.equal((await post('/admin/login',anonymousCookie,{_csrf:token,username:'tester',password:'wrong'})).status,401);
  response=await post('/admin/login',anonymousCookie,{_csrf:token,username:'tester',password});assert.equal(response.status,302);
  const cookie=cookieFrom(response);assert.notEqual(cookie,anonymousCookie);assert.match(response.headers.get('set-cookie'),/HttpOnly/);
  response=await fetch(base+'/edit-pokemones/1?edit=true',{headers:{cookie}});let html=await response.text();assert.equal(response.status,200);
  assert.match(html,/value="1" selected/);const csrf=tokenFrom(html);
  assert.equal((await post('/delete-pokemones',cookie,{})).status,403);
  assert.equal((await post('/delete-pokemones',cookie,{_csrf:token,pokemonId:'1'})).status,403);
  for(const entity of ['regiones','tipos']) {
    for(const action of ['create','edit','delete']) {
      response=await post(`/${action}-${entity}`,cookie,{_csrf:csrf,Name:'Demo',regionId:'1',tipoId:'1'});assert.equal(response.status,302);
    }
    response=await fetch(base+`/edit-${entity}/1?edit=true`,{headers:{cookie}});assert.equal(response.status,200);tokenFrom(await response.text());
  }
  const directory=path.join(__dirname,'..','uploads');const before=await fs.readdir(directory);
  const image=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aWQAAAABJRU5ErkJggg==','base64');
  const form=token=>{const f=new FormData();if(token)f.set('_csrf',token);f.set('pokemonName','Demo');f.set('regionPokemonId','1');f.set('tipoPokemonId','1');f.set('pokemonImage',new Blob([image],{type:'image/png'}),'demo.png');return f;};
  response=await fetch(base+'/create-pokemones',{method:'POST',headers:{cookie},body:form(),redirect:'manual'});assert.equal(response.status,403);assert.deepEqual(await fs.readdir(directory),before);
  const forged=form(csrf);forged.set('pokemonImage',new Blob(['fake'],{type:'image/png'}),'fake.png');
  response=await fetch(base+'/create-pokemones',{method:'POST',headers:{cookie},body:forged,redirect:'manual'});assert.equal(response.status,400);
  response=await fetch(base+'/create-pokemones',{method:'POST',headers:{cookie},body:form(csrf),redirect:'manual'});assert.equal(response.status,302);
  const filename=writes.at(-1).imagePokemon.split('/').at(-1);t.after(()=>fs.unlink(path.join(directory,filename)).catch(()=>{}));assert.deepEqual(await fs.readFile(path.join(directory,filename)),image);
  response=await post('/edit-pokemones',cookie,{_csrf:csrf,pokemonId:'1',pokemonName:'Actualizado',regionPokemonId:'1',tipoPokemonId:'1'});assert.equal(response.status,302);assert.equal(writes.at(-1).imagePokemon,pokemon.imagePokemon);
  assert.equal((await post('/delete-pokemones',cookie,{_csrf:csrf,pokemonId:'1'})).status,302);
  for(const url of ['/','/pokemones-list','/regiones-list','/tipos-list','/create-pokemones','/create-regiones','/create-tipos']) {
    response=await fetch(base+url,{headers:{cookie}});assert.equal(response.status,200,url);tokenFrom(await response.text());
  }
  assert.equal((await post('/admin/logout',cookie,{_csrf:csrf})).status,302);
  assert.equal((await post('/delete-pokemones',cookie,{_csrf:csrf,pokemonId:'1'})).status,403);
  assert.equal((await post('/delete-pokemones',anonymousCookie,{_csrf:token,pokemonId:'1'})).status,403);
  response=await fetch(base+'/admin/login');const loginCookie=cookieFrom(response),loginToken=tokenFrom(await response.text());
  for(let i=0;i<3;i++)assert.equal((await post('/admin/login',loginCookie,{_csrf:loginToken,username:'tester',password:'wrong'})).status,401);
  assert.equal((await post('/admin/login',loginCookie,{_csrf:loginToken,username:'tester',password:'wrong'})).status,429);
});
