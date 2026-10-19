# Plan de despliegue de Pokédex

Esta fase prepara el código en GitHub. No crea otra aplicación ni base de datos en alwaysdata.

## Antes de publicar

1. Integrar y revisar el pull request. Esperar el resultado del workflow si está disponible.
2. Aclarar el aviso de recursos de alwaysdata. El espacio libre por sí solo no confirma capacidad suficiente de CPU o RAM.
3. Confirmar qué dirección o ruta independiente permite el alojamiento sin interferir con BookApp. Esta versión usa rutas desde `/`: requiere alojarse en su propia raíz. No apuntar una segunda aplicación a `bookapp.alwaysdata.net/` ni montarla bajo `/pokedex/` sin adaptar las rutas primero.
4. Crear una base vacía exclusiva para Pokédex y un usuario con permisos sobre esa base. Nunca reutilizar `bookapp_demo` ni modificar el `.env` de BookApp.
5. Reservar una carpeta distinta, como `~/apps/pokedex`. Mantener separado el sitio de BookApp.

## Comandos cuando el alojamiento esté acordado

Dentro de la carpeta de Pokédex, usando el código integrado en `main`:

```sh
npm ci --omit=dev
cp .env.example .env
chmod 600 .env
```

Completar las variables MySQL con los valores de la base nueva, directamente en el servidor. No escribir contraseñas en comandos compartidos, capturas ni GitHub.

```sh
npm run db:sync
npm run seed:demo
```

Estos comandos son de preparación inicial. Si ya existen tablas o registros, no forzar ni borrar datos: revisar primero. El arranque solo comprueba la conexión y no sincroniza el esquema automáticamente.

El proceso se inicia con `node /RUTA/DEL/PROYECTO/server.js`. Respeta `IP`/`HOST` y `PORT` del proveedor. Para alwaysdata, el campo del directorio de trabajo es relativo al directorio de la cuenta: por ejemplo `apps/pokedex`, sin repetir `/home/CUENTA`. El comando de Node sí puede usar una ruta absoluta.

## Validación sobre el sitio

- `/healthz`: proceso HTTP iniciado y `demo:true`; no es una consulta de salud de MySQL en cada petición.
- Catálogo con tres Pokémon e imágenes locales.
- Búsqueda por nombre; filtro por tipo y por región; filtros combinados.
- Estado vacío y botón Limpiar al no encontrar resultados.
- Menú y tarjetas comprobados en móvil, tablet y escritorio; ausencia de desplazamiento horizontal.
- Público sin controles de edición y escrituras rechazadas por el servidor.
- Si se activa el administrador, probar una sesión y registros ficticios según [ADMIN.md](ADMIN.md).

Solo después de verificar la dirección real y estas comprobaciones se añadirá “Probar demo” al portafolio. No se ha anunciado una URL provisional como si estuviera publicada.
