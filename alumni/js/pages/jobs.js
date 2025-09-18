// Jobs page functionality with AI job matching

document.addEventListener('DOMContentLoaded', function() {
    initializeJobsPage();
    loadUserSkills();
    generateJobRecommendations();
});

let userSkills = ['AI', 'Machine Learning', 'Python', 'JavaScript', 'React'];

function initializeJobsPage() {
    const editSkillsBtn = document.getElementById('editSkillsBtn');
    const sortBy = document.getElementById('sortBy');

    if (editSkillsBtn) {
        editSkillsBtn.addEventListener('click', openSkillsEditor);
    }

    if (sortBy) {
        sortBy.addEventListener('change', (e) => {
            sortJobs(e.target.value);
        });
    }
}

function loadUserSkills() {
    // Load skills from localStorage or use default
    const savedSkills = localStorage.getItem('userSkills');
    if (savedSkills) {
        userSkills = JSON.parse(savedSkills);
    }

    displayUserSkills();
}

function displayUserSkills() {
    const skillsContainer = document.getElementById('userSkills');
    if (!skillsContainer) return;

    skillsContainer.innerHTML = userSkills.map(skill => 
        `<span class="skill-tag">${skill}</span>`
    ).join('');
}

function generateJobRecommendations() {
    if (!jobRecommendationEngine) {
        console.error('Job recommendation engine not initialized');
        return;
    }

    const loader = document.getElementById('jobsLoader');
    const grid = document.getElementById('jobsGrid');

    loader.classList.remove('hidden');
    grid.classList.add('hidden');

    // Simulate AI processing
    setTimeout(() => {
        const recommendations = jobRecommendationEngine.getRecommendations(userSkills, 12);
        displayJobRecommendations(recommendations);
        
        loader.classList.add('hidden');
        grid.classList.remove('hidden');
    }, 1200);
}

function displayJobRecommendations(jobs) {
    const jobsGrid = document.getElementById('jobsGrid');
    if (!jobsGrid) return;

    const jobCards = jobs.map(job => `
        <div class="job-card" onclick="showJobDetails(${job.id})">
            <div class="job-header">
                <div class="job-company-logo">
                    <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(job.company)}&size=50&background=0D9488&color=fff" alt="${job.company}">
                </div>
                <div class="job-info">
                    <h3 class="job-title">${job.title}</h3>
                    <div class="job-company">${job.company}</div>
                    <div class="job-location">📍 ${job.location}</div>
                </div>
                <div class="job-match">
                    <div class="match-score">${Math.round(job.matchScore * 100)}%</div>
                    <div class="match-label">Match</div>
                </div>
            </div>
            
            <div class="job-details">
                <div class="job-type">${job.type}</div>
                <div class="job-posted">Posted ${job.posted}</div>
            </div>
            
            <div class="job-description">
                ${job.description}
            </div>
            
            <div class="job-tags">
                ${job.tags.slice(0, 4).map(tag => {
                    const isMatched = job.matchedSkills && job.matchedSkills.some(skill => 
                        skill.toLowerCase().includes(tag.toLowerCase()) || 
                        tag.toLowerCase().includes(skill.toLowerCase())
                    );
                    return `<span class="job-tag ${isMatched ? 'matched' : ''}">${tag}</span>`;
                }).join('')}
                ${job.tags.length > 4 ? `<span class="tag-more">+${job.tags.length - 4}</span>` : ''}
            </div>
            
            ${job.matchedSkills && job.matchedSkills.length > 0 ? 
                `<div class="matched-skills">
                    <strong>Your matching skills:</strong> ${job.matchedSkills.join(', ')}
                </div>` : ''
            }
            
            <div class="job-actions">
                <button class="apply-btn" onclick="event.stopPropagation(); applyToJob(${job.id})">
                    Apply Now
                </button>
                <button class="save-btn" onclick="event.stopPropagation(); saveJob(${job.id})">
                    💾 Save
                </button>
            </div>
        </div>
    `).join('');

    jobsGrid.innerHTML = jobCards;
}

function sortJobs(sortBy) {
    const jobCards = document.querySelectorAll('.job-card');
    const jobsArray = Array.from(jobCards);

    jobsArray.sort((a, b) => {
        if (sortBy === 'match') {
            const matchA = parseInt(a.querySelector('.match-score').textContent);
            const matchB = parseInt(b.querySelector('.match-score').textContent);
            return matchB - matchA;
        } else if (sortBy === 'date') {
            const dateA = a.querySelector('.job-posted').textContent;
            const dateB = b.querySelector('.job-posted').textContent;
            return dateA.localeCompare(dateB);
        } else if (sortBy === 'company') {
            const companyA = a.querySelector('.job-company').textContent;
            const companyB = b.querySelector('.job-company').textContent;
            return companyA.localeCompare(companyB);
        }
        return 0;
    });

    const jobsGrid = document.getElementById('jobsGrid');
    jobsArray.forEach(card => jobsGrid.appendChild(card));
}

