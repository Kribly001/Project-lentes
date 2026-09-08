# Googles

Tienda de lentes de sol y de receta. **HTML, CSS y JavaScript escritos a mano**,
sin framework y sin generador: se abre `index.html` y anda.

Publicada en Netlify: <https://harmonious-kitsune-95ad1c.netlify.app>

## Cómo se trabaja

Los estilos se escriben en `sass/` y se compilan a `css/style.css`, que es el
único CSS que cargan las páginas.

```sh
npm install
npm run css     # compila una vez
npm run dev     # recompila al guardar
```

> El `package.json` pedía `node-sass 8`, que ya no compila en Node moderno.
> Ahora usa `sass` (Dart Sass), que es JavaScript puro y no necesita binarios.

Para verlo en el navegador alcanza con servir la carpeta:

```sh
python -m http.server 4400
```

Hace falta un servidor —y no abrir el archivo con doble clic— porque el carrito
usa `localStorage`, que no funciona sobre `file://`.

## Qué hay en cada lado

```
index.html          Home: slider, destacados y las tres franjas de abajo
paginas/
  productos.html    Catálogo de lentes de sol
  receta.html       Catálogo de lentes de receta
  nosotros.html     Sobre la tienda
  contacto.html     Formulario
  gracias.html      Acuse del formulario
css/style.css       Compilado desde sass/, no se edita a mano
sass/               Los estilos de verdad, un archivo por componente
js/carrito.js       El carrito
slider.js           El carrusel de la home
imagenes/           Fotos de producto y fondos
```

## El carrito

Vive entero en `js/carrito.js` y **lee los productos del HTML que ya está**: cada
bloque `.product` con su `.product__title`, su `.product__price` y su imagen. Si
mañana se agrega un producto a mano en cualquier página, el carrito lo toma solo,
sin tocar JavaScript.

El pedido se guarda en `localStorage`, así que sobrevive a cambiar de página y a
cerrar la pestaña.

**No cobra.** La tienda no tiene pasarela de pagos, así que el pedido se cierra
por WhatsApp con el detalle ya escrito. Simular un pago que no existe sería peor
que no tener carrito. El número está en la constante `WHATSAPP`, arriba de todo
en `js/carrito.js`.

## El formulario de contacto

Lo recibe **Netlify Forms**, no un PHP. El hosting sirve archivos estáticos y no
ejecuta PHP: el `form.php` que había antes no corría nunca y los mensajes no
llegaban a ningún lado.

Para que funcione, **una vez publicado hay que habilitar Forms en el panel de
Netlify** y configurar el aviso por correo. Si no, los envíos quedan en el panel
y nadie se entera.

## Lo que todavía falta

- **Un dominio propio.** Hoy la URL es el slug que le puso Netlify.
- **Cobrar en línea.** Hoy el pedido termina en WhatsApp.
- **Las fichas de producto.** Cada lente se ve en la grilla pero no tiene página
  propia con más fotos ni descripción.
