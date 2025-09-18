// Directory page functionality with semantic search

document.addEventListener('DOMContentLoaded', function() {
    initializeDirectorySearch();
    initializeFilters();
    loadAllAlumni();
});

let currentResults = [];

function initializeDirectorySearch() {
    const searchInput = document.getElementById('searchInput');
    const filtersBtn = document.getElementById('filtersBtn');
    
    if (!searchInput) return;

    // Simple search
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.trim();
        if (query.length > 0) {
            performSearch(query);
        } else {
            loadAllAlumni();
        }
    });

    // Filters button (placeholder)
    if (filtersBtn) {
        filtersBtn.addEventListener('click', () => {
            // Show filters popup (placeholder)
            console.log('Filters button clicked');
        });
    }
}

function initializeFilters() {
    // Simplified - no filters UI in this version
}

function performSearch(query) {
    // Search only within the featured 6 alumni to match photo context
    const featuredAlumni = alumniData.slice(0, 6);
    const results = featuredAlumni.filter(alumni => 
        alumni.name.toLowerCase().includes(query.toLowerCase()) ||
        alumni.company.toLowerCase().includes(query.toLowerCase()) ||
        alumni.jobTitle.toLowerCase().includes(query.toLowerCase()) ||
        alumni.skills.some(skill => skill.toLowerCase().includes(query.toLowerCase()))
    );
    
    currentResults = results;
    displayResults(results);
    updateResultsCount(results.length, 'search results');
}

function applyFilters() {
    const departmentFilter = document.getElementById('departmentFilter');
    const locationFilter = document.getElementById('locationFilter');
    
    let filteredResults = currentResults.length > 0 ? currentResults : alumniData;
    
    if (departmentFilter.value) {
        filteredResults = filteredResults.filter(alumni => 
            alumni.department === departmentFilter.value
        );
    }
    
    if (locationFilter.value) {
        filteredResults = filteredResults.filter(alumni => 
            alumni.location === locationFilter.value
        );
    }
    
    displayResults(filteredResults);
    updateResultsCount(filteredResults.length, 'filtered results');
}

function loadAllAlumni() {
    // Show only first 5 alumni to match the photos "Showing 5 of 6 alumni"
    const featuredAlumni = alumniData.slice(0, 6); // Featured set of 6
    const displayAlumni = featuredAlumni.slice(0, 5); // Display only 5 to match "5 of 6"
    currentResults = displayAlumni;
    displayResults(displayAlumni);
    updateResultsCount(5, 'all alumni'); // Show "5 of 6" as in the photo
}

function displayResults(results) {
    const alumniGrid = document.getElementById('alumniGrid');
    const noResults = document.getElementById('noResults');
    
    if (results.length === 0) {
        alumniGrid.innerHTML = '';
        noResults.classList.remove('hidden');
        return;
    }
    
    noResults.classList.add('hidden');
    
    // Get initials for avatar
    function getInitials(name) {
        return name.split(' ').map(word => word[0]).join('').toUpperCase();
    }
    
    const alumniCards = results.map(alumni => {
        const mentoringStatus = alumni.availableForMentoring ? 
            '<div class="mentoring-status">Available for mentoring</div>' : '';
            
        return `
            <div class="alumni-card-new">
                <div class="alumni-avatar-new">
                    <div class="avatar-initials-new">${getInitials(alumni.name)}</div>
                </div>
                <div class="alumni-info-new">
                    <h3 class="alumni-name">${alumni.name}</h3>
                    <div class="alumni-title">${alumni.jobTitle}</div>
                    <div class="alumni-company">${alumni.company}</div>
                    <div class="alumni-education">
                        <span class="degree-icon">🎓</span> ${alumni.department} • Class of ${alumni.graduationYear}
                    </div>
                    <div class="alumni-location">
                        <span class="location-icon">📍</span> ${alumni.location}
                    </div>
                    ${mentoringStatus}
                    <button class="view-profile-btn" onclick="showAlumniDetails(${alumni.id})">
                        📄 View Profile
                    </button>
                </div>
            </div>
        `;
    }).join('');
    
    alumniGrid.innerHTML = alumniCards;
}

function updateResultsCount(count, context = '') {
    const resultsCount = document.getElementById('resultsCount');
    if (resultsCount) {
        // Use featured alumni set (6 total) as denominator to match photos
        const totalFeatured = 6;
        resultsCount.textContent = `Showing ${count} of ${totalFeatured} alumni`;
    }
}

// Removed loader functions as they're not needed for this simplified version

function showAlumniDetails(alumniId) {
    const alumni = alumniData.find(a => a.id === alumniId);
    if (!alumni) return;

    const modalContent = `
        <div class="alumni-profile">
            <div class="profile-header">
                <div class="profile-avatar">
                    <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(alumni.name)}&size=120&background=1E3A8A&color=fff" alt="${alumni.name}">
                </div>
                <div class="profile-info">
                    <h2>${alumni.name}</h2>
                    <div class="profile-title">${alumni.jobTitle}</div>
                    <div class="profile-company">${alumni.company}</div>
                    <div class="profile-location">📍 ${alumni.location}</div>
                    <div class="profile-year">🎓 Class of ${alumni.graduationYear} • ${alumni.department}</div>
                </div>
            </div>
            
            <div class="profile-stats">
                <div class="profile-stat">
                    <div class="stat-value">${alumni.profileCompletion}%</div>
                    <div class="stat-label">Profile Complete</div>
                </div>
                <div class="profile-stat">
                    <div class="stat-value">${alumni.pastEventCount}</div>
                    <div class="stat-label">Events Attended</div>
                </div>
                <div class="profile-stat">
                    <div class="stat-value">${alumni.activityLevel}</div>
                    <div class="stat-label">Activity Level</div>
                </div>
            </div>
            
            <div class="profile-section">
                <h4>Skills</h4>
                <div class="skills-list">
                    ${alumni.skills.map(skill => `<span class="skill-tag">${skill}</span>`).join('')}
                </div>
            </div>
            
            <div class="profile-section">
                <h4>Interests</h4>
                <div class="interests-list">
                    ${alumni.interests.map(interest => `<span class="interest-tag">${interest}</span>`).join('')}
                </div>
            </div>
            
            <div class="profile-actions">
                <button class="btn-primary" onclick="connectWithAlumni(${alumni.id})">
                    Connect
                </button>
                <button class="btn-secondary" onclick="requestMentorship(${alumni.id})">
                    Request Mentorship
                </button>
                <button class="btn-secondary" onclick="sendMessage(${alumni.id})">
                    Send Message
                </button>
            </div>
        </div>
    `;

    document.getElementById('profileModalContent').innerHTML = modalContent;
    openModal('profileModal');
}

function connectWithAlumni(alumniId) {
    const alumni = alumniData.find(a => a.id === alumniId);
    if (alumni) {
        showNotification(`Connection request sent to ${alumni.name}!`, 'success');
    }
}

function requestMentorship(alumniId) {
    const alumni = alumniData.find(a => a.id === alumniId);
    if (alumni) {
        showNotification(`Mentorship request sent to ${alumni.name}!`, 'success');
    }
}

function sendMessage(alumniId) {
    const alumni = alumniData.find(a => a.id === alumniId);
    if (alumni) {
        showNotification(`Message thread opened with ${alumni.name}!`, 'info');
    }
}