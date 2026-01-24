// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBv7sht1z_C674KFtkWJVcFZrNSIVDglmY",
    authDomain: "personal-dashboard-9b27f.firebaseapp.com",
    projectId: "personal-dashboard-9b27f",
    storageBucket: "personal-dashboard-9b27f.firebasestorage.app",
    messagingSenderId: "847796579655",
    appId: "1:847796579655:web:05005711f491f435c47062"
};

// Initialize Firebase
let app;
let db;
let auth;
let storage;

try {
    // Import Firebase modules
    const { initializeApp } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js');
    const { getFirestore } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
    const { getAuth } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js');
    const { getStorage } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js');
    
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    auth = getAuth(app);
    storage = getStorage(app);
    
    console.log('Firebase initialized successfully');
} catch (error) {
    console.error('Firebase initialization error:', error);
    // Fallback to localStorage if Firebase fails to initialize
    console.warn('Using local fallback for data storage');
    db = null;
    auth = null;
    storage = null;
}

// Export Firebase instances
export { app, db, auth, storage, firebaseConfig };