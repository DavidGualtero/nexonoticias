/**
 * ui.js — Componentes de interfaz compartidos por todas las páginas:
 * íconos, encabezado, pie de página, tarjeta de noticia, avisos (toast)
 * y comportamientos globales (favoritos, menú móvil, boletín).
 */
import { CATEGORIAS, CLAVES } from "./config.js";
import { alternar, esFavorito, obtenerIds } from "./favoritos.js";
import { leer, guardar } from "./storage.js";
import { reglas } from "./validacion.js";

/* ---------------------------------------------------------------- Íconos */
const ICONOS = {
  buscar: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
  corazon: '<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1.1L12 21.2l7.8-7.7 1-1.1a5.5 5.5 0 0 0 0-7.8z"/>',
  marcador: '<path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>',
  compartir: '<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.6 13.5 6.8 4M15.4 6.5l-6.8 4"/>',
  comentario: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
  telefono: '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 
  2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/>',
  correo: '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>',
  ubicacion: '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/>',
  check: '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m22 4-10 10-3-3"/>',
  alerta: '<circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/>',
  flecha: '<path d="M5 12h14M12 5l7 7-7 7"/>',
  chevron: '<path d="m9 18 6-6-6-6"/>',
  enviar: '<path d="M22 2 11 13"/><path d="M22 2 15 22l-4-9-9-4z"/>',
  papelera: '<path d="M3 6h18"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>',
  menu: '<path d="M3 6h18M3 12h18M3 18h18"/>',
  facebook: '<path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>',
  x: '<path d="M18 6 6 18M6 6l12 12"/>',
  instagram: '<rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.4A4 4 0 1 1 12.6 8 4 4 0 0 1 16 11.4z"/><path d="M17.5 6.5h.01"/>',
  youtube: '<rect x="2" y="5" width="20" height="14" rx="4"/><path d="m10 9 5 3-5 3z"/>',
};

/** Devuelve el SVG (como texto) de un ícono por nombre. */
export const icono = (nombre) =>
  `<svg class="icono" viewBox="0 0 24 24" aria-hidden="true" focusable="false">${ICONOS[nombre] ?? ""}</svg>`;

/* -------------------------------------------------------------- Utilidades */
/** Escapa HTML para insertar texto de usuario de forma segura (evita XSS). */
export const escapar = (texto) =>
  String(texto).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

const formatoCorto = new Intl.DateTimeFormat("es-CO", { day: "numeric", month: "short", year: "numeric" });
const formatoLargo = new Intl.DateTimeFormat("es-CO", { day: "numeric", month: "long", year: "numeric" });
/** "14 oct 2025" (se arma por partes para no depender del formato regional del navegador) */
export const fechaCorta = (iso) => {
  const p = Object.fromEntries(formatoCorto.formatToParts(new Date(iso)).map((x) => [x.type, x.value]));
  return `${p.day} ${p.month.replace(".", "")} ${p.year}`;
};
/** "14 de octubre de 2025" */
export const fechaLarga = (iso) => formatoLargo.format(new Date(iso));
/** Iniciales de un nombre para el avatar: "Mariana Ortega" → "MO". */
export const iniciales = (nombre) => nombre.split(" ").slice(0, 2).map((p) => p[0]).join("").toUpperCase();

/** Muestra un aviso temporal en la parte inferior de la pantalla. */
export function mostrarToast(mensaje, tipo = "ok") {
  let contenedor = document.getElementById("toasts");
  if (!contenedor) {
    contenedor = document.createElement("div");
    contenedor.id = "toasts";
    contenedor.className = "toasts";
    contenedor.setAttribute("aria-live", "polite");
    document.body.append(contenedor);
  }
  const toast = document.createElement("div");
  toast.className = `toast ${tipo === "error" ? "error" : ""}`;
  toast.innerHTML = `${icono(tipo === "error" ? "alerta" : "check")}<span>${escapar(mensaje)}</span>`;
  contenedor.append(toast);
  setTimeout(() => toast.remove(), 3200);
}

/** Pinta un mensaje de error de carga dentro de un contenedor. */
export function mostrarError(contenedor, error) {
  console.error(error);
  contenedor.innerHTML = `<div class="vacio"><h2>No pudimos cargar las noticias</h2>
    <p>Si abriste el archivo directamente (file://), sirve el proyecto con un servidor local
    o usa la versión publicada. Detalle: ${escapar(error.message)}</p></div>`;
}

