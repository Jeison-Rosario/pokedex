function basePathMiddleware(basePath) {
  return (req, res, next) => {
    res.locals.basePath = basePath;
    if (!basePath) return next();
    // alwaysdata puede recortar el prefijo (Trim path). También admitimos el
    // prefijo completo para ejecutar exactamente esta configuración en local.
    const path = req.url.split('?')[0];
    if (path === basePath && ['GET', 'HEAD'].includes(req.method)) {
      const query = req.url.slice(path.length);
      return res.redirect(308, basePath + '/' + query);
    }
    if (path === basePath || path.startsWith(basePath + '/')) {
      req.url = req.url.slice(basePath.length);
      if (!req.url || req.url.startsWith('?')) req.url = '/' + req.url;
    }
    // express-session comprueba originalUrl frente al Path público de la cookie.
    // Reconstruimos ese URL solo desde la configuración local, nunca desde un header del cliente.
    req.originalUrl = basePath + req.url;
    next();
  };
}
module.exports = { basePathMiddleware };
