import { useState, useEffect } from "react";
// Firebase removed
// import { onSnapshot } from "firebase/firestore";
import { getCollectionPath } from "../services/firestoreService.js";

export const useRealtimeCollection = (collectionName) => {
  const [data, setData] = useState([]);

  useEffect(() => {
    // Firebase removed
    // const path = getCollectionPath(collectionName);
    // const unsubscribe = onSnapshot(path, (snap) => {
    //   const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    //   setData(items);
    // });
    // return () => unsubscribe();
  }, [collectionName]);

  return data;
};
