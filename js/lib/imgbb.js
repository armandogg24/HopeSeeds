import { IMGBB_WORKER_URL } from '../config.js';
import { auth } from './firebase.js';

export async function uploadImage(file) {
  if (!(file instanceof File)) throw new Error('Imagen no válida.');
  if (!IMGBB_WORKER_URL) throw new Error('Falta configurar la URL del servidor de subida.');

  let token;
  try {
    token = await auth.currentUser.getIdToken();
  } catch {
    throw new Error('Tu sesión expiró. Inicia sesión de nuevo.');
  }

  const body = new FormData();
  body.append('image', file);

  let res;
  try {
    res = await fetch(IMGBB_WORKER_URL, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body,
    });
  } catch {
    throw new Error('No se pudo contactar el servidor de subida. Revisa tu red.');
  }

  if (res.status === 401) throw new Error('Tu sesión expiró. Inicia sesión de nuevo.');
  if (res.status === 403) throw new Error('No tienes permiso para subir.');
  if (res.status === 413) throw new Error('La imagen es muy grande (máx. 32 MB).');

  let data = null;
  try {
    data = await res.json();
  } catch {
    data = null;
  }

  if (!res.ok) {
    throw new Error((data && data.error) || `El servidor de subida falló (estado ${res.status}).`);
  }
  if (!data || typeof data.url !== 'string' || !data.url.startsWith('https://')) {
    throw new Error('Respuesta inválida del servidor de subida.');
  }

  return data.url;
}