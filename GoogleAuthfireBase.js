var fireBase = fireBase || firebase;
var hasInit = false;
var config = {
  apiKey: "AIzaSyBuyQzOEh5Wg6W-C_p2c7M7V1T9wr3TlwU",
  authDomain: "kanyadet-school.firebaseapp.com",
  databaseURL: "https://kanyadet-school-default-rtdb.firebaseio.com",
  projectId: "kanyadet-school",
  storageBucket: "kanyadet-school.appspot.com",
  messagingSenderId: "224031504744",
  appId: "1:224031504744:web:8e71e83269abf49ecdfedd",
  measurementId: "G-8F80E3SNG5"
};

if (!hasInit) {
    firebase.initializeApp(config);
    hasInit = true;
}
