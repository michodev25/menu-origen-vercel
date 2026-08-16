# Panel de administración local

## Alcance

Prototipo local para que `viper`, `ivan` y `admin` administren la carta con los mismos permisos. Permite crear, editar, ordenar, ocultar y reactivar categorías, subcategorías y platos. Ocultar nunca elimina datos.

## Arquitectura

- `data/menu.json`: fuente compartida por la carta pública y el panel.
- `data/admin-users.json`: usuarios con contraseñas derivadas mediante `scrypt`; no contiene contraseñas legibles.
- `lib/menu-store.ts`: lectura, validación, respaldo y escritura del JSON.
- `lib/admin-auth.ts`: verificación de credenciales y sesión mediante cookie HTTP-only firmada.
- `/api/admin/*`: rutas protegidas de acceso y guardado.
- `/admin`: interfaz editorial para administrar la jerarquía de la carta.

## Límites del prototipo

Está diseñado para ejecutarse localmente con una sola instancia de Next.js. El archivo JSON no es almacenamiento persistente adecuado para Vercel. La estructura de tipos y la API aíslan el almacenamiento para migrarlo posteriormente a Supabase.
