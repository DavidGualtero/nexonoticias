/**
 * config.js — Constantes globales de la aplicación.
 * Centraliza rutas, claves de almacenamiento y catálogos para no repetirlos.
 */

/** Ruta del archivo JSON local con las noticias. */
export const RUTA_DATOS = "data/noticias.json";

/** Claves usadas en localStorage (todas con prefijo para evitar colisiones). */
export const CLAVES = {
  favoritos: "nexo_favoritos",               // ids de noticias guardadas
  noticiasCreadas: "nexo_noticias_creadas",  // noticias nuevas (mini CRUD)
  noticiasEliminadas: "nexo_noticias_eliminadas", // ids del JSON eliminados
  mensajes: "nexo_mensajes",                 // mensajes del formulario de contacto
  suscriptores: "nexo_suscriptores",         // correos del boletín
};

/** Categorías disponibles para filtros y para crear noticias. */
export const CATEGORIAS = ["Política", "Tecnología", "Deportes", "Cultura"];

/** Opciones del campo "Asunto" del formulario de contacto. */
export const ASUNTOS = [
  { valor: "reporte", texto: "Reporte ciudadano" },
  { valor: "queja", texto: "Queja" },
  { valor: "sugerencia", texto: "Sugerencia" },
  { valor: "comercial", texto: "Propuesta comercial" },
  { valor: "comentario", texto: "Comentario sobre una noticia" },
];

/** Imágenes disponibles al crear una noticia desde el panel de administración. */
export const IMAGENES = [
  { archivo: "img/urbano-bogota.jpg", etiqueta: "Ciudad al atardecer" },
  { archivo: "img/peatonalizacion-centro.jpg", etiqueta: "Plaza histórica" },
  { archivo: "img/centro-innovacion.jpg", etiqueta: "Centro de datos" },
  { archivo: "img/ia-campo.jpg", etiqueta: "Drones en el campo" },
  { archivo: "img/ciberseguridad.jpg", etiqueta: "Ciberseguridad" },
  { archivo: "img/festival-bellas-artes.jpg", etiqueta: "Danza folclórica" },
  { archivo: "img/bienal-pintura.jpg", etiqueta: "Galería de arte" },
  { archivo: "img/atletismo.jpg", etiqueta: "Atletismo" },
  { archivo: "img/congreso-presupuesto.jpg", etiqueta: "Congreso" },
  { archivo: "img/infraestructura-agua.jpg", etiqueta: "Presa y embalse" },
];

/** Autor por defecto para noticias creadas desde el panel. */
export const AUTOR_REDACCION = {
  nombre: "Redacción NexoNoticias",
  cargo: "Equipo editorial",
  bio: "Equipo de redacción de NexoNoticias: periodismo independiente, riguroso y comprometido con la verdad.",
};
