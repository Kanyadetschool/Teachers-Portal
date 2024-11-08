// FirebaseUI config
var uiConfig = {
  signInFlow: 'popup',  // Change to 'redirect' to handle cross-origin issues
  signInSuccessUrl: 'loginwindow2.html',
  signInOptions: [
    firebase.auth.GoogleAuthProvider.PROVIDER_ID,
    firebase.auth.EmailAuthProvider.PROVIDER_ID,
    firebase.auth.PhoneAuthProvider.PROVIDER_ID,
    // Uncomment the following lines if you want to support additional sign-in providers
   // firebase.auth.FacebookAuthProvider.PROVIDER_ID,
   // firebase.auth.TwitterAuthProvider.PROVIDER_ID,
    // firebase.auth.GithubAuthProvider.PROVIDER_ID,
  ],
  tosUrl: './terms.html'
};

// Initialize the FirebaseUI Widget using Firebase
var ui = new firebaseui.auth.AuthUI(firebase.auth());
// The start method will wait until the DOM is loaded
ui.start('#firebaseui-auth-container', uiConfig);