/* ------------------------------------------------------------ Componentes */
/** HTML de una tarjeta de noticia (catálogo, inicio y favoritos). */
export function crearTarjeta(n) {
  const url = `detalle.html?id=${n.id}`;
  const fav = esFavorito(n.id);
  return `<article class="tarjeta">
    <div class="tarjeta-img">
      <a href="${url}" tabindex="-1" aria-hidden="true"><img src="${escapar(n.imagen)}" alt="" loading="lazy"></a>
      <button type="button" class="btn-fav" data-fav="${n.id}" data-titulo="${escapar(n.titulo)}" aria-pressed="${fav}">${icono("corazon")}</button>
    </div>
    <div class="tarjeta-cuerpo">
      <div class="tarjeta-meta"><span class="cat">${escapar(n.etiqueta ?? n.categoria)}</span><time datetime="${n.fecha}">${fechaCorta(n.fecha)}</time></div>
      <h3><a href="${url}">${escapar(n.titulo)}</a></h3>
      <p class="tarjeta-resumen">${escapar(n.resumen)}</p>
    </div>
    <div class="tarjeta-pie"><a class="ver-mas" href="${url}">Ver más ${icono("chevron")}</a></div>
  </article>`;
}

const PAGINAS = [
  { id: "inicio", href: "index.html", texto: "Inicio" },
  { id: "noticias", href: "noticias.html", texto: "Noticias" },
  { id: "favoritos", href: "favoritos.html", texto: "Favoritos" },
  { id: "contacto", href: "contacto.html", texto: "Contacto" },
  { id: "admin", href: "admin.html", texto: "Admin" },
];

function htmlEncabezado(activa) {
  const enlaces = PAGINAS.map((p) => {
    const actual = p.id === activa ? ' aria-current="page"' : "";
    const insignia = p.id === "favoritos" ? ' <span class="insignia" data-insignia-fav hidden>0</span>' : "";
    return `<li><a href="${p.href}"${actual}>${p.texto}${insignia}</a></li>`;
  }).join("");
  return `<div class="header-inner contenedor">
    <a class="logo" href="index.html" aria-label="NexoNoticias, ir al inicio"><span class="logo-marca" aria-hidden="true">N</span>NexoNoticias</a>
    <button class="menu-toggle" type="button" aria-expanded="false" aria-controls="menu-principal" aria-label="Abrir menú">${icono("menu")}</button>
    <div class="menu" id="menu-principal">
      <nav class="nav" aria-label="Principal"><ul>${enlaces}</ul></nav>
      <div class="herramientas">
        <form class="buscador" role="search" action="noticias.html" method="get">
          ${icono("buscar")}<label class="visualmente-oculto" for="buscar-global">Buscar noticia</label>
          <input id="buscar-global" type="search" name="q" placeholder="Buscar noticia...">
        </form>
        <span class="clima">Bogotá, 24°C</span>
      </div>
    </div>
  </div>`;
}

function htmlPie() {
  const secciones = CATEGORIAS.map((c) => `<li><a href="noticias.html?categoria=${encodeURIComponent(c)}">${c}</a></li>`).join("");
  const redes = [["facebook", "Facebook"], ["x", "X"], ["instagram", "Instagram"], ["youtube", "YouTube"]]
    .map(([i, n]) => `<a href="#" data-pendiente aria-label="${n}">${icono(i)}</a>`).join("");
  return `<div class="contenedor">
    <div class="footer-grid">
      <div><p class="footer-marca">Nexo<span>Noticias</span></p>
        <p class="footer-desc">El pulso informativo de Colombia. Periodismo independiente, riguroso y comprometido con la verdad desde el centro del país.</p></div>
      <div class="footer-col"><h4>Secciones</h4><ul>${secciones}</ul></div>
      <div class="footer-col"><h4>Compañía</h4><ul>
        <li><a href="#" data-pendiente>Acerca de</a></li><li><a href="#" data-pendiente>Términos y Condiciones</a></li>
        <li><a href="#" data-pendiente>Privacidad</a></li><li><a href="contacto.html">Soporte</a></li></ul></div>
      <div class="footer-col"><h4>Boletín informativo</h4>
        <form class="form-boletin" id="form-boletin-pie" novalidate>
          <label class="visualmente-oculto" for="correo-pie">Tu correo electrónico</label>
          <input id="correo-pie" type="email" placeholder="Tu correo electrónico" autocomplete="email">
          <button type="submit" aria-label="Suscribirse al boletín">${icono("enviar")}</button>
        </form></div>
    </div>
    <div class="footer-base"><p>© 2026 NexoNoticias. Todos los derechos reservados. Redacción y Talleres en Bogotá, Colombia.</p>
      <div class="redes">${redes}</div></div>
  </div>`;
}

