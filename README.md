# Pokédex · Catálogo de Pokémon

Aplicación académica en Node.js, Express, Handlebars, Sequelize y MySQL/MariaDB. Explora un catálogo propio de Pokémon con búsqueda por nombre, filtros por región y tipo y paginación de 24 resultados. No utiliza PokéAPI.

La configuración predeterminada mantiene el acceso público en **solo lectura**. El administrador opcional puede crear, editar y eliminar Pokémon, regiones y tipos, y subir imágenes mediante una sesión privada.

## Funcionalidades

- Búsqueda por nombre y filtros combinables con paginación que conserva los filtros.
- Tarjetas adaptables: una columna en móvil, dos en tablet y tres en escritorio.
- Listados de Pokémon, regiones y tipos.
- Edición que conserva la imagen anterior si no se carga otra y mantiene seleccionadas sus relaciones.
- Login opcional con hash scrypt, sesiones acotadas, límites de intentos, cookies protegidas y tokens CSRF.
- Imágenes PNG/JPEG de hasta 2 MB, verificadas antes de guardarlas.
- Regiones y tipos obligatorios; no se pueden eliminar mientras tengan Pokémon relacionados, en el esquema nuevo.

## Preparación local

Requiere Node.js 22 o 24 y MySQL/MariaDB. Crear una base nueva y un usuario exclusivo para este proyecto. No utilizar la base de BookApp.

```sh
npm ci
cp .env.example .env
```

En Windows, usar `Copy-Item .env.example .env`. Completar las variables `MYSQL*` con los datos locales. El `.env` no debe subirse a GitHub.

```sh
npm run db:sync
npm run seed:demo
npm start
```

Abrir http://127.0.0.1:3000. `db:sync` crea las tablas sin `force` ni `alter`; no modifica una instalación anterior para aplicar los nuevos cambios de restricciones. `seed:demo` añade Pikachu, Charizard y Squirtle de Kanto con las imágenes ya incluidas en el repositorio. Si cualquiera de las tres tablas contiene datos, cancela la operación sin borrar ni reemplazar registros. Los cambios posteriores de esquema necesitan migraciones.

Para desarrollo, `npm run dev`. Para probar el CRUD local sin login, usar solamente en una instancia privada `NODE_ENV=development` y `DEMO_MODE=false`. En producción, la escritura requiere el acceso de administrador.

## Configuración

| Variable | Función |
| --- | --- |
| `MYSQLHOST`, `MYSQLPORT` | Host y puerto de MySQL/MariaDB |
| `MYSQLDATABASE`, `MYSQLUSER`, `MYSQLPASSWORD` | Base y acceso exclusivo del proyecto |
| `IP` / `HOST`, `PORT` | Dirección y puerto de escucha asignados por el alojamiento; defecto local 127.0.0.1:3000 |
| `BASE_PATH` | Vacío por defecto; `/pokedex` para convivir con BookApp bajo otra ruta |
| `DEMO_MODE` | true por defecto: visitantes solo consultan; administrador autenticado puede gestionar |
| `ADMIN_ENABLED` | false por defecto: acceso de administrador desactivado |
| `ADMIN_USERNAME`, `ADMIN_PASSWORD_HASH`, `SESSION_SECRET` | Valores privados generados con `npm run admin:setup` |
| `TRUST_PROXY`, `COOKIE_SECURE` | true detrás del proxy HTTPS de alwaysdata; no confiar en proxies arbitrarios |

## Administrador opcional

En el servidor HTTPS, `npm run admin:setup` solicita usuario y contraseña sin mostrarla, guarda el hash y el secreto de sesión en el `.env` con permisos 600 y conserva la configuración MySQL. Después hay que reiniciar y abrir `BASE_PATH` + `/admin/login` (por ejemplo, `/pokedex/admin/login`). Consultar [la guía de administrador](docs/ADMIN.md).

La cookie `pokedex.sid` es independiente de la usada por BookApp y se limita a `BASE_PATH/` cuando se utiliza un prefijo. Las sesiones viven una hora en memoria con máximo de 100 entradas; al reiniciar se cierran. La configuración está pensada para una sola instancia y un administrador.

## Organización

- `server.js`: conexión inicial y arranque/apagado del proceso.
- `app.js`: aplicación Express, protección de rutas y manejo de errores.
- `config/`, `context/`: variables y conexión MySQL.
- `models/`: Pokémon, región y tipo, validaciones y relaciones.
- `controllers/`, `routes/`: catálogo y operaciones CRUD.
- `middlewares/`: permisos, CSRF y cargas de imágenes.
- `views/`: plantillas y parcial de tarjetas compartido.
- `public/`: Bootstrap, estilos propios e imagen alternativa.
- `uploads/`: imágenes históricas del catálogo y cargas locales; las nuevas cargas se ignoran en Git.
- `scripts/`: tablas iniciales, seed y configuración de administrador.
- `test/`: pruebas con el ejecutor integrado de Node.

## Validación

```sh
npm ci --omit=dev
npm test
```

Las pruebas locales usan datos simulados para comprobar renderizado HTTP, filtros combinados, paginación, recursos del catálogo, restricciones de visitantes, validaciones de modelos, login, CSRF, CRUD, cargas de imágenes, conservación de imagen y logout. No envían correos ni consumen recursos de alwaysdata.

Las pruebas de BASE_PATH cubren recursos, enlaces, filtros, formularios, redirecciones, cookies, login/logout y subida de imágenes con el prefijo conservado o recortado por un proxy.

El workflow incluido prepara MySQL 8 y Node.js 22 para una comprobación adicional del seed, asociaciones, filtros, restricción de borrado y rechazo de un segundo seed. Solo esa prueba requiere `RUN_MYSQL_TESTS=true` y una base de pruebas preparada; no ejecutar contra una base con datos importantes.

## Estado de despliegue

Preparado para pruebas, **sin URL de demo publicada todavía**. [Plan de despliegue](docs/DEPLOYMENT.md). El soporte para `/pokedex/` permite preparar una prueba controlada en un sitio independiente; vigilar el aviso de recursos de la cuenta al desplegar. No sustituir el sitio, `.env` ni la base de BookApp.

El propietario comprobó catálogo, filtros, diseño móvil y administrador contra MySQL local. El soporte adicional de BASE_PATH se verificó mediante pruebas HTTP automatizadas; su publicación bajo /pokedex/ sigue pendiente.

## Límites

- Cada Pokémon tiene un único tipo en el modelo actual. Añadir múltiples tipos requeriría una tabla intermedia y migración.
- El `sync()` inicial no reemplaza un sistema de migraciones.
- Las portadas antiguas reemplazadas o de registros eliminados todavía necesitan una política de limpieza.
- Sesiones y límites de intentos en memoria no se comparten entre varios procesos.
- No hay relación con Nintendo, Game Freak o The Pokémon Company. Los personajes e imágenes pertenecen a sus respectivos titulares; este es un proyecto académico.

## Autor

[Jeison Rosario](https://github.com/Jeison-Rosario)
