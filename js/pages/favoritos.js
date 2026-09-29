/**
 * favoritos.js — Lista personalizada de noticias guardadas (localStorage).
 * Se vuelve a pintar cada vez que cambia la lista ("favoritos:cambio").
 */
import { iniciarLayout, crearTarjeta, mostrarError, sincronizarFavoritos, mostrarToast } from "../core/ui.js";
import { obtenerNoticias } from "../core/api.js";
import { obtenerIds, vaciar } from "../core/favoritos.js";

iniciarLayout("favoritos");

const listado = document.getElementById("listado");
const contador = document.getElementById("contador");
const botonVaciar = document.getElementById("btn-vaciar");
let noticias = [];

function pintar() {
  // Respeta el orden en que el usuario las guardó e ignora ids de noticias eliminadas
  const lista = obtenerIds().map((id) => noticias.find((n) => n.id === id)).filter(Boolean);
  contador.textContent = lista.length === 1 ? "1 noticia guardada" : `${lista.length} noticias guardadas`;
  botonVaciar.hidden = lista.length === 0;
  listado.innerHTML = lista.length
    ? lista.map(crearTarjeta).join("")
    : `<div class="vacio"><h2>Aún no tienes favoritos</h2>
       <p>Toca el corazón de cualquier noticia para guardarla aquí y leerla después.</p>
       <a class="btn btn-primario" href="noticias.html">Explorar noticias</a></div>`;
  sincronizarFavoritos();
}

botonVaciar.addEventListener("click", () => {
  if (confirm("¿Quieres quitar todas las noticias de tu lista de favoritos?")) {
    vaciar();
    mostrarToast("Lista de favoritos vaciada");
  }
});
document.addEventListener("favoritos:cambio", pintar);

(async () => {
  try {
    noticias = await obtenerNoticias();
    pintar();
  } catch (error) {
    mostrarError(listado, error);
  }
})();
