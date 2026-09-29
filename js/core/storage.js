/**
 * storage.js — Envoltorio seguro sobre localStorage.
 * Si el navegador bloquea el almacenamiento (modo privado, cuota llena)
 * la aplicación sigue funcionando sin lanzar errores.
 */

/** Lee y parsea un valor JSON; devuelve `porDefecto` si no existe o falla. */
export function leer(clave, porDefecto = null) {
  try {
    const bruto = localStorage.getItem(clave);
    return bruto === null ? porDefecto : JSON.parse(bruto);
  } catch {
    return porDefecto;
  }
}

/** Guarda un valor serializado como JSON. Devuelve true si tuvo éxito. */
export function guardar(clave, valor) {
  try {
    localStorage.setItem(clave, JSON.stringify(valor));
    return true;
  } catch {
    return false;
  }
}

/** Elimina una clave. */
export function borrar(clave) {
  try {
    localStorage.removeItem(clave);
  } catch {
    /* sin acción: el almacenamiento no está disponible */
  }
}
