// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDummyKeyForTesting",
    authDomain: "dummy-project.firebaseapp.com",
    projectId: "dummy-project-id",
    storageBucket: "dummy-project.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:dummyappid"
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