function showJobDetails(jobId) {
    const job = jobsData.find(j => j.id === jobId);
    if (!job) return;

    const modalContent = `
        <div class="job-details-modal">
            <div class="job-modal-header">
                <div class="job-modal-company">
                    <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(job.company)}&size=80&background=0D9488&color=fff" alt="${job.company}">
                </div>
                <div class="job-modal-info">
                    <h2>${job.title}</h2>
                    <h3>${job.company}</h3>
                    <div class="job-modal-details">
                        <span>📍 ${job.location}</span>
                        <span>💼 ${job.type}</span>
                        <span>📅 Posted ${job.posted}</span>
                    </div>
                </div>
            </div>
            
            <div class="job-modal-description">
                <h4>Job Description</h4>
                <p>${job.description}</p>
            </div>
            
            <div class="job-modal-requirements">
                <h4>Required Skills</h4>
                <div class="job-modal-tags">
                    ${job.tags.map(tag => `<span class="job-tag">${tag}</span>`).join('')}
                </div>
            </div>
            
            <div class="job-modal-ai">
                <h4>🤖 AI Match Analysis</h4>
                <div class="ai-analysis">
                    <div class="match-score-large">${Math.round((job.matchScore || 0.5) * 100)}%</div>
                    <div class="match-details">
                        <p>This job matches your profile based on skill overlap and career progression patterns.</p>
                        ${job.matchedSkills && job.matchedSkills.length > 0 ? 
                            `<p><strong>Matching skills:</strong> ${job.matchedSkills.join(', ')}</p>` : 
                            `<p><strong>Skill overlap:</strong> ${Math.round((job.matchScore || 0.5) * 100)}% match with your profile</p>`
                        }
                    </div>
                </div>
            </div>
            
            <div class="job-modal-actions">
                <button class="btn-primary" onclick="applyToJob(${job.id})">
                    Apply Now
                </button>
                <button class="btn-secondary" onclick="saveJob(${job.id})">
                    Save Job
                </button>
                <button class="btn-secondary" onclick="shareJob(${job.id})">
                    Share
                </button>
            </div>
        </div>
    `;

    document.getElementById('jobModalContent').innerHTML = modalContent;
    openModal('jobModal');
}

function openSkillsEditor() {
    const skillsModal = document.getElementById('skillsModal');
    const skillsList = document.getElementById('skillsList');
    const skillInput = document.getElementById('skillInput');
    const addSkillBtn = document.getElementById('addSkillBtn');
    const saveSkillsBtn = document.getElementById('saveSkillsBtn');
    const cancelSkillsBtn = document.getElementById('cancelSkillsBtn');

    // Display current skills
    displaySkillsInEditor();

    // Event listeners
    addSkillBtn.onclick = () => {
        const skill = skillInput.value.trim();
        if (skill && !userSkills.includes(skill)) {
            userSkills.push(skill);
            skillInput.value = '';
            displaySkillsInEditor();
        }
    };

    skillInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addSkillBtn.click();
        }
    });

    saveSkillsBtn.onclick = () => {
        localStorage.setItem('userSkills', JSON.stringify(userSkills));
        displayUserSkills();
        generateJobRecommendations();
        closeModal('skillsModal');
        showNotification('Skills updated successfully!', 'success');
    };

    cancelSkillsBtn.onclick = () => {
        closeModal('skillsModal');
    };

    openModal('skillsModal');
}

function displaySkillsInEditor() {
    const skillsList = document.getElementById('skillsList');
    skillsList.innerHTML = userSkills.map(skill => `
        <span class="skill-tag editable">
            ${skill}
            <button class="remove-skill" onclick="removeSkill('${skill}')">&times;</button>
        </span>
    `).join('');
}

function removeSkill(skill) {
    userSkills = userSkills.filter(s => s !== skill);
    displaySkillsInEditor();
}

function applyToJob(jobId) {
    const job = jobsData.find(j => j.id === jobId);
    if (job) {
        showNotification(`Application submitted for ${job.title} at ${job.company}!`, 'success');
        closeModal('jobModal');
    }
}

function saveJob(jobId) {
    const job = jobsData.find(j => j.id === jobId);
    if (job) {
        const savedJobs = JSON.parse(localStorage.getItem('savedJobs') || '[]');
        if (!savedJobs.includes(jobId)) {
            savedJobs.push(jobId);
            localStorage.setItem('savedJobs', JSON.stringify(savedJobs));
            showNotification(`${job.title} saved for later!`, 'success');
        } else {
            showNotification('Job already saved!', 'info');
        }
    }
}

function shareJob(jobId) {
    const job = jobsData.find(j => j.id === jobId);
    if (job && navigator.share) {
        navigator.share({
            title: job.title,
            text: `Check out this job opportunity at ${job.company}`,
            url: window.location.href
        });
    } else {
        showNotification('Job link copied to clipboard!', 'success');
    }
}