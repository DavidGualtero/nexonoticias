/**
 * noticias.js — Catálogo de noticias con búsqueda y filtro por categoría.
 * El estado del filtro se refleja en la URL (?q=...&categoria=...) para
 * poder compartir o recargar la búsqueda.
 */
import { iniciarLayout, crearTarjeta, mostrarError, sincronizarFavoritos, escapar } from "../core/ui.js";
import { obtenerNoticias } from "../core/api.js";
import { CATEGORIAS } from "../core/config.js";

iniciarLayout("noticias");

const listado = document.getElementById("listado");
const contador = document.getElementById("contador");
const campoBusqueda = document.getElementById("buscar");
const contenedorPildoras = document.getElementById("pildoras");

const params = new URLSearchParams(location.search);
const estado = {
  q: params.get("q") ?? "",
  categoria: CATEGORIAS.includes(params.get("categoria")) ? params.get("categoria") : "Todas",
};
let noticias = [];

/** Minúsculas y sin tildes, para que "politica" encuentre "Política". */
const normalizar = (t) => t.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

function filtrar() {
  const consulta = normalizar(estado.q.trim());
  return noticias.filter((n) => {
    const coincideCategoria = estado.categoria === "Todas" || n.categoria === estado.categoria;
    const texto = normalizar(`${n.titulo} ${n.resumen} ${n.categoria} ${n.etiqueta ?? ""}`);
    return coincideCategoria && (!consulta || texto.includes(consulta));
  });
}

function pintarPildoras() {
  contenedorPildoras.innerHTML = ["Todas", ...CATEGORIAS]
    .map((c) => `<button type="button" class="pildora" data-categoria="${c}" aria-pressed="${c === estado.categoria}">${c}</button>`)
    .join("");
}

function pintar() {
  const resultado = filtrar();
  contador.textContent = `${resultado.length} ${resultado.length === 1 ? "noticia encontrada" : "noticias encontradas"}`;
  listado.innerHTML = resultado.length
    ? resultado.map(crearTarjeta).join("")
    : `<div class="vacio"><h2>Sin resultados</h2><p>No encontramos noticias para «${escapar(estado.q)}» en ${escapar(estado.categoria)}.</p>
       <button type="button" class="btn btn-primario" id="limpiar">Ver todas las noticias</button></div>`;
  sincronizarFavoritos();

  const nuevos = new URLSearchParams();
  if (estado.q) nuevos.set("q", estado.q);
  if (estado.categoria !== "Todas") nuevos.set("categoria", estado.categoria);
  history.replaceState(null, "", nuevos.toString() ? `?${nuevos}` : location.pathname);
}

// --- Eventos ---
contenedorPildoras.addEventListener("click", (e) => {
  const boton = e.target.closest("[data-categoria]");
  if (!boton) return;
  estado.categoria = boton.dataset.categoria;
  contenedorPildoras.querySelectorAll(".pildora").forEach((p) => p.setAttribute("aria-pressed", String(p === boton)));
  pintar();
});
campoBusqueda.addEventListener("input", () => { estado.q = campoBusqueda.value; pintar(); });
document.getElementById("form-buscar").addEventListener("submit", (e) => e.preventDefault());
listado.addEventListener("click", (e) => {
  if (!e.target.closest("#limpiar")) return;
  estado.q = ""; estado.categoria = "Todas"; campoBusqueda.value = "";
  pintarPildoras(); pintar();
});

// --- Carga inicial ---
(async () => {
  try {
    noticias = await obtenerNoticias();
    campoBusqueda.value = estado.q;
    pintarPildoras();
    pintar();
  } catch (error) {
    mostrarError(listado, error);
  }
})();
