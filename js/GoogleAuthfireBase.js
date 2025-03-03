var fireBase = fireBase || firebase;
var hasInit = false;
var config = {
    apiKey: "AIzaSyBoXasNfL5QtMvTMsKQzctcl-cFm1ThvNw",
    authDomain: "kanyadet-school-portal.firebaseapp.com",
    projectId: "kanyadet-school-portal",
    storageBucket: "kanyadet-school-portal.firebasestorage.app",
    messagingSenderId: "77104853416",
    appId: "1:77104853416:web:ddac8c070c194f5334ad9d",
    measurementId: "G-42L66EN6GJ"
};

if (!firebase.apps.length) {
    const firebaseConfig = {
        apiKey: "AIzaSyBoXasNfL5QtMvTMsKQzctcl-cFm1ThvNw",
        authDomain: "kanyadet-school-portal.firebaseapp.com",
        projectId: "kanyadet-school-portal",
        storageBucket: "kanyadet-school-portal.firebasestorage.app",
        messagingSenderId: "77104853416",
        appId: "1:77104853416:web:ddac8c070c194f5334ad9d",
        measurementId: "G-42L66EN6GJ"
    };
    firebase.initializeApp(firebaseConfig);
} else {
    firebase.app(); // if already initialized, use that one
}
