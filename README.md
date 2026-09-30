# NexoNoticias

Prototipo funcional de una plataforma web de noticias (Entrega 2 – Módulo Desarrollo de Front-end).

**Tecnologías:** HTML5, CSS3, JavaScript (módulos ES), JSON local y localStorage. Sin dependencias externas.

## Cómo ejecutarlo

La app usa `fetch` y módulos ES, por lo que **debe abrirse con un servidor web** (no con doble clic).

```bash
# Opción 1: Python
python -m http.server 8000     # luego abrir http://localhost:8000

# Opción 2: Visual Studio Code -> extensión "Live Server" -> "Go Live"
```

También funciona publicada en GitHub Pages, Netlify o Vercel (sitio estático, sin paso de compilación).

## Páginas

| Archivo | Descripción |
|---|---|
| `index.html` | Inicio: hero, destacados desde JSON, cita, estadísticas, boletín |
| `noticias.html` | Catálogo con búsqueda y filtro por categoría |
| `detalle.html?id=N` | Detalle de una noticia, reportero y relacionadas |
| `favoritos.html` | Lista personalizada de favoritos (localStorage) |
| `contacto.html` | Formulario con validaciones y confirmación |
| `admin.html` | Mini CRUD: crear y eliminar noticias |

## Estructura

```
css/styles.css        estilos (variables, Grid, Flexbox, responsive)
js/core/              módulos reutilizables (config, storage, api, favoritos, validacion, ui)
js/pages/             un módulo por página
data/noticias.json    autores y noticias
img/  fonts/          recursos
```

## Datos

Las noticias se leen de `data/noticias.json`. Los cambios del usuario (favoritos, noticias creadas o eliminadas, mensajes) se guardan en `localStorage`; el JSON nunca se modifica. El botón **Restablecer datos de ejemplo** en Admin recupera el estado inicial.

## Autor

Juan David Gualtero · Docente: John Olarte Ramos
