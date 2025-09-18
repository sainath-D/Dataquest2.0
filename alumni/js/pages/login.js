// Login page functionality

document.addEventListener('DOMContentLoaded', function() {
    initializeLoginForm();
    initializePasswordToggle();
});

function initializeLoginForm() {
    const loginForm = document.getElementById('loginForm');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const submitBtn = loginForm.querySelector('button[type="submit"]');
    const btnText = submitBtn.querySelector('.btn-text');
    const btnLoader = submitBtn.querySelector('.btn-loader');

    // Redirect if already logged in
    if (auth.isLoggedIn()) {
        window.location.href = 'dashboard.html';
        return;
    }

    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();

        if (!email || !password) {
            showNotification('Please fill in all fields', 'error');
            return;
        }

        // Show loading state
        btnText.classList.add('hidden');
        btnLoader.classList.remove('hidden');
        submitBtn.disabled = true;

        try {
            const user = await auth.login(email, password);
            showNotification(`Welcome back, ${user.name}!`, 'success');
            
            // Redirect based on user role
            setTimeout(() => {
                if (user.role === 'admin') {
                    window.location.href = 'dashboard.html';
                } else {
                    window.location.href = 'directory.html';
                }
            }, 1000);
            
        } catch (error) {
            showNotification(error.message, 'error');
            
            // Reset form state
            btnText.classList.remove('hidden');
            btnLoader.classList.add('hidden');
            submitBtn.disabled = false;
            passwordInput.value = '';
        }
    });

    // Support contact
    const contactSupport = document.getElementById('contactSupport');
    contactSupport.addEventListener('click', (e) => {
        e.preventDefault();
        showNotification('Contact IT Support at support@university.edu or call 1800-XXX-XXXX', 'info', 5000);
    });
}

function initializePasswordToggle() {
    const passwordInput = document.getElementById('password');
    const passwordToggle = document.querySelector('.password-toggle');
    
    passwordToggle.addEventListener('click', () => {
        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            passwordToggle.textContent = '🙈';
        } else {
            passwordInput.type = 'password';
            passwordToggle.textContent = '👁️';
        }
    });
}