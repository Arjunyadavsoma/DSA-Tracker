import { auth } from './firebase-config.js';
import { 
    signInWithEmailAndPassword, 
    signInWithPopup, 
    GoogleAuthProvider,
    sendPasswordResetEmail,
    onAuthStateChanged 
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';

const googleProvider = new GoogleAuthProvider();

// Check if already logged in
onAuthStateChanged(auth, (user) => {
    if (user) {
        window.location.href = 'topics.html';
    }
});

// Email/Password Login
const emailLoginForm = document.getElementById('email-login-form');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const loginBtn = document.getElementById('login-btn');
const loginText = document.getElementById('login-text');
const loginSpinner = document.getElementById('login-spinner');

emailLoginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    
    // Clear previous errors
    clearErrors();
    
    // Show loading
    loginBtn.disabled = true;
    loginText.style.display = 'none';
    loginSpinner.style.display = 'inline-block';
    
    try {
        await signInWithEmailAndPassword(auth, email, password);
        // Redirect handled by onAuthStateChanged
    } catch (error) {
        console.error('Login error:', error);
        showError(error.code);
        loginBtn.disabled = false;
        loginText.style.display = 'inline';
        loginSpinner.style.display = 'none';
    }
});

// Google Sign In
const googleSigninBtn = document.getElementById('google-signin');
googleSigninBtn.addEventListener('click', async () => {
    const spinner = googleSigninBtn.querySelector('.loading-spinner');
    const span = googleSigninBtn.querySelector('span:first-of-type');
    
    googleSigninBtn.disabled = true;
    span.style.display = 'none';
    spinner.style.display = 'inline-block';
    
    try {
        await signInWithPopup(auth, googleProvider);
        // Redirect handled by onAuthStateChanged
    } catch (error) {
        console.error('Google sign in error:', error);
        showError(error.code);
        googleSigninBtn.disabled = false;
        span.style.display = 'inline';
        spinner.style.display = 'none';
    }
});

// Forgot Password Modal
const forgotPasswordLink = document.getElementById('forgot-password-link');
const modal = document.getElementById('forgot-password-modal');
const closeModal = document.querySelector('.close');
const resetPasswordForm = document.getElementById('reset-password-form');
const resetEmailInput = document.getElementById('reset-email');
const resetStatus = document.getElementById('reset-status');

forgotPasswordLink.addEventListener('click', (e) => {
    e.preventDefault();
    modal.style.display = 'block';
    modal.setAttribute('aria-hidden', 'false');
});

closeModal.addEventListener('click', () => {
    modal.style.display = 'none';
    modal.setAttribute('aria-hidden', 'true');
    resetStatus.textContent = '';
    resetPasswordForm.reset();
});

window.addEventListener('click', (e) => {
    if (e.target === modal) {
        modal.style.display = 'none';
        modal.setAttribute('aria-hidden', 'true');
    }
});

resetPasswordForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = resetEmailInput.value.trim();
    const resetText = document.getElementById('reset-text');
    const resetSpinner = document.getElementById('reset-spinner');
    
    resetStatus.textContent = '';
    resetStatus.className = '';
    
    resetText.style.display = 'none';
    resetSpinner.style.display = 'inline-block';
    
    try {
        await sendPasswordResetEmail(auth, email);
        resetStatus.textContent = '✓ Password reset email sent! Check your inbox.';
        resetStatus.className = 'success-message';
        resetPasswordForm.reset();
        
        setTimeout(() => {
            modal.style.display = 'none';
            resetStatus.textContent = '';
        }, 3000);
    } catch (error) {
        console.error('Reset error:', error);
        resetStatus.textContent = getErrorMessage(error.code);
        resetStatus.className = 'error-message';
    } finally {
        resetText.style.display = 'inline';
        resetSpinner.style.display = 'none';
    }
});

// Error Handling
function showError(code) {
    const authStatus = document.getElementById('auth-status');
    authStatus.textContent = getErrorMessage(code);
    authStatus.className = 'error-banner';
    authStatus.style.display = 'block';
    
    setTimeout(() => {
        authStatus.style.display = 'none';
    }, 5000);
}

function clearErrors() {
    document.getElementById('email-error').textContent = '';
    document.getElementById('password-error').textContent = '';
    const authStatus = document.getElementById('auth-status');
    authStatus.style.display = 'none';
}

function getErrorMessage(code) {
    switch (code) {
        case 'auth/user-not-found':
            return 'No account found with this email. Please sign up.';
        case 'auth/wrong-password':
            return 'Incorrect password. Please try again.';
        case 'auth/invalid-email':
            return 'Invalid email address format.';
        case 'auth/user-disabled':
            return 'This account has been disabled.';
        case 'auth/too-many-requests':
            return 'Too many failed attempts. Try again later.';
        case 'auth/network-request-failed':
            return 'Network error. Check your internet connection.';
        case 'auth/popup-closed-by-user':
            return 'Sign in popup was closed. Please try again.';
        case 'auth/cancelled-popup-request':
            return 'Only one popup request is allowed at a time.';
        default:
            return 'Login failed. Please try again.';
    }
}
