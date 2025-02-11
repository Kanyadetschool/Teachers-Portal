// Ensure Firebase is initialized
if (!firebase.apps.length) {
    firebase.initializeApp({
        // Add your Firebase config here if not already initialized elsewhere
        // apiKey: "your-api-key",
        // authDomain: "your-auth-domain",
        // databaseURL: "your-database-url",
        // projectId: "your-project-id",
        // storageBucket: "your-storage-bucket",
        // messagingSenderId: "your-messaging-sender-id",
        // appId: "your-app-id"
    });
}

const NotificationService = {
    async send(title, message, type = 'info') {
        try {
            const notificationsRef = firebase.database().ref('notifications');
            const notification = {
                id: Date.now(),
                title,
                message,
                type,
                timestamp: Date.now(),
                read: false,
                sessionId: 'system_' + Date.now()
            };
            
            await notificationsRef.push().set(notification);
            return true;
        } catch (error) {
            console.error('Error sending notification:', error);
            return false;
        }
    },

    // Predefined notification types
    async studentAdded(studentName) {
        return this.send(
            'New Student Registration',
            `${studentName} has been registered successfully`,
            'success'
        );
    },

    async studentTransferred(studentName) {
        return this.send(
            'Student Transfer',
            `${studentName} has been transferred`,
            'info'
        );
    },

    async examUploaded(examName) {
        return this.send(
            'Exam Results Updated',
            `${examName} results have been uploaded`,
            'info'
        );
    },

    async feePayment(studentName, amount) {
        return this.send(
            'Fee Payment Received',
            `${studentName} paid KES ${amount}`,
            'success'
        );
    }
};
