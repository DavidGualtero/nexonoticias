/**
 * contacto.js — Formulario de contacto con validaciones básicas:
 *  - Nombre: obligatorio, mínimo 3 caracteres
 *  - Correo: obligatorio y con formato válido
 *  - Mensaje: obligatorio, entre 10 y 1000 caracteres
 * Al enviar guarda el mensaje en localStorage y muestra una confirmación.
 */
import { iniciarLayout, escapar } from "../core/ui.js";
import { reglas, validarFormulario, activarValidacionEnVivo } from "../core/validacion.js";
import { ASUNTOS, CLAVES } from "../core/config.js";
import { leer, guardar } from "../core/storage.js";
import { obtenerNoticia } from "../core/api.js";

iniciarLayout("contacto");

const esquema = {
  nombre: [reglas.requerido, reglas.minimo(3)],
  correo: [reglas.requerido, reglas.correo],
  mensaje: [reglas.requerido, reglas.minimo(10), reglas.maximo(1000)],
};

const formulario = document.getElementById("form-contacto");
const aviso = document.getElementById("aviso-validos");
const confirmacion = document.getElementById("confirmacion");
const selectAsunto = document.getElementById("asunto");

// Opciones del asunto generadas desde la configuración
selectAsunto.insertAdjacentHTML("beforeend", ASUNTOS.map((a) => `<option value="${a.valor}">${a.texto}</option>`).join(""));

/** Muestra el aviso verde cuando nombre y correo ya son válidos (sin pintar errores). */
function actualizarAviso() {
  const ok = (id) => esquema[id].every((regla) => regla(document.getElementById(id).value) === true);
  aviso.hidden = !(ok("nombre") && ok("correo"));
}

activarValidacionEnVivo(esquema, actualizarAviso);

formulario.addEventListener("submit", (e) => {
  e.preventDefault();
  if (!validarFormulario(esquema)) return;

  const datos = Object.fromEntries(new FormData(formulario));
  const mensajes = leer(CLAVES.mensajes, []);
  guardar(CLAVES.mensajes, [...mensajes, { id: Date.now(), ...datos, fecha: new Date().toISOString() }]);

  document.getElementById("confirmacion-nombre").textContent = datos.nombre.trim();
  formulario.hidden = true;
  confirmacion.hidden = false;
  confirmacion.focus();
});

document.getElementById("btn-nuevo").addEventListener("click", () => {
  formulario.reset();
  formulario.querySelectorAll("[aria-invalid]").forEach((c) => c.setAttribute("aria-invalid", "false"));
  formulario.querySelectorAll(".campo-estado[id$='-estado']").forEach((s) => { s.textContent = "* Requerido"; s.classList.remove("es-error"); });
  aviso.hidden = true;
  confirmacion.hidden = true;
  formulario.hidden = false;
  document.getElementById("nombre").focus();
});

// Prellenado cuando se llega desde una noticia (?asunto=comentario&noticia=ID)
(async () => {
  const params = new URLSearchParams(location.search);
  const asunto = params.get("asunto");
  if (ASUNTOS.some((a) => a.valor === asunto)) selectAsunto.value = asunto;
  const id = params.get("noticia");
  if (id) {
    try {
      const noticia = await obtenerNoticia(id);
      if (noticia) document.getElementById("mensaje").value = `Comentario sobre la noticia «${noticia.titulo}»:\n\n`;
    } catch { /* si falla la carga, el formulario sigue funcionando vacío */ }
  }
})();
