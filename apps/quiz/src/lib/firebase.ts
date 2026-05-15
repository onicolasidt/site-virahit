import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
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
  } catch (err: any) {
    console.error('[Firebase] buscarPedido FAILED:', err.code, err.message);
    return null;
  }
}

export async function buscarPedidoPorCodigoCurto(codigoCurto: string) {
  try {
    const q = query(collection(db, 'pedidos'), where('codigoCurto', '==', codigoCurto));
    const snap = await getDocs(q);
    if (snap.empty) return null;
    const docSnap = snap.docs[0];
    const data = { idPedido: docSnap.id, ...docSnap.data() };
    return data;
  } catch (err: any) {
    console.error('[Firebase] buscarPedidoPorCodigoCurto FAILED:', err.code, err.message);
    return null;
  }
}
