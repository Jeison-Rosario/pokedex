# Publicar Pokédex bajo /pokedex/

Dirección prevista: `https://bookapp.alwaysdata.net/pokedex/`. Esta guía no confirma que esté publicado todavía.

BookApp conserva la raíz `https://bookapp.alwaysdata.net/`. Pokédex usa otro proceso, carpeta, base de datos y cookie de sesión. No modificar el sitio, `.env` ni la base de BookApp.

## 1. Preparar una base independiente

Crear una base vacía y un usuario MySQL exclusivo para Pokédex en el panel. Guardar sus nombres completos, incluido el prefijo que asigne el panel. El usuario necesita crear tablas para la inicialización y SELECT/INSERT/UPDATE/DELETE para el administrador.

No utilizar `bookapp_demo` ni importar el `.env` local de Windows al servidor. Para publicar solo el catálogo, el administrador puede quedar desactivado inicialmente.

## 2. Instalar el código integrado

Después de integrar el pull request en `main`, desde SSH:

```sh
mkdir -p ~/apps
cd ~/apps
git clone https://github.com/Jeison-Rosario/pokedex.git pokedex
cd pokedex
npm ci --omit=dev
cp .env.example .env
chmod 600 .env
nano .env
```

Si ya existe la carpeta, revisar su estado antes de actualizar; no volver a clonar ni sobrescribir un `.env` existente. Ejecutar una sola instalación sin otros trabajos pesados simultáneos para limitar los picos de recursos.

Completar la configuración privada con los valores reales de la base nueva:

```dotenv
NODE_ENV=production
BASE_PATH=/pokedex
DEMO_MODE=true
MYSQLHOST=mysql-bookapp.alwaysdata.net
MYSQLPORT=3306
MYSQLDATABASE=NOMBRE_COMPLETO_DE_LA_BASE_NUEVA
MYSQLUSER=USUARIO_EXCLUSIVO_DE_POKEDEX
MYSQLPASSWORD=CONTRASEÑA_NUEVA
ADMIN_ENABLED=false
TRUST_PROXY=true
COOKIE_SECURE=true
```

Los nombres y contraseñas son marcadores, no valores para copiar literalmente. No fijar IP, HOST o PORT en el servidor: los asigna el alojamiento. El archivo `.env` se carga desde la carpeta del proyecto aunque el comando use una ruta absoluta.

```sh
npm run db:sync
npm run seed:demo
```

Estos comandos son de preparación inicial. `sync()` no fuerza cambios en una instalación anterior y el seed se cancela si existen datos. No borrar ni reiniciar una base para repetirlos. El servidor no sincroniza tablas automáticamente al arrancar.

## 3. Crear el sitio de Pokédex

En **Web > Sites**, añadir un sitio distinto del de BookApp:

| Campo | Valor |
| --- | --- |
| Tipo | Node.js |
| Dirección | `bookapp.alwaysdata.net/pokedex` |
| Directorio de trabajo | `apps/pokedex` (relativo a la carpeta de la cuenta) |
| Comando | `node /home/bookapp/apps/pokedex/server.js` |
| Node | 22 o 24 |
| Trim path / Recortar ruta | Activado, si aparece |
| HTTPS | Activado |

El campo de directorio de trabajo no debe repetir `/home/bookapp`. No cambiar la dirección del sitio BookApp ni añadir `/pokedex` a su configuración: la ruta pertenece al sitio nuevo.

La aplicación admite peticiones con el prefijo completo y peticiones donde el proxy ya lo recortó. `BASE_PATH` determina las URL públicas, los recursos y el Path de la cookie de sesión. No se toma ese prefijo de headers controlables por visitantes.

## 4. Comprobar

- `https://bookapp.alwaysdata.net/pokedex/healthz` debe responder con `demo:true`.
- `https://bookapp.alwaysdata.net/pokedex/` debe mostrar los tres Pokémon e imágenes locales.
- Los enlaces, filtros, paginación y recursos permanecen bajo `/pokedex/`.
- Catálogo y menú deben revisarse en móvil y escritorio.
- `https://bookapp.alwaysdata.net/` debe seguir abriendo BookApp.
- Si alguno de los sitios se vuelve inestable, detener solo el sitio nuevo de Pokédex y revisar los logs y recursos antes de seguir. Un consumo bajo previo no garantiza capacidad para dos procesos.

No ejecutar `npm test` en la cuenta gratuita para esta verificación; las pruebas se ejecutaron fuera del alojamiento y están en CI.

## 5. Activar el administrador cuando el catálogo funcione

Desde `~/apps/pokedex`:

```sh
npm run admin:setup
```

Elegir credenciales nuevas, reiniciar únicamente el sitio Pokédex y abrir `https://bookapp.alwaysdata.net/pokedex/admin/login`. El asistente conserva BASE_PATH y MySQL. No reutilizar las credenciales de BookApp.

El nombre de cookie es `pokedex.sid` y su Path es `/pokedex/`, independiente de `bookapp.sid`. Después de cambiar BASE_PATH o reiniciar, volver a iniciar sesión. La cookie no contiene la contraseña.

Seguir [ADMIN.md](ADMIN.md) para probar CRUD, imágenes y restricciones.

## Prueba local con el mismo prefijo

En el `.env` de tu computadora, mantener los valores locales de MySQL y usar:

```dotenv
NODE_ENV=development
BASE_PATH=/pokedex
TRUST_PROXY=false
COOKIE_SECURE=false
```

Reiniciar y abrir `http://127.0.0.1:3000/pokedex/` (o el puerto local elegido). Para volver a la configuración anterior, dejar `BASE_PATH=` vacío y reiniciar. No trasladar COOKIE_SECURE=false al sitio público.

## Portafolio

Añadir “Probar demo” solo después de verificar el sitio publicado. La URL prevista no equivale a una publicación confirmada.

## Referencias

La documentación oficial de alwaysdata incluye ejemplos de sitios separados bajo una ruta y la opción Trim path:

https://help.alwaysdata.com/en/blog/2023-03-14-hold-on-to-your-socks-high-speed-data-stream-hosting-with-websockets/
