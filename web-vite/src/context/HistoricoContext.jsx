import React, { createContext, useState, useEffect, useContext } from 'react';
import { db } from '../firebaseConfig';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { useAuth } from './AuthContext';

const HistoricoContext = createContext();

export function HistoricoProvider({ children }) {
  const [livros, setLivros] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setLivros([]);
      setLoading(false);
      return;
    }

    // LISTENER EM TEMPO REAL:
    // "Reativa" a função de ver atualizações na hora (sem F5)
    const q = query(collection(db, "livros"), where("uid", "==", user.uid));
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const dados = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setLivros(dados);
      setLoading(false);
    }, (error) => {
      console.error("Erro no contexto de histórico:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  return (
    <HistoricoContext.Provider value={{ livros, loading }}>
      {children}
    </HistoricoContext.Provider>
  );
}

export function useHistorico() {
  const context = useContext(HistoricoContext);
  if (!context) {
    throw new Error('useHistorico deve ser usado dentro de um HistoricoProvider');
  }
  return context;
}