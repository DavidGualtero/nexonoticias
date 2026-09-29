/**
 * api.js — Capa de acceso a datos.
 * Fuente base: data/noticias.json (fetch). Sobre esa base se aplica el
 * "mini CRUD" guardado en localStorage:
 *   noticias visibles = (creadas + base) − eliminadas
 */
import { RUTA_DATOS, CLAVES, AUTOR_REDACCION } from "./config.js";
import { leer, guardar, borrar } from "./storage.js";

let cacheBase = null; // evita pedir el JSON varias veces en la misma página

/** Descarga (una sola vez) el JSON base. Lanza error si falla la petición. */
async function cargarBase() {
  if (cacheBase) return cacheBase;
  const respuesta = await fetch(RUTA_DATOS);
  if (!respuesta.ok) throw new Error(`No se pudo cargar ${RUTA_DATOS} (HTTP ${respuesta.status})`);
  cacheBase = await respuesta.json();
  return cacheBase;
}

/** Devuelve todas las noticias visibles, de la más reciente a la más antigua. */
export async function obtenerNoticias() {
  const base = await cargarBase();
  const eliminadas = leer(CLAVES.noticiasEliminadas, []);
  const creadas = leer(CLAVES.noticiasCreadas, []);
  return [...creadas, ...base.noticias]
    .filter((n) => !eliminadas.includes(n.id))
    .sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
}

/** Busca una noticia por id (o undefined si no existe). */
export async function obtenerNoticia(id) {
  const todas = await obtenerNoticias();
  return todas.find((n) => n.id === Number(id));
}

/** Devuelve el autor de una noticia (o el autor genérico de la redacción). */
export async function obtenerAutor(clave) {
  const base = await cargarBase();
  return base.autores[clave] ?? AUTOR_REDACCION;
}

/** Devuelve el mapa completo de autores del JSON. */
export async function obtenerAutores() {
  return (await cargarBase()).autores;
}

/** true si la noticia fue creada por el usuario (vive en localStorage). */
export function esNoticiaCreada(id) {
  return leer(CLAVES.noticiasCreadas, []).some((n) => n.id === id);
}

/** CREATE — agrega una noticia nueva y devuelve el objeto guardado. */
export function crearNoticia(datos) {
  const creadas = leer(CLAVES.noticiasCreadas, []);
  const nueva = {
    ...datos,
    id: Date.now(), // id único suficiente para un prototipo
    fecha: new Date().toISOString(),
    destacada: false,
  };
  guardar(CLAVES.noticiasCreadas, [nueva, ...creadas]);
  return nueva;
}

/** DELETE — elimina una noticia (creada o del JSON base). */
export function eliminarNoticia(id) {
  if (esNoticiaCreada(id)) {
    const creadas = leer(CLAVES.noticiasCreadas, []).filter((n) => n.id !== id);
    guardar(CLAVES.noticiasCreadas, creadas);
  } else {
    const eliminadas = leer(CLAVES.noticiasEliminadas, []);
    guardar(CLAVES.noticiasEliminadas, [...eliminadas, id]);
  }
}

/** Restablece los datos de ejemplo: borra lo creado y lo eliminado. */
export function restablecerDatos() {
  borrar(CLAVES.noticiasCreadas);
  borrar(CLAVES.noticiasEliminadas);
}
