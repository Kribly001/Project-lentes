/* Carrito de Googles.
 *
 * Antes de esto, el icono de cada producto era un <i> de Font Awesome y nada
 * mas: se veia un carrito y al tocarlo no pasaba nada. Aca esta la parte que
 * faltaba.
 *
 * Lo que hace y lo que no:
 *   - Guarda el pedido en el navegador (localStorage), asi sobrevive a cambiar
 *     de pagina y a cerrar la pestania.
 *   - No cobra. La tienda no tiene pasarela de pagos, asi que el pedido se
 *     cierra por WhatsApp con el detalle ya escrito. Simular un pago que no
 *     existe seria peor que no tener carrito.
 *
 * Los productos se leen del HTML que ya estaba (.product) y no de una lista
 * aparte: si maniana se agrega un producto a mano, el carrito lo toma solo.
 */
(function () {
  "use strict";

  var CLAVE = "googles:carrito";
  var WHATSAPP = "5492634592703";

  /* Los precios estan escritos como "$575.00" en el HTML. */
  function aNumero(texto) {
    var limpio = (texto || "").replace(/[^0-9.,]/g, "").replace(",", ".");
    var n = parseFloat(limpio);
    return isNaN(n) ? 0 : n;
  }

  function comoPrecio(n) {
    return "$" + n.toFixed(2);
  }

  function leer() {
    try {
      var crudo = window.localStorage.getItem(CLAVE);
      var lista = crudo ? JSON.parse(crudo) : [];
      return Array.isArray(lista) ? lista : [];
    } catch (e) {
      /* Modo incognito o almacenamiento bloqueado: el carrito sigue andando,
         solo que no se acuerda de nada al cambiar de pagina. */
      return [];
    }
  }

  function guardar(items) {
    try {
      window.localStorage.setItem(CLAVE, JSON.stringify(items));
    } catch (e) {}
  }

  var items = leer();

  function total() {
    return items.reduce(function (suma, it) {
      return suma + it.precio * it.cantidad;
    }, 0);
  }

  function unidades() {
    return items.reduce(function (suma, it) {
      return suma + it.cantidad;
    }, 0);
  }

  function agregar(producto) {
    var existente = null;
    for (var i = 0; i < items.length; i++) {
      if (items[i].id === producto.id) existente = items[i];
    }
    if (existente) {
      existente.cantidad += 1;
    } else {
      items.push({
        id: producto.id,
        nombre: producto.nombre,
        precio: producto.precio,
        img: producto.img,
        cantidad: 1,
      });
    }
    guardar(items);
    pintar();
    avisar(producto.nombre + " se agrego al carrito");
  }

  function cambiarCantidad(id, delta) {
    for (var i = 0; i < items.length; i++) {
      if (items[i].id !== id) continue;
      items[i].cantidad += delta;
      if (items[i].cantidad < 1) items.splice(i, 1);
      break;
    }
    guardar(items);
    pintar();
  }

  function vaciar() {
    items = [];
    guardar(items);
    pintar();
  }

  /* ── La interfaz ──────────────────────────────────────────────────────── */

  var boton, panel, lista, pie, insignia, aviso;

  function armar() {
    boton = document.createElement("button");
    boton.type = "button";
    boton.className = "carrito__abrir";
    boton.setAttribute("aria-label", "Abrir el carrito");
    boton.innerHTML =
      '<i class="fas fa-cart-shopping" aria-hidden="true"></i>' +
      '<span class="carrito__insignia" hidden>0</span>';
    document.body.appendChild(boton);
    insignia = boton.querySelector(".carrito__insignia");

    panel = document.createElement("aside");
    panel.className = "carrito";
    panel.setAttribute("aria-label", "Carrito de compras");
    panel.hidden = true;
    panel.innerHTML =
      '<div class="carrito__barra">' +
      '<h2 class="carrito__titulo">Tu pedido</h2>' +
      '<button type="button" class="carrito__cerrar" aria-label="Cerrar el carrito">&times;</button>' +
      "</div>" +
      '<ul class="carrito__lista"></ul>' +
      '<div class="carrito__pie"></div>';
    document.body.appendChild(panel);

    lista = panel.querySelector(".carrito__lista");
    pie = panel.querySelector(".carrito__pie");

    /* role="status" para que un lector de pantalla lea el aviso sin que haya
       que moverle el foco a nadie. */
    aviso = document.createElement("p");
    aviso.className = "carrito__aviso";
    aviso.setAttribute("role", "status");
    aviso.hidden = true;
    document.body.appendChild(aviso);

    boton.addEventListener("click", function () {
      abrir(panel.hidden);
    });
    panel.querySelector(".carrito__cerrar").addEventListener("click", function () {
      abrir(false);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && !panel.hidden) abrir(false);
    });
  }

  function abrir(si) {
    panel.hidden = !si;
    /* Enciende las reglas que apartan el boton flotante de WhatsApp, que esta
       en la misma esquina y en un z-index mas alto. */
    document.body.classList.toggle("con-carrito", si);
    if (si) panel.querySelector(".carrito__cerrar").focus();
    else boton.focus();
  }

  var tiempoAviso;
  function avisar(texto) {
    aviso.textContent = texto;
    aviso.hidden = false;
    window.clearTimeout(tiempoAviso);
    tiempoAviso = window.setTimeout(function () {
      aviso.hidden = true;
    }, 2200);
  }

  function pintar() {
    var cuantos = unidades();
    insignia.textContent = String(cuantos);
    insignia.hidden = cuantos === 0;

    lista.innerHTML = "";

    if (items.length === 0) {
      var vacio = document.createElement("li");
      vacio.className = "carrito__vacio";
      vacio.textContent = "Todavia no elegiste nada.";
      lista.appendChild(vacio);
      pie.innerHTML = "";
      return;
    }

    items.forEach(function (it) {
      var li = document.createElement("li");
      li.className = "carrito__item";
      li.innerHTML =
        '<img class="carrito__img" src="" alt="">' +
        '<div class="carrito__datos">' +
        '<p class="carrito__nombre"></p>' +
        '<p class="carrito__precio"></p>' +
        "</div>" +
        '<div class="carrito__cantidad">' +
        '<button type="button" class="carrito__mas-menos" data-delta="-1" aria-label="Quitar uno">-</button>' +
        '<span class="carrito__numero"></span>' +
        '<button type="button" class="carrito__mas-menos" data-delta="1" aria-label="Agregar uno">+</button>' +
        "</div>";

      /* Nombre, precio e imagen salen del HTML de la pagina: se asignan como
         texto y como atributo, nunca concatenados dentro de innerHTML. */
      li.querySelector(".carrito__img").setAttribute("src", it.img);
      li.querySelector(".carrito__nombre").textContent = it.nombre;
      li.querySelector(".carrito__precio").textContent = comoPrecio(it.precio) + " c/u";
      li.querySelector(".carrito__numero").textContent = String(it.cantidad);

      Array.prototype.forEach.call(
        li.querySelectorAll(".carrito__mas-menos"),
        function (b) {
          b.addEventListener("click", function () {
            cambiarCantidad(it.id, Number(b.getAttribute("data-delta")));
          });
        }
      );

      lista.appendChild(li);
    });

    pie.innerHTML =
      '<p class="carrito__total"><span>Total</span><strong></strong></p>' +
      '<a class="carrito__pedir" target="_blank" rel="noopener">Hacer el pedido por WhatsApp</a>' +
      '<button type="button" class="carrito__vaciar">Vaciar el carrito</button>' +
      '<p class="carrito__nota">El pedido se cierra por WhatsApp: la tienda todavia no cobra en linea.</p>';

    pie.querySelector(".carrito__total strong").textContent = comoPrecio(total());
    pie.querySelector(".carrito__pedir").href = enlaceWhatsapp();
    pie.querySelector(".carrito__vaciar").addEventListener("click", vaciar);
  }

  function enlaceWhatsapp() {
    var lineas = items.map(function (it) {
      return (
        "- " + it.cantidad + " x " + it.nombre +
        " (" + comoPrecio(it.precio * it.cantidad) + ")"
      );
    });
    var texto =
      "Hola Googles, quiero hacer este pedido:\n" +
      lineas.join("\n") +
      "\nTotal: " + comoPrecio(total());
    return "https://wa.me/" + WHATSAPP + "?text=" + encodeURIComponent(texto);
  }

  /* ── Los productos que ya estan en el HTML ────────────────────────────── */

  function engancharProductos() {
    Array.prototype.forEach.call(
      document.querySelectorAll(".product"),
      function (tarjeta) {
        var disparador = tarjeta.querySelector(".product__icon");
        var titulo = tarjeta.querySelector(".product__title");
        var precio = tarjeta.querySelector(".product__price");
        var img = tarjeta.querySelector(".product__img");
        if (!disparador || !titulo || !precio) return;

        var producto = {
          /* El nombre se repite entre paginas —hay tres "Farenheit Oval"—, asi
             que el id le suma el precio: dos modelos distintos no se pisan. */
          id: titulo.textContent.trim() + "|" + precio.textContent.trim(),
          nombre: titulo.textContent.trim(),
          precio: aNumero(precio.textContent),
          /* .src y no getAttribute("src"): el HTML la escribe relativa
             ("imagenes/s1.webp") y el carrito viaja entre carpetas. Guardada
             relativa, desde /paginas/ se buscaria en /paginas/imagenes/. */
          img: img ? img.src : "",
        };

        disparador.addEventListener("click", function () {
          agregar(producto);
        });
      }
    );
  }

  function arrancar() {
    armar();
    engancharProductos();
    pintar();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", arrancar);
  } else {
    arrancar();
  }
})();
