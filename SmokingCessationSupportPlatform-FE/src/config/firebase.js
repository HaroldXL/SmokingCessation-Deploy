import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCLuxlWnwTOxpZESURjprl4hZPLr_Y68A8",
  authDomain: "test-4e762.firebaseapp.com",
  databaseURL: "https://test-4e762-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "test-4e762",
  storageBucket: "test-4e762.firebasestorage.app",
  messagingSenderId: "334459248272",
  appId: "1:334459248272:web:6b2d194d1ce6298c178215",
  measurementId: "G-9FKKSRS9GR"
};

const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

export { storage };
