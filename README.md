# Semillas de Esperanza

Web App espiritual/cristiana donde cada **Semilla** (imagen + mensaje) se entrega aleatoriamente al escanear un QR. Incluye un panel de administración para crear, editar, activar/desactivar y eliminar Semillas.

## Funcionalidades

- **Público**: escanear un QR → Semilla aleatoria entre las activas; galería de Semillas activas.
- **Admin** (`admin.html`): login, CRUD de Semillas, activar/desactivar y subida de imágenes.

## Stack técnico

- HTML/CSS puro (sin build) + JS Vanilla (ESModules).
- Firebase: Auth (Email/Password) + Firestore.
- Cloudflare Worker: proxy de subida a imgBB.
- GitHub Pages para el deploy.

## Estructura de carpetas

```
css/            Estilos (glassmorphism, responsivo)
js/             Lógica (main, admin, lib/*)
```
## QR dinámico

Un solo QR fijo que codifica la URL con el hash `#/semilla`. Cada escaneo carga la app y entrega una Semilla aleatoria entre las **activas** (aleatoriedad pura, puede repetir; sin estado ni backend). El QR se genera con cualquier herramienta externa usando la URL como contenido.

## Licencia

MIT — © 2026 Armando González.