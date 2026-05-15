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
    console.log('[Firebase] buscarPedido:', pedidoId);
    const snap = await getDoc(doc(db, 'pedidos', pedidoId));
    console.log('[Firebase] buscarPedido exists:', snap.exists(), snap.exists() ? snap.data().status : 'n/a');
    if (!snap.exists()) return null;
    return { idPedido: pedidoId, ...snap.data() };
  } catch (err: any) {
    console.error('[Firebase] buscarPedido FAILED:', err.code, err.message);
    return null;
  }
}

export async function buscarPedidoPorCodigoCurto(codigoCurto: string) {
  try {
    console.log('[Firebase] buscarPedidoPorCodigoCurto:', codigoCurto);
    const q = query(collection(db, 'pedidos'), where('codigoCurto', '==', codigoCurto));
    const snap = await getDocs(q);
    console.log('[Firebase] buscarPedidoPorCodigoCurto results:', snap.size, snap.docs.map(d => ({id: d.id, status: d.data().status, keys: Object.keys(d.data())})));
    if (snap.empty) return null;
    const docSnap = snap.docs[0];
    const data = { idPedido: docSnap.id, ...docSnap.data() };
    console.log('[Firebase] buscarPedidoPorCodigoCurto returning:', { idPedido: data.idPedido, status: (data as any).status });
    return data;
  } catch (err: any) {
    console.error('[Firebase] buscarPedidoPorCodigoCurto FAILED:', err.code, err.message);
    return null;
  }
}
