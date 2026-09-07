import { listSeeds, randomSeed } from './lib/seed-service.js';

const view = document.getElementById('view');

function esc(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[c]);
}

function renderSeedCard(s) {
  return `
    <article class="card">
      <img class="card-img" src="${esc(s.imageUrl)}" alt="${esc(s.message)}" loading="lazy">
      <div class="card-body">
        <p class="card-msg">${esc(s.message)}</p>
        ${s.author ? `<span class="card-author">— ${esc(s.author)}</span>` : ''}
      </div>
    </article>`;
}

function renderError(retry) {
  view.innerHTML = `
    <div class="state-box">
      <p class="state error">No se pudo cargar el contenido.</p>
      <button id="retry" class="btn">Reintentar</button>
    </div>`;
  document.getElementById('retry').onclick = retry;
}

function home() {
  view.innerHTML = `
    <section class="hero">
      <h1>Semillas de Esperanza</h1>
      <p>Cada semilla es una imagen con un mensaje de fe. Escanea tu QR, abre tu semilla y deja que toque tu corazón.</p>
      <div class="row">
        <a class="btn" href="#/semilla">Recibir una Semilla</a>
        <a class="btn btn-ghost" href="#/galeria">Ver la galería</a>
      </div>
    </section>`;
}

async function showRandomSeed(seed) {
  if (!seed) {
    view.innerHTML = '<div class="state-box"><p class="state">Aún no hay semillas activas. Vuelve pronto.</p></div>';
    return;
  }
  view.innerHTML = `
    ${renderSeedCard(seed)}
    <div class="row">
      <button id="again" class="btn">Ver otra Semilla</button>
    </div>`;
  document.getElementById('again').onclick = () => seedView(seed);
}

async function seedView(cachedList) {
  const load = async (list) => showRandomSeed(randomSeed(list));
  if (cachedList) return load(cachedList);

  view.innerHTML = '<div class="state-box"><p class="state">Cargando tu Semilla…</p></div>';
  try {
    const list = await listSeeds({ activeOnly: true });
    load(list);
  } catch {
    renderError(() => seedView());
  }
}

async function gallery() {
  view.innerHTML = '<div class="state-box"><p class="state">Cargando…</p></div>';
  try {
    const list = await listSeeds({ activeOnly: true });
    view.innerHTML = list.length
      ? `<div class="grid">${list.map(renderSeedCard).join('')}</div>`
      : '<div class="state-box"><p class="state">Aún no hay semillas activas.</p></div>';
  } catch {
    renderError(gallery);
  }
}

function route() {
  const h = location.hash || '#/';
  if (h.startsWith('#/semilla')) seedView();
  else if (h.startsWith('#/galeria')) gallery();
  else home();
}

window.addEventListener('hashchange', route);
route();