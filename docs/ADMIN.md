# Administrador opcional de Pokédex

El acceso está desactivado por defecto. Permite probar el CRUD completo sin abrir las escrituras a todos los visitantes y mantiene `DEMO_MODE=true`.

## Configurar

Primero preparar una base exclusiva de Pokédex y su `.env`. En el servidor HTTPS, dentro de la carpeta de este proyecto:

```sh
npm run admin:setup
```

El asistente solicita usuario (3–60 letras, números, puntos o guiones) y una contraseña de 12–256 caracteres dos veces. No muestra ni guarda la contraseña en texto plano. Conserva las variables MySQL, genera el hash scrypt y un secreto de sesión y escribe `.env` con permisos 600. También configura `TRUST_PROXY=true` y `COOKIE_SECURE=true` para HTTPS detrás del proxy. No compartir ese archivo.

Reiniciar el sitio y abrir `/admin/login` en su dirección HTTPS propia. No introducir las credenciales de BookApp, MySQL o alwaysdata: elegir credenciales nuevas para Pokédex. Si el panel tiene variables de administrador anteriores, actualizarlas o retirarlas de allí para que no sobrescriban el `.env`.

El usuario MySQL necesita SELECT, INSERT, UPDATE y DELETE en la base de Pokédex para gestionar datos. La inicialización inicial también necesita crear tablas.

## Probar

1. Entrar y comprobar el aviso de administrador.
2. Crear una región y un tipo de prueba.
3. Crear un Pokémon con esos valores y una imagen PNG/JPEG de hasta 2 MB.
4. Editarlo sin otra imagen: se conserva la anterior. Comprobar que sus selectores mantienen región y tipo.
5. Intentar eliminar su región o tipo: el esquema nuevo lo impide mientras existan Pokémon relacionados.
6. Eliminar el Pokémon de prueba y después su región y tipo.
7. Cerrar sesión. En una pestaña privada, solo deben verse catálogo, filtros y listados; los cambios se rechazan.

Las cookies son HttpOnly, SameSite=Strict y Secure en HTTPS. La sesión se renueva al entrar y se invalida al salir. Los formularios requieren CSRF y la subida guarda archivos solo después de validar el token y la firma de imagen.

Las sesiones están en memoria (máximo 100, duración de una hora). Reiniciar cierra las sesiones y reinicia los límites de intentos. Cinco intentos por IP en 15 minutos y un límite global restringen el login. Un exceso devuelve 429. Un formulario con sesión o token caducado requiere recarga y nuevo login.

## Cambiar contraseña o desactivar

Repetir `npm run admin:setup` y reiniciar para cambiarla. Para desactivar, usar `ADMIN_ENABLED=false` y mantener `DEMO_MODE=true`.

Para pruebas locales por HTTP, utilizar `COOKIE_SECURE=false` y `TRUST_PROXY=false` únicamente en el entorno local privado. No desactivar Secure para resolver problemas de acceso en un sitio público HTTPS.
