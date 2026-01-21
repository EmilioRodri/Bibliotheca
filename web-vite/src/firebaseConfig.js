import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";


const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "minhabiblioteca-e5788.firebaseapp.com",
  projectId: "minhabiblioteca-e5788",
  storageBucket: "minhabiblioteca-e5788.firebasestorage.app",
  messagingSenderId: "565349948544",
  appId: "1:565349948544:web:73215a6801f09dd4c45a65"
};

// Initialize Firebase

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app); // Inicializa aqui

// Exporta as instâncias PRONTAS
export { app, db, auth };