/**
 * home.js — Página de inicio.
 * Pinta las noticias destacadas desde el JSON, enlaza "Última Hora",
 * anima las estadísticas y activa la suscripción al boletín.
 */
import { iniciarLayout, crearTarjeta, mostrarError, iniciarBoletin, sincronizarFavoritos } from "../core/ui.js";
import { obtenerNoticias } from "../core/api.js";

iniciarLayout("inicio");
iniciarBoletin(document.getElementById("form-boletin"), document.getElementById("msg-boletin"));
animarContadores();
cargarDestacados();

async function cargarDestacados() {
  const contenedor = document.getElementById("destacados");
  try {
    const todas = await obtenerNoticias();
    if (todas.length === 0) {
      contenedor.innerHTML = '<div class="vacio"><h2>Aún no hay noticias</h2><p>Crea la primera desde el panel Admin.</p></div>';
      return;
    }
    // Destacadas primero; si hay menos de 3, se completa con las más recientes
    const destacadas = todas.filter((n) => n.destacada);
    const seleccion = [...destacadas, ...todas.filter((n) => !n.destacada)].slice(0, 3);
    contenedor.innerHTML = seleccion.map(crearTarjeta).join("");
    document.getElementById("btn-ultima-hora").href = `detalle.html?id=${todas[0].id}`;
    sincronizarFavoritos();
  } catch (error) {
    mostrarError(contenedor, error);
  }
}

/** Anima los números de la sección de estadísticas cuando entran en pantalla. */
function animarContadores() {
  const elementos = document.querySelectorAll("[data-contador]");
  const sinMovimiento = matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (sinMovimiento || !("IntersectionObserver" in window)) return;

  const observador = new IntersectionObserver((entradas) => {
    entradas.forEach((entrada) => {
      if (!entrada.isIntersecting) return;
      observador.unobserve(entrada.target);
      contar(entrada.target);
    });
  }, { threshold: 0.6 });
  elementos.forEach((el) => observador.observe(el));
}

function contar(el) {
  const meta = parseFloat(el.dataset.contador);
  const decimales = Number(el.dataset.decimales ?? 0);
  const sufijo = el.dataset.sufijo ?? "";
  const duracion = 1200;
  const inicio = performance.now();
  const paso = (ahora) => {
    const progreso = Math.min((ahora - inicio) / duracion, 1);
    const suavizado = 1 - Math.pow(1 - progreso, 3); // desaceleración
    el.textContent = (meta * suavizado).toFixed(decimales) + sufijo;
    if (progreso < 1) requestAnimationFrame(paso);
  };
  requestAnimationFrame(paso);
}
