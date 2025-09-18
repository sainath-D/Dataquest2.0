// Profile Page Functionality for Alumni Platform

document.addEventListener('DOMContentLoaded', function() {
    if (window.location.pathname.includes('profile.html')) {
        initializeProfilePage();
    }
});

function initializeProfilePage() {
    console.log('👤 Initializing profile page');
    
    // Initialize profile components
    initializeAvatarUpload();
    initializeProfileCompletion();
    initializePrivacyToggles();
    setupFormHandlers();
    updateAvatarInitials();
    
    console.log('✅ Profile page initialized');
}

function initializeAvatarUpload() {
    const avatarUpload = document.getElementById('avatarUpload');
    if (avatarUpload) {
        avatarUpload.addEventListener('change', function(event) {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    const avatarCircle = document.querySelector('.avatar-circle');
                    if (avatarCircle) {
                        avatarCircle.style.backgroundImage = `url(${e.target.result})`;
                        avatarCircle.style.backgroundSize = 'cover';
                        avatarCircle.style.backgroundPosition = 'center';
                        
                        // Hide initials when photo is uploaded
                        const initials = document.getElementById('avatarInitials');
                        if (initials) {
                            initials.style.display = 'none';
                        }
                    }
                };
                reader.readAsDataURL(file);
                
                showToast('Profile photo updated!', 'success');
            }
        });
    }
}

function updateAvatarInitials() {
    const nameField = document.getElementById('fullName');
    const initialsElement = document.getElementById('avatarInitials');
    
    if (nameField && initialsElement) {
        const updateInitials = () => {
            const name = nameField.value.trim();
            if (name) {
                const names = name.split(' ');
                let initials = names[0].charAt(0).toUpperCase();
                if (names.length > 1) {
                    initials += names[names.length - 1].charAt(0).toUpperCase();
                }
                initialsElement.textContent = initials;
            }
        };
        
        // Update initials on page load and when name changes
        updateInitials();
        nameField.addEventListener('input', updateInitials);
    }
}

function initializeProfileCompletion() {
    updateProfileCompletion();
    
    // Monitor form changes for real-time completion updates
    const form = document.getElementById('profileForm');
    if (form) {
        const inputs = form.querySelectorAll('input, select');
        inputs.forEach(input => {
            input.addEventListener('change', updateProfileCompletion);
            input.addEventListener('input', debounce(updateProfileCompletion, 300));
        });
    }
}

function updateProfileCompletion() {
    const form = document.getElementById('profileForm');
    if (!form) return;
    
    // Calculate completion based on filled fields
    let totalFields = 0;
    let filledFields = 0;
    
    // Basic info fields
    const basicFields = ['fullName', 'location', 'linkedIn', 'jobTitle', 'company', 'gradYear', 'department'];
    basicFields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field) {
            totalFields++;
            if (field.value && field.value.trim()) {
                filledFields++;
            }
        }
    });
    
    // Interests
    const interests = document.querySelectorAll('input[name="interests"]:checked');
    totalFields++;
    if (interests.length > 0) {
        filledFields++;
    }
    
    // Calculate percentage
    const percentage = Math.round((filledFields / totalFields) * 100);
    
    // Update UI
    const percentageElement = document.getElementById('completionPercentage');
    const progressElement = document.getElementById('completionProgress');
    
    if (percentageElement && progressElement) {
        percentageElement.textContent = `${percentage}% Complete`;
        progressElement.style.width = `${percentage}%`;
    }
}

function initializePrivacyToggles() {
    const toggles = document.querySelectorAll('.toggle-switch-new input');
    toggles.forEach(toggle => {
        toggle.addEventListener('change', function() {
            const settingName = this.id.replace(/([A-Z])/g, ' $1').toLowerCase();
            const status = this.checked ? 'enabled' : 'disabled';
            
            showToast(`${settingName} ${status}`, 'success');
            
            // Update privacy status text
            const privacyContent = document.querySelector('.privacy-content p');
            if (privacyContent && this.id === 'profileVisibility') {
                privacyContent.textContent = this.checked ? 'Your profile is public' : 'Your profile is private';
            }
        });
    });
}

function setupFormHandlers() {
    const form = document.getElementById('profileForm');
    if (form) {
        form.addEventListener('submit', handleProfileSubmit);
    }
}

function handleProfileSubmit(event) {
    event.preventDefault();
    
    showLoading('Updating profile...');
    
    // Simulate API call
    setTimeout(() => {
        hideLoading();
        showToast('Profile updated successfully!', 'success');
        updateProfileCompletion();
    }, 1500);
}

// Utility Functions
function showToast(message, type = 'info') {
    // Create toast element if it doesn't exist
    let toastContainer = document.getElementById('toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'toast-container';
        toastContainer.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 9999;
        `;
        document.body.appendChild(toastContainer);
    }
    
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.style.cssText = `
        background: ${type === 'success' ? '#10B981' : type === 'error' ? '#EF4444' : '#3B82F6'};
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        margin-bottom: 10px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        transform: translateX(100%);
        transition: transform 0.3s ease;
    `;
    toast.textContent = message;
    
    toastContainer.appendChild(toast);
    
    // Animate in
    setTimeout(() => {
        toast.style.transform = 'translateX(0)';
    }, 10);
    
    // Remove after 3 seconds
    setTimeout(() => {
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }, 3000);
}

function showLoading(message) {
    let overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        overlay.querySelector('p').textContent = message;
        overlay.classList.remove('hidden');
    }
}

function hideLoading() {
    let overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        overlay.classList.add('hidden');
    }
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}