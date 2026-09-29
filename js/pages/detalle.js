/**
 * detalle.js — Vista de detalle de una noticia (detalle.html?id=N).
 * Muestra el artículo completo, el panel del reportero y noticias relacionadas.
 * Acciones: guardar en favoritos, compartir enlace y comentar (va a Contacto).
 */
import { iniciarLayout, icono, escapar, fechaCorta, fechaLarga, iniciales, mostrarToast, mostrarError, sincronizarFavoritos } from "../core/ui.js";
import { obtenerNoticia, obtenerNoticias, obtenerAutor } from "../core/api.js";

iniciarLayout("noticias");
const contenedor = document.getElementById("detalle");

(async () => {
  try {
    const id = new URLSearchParams(location.search).get("id");
    const noticia = await obtenerNoticia(id);
    if (!noticia) return noEncontrada();

    const [autor, todas] = await Promise.all([obtenerAutor(noticia.autor), obtenerNoticias()]);
    document.title = `${noticia.titulo} · NexoNoticias`;
    contenedor.innerHTML = htmlDetalle(noticia, autor, relacionadas(noticia, todas));
    sincronizarFavoritos();
    document.getElementById("btn-compartir").addEventListener("click", () => compartir(noticia));
  } catch (error) {
    mostrarError(contenedor, error);
  }
})();

/** Prioriza noticias de la misma categoría; completa con las más recientes. */
function relacionadas(actual, todas) {
  const otras = todas.filter((n) => n.id !== actual.id);
  const mismas = otras.filter((n) => n.categoria === actual.categoria);
  return [...mismas, ...otras.filter((n) => !mismas.includes(n))].slice(0, 3);
}

function htmlDetalle(n, autor, rel) {
  const parrafos = n.contenido.map((p) => `<p>${escapar(p)}</p>`).join("");
  const itemsRel = rel.map((r) => `
    <a class="rel-item" href="detalle.html?id=${r.id}">
      <img src="${escapar(r.imagen)}" alt="" loading="lazy">
      <div><small>${fechaCorta(r.fecha)} · ${escapar(r.categoria)}</small><h3>${escapar(r.titulo)}</h3></div>
    </a>`).join("");
  return `
  <div class="detalle-grid">
    <article class="articulo">
      <div class="articulo-cab">
        <div>
          <p class="cat">${escapar(n.etiqueta ?? n.categoria)}</p>
          <p class="articulo-meta">Por <strong>${escapar(autor.nombre)}</strong> · Publicado el ${fechaLarga(n.fecha)}</p>
        </div>
        <div class="acciones-icono">
          <button type="button" class="icono-btn" data-fav="${n.id}" aria-pressed="false">${icono("marcador")}</button>
          <button type="button" class="icono-btn" id="btn-compartir" aria-label="Compartir esta noticia" title="Compartir">${icono("compartir")}</button>
          <a class="icono-btn" href="contacto.html?asunto=comentario&noticia=${n.id}" aria-label="Comentar esta noticia" title="Comentar">${icono("comentario")}</a>
        </div>
      </div>
      <h1>${escapar(n.titulo)}</h1>
      <img class="articulo-img" src="${escapar(n.imagen)}" alt="Imagen de la noticia: ${escapar(n.titulo)}">
      <div class="articulo-cuerpo">${parrafos}</div>
    </article>
    <aside>
      <section class="panel" aria-labelledby="t-reportero">
        <h2 id="t-reportero">Sobre el Reportero</h2>
        <div class="reportero"><span class="avatar" aria-hidden="true">${iniciales(autor.nombre)}</span>
          <div><strong>${escapar(autor.nombre)}</strong><span>${escapar(autor.cargo)}</span></div></div>
        <p>${escapar(autor.bio)}</p>
      </section>
      <section class="panel publicidad" aria-label="Publicidad">
        <small>Publicidad</small><h2>Noticias sin Límites</h2>
        <p>Apoya el periodismo independiente comprando una suscripción digital premium.</p>
        <a class="btn btn-oscuro" href="contacto.html?asunto=comercial">Saber más</a>
      </section>
    </aside>
  </div>
  <section class="relacionadas" aria-labelledby="t-rel">
    <h2 class="titulo-linea" id="t-rel">Otras Noticias Relacionadas</h2>
    <div class="rel-grid">${itemsRel}</div>
  </section>`;
}

/** Usa el menú nativo de compartir si existe; si no, copia el enlace. */
async function compartir(n) {
  try {
    if (navigator.share) {
      await navigator.share({ title: n.titulo, text: n.resumen, url: location.href });
      return;
    }
    await navigator.clipboard.writeText(location.href);
    mostrarToast("Enlace copiado al portapapeles");
  } catch (error) {
    if (error.name !== "AbortError") mostrarToast("No se pudo compartir el enlace", "error");
  }
}

function noEncontrada() {
  document.title = "Noticia no encontrada · NexoNoticias";
  contenedor.innerHTML = `<div class="vacio"><h2>Noticia no encontrada</h2>
    <p>La noticia que buscas no existe o fue eliminada.</p>
    <a class="btn btn-primario" href="noticias.html">Volver al catálogo</a></div>`;
}
