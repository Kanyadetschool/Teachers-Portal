var fireBase = fireBase || firebase;
var hasInit = false;
var config = {
  apiKey: "AIzaSyABRqyn5MxtJsNO4AIRxGmFqRO11UOJ8Wc",
  authDomain: "kanyadetschool-1.firebaseapp.com",
  databaseURL: "https://kanyadetschool-1-default-rtdb.firebaseio.com",
  projectId: "kanyadetschool-1",
  storageBucket: "kanyadetschool-1.appspot.com",
  messagingSenderId: "46717768246",
  appId: "1:46717768246:web:f74defc6b7bf5ea003fe97",
  measurementId: "G-RVDM8W9EL7"
};

if (!hasInit) {
    firebase.initializeApp(config);
    hasInit = true;
}
