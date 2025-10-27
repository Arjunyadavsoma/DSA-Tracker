import { auth } from './firebase-config.js';
import { onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';

class Header {
    constructor() {
        this.currentUser = null;
        this.currentPage = this.getCurrentPage();
        this.init();
    }

    getCurrentPage() {
        const path = window.location.pathname;
        if (path.includes('index.html') || path === '/') return 'home';
        if (path.includes('topics.html')) return 'topics';
        if (path.includes('topic.html')) return 'topic';
        if (path.includes('questions.html')) return 'questions';
        if (path.includes('dashboard.html')) return 'dashboard';
        if (path.includes('login.html')) return 'login';
        if (path.includes('signup.html')) return 'signup';
        return 'home';
    }

    init() {
        this.renderHeader();
        this.setupAuthListener();
    }

    renderHeader() {
        const header = document.querySelector('header');
        if (!header) return;

        header.innerHTML = `
            <nav class="main-nav">
                <div class="nav-container">
                    <!-- Brand Section - Will be updated based on auth -->
                    <a href="index.html" class="nav-brand" id="nav-brand">
                        <svg class="brand-logo" width="32" height="32" viewBox="0 0 32 32">
                            <rect width="32" height="32" rx="8" fill="#4f46e5"/>
                            <path d="M16 8L24 16L16 24L8 16L16 8Z" fill="white"/>
                        </svg>
                        <span class="brand-text">DSA Tracker</span>
                    </a>
                    
                    <!-- Desktop Navigation -->
                    <div class="nav-center">
                        <a href="topics.html" class="nav-link ${this.currentPage === 'topics' || this.currentPage === 'topic' ? 'active' : ''}">
                            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                                <rect x="2" y="2" width="5" height="5" rx="1" stroke="currentColor" stroke-width="1.5"/>
                                <rect x="9" y="2" width="5" height="5" rx="1" stroke="currentColor" stroke-width="1.5"/>
                                <rect x="2" y="9" width="5" height="5" rx="1" stroke="currentColor" stroke-width="1.5"/>
                                <rect x="9" y="9" width="5" height="5" rx="1" stroke="currentColor" stroke-width="1.5"/>
                            </svg>
                            Topics
                        </a>
                        <a href="questions.html" class="nav-link ${this.currentPage === 'questions' ? 'active' : ''}">
                            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                                <path d="M2 3H16M2 9H16M2 15H16" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                            </svg>
                            All Questions
                        </a>
                        <a href="dashboard.html" class="nav-link ${this.currentPage === 'dashboard' ? 'active' : ''}">
                            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                                <rect x="2" y="2" width="5" height="5" rx="1" stroke="currentColor" stroke-width="1.5"/>
                                <rect x="9" y="2" width="5" height="5" rx="1" stroke="currentColor" stroke-width="1.5"/>
                                <rect x="2" y="9" width="12" height="5" rx="1" stroke="currentColor" stroke-width="1.5"/>
                            </svg>
                            Dashboard
                        </a>
                    </div>
                    
                    <!-- Right Section -->
                    <div class="nav-right">
                        <div id="user-section" class="user-section" style="display: none;">
                            <div class="user-avatar">
                                <span id="user-initial">U</span>
                            </div>
                            <span id="user-name" class="user-name">User</span>
                            <button id="logout-btn" class="btn-logout">Logout</button>
                        </div>
                        <div id="guest-section" class="guest-section">
                            <a href="login.html" class="btn-login">Login</a>
                            <a href="signup.html" class="btn-signup">Sign Up</a>
                        </div>
                    </div>
                    
                    <!-- Mobile Menu Button -->
                    <button class="mobile-toggle" id="mobile-toggle">
                        <span></span>
                        <span></span>
                        <span></span>
                    </button>
                </div>
                
                <!-- Mobile Menu -->
                <div class="mobile-menu" id="mobile-menu">
                    <a href="topics.html" class="mobile-link ${this.currentPage === 'topics' || this.currentPage === 'topic' ? 'active' : ''}">Topics</a>
                    <a href="questions.html" class="mobile-link ${this.currentPage === 'questions' ? 'active' : ''}">All Questions</a>
                    <a href="dashboard.html" class="mobile-link ${this.currentPage === 'dashboard' ? 'active' : ''}">Dashboard</a>
                    <div id="mobile-auth" class="mobile-auth"></div>
                </div>
            </nav>
        `;

        this.setupMobileMenu();
    }

    setupAuthListener() {
        onAuthStateChanged(auth, (user) => {
            this.currentUser = user;
            this.updateAuthUI(user);
            this.updateBrandLink(user);
        });
    }

    updateBrandLink(user) {
        const brandLink = document.getElementById('nav-brand');
        if (brandLink) {
            if (user) {
                // Logged in users go to topics
                brandLink.href = 'topics.html';
            } else {
                // Guest users go to home
                brandLink.href = 'index.html';
            }
        }
    }

    updateAuthUI(user) {
        const userSection = document.getElementById('user-section');
        const guestSection = document.getElementById('guest-section');
        const userName = document.getElementById('user-name');
        const userInitial = document.getElementById('user-initial');
        const mobileAuth = document.getElementById('mobile-auth');

        if (user) {
            const displayName = user.displayName || user.email?.split('@')[0] || 'User';
            const initial = displayName.charAt(0).toUpperCase();
            
            userName.textContent = displayName;
            userInitial.textContent = initial;
            
            userSection.style.display = 'flex';
            guestSection.style.display = 'none';
            
            mobileAuth.innerHTML = `
                <div class="mobile-user">
                    <div class="mobile-user-info">
                        <div class="user-avatar-mobile">${initial}</div>
                        <span>${displayName}</span>
                    </div>
                    <button id="mobile-logout" class="btn-logout-mobile">Logout</button>
                </div>
            `;
            
            document.getElementById('logout-btn').onclick = () => this.handleLogout();
            document.getElementById('mobile-logout').onclick = () => this.handleLogout();
        } else {
            userSection.style.display = 'none';
            guestSection.style.display = 'flex';
            
            mobileAuth.innerHTML = `
                <a href="login.html" class="btn-login-mobile">Login</a>
                <a href="signup.html" class="btn-signup-mobile">Sign Up</a>
            `;
        }
    }

    async handleLogout() {
        try {
            await signOut(auth);
            window.location.href = 'index.html';
        } catch (error) {
            console.error('Logout error:', error);
            alert('Error signing out');
        }
    }

    setupMobileMenu() {
        const toggle = document.getElementById('mobile-toggle');
        const menu = document.getElementById('mobile-menu');

        toggle?.addEventListener('click', () => {
            toggle.classList.toggle('active');
            menu.classList.toggle('active');
        });

        document.addEventListener('click', (e) => {
            if (!toggle?.contains(e.target) && !menu?.contains(e.target)) {
                toggle?.classList.remove('active');
                menu?.classList.remove('active');
            }
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new Header();
});

export default Header;