/* -------------------------------------------------------- Comportamientos */
/** Sincroniza botones de favorito e insignia del menú con el estado guardado. */
function sincronizarFavoritos() {
  const ids = obtenerIds();
  document.querySelectorAll("[data-fav]").forEach((b) => {
    const activo = ids.includes(Number(b.dataset.fav));
    b.setAttribute("aria-pressed", String(activo));
    const accion = activo ? "Quitar de favoritos" : "Agregar a favoritos";
    b.setAttribute("aria-label", b.dataset.titulo ? `${accion}: ${b.dataset.titulo}` : accion);
    b.title = accion;
  });
  const insignia = document.querySelector("[data-insignia-fav]");
  if (insignia) { insignia.textContent = ids.length; insignia.hidden = ids.length === 0; }
}

/**
 * Suscripción al boletín: valida el correo y lo guarda en localStorage.
 * @param {HTMLFormElement} formulario  formulario con un input de correo
 * @param {HTMLElement} [mensaje]  elemento para el mensaje en línea (si no, usa toast)
 */
export function iniciarBoletin(formulario, mensaje) {
  const input = formulario.querySelector("input[type=email]");
  formulario.addEventListener("submit", (e) => {
    e.preventDefault();
    const valido = reglas.correo(input.value) === true;
    const texto = valido ? "¡Gracias por suscribirte! Revisa tu bandeja de entrada." : "Ingresa un correo electrónico válido.";
    if (valido) {
      const lista = leer(CLAVES.suscriptores, []);
      const correo = input.value.trim().toLowerCase();
      if (!lista.includes(correo)) guardar(CLAVES.suscriptores, [...lista, correo]);
      input.value = "";
    }
    if (mensaje) {
      mensaje.textContent = texto;
      mensaje.className = `msg-suscripcion ${valido ? "es-exito" : "es-error"}`;
    } else mostrarToast(texto, valido ? "ok" : "error");
    input.setAttribute("aria-invalid", String(!valido));
  });
}

/**
 * Inicializa el diseño común: encabezado, pie, menú móvil, favoritos globales.
 * @param {string} paginaActiva  id de la página (para resaltar el menú)
 */
export function iniciarLayout(paginaActiva) {
  document.getElementById("header").innerHTML = htmlEncabezado(paginaActiva);
  document.getElementById("footer").innerHTML = htmlPie();

  const boton = document.querySelector(".menu-toggle");
  const menu = document.getElementById("menu-principal");
  boton.addEventListener("click", () => {
    const abierto = menu.classList.toggle("abierto");
    boton.setAttribute("aria-expanded", String(abierto));
  });

  iniciarBoletin(document.getElementById("form-boletin-pie"));

  // Delegación de eventos: un solo listener atiende todos los botones de favorito
  document.addEventListener("click", (e) => {
    const botonFav = e.target.closest("[data-fav]");
    if (botonFav) {
      const guardada = alternar(botonFav.dataset.fav);
      mostrarToast(guardada ? "Noticia agregada a favoritos" : "Noticia quitada de favoritos");
    }
    const pendiente = e.target.closest("[data-pendiente]");
    if (pendiente) { e.preventDefault(); mostrarToast("Esta sección está en construcción (prototipo)."); }
  });
  document.addEventListener("favoritos:cambio", sincronizarFavoritos);
  sincronizarFavoritos();
}

/** Vuelve a sincronizar favoritos tras pintar contenido dinámico nuevo. */
export { sincronizarFavoritos };
