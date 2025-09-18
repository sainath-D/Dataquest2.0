// Authentication System for Alumni Platform

class AuthSystem {
    constructor() {
        this.currentUser = null;
        this.initAuth();
    }

    initAuth() {
        // Check for saved user session
        const savedUser = localStorage.getItem('currentUser');
        if (savedUser) {
            this.currentUser = JSON.parse(savedUser);
        }
    }

    // Mock authentication - replace with real auth in production
    async login(email, password) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                // Demo credentials
                if (email === 'admin@demo.com' && password === 'demo123') {
                    this.currentUser = {
                        id: 'admin',
                        name: 'Admin User',
                        email: email,
                        role: 'admin',
                        loginTime: new Date().toISOString()
                    };
                    localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
                    resolve(this.currentUser);
                } else if (email === 'user@demo.com' && password === 'demo123') {
                    this.currentUser = {
                        id: 'user1',
                        name: 'Alumni User',
                        email: email,
                        role: 'alumni',
                        loginTime: new Date().toISOString()
                    };
                    localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
                    resolve(this.currentUser);
                } else {
                    reject(new Error('Invalid credentials'));
                }
            }, 1000); // Simulate API delay
        });
    }

    logout() {
        this.currentUser = null;
        localStorage.removeItem('currentUser');
        window.location.href = 'index.html';
    }

    isLoggedIn() {
        return this.currentUser !== null;
    }

    isAdmin() {
        return this.currentUser && this.currentUser.role === 'admin';
    }

    getCurrentUser() {
        return this.currentUser;
    }

    // Check if user can access admin features
    requireAuth() {
        if (!this.isLoggedIn()) {
            window.location.href = 'login.html';
            return false;
        }
        return true;
    }

    requireAdmin() {
        if (!this.isAdmin()) {
            showNotification('Admin access required', 'error');
            return false;
        }
        return true;
    }
}

// Global auth instance
const auth = new AuthSystem();

// Auto-redirect for protected pages
document.addEventListener('DOMContentLoaded', () => {
    const protectedPages = ['dashboard.html', 'profile.html'];
    const adminPages = ['dashboard.html'];
    const currentPage = window.location.pathname.split('/').pop();

    if (protectedPages.includes(currentPage)) {
        if (!auth.requireAuth()) return;
    }

    if (adminPages.includes(currentPage)) {
        if (!auth.requireAdmin()) return;
    }

    // Update UI based on auth state
    updateAuthUI();
});

function updateAuthUI() {
    const loginBtn = document.querySelector('.login-btn');
    const user = auth.getCurrentUser();

    if (user && loginBtn) {
        loginBtn.textContent = user.name;
        loginBtn.href = '#';
        loginBtn.onclick = (e) => {
            e.preventDefault();
            showUserMenu();
        };
    }
}

function showUserMenu() {
    const user = auth.getCurrentUser();
    if (!user) return;

    const menu = document.createElement('div');
    menu.className = 'user-menu';
    menu.innerHTML = `
        <div class="user-info">
            <strong>${user.name}</strong>
            <small>${user.email}</small>
        </div>
        <div class="user-actions">
            <a href="profile.html">Profile</a>
            ${user.role === 'admin' ? '<a href="dashboard.html">Dashboard</a>' : ''}
            <button onclick="auth.logout()">Logout</button>
        </div>
    `;

    // Position menu
    const loginBtn = document.querySelector('.login-btn');
    const rect = loginBtn.getBoundingClientRect();
    menu.style.position = 'fixed';
    menu.style.top = `${rect.bottom + 5}px`;
    menu.style.right = '20px';

    document.body.appendChild(menu);

    // Remove menu when clicking outside
    setTimeout(() => {
        const closeMenu = (e) => {
            if (!menu.contains(e.target)) {
                document.body.removeChild(menu);
                document.removeEventListener('click', closeMenu);
            }
        };
        document.addEventListener('click', closeMenu);
    }, 100);
}