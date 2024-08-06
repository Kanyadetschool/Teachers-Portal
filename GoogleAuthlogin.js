// FirebaseUI config.
var uiConfig = {
  signInSuccessUrl: 'https://kanyadetschool-1.web.app/loginwindow2.html',
  signInOptions: [
    // Leave the lines as is for the providers you want to offer your users.
    firebase.auth.PhoneAuthProvider.PROVIDER_ID,
    firebase.auth.EmailAuthProvider.PROVIDER_ID,
    // firebase.auth.GoogleAuthProvider.PROVIDER_ID,
    // firebase.auth.FacebookAuthProvider.PROVIDER_ID,
          //firebase.auth.TwitterAuthProvider.PROVIDER_ID,
          //firebase.auth.GithubAuthProvider.PROVIDER_ID,
  ],
  // Terms of service url.
  tosUrl: '/@Landing/Staff/1.Staff%20Landing%20Page/terms.html'
};

// Initialize the FirebaseUI Widget using Firebase.
var ui = new firebaseui.auth.AuthUI(firebase.auth());
// The start method will wait until the DOM is loaded.
ui.start('#firebaseui-auth-container', uiConfig);









