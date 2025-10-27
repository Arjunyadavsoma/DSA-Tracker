import { auth } from './firebase-config.js';
import { signOut } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';

import { 
    signInWithPopup, 
    GoogleAuthProvider,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    onAuthStateChanged
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';

const googleProvider = new GoogleAuthProvider();

// Check authentication state
onAuthStateChanged(auth, (user) => {
    if (user) {
        // User is signed in
        const currentPage = window.location.pathname;
        
        if (currentPage.includes('login.html')) {
            window.location.href = 'dashboard.html';
        }
        
        // Update user info on dashboard
        if (currentPage.includes('dashboard.html')) {
            const userName = document.getElementById('user-name');
            if (userName) {
                userName.textContent = user.displayName || user.email;
            }
        }
    } else {
        // User is signed out
        const currentPage = window.location.pathname;
        if (currentPage.includes('dashboard.html')) {
            window.location.href = 'login.html';
        }
    }
});

// Google Sign In
const googleSignInBtn = document.getElementById('google-signin');
if (googleSignInBtn) {
    googleSignInBtn.addEventListener('click', async () => {
        try {
            const result = await signInWithPopup(auth, googleProvider);
            console.log('User signed in:', result.user);
        } catch (error) {
            console.error('Error signing in:', error.message);
            showAuthStatus('Error: ' + error.message, 'error');
        }
    });
}

// Email/Password Sign In
const emailLoginForm = document.getElementById('email-login-form');
if (emailLoginForm) {
    emailLoginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        try {
            await signInWithEmailAndPassword(auth, email, password);
        } catch (error) {
            console.error('Error signing in:', error.message);
            showAuthStatus('Error: ' + error.message, 'error');
        }
    });
}

// Logout functionality
const logoutBtn = document.getElementById('logout-btn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
        try {
            await signOut(auth);
            // Redirect to landing page
            window.location.href = 'index.html';
        } catch (error) {
            console.error('Error signing out:', error);
            alert('Error signing out. Please try again.');
        }
    });
}


// Show authentication status messages
function showAuthStatus(message, type) {
    const statusDiv = document.getElementById('auth-status');
    if (statusDiv) {
        statusDiv.textContent = message;
        statusDiv.style.color = type === 'error' ? '#ef4444' : '#10b981';
        statusDiv.style.marginBottom = '1rem';
    }
}
