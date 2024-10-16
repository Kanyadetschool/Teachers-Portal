let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
  console.log('beforeinstallprompt event fired');
  // Prevent the mini-infobar from appearing on mobile
  e.preventDefault();
  // Stash the event so it can be triggered later.
  deferredPrompt = e;
});

function isAppInstalled() {
  return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
}

document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    const isInstalled = localStorage.getItem('appInstalled') === 'true' || isAppInstalled();

    Swal.fire({
      title: isInstalled ? 'App Already Installed' : 'Install Our App',
      html: `
        <div id="installButtonContainer" style="${isInstalled ? 'display: none;' : 'display: block;'}">
          <button class="btn" id="installButton">Install App</button>
        </div>
        <div id="thankYouMessage" style="${isInstalled ? 'display: block;' : 'display: none;'}">
          Thank you for installing the app!
        </div>
        <button id="shareButton" style="${isInstalled ? 'display: block;' : 'display: none;'}" class="btn">Share App</button>
      `,
      didOpen: () => {
        console.log('SweetAlert popup opened');
        document.getElementById('installButton').addEventListener('click', () => {
          console.log('Install button clicked');
          if (deferredPrompt) {
            deferredPrompt.prompt();
            deferredPrompt.userChoice.then((choiceResult) => {
              if (choiceResult.outcome === 'accepted') {
                console.log('User accepted the install prompt');
                // Update the title and show thank you message
                Swal.update({
                  title: 'App Installed Successfully',
                });
                document.getElementById('installButtonContainer').style.display = 'none';
                document.getElementById('thankYouMessage').style.display = 'block';
                document.getElementById('shareButton').style.display = 'block';
                localStorage.setItem('appInstalled', 'true'); // Save the installation status
              } else {
                console.log('User dismissed the install prompt');
              }
              deferredPrompt = null;
            });
          } else {
            console.error('Installation prompt is not available.');
          }
        });

        document.getElementById('shareButton').addEventListener('click', () => {
          if (navigator.share) {
            navigator.share({
              title: 'Kanyadet School Official App',
              text: 'Improving Online School Services.🧑‍⚕️!',
              url: window.location.href
            }).then(() => {
              console.log('Shared successfully.');
            }).catch((error) => {
              console.error('Error sharing:', error);
            });
          } else {
            console.error('Sharing not supported.');
          }
        });

        if (isInstalled) {
          document.getElementById('shareButton').style.display = 'block';
        }
      },
      showConfirmButton: false,
    });
  }, 250000);
});