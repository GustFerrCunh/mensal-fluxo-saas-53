import { useEffect, useState } from "react";
import { collection, query, where, onSnapshot, addDoc, updateDoc, doc, deleteDoc } from "firebase/firestore";
import { db } from "@/firebase";
import { getAuth } from "firebase/auth";

export function useFirestoreCollection(collectionName: string) {
  const [data, setData] = useState<any[]>([]);
  const userId = getAuth().currentUser?.uid;

  useEffect(() => {
    if (!userId) return;
    const q = query(collection(db, collectionName), where("userId", "==", userId));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setData(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, [collectionName, userId]);

  const add = async (item: any) => addDoc(collection(db, collectionName), { ...item, userId });
  const update = async (id: string, item: any) => updateDoc(doc(db, collectionName, id), item);
  const remove = async (id: string) => deleteDoc(doc(db, collectionName, id));

  return { data, add, update, remove };
} 