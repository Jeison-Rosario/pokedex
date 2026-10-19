# Pokédex · Catálogo administrable de Pokémon

Aplicación web académica con Node.js, Express, Handlebars, Sequelize y MySQL. Mantiene un catálogo propio de Pokémon relacionados con tipos y regiones; no depende de una integración con PokéAPI en los archivos revisados.

## Funcionalidades

- Consulta del catálogo con imagen, nombre, tipo y región.
- Gestión de Pokémon, tipos y regiones.
- Carga de imágenes mediante Multer.
- Persistencia relacional con Sequelize.

## Estructura

- `app.js`: servidor y configuración de vistas.
- `context/appContext.js`: conexión MySQL.
- `models/`: Pokémon, región, tipo y asociaciones.
- `controllers/`, `routes/`, `views/`: lógica e interfaz.
- `uploads/`: imágenes servidas por Express.

## Ejecución local

Requiere Node.js, npm y MySQL. No hay una versión de Node fijada en el repositorio.

1. Clonar el repositorio y ejecutar `npm ci`.
2. Crear una base MySQL llamada `pokedex`.
3. Ajustar `context/appContext.js` a una cuenta local de pruebas. La configuración publicada utiliza localhost, puerto 3306 y una cuenta root sin contraseña; sustituirla por un usuario con permisos limitados.
4. Ejecutar `node app.js` desde la raíz.
5. Abrir http://localhost:3000.

Sequelize sincroniza las tablas al iniciar. El script actual `npm start` usa `nodemon /app.js`; el comando anterior evita esa ruta absoluta.

## Prueba manual sugerida

Crear una región y un tipo, registrar un Pokémon con imagen y comprobar su aparición en el catálogo. Editarlo y revisar el comportamiento de sus relaciones. Utilizar datos desechables para probar eliminaciones.

## Limitaciones y mejoras propuestas

- Migrar la conexión a variables de entorno y añadir un ejemplo sin secretos.
- Revisar `onDelete: CASCADE`: borrar un tipo o una región puede eliminar Pokémon asociados.
- Validar tamaño y formato de archivos en el servidor.
- Incorporar autenticación, autorización y protección CSRF para la administración.
- Añadir búsquedas, filtros, paginación y pruebas de integridad.
- Corregir scripts de ejecución y utilizar migraciones para cambios de esquema.
- Diferenciar este proyecto de otros CRUD mediante funcionalidades propias del dominio.

## Validación

Revisión estática de archivos; no se ejecutaron el servidor ni MySQL. `npm test` contiene un marcador que termina con error y no ejecuta pruebas reales.

## Autor

[Jeison Rosario](https://github.com/Jeison-Rosario)
