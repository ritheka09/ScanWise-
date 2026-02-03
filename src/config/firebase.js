import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyASHc122nQbiPVkGBYWkIXY7DFv_M-6z_g",
  authDomain: "scanwise-861c4.firebaseapp.com",
  projectId: "scanwise-861c4",
  storageBucket: "scanwise-861c4.firebasestorage.app",
  messagingSenderId: "444154040823",
  appId: "1:444154040823:web:0868e54669b8cfc6419ef2",
  measurementId: "G-9VHX43S8R2"
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)