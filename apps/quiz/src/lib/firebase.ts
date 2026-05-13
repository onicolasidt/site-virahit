import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

export async function salvarPedido(pedidoId: string, dados: any) {
  try {
    await setDoc(doc(db, 'pedidos', pedidoId), dados, { merge: true });
  } catch (err) {
    console.error('Erro ao salvar no Firestore', err);
  }
}

export async function buscarPedido(pedidoId: string) {
  try {
    const snap = await getDoc(doc(db, 'pedidos', pedidoId));
    if (!snap.exists()) return null;
    return { idPedido: pedidoId, ...snap.data() };
  } catch (err) {
    console.error('Erro ao buscar no Firestore', err);
    return null;
  }
}
