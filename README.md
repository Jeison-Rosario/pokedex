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

## Demo y despliegue

**[Abrir Pokédex](https://bookapp.alwaysdata.net/pokedex/)** · [Guía de despliegue](docs/DEPLOYMENT.md)

La demo ya está publicada bajo `/pokedex/` y el propietario confirmó catálogo, filtros y administración. Utiliza un sitio, directorio, base y cookie propios, aunque comparta alojamiento con BookApp.

| Campo | Valor de la demo |
| --- | --- |
| Dirección | `bookapp.alwaysdata.net/pokedex` |
| Directorio de trabajo relativo | `apps/pokedex` |
| Comando | `node /home/bookapp/apps/pokedex/server.js` |
| Prefijo | `BASE_PATH=/pokedex` |
| Salud HTTP | `/pokedex/healthz` |
| Administrador | `/pokedex/admin/login` |

El prefijo admite solicitudes recortadas o conservadas por el proxy. Al actualizar, no sustituir el `.env`, la base o el sitio de BookApp. `/healthz` comprueba la respuesta del proceso, no ejecuta una comprobación completa de MySQL.

## Recorrido y parámetros de consulta

1. Buscar por nombre y combinar región y tipo.
2. Avanzar por páginas; los enlaces conservan los filtros.
3. Restablecer los filtros cuando no haya resultados.
4. Para administrar, crear región y tipo antes de registrar un Pokémon.
5. Probar una edición sin reemplazar imagen y cerrar sesión al terminar.

| Parámetro | Uso |
| --- | --- |
| `search` | Texto parcial, recortado a 80 caracteres |
| `region` | ID positivo de región |
| `tipo` | ID positivo de tipo |
| `page` | Página positiva, hasta 10000 |

Ejemplo de estructura local: `/?search=pika&region=1&tipo=1&page=1`. Sustituir los IDs por registros existentes. Cada página contiene hasta 24 resultados. Parámetros inválidos pueden devolver HTTP 400.

## Datos y mantenimiento

No se importa un catálogo completo ni se consulta PokéAPI. Cada Pokémon tiene un único tipo y una región. Las imágenes se guardan en `uploads/`; respaldar esa carpeta junto con la base. Al reiniciar se cierran las sesiones en memoria, pero los registros de MySQL permanecen.

## Solución de problemas

| Situación | Qué revisar |
| --- | --- |
| No conecta a MySQL | Base exclusiva, credenciales y permisos |
| No aparecen resultados | Filtros y registros existentes |
| Error 400 en filtros | IDs y página positivos, sin listas u objetos |
| No puede borrar región o tipo | Pokémon relacionados y restricciones instaladas |
| Rechaza imagen | PNG/JPEG válido de hasta 2 MB |
| Login o enlaces fuera de la subruta | `BASE_PATH`, cookies y dominio público |
| No permite crear como visitante | Usar acceso privado; la demo pública es de solo lectura |

Esta ampliación actualiza el estado documentado y contrasta rutas y consultas con el código. No repite la suite ni una revisión visual del despliegue.

## Límites

- Cada Pokémon tiene un único tipo en el modelo actual. Añadir múltiples tipos requeriría una tabla intermedia y migración.
- El `sync()` inicial no reemplaza un sistema de migraciones.
- Las portadas antiguas reemplazadas o de registros eliminados todavía necesitan una política de limpieza.
- Sesiones y límites de intentos en memoria no se comparten entre varios procesos.
- No hay relación con Nintendo, Game Freak o The Pokémon Company. Los personajes e imágenes pertenecen a sus respectivos titulares; este es un proyecto académico.

## Autor

[Jeison Rosario](https://github.com/Jeison-Rosario)
