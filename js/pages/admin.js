/**
 * admin.js — Mini CRUD de noticias (Create / Read / Delete).
 * Demostrativo: no tiene autenticación y los cambios se guardan solo en
 * el navegador (localStorage), sin modificar el archivo JSON.
 */
import { iniciarLayout, escapar, fechaCorta, mostrarToast, mostrarError } from "../core/ui.js";
import { reglas, validarFormulario, activarValidacionEnVivo } from "../core/validacion.js";
import { CATEGORIAS, IMAGENES } from "../core/config.js";
import { obtenerNoticias, obtenerAutores, crearNoticia, eliminarNoticia, esNoticiaCreada, restablecerDatos } from "../core/api.js";
import { quitar as quitarFavorito } from "../core/favoritos.js";

iniciarLayout("admin");

const esquema = {
  titulo: [reglas.requerido, reglas.minimo(10), reglas.maximo(120)],
  resumen: [reglas.requerido, reglas.minimo(20), reglas.maximo(180)],
  cuerpo: [reglas.requerido, reglas.minimo(60)], // id del textarea de contenido
};
const formulario = document.getElementById("form-noticia");
const cuerpoTabla = document.getElementById("cuerpo-tabla");
const titulo = document.getElementById("total");

// --- Opciones de los selects (categoría, imagen, autor) ---
document.getElementById("categoria").innerHTML = CATEGORIAS.map((c) => `<option>${c}</option>`).join("");
const selectImagen = document.getElementById("imagen");
selectImagen.innerHTML = IMAGENES.map((i) => `<option value="${i.archivo}">${i.etiqueta}</option>`).join("");
const vista = document.getElementById("vista-previa");
const actualizarVista = () => { vista.src = selectImagen.value; };
selectImagen.addEventListener("change", actualizarVista);
actualizarVista();

activarValidacionEnVivo(esquema);

// --- CREATE ---
formulario.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!validarFormulario(esquema)) return;
  const d = Object.fromEntries(new FormData(formulario));
  crearNoticia({
    titulo: d.titulo.trim(),
    categoria: d.categoria,
    resumen: d.resumen.trim(),
    // Cada bloque separado por una línea en blanco se convierte en un párrafo
    contenido: d.contenido.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean),
    imagen: d.imagen,
    autor: d.autor,
  });
  formulario.reset();
  formulario.querySelectorAll(".campo-estado[id$='-estado']").forEach((s) => { s.textContent = "* Requerido"; s.classList.remove("es-error"); });
  actualizarVista();
  mostrarToast("Noticia creada correctamente");
  await pintarTabla();
});

// --- READ ---
async function pintarTabla() {
  try {
    const noticias = await obtenerNoticias();
    titulo.textContent = noticias.length;
    cuerpoTabla.innerHTML = noticias.map((n) => {
      const creada = esNoticiaCreada(n.id);
      return `<tr>
        <td><img src="${escapar(n.imagen)}" alt=""></td>
        <td class="titulo-celda"><a href="detalle.html?id=${n.id}">${escapar(n.titulo)}</a></td>
        <td>${escapar(n.categoria)}</td>
        <td>${fechaCorta(n.fecha)}</td>
        <td><span class="etiqueta-origen ${creada ? "creada" : ""}">${creada ? "Creada" : "Base"}</span></td>
        <td><button type="button" class="btn btn-peligro" data-eliminar="${n.id}" aria-label="Eliminar: ${escapar(n.titulo)}">Eliminar</button></td>
      </tr>`;
    }).join("") || '<tr><td colspan="6">No hay noticias publicadas.</td></tr>';
  } catch (error) {
    mostrarError(cuerpoTabla.closest(".tabla-envoltorio"), error);
  }
}

// --- DELETE (delegación de eventos sobre la tabla) ---
cuerpoTabla.addEventListener("click", async (e) => {
  const boton = e.target.closest("[data-eliminar]");
  if (!boton) return;
  const id = Number(boton.dataset.eliminar);
  if (!confirm("¿Eliminar esta noticia? Podrás restablecer los datos de ejemplo cuando quieras.")) return;
  eliminarNoticia(id);
  quitarFavorito(id); // evita favoritos "fantasma"
  mostrarToast("Noticia eliminada");
  await pintarTabla();
});

document.getElementById("btn-restablecer").addEventListener("click", async () => {
  if (!confirm("Se borrarán las noticias creadas y se recuperarán las eliminadas. ¿Continuar?")) return;
  restablecerDatos();
  mostrarToast("Datos de ejemplo restablecidos");
  await pintarTabla();
});

// --- Autores (select) y primera carga ---
(async () => {
  try {
    const autores = await obtenerAutores();
    const opciones = Object.entries(autores).map(([clave, a]) => `<option value="${clave}">${escapar(a.nombre)} — ${escapar(a.cargo)}</option>`);
    document.getElementById("autor").innerHTML = '<option value="redaccion">Redacción NexoNoticias</option>' + opciones.join("");
    await pintarTabla();
  } catch (error) {
    mostrarError(cuerpoTabla.closest(".tabla-envoltorio"), error);
  }
})();
