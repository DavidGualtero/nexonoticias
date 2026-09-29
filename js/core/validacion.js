/**
 * validacion.js — Validación de formularios reutilizable (sin librerías).
 *
 * Uso: cada campo se describe con una lista de reglas. Una regla es una
 * función que recibe el valor y devuelve `true` si es válido o un texto
 * con el mensaje de error.
 */

export const reglas = {
  requerido: (v) => v.trim() !== "" || "Campo vacío",
  minimo: (n) => (v) => v.trim().length >= n || `Mínimo ${n} caracteres`,
  maximo: (n) => (v) => v.trim().length <= n || `Máximo ${n} caracteres`,
  correo: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) || "Correo no válido",
};

/**
 * Valida un campo y actualiza su estado visual y de accesibilidad.
 * El elemento con id `<id>-estado` muestra "* Requerido", el error o "✓ Correcto".
 * @returns {boolean} true si el campo es válido
 */
export function validarCampo(campo, listaReglas) {
  const estado = document.getElementById(`${campo.id}-estado`);
  let error = null;
  for (const regla of listaReglas) {
    const resultado = regla(campo.value);
    if (resultado !== true) { error = resultado; break; }
  }
  campo.setAttribute("aria-invalid", error ? "true" : "false");
  if (estado) {
    estado.classList.toggle("es-error", Boolean(error));
    estado.textContent = error ?? "✓ Correcto";
  }
  return !error;
}

/**
 * Valida todo un formulario según un esquema { idCampo: [reglas] }.
 * Enfoca el primer campo inválido. @returns {boolean}
 */
export function validarFormulario(esquema) {
  let primeroInvalido = null;
  for (const [id, listaReglas] of Object.entries(esquema)) {
    const campo = document.getElementById(id);
    if (!validarCampo(campo, listaReglas) && !primeroInvalido) primeroInvalido = campo;
  }
  primeroInvalido?.focus();
  return !primeroInvalido;
}

/**
 * Conecta la validación en vivo: al salir de un campo y mientras se corrige.
 * @param {Function} [alCambiar] se ejecuta tras cada validación
 */
export function activarValidacionEnVivo(esquema, alCambiar) {
  for (const [id, listaReglas] of Object.entries(esquema)) {
    const campo = document.getElementById(id);
    const evento = campo.tagName === "SELECT" ? "change" : "blur";
    campo.addEventListener(evento, () => { validarCampo(campo, listaReglas); alCambiar?.(); });
    campo.addEventListener("input", () => {
      if (campo.getAttribute("aria-invalid") === "true") validarCampo(campo, listaReglas);
      alCambiar?.();
    });
  }
}
