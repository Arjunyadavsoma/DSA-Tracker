// Import Firebase modules
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAmEp590rxO16ePJrP3oH4Sh0KLVEPWV-4",
  authDomain: "authstart-reh4u.firebaseapp.com",
  projectId: "authstart-reh4u",
  storageBucket: "authstart-reh4u.firebasestorage.app",
  messagingSenderId: "871681016017",
  appId: "1:871681016017:web:067fa517b1b24653f005f0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
