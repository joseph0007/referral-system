const firebase = require("firebase-admin");

firebase.initializeApp({  
  apiKey: "AIzaSyD0t0p_x2kCQrDcddndYcVxZZwGVdyG8MQ",
  authDomain: "crwn-clothing-e93a4.firebaseapp.com",
  databaseURL: "https://crwn-clothing-e93a4.firebaseio.com",
  projectId: "crwn-clothing-e93a4",
  storageBucket: "crwn-clothing-e93a4.appspot.com",
  messagingSenderId: "847126168089",
  appId: "1:847126168089:web:8e2055bde8d2aea7a86088",
  measurementId: "G-QBRKGPD4LE",
});

module.exports = firebase;