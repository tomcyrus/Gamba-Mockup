// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getDatabase, ref, set, push, get } from "firebase/database";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional

const firebaseConfig = {
  apiKey: "AIzaSyDywVP19QU_22RFwye-xLucIAaofCs75tA",
  authDomain: "legacylucidchess.firebaseapp.com",
  databaseURL: "https://legacylucidchess-default-rtdb.firebaseio.com",
  projectId: "legacylucidchess",
  storageBucket: "legacylucidchess.firebasestorage.app",
  messagingSenderId: "356778550735",
  appId: "1:356778550735:web:71c8eaaacb70b7227adeba",
  measurementId: "G-HS6SB9EKWV"
};

//   const firebaseConfig = {
//   apiKey: "AIzaSyC8xbequnrjtAAS2EBpLpDJzMi7KBZLR9w",
//   authDomain: "lumanagi-auth.firebaseapp.com",
//   databaseURL: "https://lumanagi-auth-default-rtdb.firebaseio.com",
//   projectId: "lumanagi-auth",
//   storageBucket: "lumanagi-auth.firebasestorage.app",
//   messagingSenderId: "547457028",
//   appId: "1:547457028:web:6486e77b35bbd3e6574d51",
//   measurementId: "G-NV7FM375B9"
// };

// const firebaseConfig = {
//   apiKey: "AIzaSyCvi7MhE_qgLgkgPr3JUT8BZXMYfGTwwso",
//   authDomain: "metamodal-20380.firebaseapp.com",
//   databaseURL: "https://metamodal-20380-default-rtdb.firebaseio.com",
//   projectId: "metamodal-20380",
//   storageBucket: "metamodal-20380.firebasestorage.app",
//   messagingSenderId: "442000129225",
//   appId: "1:442000129225:web:88715530d07ecca9106118",
//   measurementId: "G-XJWCJNEXTR"
// };

// Initialize Firebase
const cong = initializeApp(firebaseConfig);
const database = getDatabase(cong);
export { database, ref, set, push, get };
export default cong; 