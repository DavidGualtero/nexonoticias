/**
 * favoritos.js — Gestión de noticias favoritas con localStorage.
 * Cada cambio dispara el evento "favoritos:cambio" para que otras partes
 * de la interfaz (insignia del menú, botones, listas) se actualicen.
 */
import { CLAVES } from "./config.js";
import { leer, guardar } from "./storage.js";

/** Lista de ids favoritos. */
export const obtenerIds = () => leer(CLAVES.favoritos, []);

/** ¿La noticia está en favoritos? */
export const esFavorito = (id) => obtenerIds().includes(Number(id));

function notificar() {
  document.dispatchEvent(new CustomEvent("favoritos:cambio", { detail: { ids: obtenerIds() } }));
}

/** Agrega o quita una noticia. Devuelve true si quedó guardada. */
export function alternar(id) {
  id = Number(id);
  const ids = obtenerIds();
  const guardada = !ids.includes(id);
  guardar(CLAVES.favoritos, guardada ? [...ids, id] : ids.filter((x) => x !== id));
  notificar();
  return guardada;
}

/** Vacía toda la lista de favoritos. */
export function vaciar() {
  guardar(CLAVES.favoritos, []);
  notificar();
}

/** Quita una noticia de favoritos sin devolver estado (p. ej. al eliminarla del sitio). */
export function quitar(id) {
  const ids = obtenerIds();
  if (!ids.includes(Number(id))) return;
  guardar(CLAVES.favoritos, ids.filter((x) => x !== Number(id)));
  notificar();
}
