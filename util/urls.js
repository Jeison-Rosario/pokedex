const config = require('../config');
function withBasePath(basePath, value = '/') {
  if (typeof value !== 'string') return '';
  // Las imágenes externas y los fragmentos no pertenecen a esta instalación.
  if (!basePath || !value.startsWith('/') || value.startsWith('//')) return value;
  if (value === basePath || value.startsWith(basePath + '/') || value.startsWith(basePath + '?')) return value;
  return basePath + value;
}
function appUrl(value) { return withBasePath(config.basePath, value); }
module.exports = { appUrl, withBasePath };
