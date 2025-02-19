var mainApp = {};
(function() {
    var mainContainer = document.getElementById("main_container");

    // Enable local persistence
    firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL)
        .then(() => {
            console.log("Persistence set to LOCAL");
        })
        .catch((error) => {
            console.error("Error setting persistence:", error);
        });

    // Logout function that syncs across all tabs
    var logout = function() {
        firebase.auth().signOut().then(function() {
            localStorage.setItem("logout", Date.now()); // Sync logout across tabs
            window.location.replace("GoogleAuthlogin.html");
        });
    };

    // Firebase Authentication State Listener
    var init = function() {
        firebase.auth().onAuthStateChanged(function(user) {
            if (user) {
                console.log("User is logged in");
                mainContainer.style.display = "";
                inactivityTime.reset(); // Start the inactivity timer
                inactivityTime.setup(); // Set up event listeners for activity tracking
                sessionStorage.setItem("sessionActive", "true"); // Track session for reopening
            } else {
                mainContainer.style.display = "none";
                sessionStorage.removeItem("sessionActive"); // Remove session tracking
                window.location.replace("GoogleAuthlogin.html");
            }
        });
    };

    // Inactivity Timer Function
    var inactivityTime = function() {
        var timer;
        var warningTimer;

        function resetTimer() {
            clearTimeout(timer);
            clearTimeout(warningTimer);
            timer = setTimeout(showWarning, 7000); // 70 seconds inactivity warning
        }

        function showWarning() {
            var countdown = 30;
            Swal.fire({
                title: 'Inactivity Warning',
                html: `You will be logged out in <strong>${countdown}</strong> seconds due to inactivity.`,
                icon: 'warning',
                timer: 30000,
                showCancelButton: true,
                confirmButtonText: 'Stay Logged In',
                cancelButtonText: 'Log Out Now',
                timerProgressBar: true,
                willClose: () => {
                    clearTimeout(warningTimer);
                }
            }).then((result) => {
                if (result.isConfirmed) {
                    resetTimer();
                } else {
                    logout();
                }
            });

            // Countdown timer inside SweetAlert
            var interval = setInterval(() => {
                countdown--;
                if (countdown >= 0) {
                    Swal.getHtmlContainer().querySelector('strong').textContent = countdown;
                } else {
                    clearInterval(interval);
                }
            }, 1000);

            warningTimer = setTimeout(logout, 30000); // Auto logout after 30 seconds
        }

        // Setup event listeners for detecting user activity
        function setupInactivityListener() {
            window.addEventListener('mousemove', resetTimer);
            window.addEventListener('keydown', resetTimer);
            window.addEventListener('scroll', resetTimer);
            window.addEventListener('touchstart', resetTimer);
            window.addEventListener('click', resetTimer);
        }

        return {
            reset: resetTimer,
            setup: setupInactivityListener
        };
    }();

    // Detect logout in other tabs
    window.addEventListener("storage", (event) => {
        if (event.key === "logout") {
            window.location.replace("GoogleAuthlogin.html");
        }
    });

    // Auto reopen pages if session was active
    window.addEventListener("load", () => {
        if (sessionStorage.getItem("sessionActive")) {
            window.open("index.html", "_self");
        }
    });

    init();
    mainApp.logout = logout;
})();
