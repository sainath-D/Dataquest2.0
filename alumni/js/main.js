// Main JavaScript file for Alumni Platform

// Initialize all ML engines when data is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize ML engines
    if (typeof initializeMLEngines === 'function') {
        initializeMLEngines();
    }
    
    // Initialize mobile menu
    initializeMobileMenu();
    
    // Initialize animated stats on home page
    if (window.location.pathname.includes('index.html') || window.location.pathname === '/') {
        initializeAnimatedStats();
    }
    
    // Initialize AI info toggles
    initializeAIInfoToggles();
    
    // Initialize voice search if available
    initializeVoiceSearch();
});

// Mobile menu functionality
function initializeMobileMenu() {
    const mobileToggle = document.querySelector('.mobile-menu-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (mobileToggle && navMenu) {
        mobileToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            mobileToggle.classList.toggle('active');
        });
    }
}

// Animated stats for home page
function initializeAnimatedStats() {
    const statNumbers = document.querySelectorAll('.stat-number');
    
    // Intersection Observer for triggering animation
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = parseInt(entry.target.dataset.target);
                animateCounter(entry.target, target);
                observer.unobserve(entry.target);
            }
        });
    });
    
    statNumbers.forEach(stat => {
        observer.observe(stat);
    });
}

// AI info toggles
function initializeAIInfoToggles() {
    const toggles = document.querySelectorAll('.ai-info-toggle');
    
    toggles.forEach(toggle => {
        toggle.addEventListener('click', () => {
            const content = toggle.nextElementSibling;
            if (content && content.classList.contains('ai-info-content')) {
                content.classList.toggle('hidden');
                toggle.textContent = content.classList.contains('hidden') 
                    ? '🤖 How AI Works' 
                    : '🤖 Hide AI Info';
            }
        });
    });
}

// Voice search functionality
function initializeVoiceSearch() {
    const voiceBtn = document.getElementById('voiceSearchBtn');
    
    if (!voiceBtn) return;
    
    // Check for Web Speech API support
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        voiceBtn.style.display = 'none';
        return;
    }
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';
    
    voiceBtn.addEventListener('click', () => {
        voiceBtn.classList.add('listening');
        voiceBtn.textContent = '🔴';
        recognition.start();
    });
    
    recognition.addEventListener('result', (event) => {
        const transcript = event.results[0][0].transcript;
        const searchInput = document.getElementById('searchInput');
        
        if (searchInput) {
            searchInput.value = transcript;
            // Trigger search
            const searchBtn = document.getElementById('searchBtn');
            if (searchBtn) searchBtn.click();
        }
    });
    
    recognition.addEventListener('end', () => {
        voiceBtn.classList.remove('listening');
        voiceBtn.textContent = '🎤';
    });
    
    recognition.addEventListener('error', () => {
        voiceBtn.classList.remove('listening');
        voiceBtn.textContent = '🎤';
        showNotification('Voice search failed. Please try again.', 'error');
    });
}

// Global functions for modals
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('hidden');
        document.body.classList.add('modal-open');
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('hidden');
        document.body.classList.remove('modal-open');
    }
}

// Close modals when clicking outside
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
        e.target.classList.add('hidden');
        document.body.classList.remove('modal-open');
    }
    
    if (e.target.classList.contains('modal-close')) {
        const modal = e.target.closest('.modal');
        if (modal) {
            modal.classList.add('hidden');
            document.body.classList.remove('modal-open');
        }
    }
});

// Global search functionality for pages that need it
window.performSearch = function(query, filters = {}) {
    if (!semanticSearchEngine) {
        console.error('Search engine not initialized');
        return [];
    }
    
    const results = semanticSearchEngine.search(query);
    
    // Apply filters if provided
    let filteredResults = results;
    
    if (filters.department) {
        filteredResults = filteredResults.filter(alumni => 
            alumni.department === filters.department
        );
    }
    
    if (filters.location) {
        filteredResults = filteredResults.filter(alumni => 
            alumni.location === filters.location
        );
    }
    
    return filteredResults;
};

// Reset demo data function
window.resetDemo = function() {
    if (confirm('This will reset all demo data. Are you sure?')) {
        localStorage.clear();
        location.reload();
        showNotification('Demo data reset successfully!', 'success');
    }
};

// Export functionality for admin
window.exportData = function(dataType) {
    if (!auth.isAdmin()) {
        showNotification('Admin access required', 'error');
        return;
    }
    
    let data, filename;
    
    switch (dataType) {
        case 'alumni':
            data = alumniData;
            filename = 'alumni_data.csv';
            break;
        case 'events':
            data = eventsData;
            filename = 'events_data.csv';
            break;
        case 'jobs':
            data = jobsData;
            filename = 'jobs_data.csv';
            break;
        default:
            showNotification('Invalid data type', 'error');
            return;
    }
    
    exportToCSV(data, filename);
    showNotification(`${dataType} data exported successfully!`, 'success');
};