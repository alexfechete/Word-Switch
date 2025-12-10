// WS-firebase.js
// Make sure to include this in every HTML page before your page-specific JS

// Import Firebase functions
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-database.js";

// Your Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDh8YHXxt7XcXcgnhpMDohysv6w9vMUjHI",
    authDomain: "word-switch-806bd.firebaseapp.com",
    projectId: "word-switch-806bd",
    storageBucket: "word-switch-806bd.appspot.com",
    messagingSenderId: "675507969336",
    appId: "1:675507969336:web:b1e5e49c7c0f6fe87675cd",
    measurementId: "G-6T9HQT5H18"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// Make Firebase database accessible globally
window.firebaseApp = app;
window.firebaseDatabase = database;

// Optional: initialize analytics if needed
// import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-analytics.js";
// const analytics = getAnalytics(app);
