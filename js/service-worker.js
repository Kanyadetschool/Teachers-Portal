if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./js/service-worker.js')
      .then(function(registration) {
        console.log('Service Worker registered successfully');
      })
      .catch(function(err) {
        console.log('Service Worker registration failed: ', err);
      });
  }