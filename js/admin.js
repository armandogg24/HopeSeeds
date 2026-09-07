import { login, onLogin, logout } from './lib/auth.js';
import { listSeeds, createSeed, updateSeed, deleteSeed } from './lib/seed-service.js';
import { uploadImage } from './lib/imgbb.js';

const loginSection = document.getElementById('login-section');
const panelSection = document.getElementById('panel-section');
const loginForm = document.getElementById('login-form');
const loginMsg = document.getElementById('login-msg');
const loginBtn = loginForm.querySelector('button[type="submit"]');
const toast = document.getElementById('toast');
const panelUser = document.getElementById('panel-user');
const logoutBtn = document.getElementById('logout-btn');
const newBtn = document.getElementById('new-btn');
const seedForm = document.getElementById('seed-form');
const seedFormTitle = document.getElementById('seed-form-title');
const formMsg = document.getElementById('form-msg');
const cancelBtn = document.getElementById('cancel-btn');
const seedsList = document.getElementById('seeds-list');
const listMsg = document.getElementById('list-msg');
const imageInput = document.getElementById('seed-image');
const messageInput = document.getElementById('seed-message');
const authorInput = document.getElementById('seed-author');
const activeInput = document.getElementById('seed-active');

let editingId = null;
let seeds = [];
let hadSession = false;
let toastTimer = null;

const LOGIN_ERRORS = {
  'auth/invalid-credential': 'Correo o contraseña incorrectos.',
  'auth/user-not-found': 'No existe una cuenta con este correo.',
  'auth/invalid-email': 'Correo electrónico inválido.',
  'auth/network-request-failed': 'Sin conexión. Revisa tu red.',
  'auth/too-many-requests': 'Demasiados intentos. Espera un momento.',
  'auth/user-disabled': 'Esta cuenta está deshabilitada.',
};

function esc(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[c]);
}

function setMsg(el, text) {
  el.textContent = text;
}

function loginErrorText(err) {
  return LOGIN_ERRORS[err.code] || `Error al iniciar sesión (${err.code || 'desconocido'}).`;
}

function resetLoginMsg() {
  loginMsg.textContent = '';
}

function setListMsg(text) {
  listMsg.textContent = text;
  listMsg.hidden = !text;
}

function showToast(text) {
  toast.textContent = text;
  toast.classList.remove('hide');
  toast.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.add('hide');
    setTimeout(() => {
      toast.hidden = true;
    }, 300);
  }, 3000);
}

loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  resetLoginMsg();
  const email = loginForm.elements.email.value.trim();
  const password = loginForm.elements.password.value;
  if (!email || !password) return setMsg(loginMsg, 'Completa tu correo y contraseña.');
  if (!email.includes('@')) return setMsg(loginMsg, 'Escribe un correo válido.');

  loginBtn.disabled = true;
  loginBtn.textContent = 'Iniciando sesión…';
  try {
    const cred = await login(email, password);
    const userEmail = (cred.user && cred.user.email) || email;
    showToast(`Sesión iniciada como ${userEmail}`);
    loginForm.reset();
  } catch (err) {
    setMsg(loginMsg, loginErrorText(err));
  } finally {
    loginBtn.disabled = false;
    loginBtn.textContent = 'Entrar';
  }
});

loginForm.addEventListener('input', () => {
  if (loginMsg.textContent) resetLoginMsg();
});

logoutBtn.addEventListener('click', () => logout());

newBtn.addEventListener('click', () => openForm());

cancelBtn.addEventListener('click', () => {
  seedForm.hidden = true;
  editingId = null;
});

seedForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  setMsg(formMsg, '');
  const message = messageInput.value.trim();
  if (!message) return setMsg(formMsg, 'El mensaje es obligatorio.');
  if (!imageInput.files.length && !editingId) return setMsg(formMsg, 'Elige una imagen.');

  const submitBtn = seedForm.querySelector('button[type="submit"]');
  submitBtn.disabled = true;
  try {
    let imageUrl = imageInput.files.length ? await uploadImage(imageInput.files[0]) : getSeed(editingId).imageUrl;
    const payload = { imageUrl, message, author: authorInput.value, active: activeInput.checked };

    if (editingId) await updateSeed(editingId, payload);
    else await createSeed(payload);

    seedForm.hidden = true;
    editingId = null;
    seedForm.reset();
    await loadSeeds();
    showToast('Semilla guardada.');
  } catch (err) {
    setMsg(formMsg, (err && err.message) ? err.message : 'No se pudo guardar. Revisa la conexión e inténtalo de nuevo.');
  } finally {
    submitBtn.disabled = false;
  }
});

function getSeed(id) {
  return seeds.find((s) => s.id === id) || {};
}

function openForm(seed = null) {
  editingId = seed ? seed.id : null;
  seedFormTitle.textContent = seed ? 'Editar Semilla' : 'Nueva Semilla';
  messageInput.value = seed ? seed.message : '';
  authorInput.value = seed ? (seed.author || '') : '';
  activeInput.checked = seed ? seed.active : true;
  imageInput.value = '';
  formMsg.textContent = '';
  seedForm.hidden = false;
  messageInput.focus();
}

seedsList.addEventListener('click', async (e) => {
  const btn = e.target.closest('button[data-action]');
  if (!btn) return;
  const id = btn.dataset.id;
  const seed = getSeed(id);

  if (btn.dataset.action === 'edit') openForm(seed);
  if (btn.dataset.action === 'toggle') {
    try {
      await updateSeed(id, { message: seed.message, author: seed.author, active: !seed.active });
      await loadSeeds();
    } catch {
      setListMsg('No se pudo actualizar.');
    }
  }
  if (btn.dataset.action === 'delete') {
    if (!confirm('¿Eliminar esta Semilla?')) return;
    try {
      await deleteSeed(id);
      await loadSeeds();
    } catch {
      setListMsg('No se pudo eliminar.');
    }
  }
});

async function loadSeeds() {
  setMsg(formMsg, '');
  setListMsg('');
  seedsList.innerHTML = '<p class="state">Cargando…</p>';
  try {
    seeds = await listSeeds();
    seedsList.innerHTML = seeds.length
      ? seeds.map(
          (s) => `
        <div class="row-item ${s.active ? '' : 'inactive'}">
          <img src="${esc(s.imageUrl)}" alt="${esc(s.message)}" loading="lazy">
          <div class="row-info">
            <p class="row-msg">${esc(s.message)}</p>
            <span class="badge">${s.active ? 'Activa' : 'Inactiva'}</span>
          </div>
          <div class="row-actions">
            <button class="btn btn-sm" data-action="edit" data-id="${s.id}">Editar</button>
            <button class="btn btn-sm" data-action="toggle" data-id="${s.id}">${s.active ? 'Desactivar' : 'Activar'}</button>
            <button class="btn btn-sm btn-danger" data-action="delete" data-id="${s.id}">Eliminar</button>
          </div>
        </div>`
        ).join('')
      : '<p class="state">Aún no hay semillas.</p>';
  } catch {
    seedsList.innerHTML = '<p class="state error">No se pudo cargar la lista.</p>';
  }
}

onLogin((user) => {
  const logged = Boolean(user);
  if (hadSession && !logged) {
    panelUser.textContent = '';
    setMsg(loginMsg, 'Sesión cerrada.');
  }
  hadSession = logged;
  loginSection.hidden = logged;
  panelSection.hidden = !logged;
  if (logged) {
    panelUser.textContent = user.email;
    loadSeeds();
  }
});