const { Op } = require('sequelize');
const { Pokemon, Region, Tipo } = require('../models');
const PAGE_SIZE = 24;
function positive(value, fallback) {
  if (value === undefined || value === '') return fallback;
  if (typeof value !== 'string' || !/^[1-9]\d{0,8}$/.test(value)) throw new Error('INVALID_FILTER');
  return Number(value);
}
exports.GetPokedexList = async (req, res, next) => {
  let page, regionId, tipoId, search;
  try {
    page = positive(req.query.page, 1);
    if (page > 10000) throw new Error('INVALID_FILTER');
    regionId = positive(req.query.region, null); tipoId = positive(req.query.tipo, null);
    if (req.query.search !== undefined && typeof req.query.search !== 'string') throw new Error('INVALID_FILTER');
    search = (req.query.search || '').trim().slice(0, 80);
  } catch { return res.status(400).send('Los filtros o la página no son válidos.'); }
  try {
    const where = {};
    if (search) where.namePokemon = { [Op.like]: `%${search}%` };
    if (regionId) where.regionPokemonId = regionId;
    if (tipoId) where.tipoPokemonId = tipoId;
    const [{ rows, count }, regions, types] = await Promise.all([
      Pokemon.findAndCountAll({ where, include: [{ model: Region }, { model: Tipo }],
        order: [['idPokemon', 'ASC']], limit: PAGE_SIZE, offset: (page - 1) * PAGE_SIZE, distinct: true }),
      Region.findAll({ order: [['region', 'ASC']] }), Tipo.findAll({ order: [['tipo', 'ASC']] })
    ]);
    const url = target => {
      const query = new URLSearchParams();
      if (search) query.set('search', search);
      if (regionId) query.set('region', String(regionId));
      if (tipoId) query.set('tipo', String(tipoId));
      query.set('page', String(target)); return '/?' + query;
    };
    const pages = Math.max(1, Math.ceil(count / PAGE_SIZE));
    res.render('pokedex/pokedex', {
      pageTitle: 'Pokédex · Catálogo', homeActive: true, search, total: count, page, pages,
      previousUrl: page > 1 ? url(page - 1) : null, nextUrl: page < pages ? url(page + 1) : null,
      regiones: regions.map(r => ({ ...r.dataValues, selected: r.idRegion === regionId })),
      tipos: types.map(t => ({ ...t.dataValues, selected: t.idTipo === tipoId })),
      pokemones: rows.map(p => ({ id: p.idPokemon, name: p.namePokemon,
        tipo: p.tipo?.tipo || 'Desconocido', region: p.region?.region || 'Desconocida', image: p.imagePokemon })),
      hasPokemones: rows.length > 0
    });
  } catch (error) { next(error); }
};
