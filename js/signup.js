import { auth } from './firebase-config.js';
import { 
    createUserWithEmailAndPassword, 
    signInWithPopup, 
    GoogleAuthProvider,
    updateProfile,
    onAuthStateChanged 
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';

const googleProvider = new GoogleAuthProvider();

// Check if already logged in
onAuthStateChanged(auth, (user) => {
    if (user) {
        window.location.href = 'topics.html';
    }
});

// Email/Password Signup
const emailSignupForm = document.getElementById('email-signup-form');
const nameInput = document.getElementById('signup-name');
const emailInput = document.getElementById('signup-email');
const passwordInput = document.getElementById('signup-password');
const confirmPasswordInput = document.getElementById('confirm-password');
const signupBtn = document.getElementById('signup-btn');
const signupText = document.getElementById('signup-text');
const signupSpinner = document.getElementById('signup-spinner');

emailSignupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;
    
    // Clear previous errors
    clearErrors();
    
    // Validation
    if (name.length < 3) {
        showFieldError('name-error', 'Name must be at least 3 characters');
        return;
    }
    
    if (password.length < 6) {
        showFieldError('password-error', 'Password must be at least 6 characters');
        return;
    }
    
    if (password !== confirmPassword) {
        showFieldError('confirm-error', 'Passwords do not match');
        return;
    }
    
    // Show loading
    signupBtn.disabled = true;
    signupText.style.display = 'none';
    signupSpinner.style.display = 'inline-block';
    
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, {
            displayName: name
        });
        // Redirect handled by onAuthStateChanged
    } catch (error) {
        console.error('Signup error:', error);
        showError(error.code);
        signupBtn.disabled = false;
        signupText.style.display = 'inline';
        signupSpinner.style.display = 'none';
    }
});

// Google Sign Up
const googleSignupBtn = document.getElementById('google-signup');
googleSignupBtn.addEventListener('click', async () => {
    const spinner = googleSignupBtn.querySelector('.loading-spinner');
    const span = googleSignupBtn.querySelector('span:first-of-type');
    
    googleSignupBtn.disabled = true;
    span.style.display = 'none';
    spinner.style.display = 'inline-block';
    
    try {
        await signInWithPopup(auth, googleProvider);
        // Redirect handled by onAuthStateChanged
    } catch (error) {
        console.error('Google signup error:', error);
        showError(error.code);
        googleSignupBtn.disabled = false;
        span.style.display = 'inline';
        spinner.style.display = 'none';
    }
});

// Real-time password validation
passwordInput.addEventListener('input', () => {
    const password = passwordInput.value;
    const errorEl = document.getElementById('password-error');
    
    if (password.length > 0 && password.length < 6) {
        errorEl.textContent = 'Password must be at least 6 characters';
    } else {
        errorEl.textContent = '';
    }
});

// Real-time confirm password validation
confirmPasswordInput.addEventListener('input', () => {
    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;
    const errorEl = document.getElementById('confirm-error');
    
    if (confirmPassword.length > 0 && password !== confirmPassword) {
        errorEl.textContent = 'Passwords do not match';
    } else {
        errorEl.textContent = '';
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

function showFieldError(fieldId, message) {
    const errorEl = document.getElementById(fieldId);
    errorEl.textContent = message;
}

function clearErrors() {
    document.getElementById('name-error').textContent = '';
    document.getElementById('email-error').textContent = '';
    document.getElementById('password-error').textContent = '';
    document.getElementById('confirm-error').textContent = '';
    const authStatus = document.getElementById('auth-status');
    authStatus.style.display = 'none';
}

function getErrorMessage(code) {
    switch (code) {
        case 'auth/email-already-in-use':
            return 'Email already registered. Try logging in instead.';
        case 'auth/invalid-email':
            return 'Invalid email address format.';
        case 'auth/weak-password':
            return 'Password is too weak. Use at least 6 characters.';
        case 'auth/network-request-failed':
            return 'Network error. Check your internet connection.';
        case 'auth/popup-closed-by-user':
            return 'Sign up popup was closed. Please try again.';
        case 'auth/cancelled-popup-request':
            return 'Only one popup request is allowed at a time.';
        default:
            return 'Signup failed. Please try again.';
    }
}
