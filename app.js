const express = require("express");
const fs = require('fs');
const path = require("path");
const { engine } = require("express-handlebars");
const config = require("./config");
const { appUrl } = require("./util/urls");
const { basePathMiddleware } = require("./middlewares/basePath");
const session = require("express-session");
const MemoryStore = require("memorystore")(session);
const { csrfToken, csrfProtection } = require("./middlewares/csrf");
const { demoGuard } = require("./middlewares/demo");

require("./models");

const pokedexRouter = require('./routes/pokedex');
const pokemonRouter = require('./routes/pokemones');
const regionRouter = require('./routes/regiones');
const tipoRouter = require('./routes/tipo');
const errorController = require("./controllers/errorController");

const app = express();

const compareHelpers = require("./util/helpers/hbs/compare");

app.engine(
    "hbs",
    engine({
        layoutsDir: path.join(__dirname, "views/layouts"),
        partialsDir: path.join(__dirname, "views/partials"),
        defaultLayout: "mainLayout",
        extname: "hbs",
        helpers: {
            equalValue: compareHelpers.EqualValue,
            url: appUrl,
        },
    })
);

app.set("view engine", "hbs");
app.set("views", path.join(__dirname, "views"));

app.disable("x-powered-by");
app.use(basePathMiddleware(config.basePath));
if (config.trustProxy) app.set('trust proxy', 1);
app.use((req, res, next) => {
    res.set('X-Content-Type-Options', 'nosniff');
    res.set('Referrer-Policy', 'same-origin');
    res.set('X-Frame-Options', 'DENY');
    next();
});
app.get("/healthz", (req, res) => res.json({ status: "ok", demo: config.demoMode }));

app.use(express.static(path.join(__dirname, "public")));

const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

if (config.admin.enabled) {
    const store = new MemoryStore({ max: 100, ttl: 3600000, checkPeriod: 600000 });
    app.locals.sessionStore = store;
    app.use(session({
        name: 'pokedex.sid', secret: config.admin.secret,
        resave: false, saveUninitialized: false,
        store,
        cookie: { path: config.cookiePath, httpOnly: true, secure: config.admin.cookieSecure, sameSite: 'strict', maxAge: 3600000 }
    }));
}
app.use(express.urlencoded({ extended: false, limit: '32kb' }));
app.use('/admin', require('./routes/admin'));
app.use(demoGuard(config.demoMode, config.admin.enabled));
app.use((req, res, next) => {
    if (req.session?.isAdmin) res.locals.csrfToken = csrfToken(req);
    // Las páginas cambian según la sesión; no almacenar formularios ni tokens en cachés compartidas.
    res.set('Cache-Control', 'no-store');
    if (req.is('multipart/form-data') && ['/create-pokemones', '/edit-pokemones'].includes(req.path)) return next();
    csrfProtection(req, res, next);
});
app.use(pokedexRouter);
app.use(pokemonRouter);
app.use(regionRouter);
app.use(tipoRouter);
app.use(errorController.Get404);


app.use((err, req, res, next) => {
    if (res.headersSent) return next(err);
    if (err.code === 'LIMIT_FILE_SIZE') return res.status(413).send('La imagen supera el límite de 2 MB.');
    if (err.code === 'INVALID_IMAGE') return res.status(400).send('Solo se permiten imágenes PNG o JPEG.');
    if (err.status === 413) return res.status(413).send('El formulario supera el tamaño permitido.');
    if (err.name === 'SequelizeValidationError') return res.status(400).send('Revisa los campos del formulario.');
    if (err.name === 'SequelizeForeignKeyConstraintError') return res.status(400).send('No se pudo completar la operación: comprueba los registros relacionados. No se pueden eliminar regiones o tipos que tengan Pokémon asociados.');
    console.error('Error de aplicación:', err.name || 'Error');
    res.status(500).send('No se pudo completar la operación.');
});
module.exports = app;
