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
worker/         Cloudflare Worker (subida de imágenes a imgBB)
firestore.rules Reglas de seguridad de Firestore
opencode.md     Instrucciones y convenciones del proyecto
```

## Puesta en marcha local

1. Clonar el repositorio.
2. Copiar `js/config.example.js` → `js/config.js` y rellenar (referencia: `firebaseconfig.md`, local, no versionado).
3. Abrir con Live Server (`index.html`).
4. Panel admin en `admin.html`.

## Configurar Firebase (una vez)

1. Habilitar Auth con Email/Password.
2. Crear el usuario admin.
3. Crear el documento `usuarios/{uid}` con `role: "admin"` (necesario).
4. Publicar `firestore.rules` (está en la raíz del repo).

## Cloudflare Worker

Despliega el worker por el dashboard de Cloudflare (sin Node). Al final, vuelca la URL del worker en `IMGBB_WORKER_URL` de `js/config.js`.

## Deploy GitHub Pages

1. Publicar el repo (branch `main`).
2. Settings → Pages → publicar desde `main`.
3. URL final: `https://<usuario>.github.io/<repo>/`.
4. QR dinámico apunta a `<url>/#/semilla`.

## QR dinámico

Un solo QR fijo que codifica la URL con el hash `#/semilla`. Cada escaneo carga la app y entrega una Semilla aleatoria entre las **activas** (aleatoriedad pura, puede repetir; sin estado ni backend). El QR se genera con cualquier herramienta externa usando la URL como contenido. Ver `.opencode/specs/06-qr-routing.spec.md`.

## Licencia

MIT — © 2026 Armando González.