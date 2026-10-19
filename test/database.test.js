const test=require('node:test');const assert=require('node:assert/strict');const {spawnSync}=require('node:child_process');
test('MySQL demo seed, associations, filters and overwrite refusal',{skip:process.env.RUN_MYSQL_TESTS!=='true'},async t=>{
 const connection=require('../context/appContext');const {Pokemon,Region,Tipo}=require('../models');t.after(()=>connection.close());
 await connection.authenticate();const records=await Pokemon.findAll({include:[Region,Tipo]});assert.equal(records.length,3);
 const p=records.find(p=>p.namePokemon==='Pikachu');assert.equal(p.region.region,'Kanto');assert.equal(p.tipo.tipo,'Eléctrico');
 const result=await Pokemon.findAndCountAll({where:{regionPokemonId:p.regionPokemonId,tipoPokemonId:p.tipoPokemonId},limit:24,distinct:true});assert.equal(result.count,1);
 await assert.rejects(Region.destroy({where:{idRegion:p.regionPokemonId}}), err=>err.name==='SequelizeForeignKeyConstraintError');
 const second=spawnSync(process.execPath,['scripts/seed-demo.js'],{encoding:'utf8',env:process.env,timeout:15000});assert.equal(second.status,1);assert.match(second.stderr,/base vacía/);assert.equal(await Pokemon.count(),3);
});
