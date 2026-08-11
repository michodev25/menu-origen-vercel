# Menú Origen

Web móvil del menú de The Origen, La Habana, preparada para publicar en Vercel.

## Publicar en Vercel

1. Descomprime este ZIP.
2. Sube la carpeta a un repositorio de GitHub.
3. En Vercel selecciona **Add New → Project**, importa el repositorio y pulsa **Deploy**.
4. No necesitas configurar variables de entorno ni cambiar el comando de compilación.

También puedes publicarla desde la carpeta del proyecto con `npx vercel`.

## Ejecutarla en tu computadora

```bash
npm install
npm run dev
```

Luego abre `http://localhost:3000`.

## Cambiar platos, descripciones o precios

Edita el arreglo `menuSections` al comienzo de `app/page.tsx`. Cada plato tiene:

```ts
{
  name: "Nombre del plato",
  description: "Descripción",
  price: "$0.00",
}
```

Para agregar una categoría, copia uno de los bloques completos y asígnale un `id` único. Si quieres que aparezca en la barra superior, agrega ese mismo `id` a `navSections`.

## Archivos de identidad visual

- Logo: `public/assets/origen-logo.png`
- Tipografías: `public/fonts/`

Cuando Vercel te entregue la URL definitiva, esa será la dirección que debe codificarse en el QR.
