import { db, collection, doc, addDoc, getDocs, query, where, updateDoc, deleteDoc, serverTimestamp } from './firebase.js';

export const SEED_COLLECTION = 'semillas';

export function isSeed(x) {
  return (
    x != null &&
    typeof x === 'object' &&
    typeof x.imageUrl === 'string' &&
    x.imageUrl.startsWith('https://') &&
    typeof x.message === 'string' &&
    x.message.trim().length > 0 &&
    typeof x.active === 'boolean'
  );
}

export async function listSeeds({ activeOnly = false } = {}) {
  let q = collection(db, SEED_COLLECTION);
  if (activeOnly) q = query(q, where('active', '==', true));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() })).filter(isSeed);
}

export function randomSeed(list) {
  if (!list.length) return null;
  return list[Math.floor(Math.random() * list.length)];
}

export async function createSeed({ imageUrl, message, author = '', active = true }) {
  const data = { imageUrl, message: message.trim(), active, createdAt: serverTimestamp() };
  if (author.trim()) data.author = author.trim();
  const ref = await addDoc(collection(db, SEED_COLLECTION), data);
  return { id: ref.id, ...data };
}

export async function updateSeed(id, { message, author = '', active }) {
  const data = { message: message.trim(), active, author: author.trim() };
  await updateDoc(doc(db, SEED_COLLECTION, id), data);
}

export async function deleteSeed(id) {
  await deleteDoc(doc(db, SEED_COLLECTION, id));
}