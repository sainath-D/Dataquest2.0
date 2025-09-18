// Donate page functionality with AI forecasting

document.addEventListener('DOMContentLoaded', function() {
    initializeDonationPage();
    animateImpactStats();
    generateDonationPrediction();
    
    if (auth.isAdmin()) {
        showAdminForecastSection();
        loadDonationForecasting();
    }
});

function initializeDonationPage() {
    const donationForm = document.getElementById('donationForm');
    const amountButtons = document.querySelectorAll('.amount-btn');
    const customAmount = document.getElementById('customAmount');

    // Amount selection
    amountButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            amountButtons.forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            customAmount.value = '';
        });
    });

    customAmount.addEventListener('input', () => {
        amountButtons.forEach(btn => btn.classList.remove('selected'));
    });

    // Form submission
    if (donationForm) {
        donationForm.addEventListener('submit', handleDonationSubmission);
    }
}

function animateImpactStats() {
    const impactNumbers = document.querySelectorAll('.impact-number');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = parseInt(entry.target.dataset.target);
                animateCounter(entry.target, target, 2000);
                observer.unobserve(entry.target);
            }
        });
    });
    
    impactNumbers.forEach(stat => {
        observer.observe(stat);
    });
}

function generateDonationPrediction() {
    if (!donationPredictor) return;

    const predictionCard = document.getElementById('donationPrediction');
    if (!predictionCard) return;

    // Mock user data for prediction
    const mockUser = {
        graduationYear: 2018,
        company: 'Google',
        pastDonations: 5000,
        activityLevel: 'high',
        pastEventCount: 8
    };

    const probability = donationPredictor.predictDonationProbability(mockUser);
    const predictedAmount = donationPredictor.predictDonationAmount(mockUser);
    const probabilityLabel = donationPredictor.getProbabilityLabel(probability);

    predictionCard.innerHTML = `
        <div class="prediction-score">${Math.round(probability * 100)}%</div>
        <div class="prediction-label">Donation Likelihood</div>
        <div class="prediction-details">
            <p>Our AI suggests a donation of <strong>${formatCurrency(predictedAmount)}</strong> based on your profile.</p>
            <div class="prediction-factors">
                <div class="factor-item">
                    <span class="factor-icon">🎓</span>
                    <span class="factor-text">Alumni Since 2018</span>
                </div>
                <div class="factor-item">
                    <span class="factor-icon">🏢</span>
                    <span class="factor-text">Tech Industry</span>
                </div>
                <div class="factor-item">
                    <span class="factor-icon">📈</span>
                    <span class="factor-text">High Engagement</span>
                </div>
            </div>
            <button class="use-suggestion-btn" onclick="useSuggestedAmount(${predictedAmount})">
                Use AI Suggestion
            </button>
        </div>
    `;
}

function showAdminForecastSection() {
    const adminSection = document.getElementById('adminForecastSection');
    if (adminSection) {
        adminSection.classList.remove('hidden');
    }
}

function loadDonationForecasting() {
    if (!donationPredictor) return;

    const forecast = donationPredictor.getForecastSummary();
    const forecastSummary = document.getElementById('forecastSummary');
    const donorProspects = document.getElementById('donorProspects');

    // Forecast summary cards
    if (forecastSummary) {
        forecastSummary.innerHTML = `
            <div class="forecast-card">
                <div class="forecast-icon">💰</div>
                <div class="forecast-info">
                    <div class="forecast-number">${formatCurrency(forecast.totalPredicted)}</div>
                    <div class="forecast-label">Predicted Total</div>
                </div>
            </div>
            <div class="forecast-card">
                <div class="forecast-icon">🎯</div>
                <div class="forecast-info">
                    <div class="forecast-number">${forecast.totalProspects}</div>
                    <div class="forecast-label">Total Prospects</div>
                </div>
            </div>
            <div class="forecast-card">
                <div class="forecast-icon">⭐</div>
                <div class="forecast-info">
                    <div class="forecast-number">${forecast.highProbabilityDonors}</div>
                    <div class="forecast-label">High Probability</div>
                </div>
            </div>
            <div class="forecast-card">
                <div class="forecast-icon">📊</div>
                <div class="forecast-info">
                    <div class="forecast-number">${formatCurrency(forecast.averageDonation)}</div>
                    <div class="forecast-label">Average Predicted</div>
                </div>
            </div>
        `;
    }

    // Top donor prospects
    if (donorProspects) {
        const prospects = donationPredictor.getDonationProspects(10);
        
        donorProspects.innerHTML = prospects.map(prospect => `
            <div class="prospect-item">
                <div class="prospect-info">
                    <div class="prospect-name">${prospect.name}</div>
                    <div class="prospect-company">${prospect.company}</div>
                    <div class="prospect-year">Class of ${prospect.graduationYear}</div>
                </div>
                <div class="prospect-prediction">
                    <div class="prospect-probability ${prospect.probabilityLabel}">
                        ${Math.round(prospect.donationProbability * 100)}%
                    </div>
                    <div class="prospect-amount">${formatCurrency(prospect.predictedAmount)}</div>
                </div>
                <div class="prospect-actions">
                    <button class="contact-btn" onclick="contactProspect(${prospect.id})">
                        Contact
                    </button>
                </div>
            </div>
        `).join('');
    }
}

function useSuggestedAmount(amount) {
    const customAmount = document.getElementById('customAmount');
    const amountButtons = document.querySelectorAll('.amount-btn');
    
    // Clear existing selections
    amountButtons.forEach(btn => btn.classList.remove('selected'));
    
    // Set custom amount
    customAmount.value = amount;
    customAmount.focus();
    
    showNotification('AI suggested amount applied!', 'success');
}

function handleDonationSubmission(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const selectedAmount = document.querySelector('.amount-btn.selected');
    const customAmount = document.getElementById('customAmount');
    
    let amount = 0;
    if (selectedAmount) {
        amount = parseInt(selectedAmount.dataset.amount);
    } else if (customAmount.value) {
        amount = parseInt(customAmount.value);
    }
    
    if (amount < 100) {
        showNotification('Minimum donation amount is ₹100', 'error');
        return;
    }
    
    const donorName = document.getElementById('donorName').value;
    const donorEmail = document.getElementById('donorEmail').value;
    const purpose = document.getElementById('purpose').value;
    const anonymous = document.getElementById('anonymous').checked;
    
    if (!donorName || !donorEmail || !purpose) {
        showNotification('Please fill in all required fields', 'error');
        return;
    }
    
    // Simulate donation processing
    processDonation({
        amount,
        donorName: anonymous ? 'Anonymous' : donorName,
        donorEmail,
        purpose,
        anonymous
    });
}

function processDonation(donationData) {
    const submitBtn = document.querySelector('.donate-btn');
    const btnText = submitBtn.querySelector('.btn-text');
    const btnIcon = submitBtn.querySelector('.btn-icon');
    
    // Show processing state
    btnText.textContent = 'Processing...';
    btnIcon.textContent = '⏳';
    submitBtn.disabled = true;
    
    // Simulate API call
    setTimeout(() => {
        // Save donation to localStorage
        const donations = JSON.parse(localStorage.getItem('donations') || '[]');
        donations.push({
            ...donationData,
            id: Date.now(),
            date: new Date().toISOString(),
            status: 'completed'
        });
        localStorage.setItem('donations', JSON.stringify(donations));
        
        // Reset form
        document.getElementById('donationForm').reset();
        document.querySelectorAll('.amount-btn').forEach(btn => btn.classList.remove('selected'));
        
        // Show success
        btnText.textContent = 'Donate Now';
        btnIcon.textContent = '💝';
        submitBtn.disabled = false;
        
        showSuccessModal(donationData);
    }, 2000);
}

function showSuccessModal(donationData) {
    const successModal = document.getElementById('successModal');
    const successContent = successModal.querySelector('.success-content');
    
    successContent.innerHTML = `
        <div class="success-icon">🎉</div>
        <h2>Thank You${donationData.anonymous ? '' : ', ' + donationData.donorName}!</h2>
        <div class="donation-summary">
            <p>Your donation of <strong>${formatCurrency(donationData.amount)}</strong> for <strong>${donationData.purpose}</strong> has been processed successfully.</p>
            <div class="donation-impact">
                <h4>Your Impact:</h4>
                <p>${getDonationImpactMessage(donationData.purpose, donationData.amount)}</p>
            </div>
        </div>
        <p>You'll receive a confirmation email shortly with tax receipt details.</p>
        <button class="btn-primary" onclick="closeModal('successModal')">Close</button>
    `;
    
    openModal('successModal');
}

function getDonationImpactMessage(purpose, amount) {
    const impacts = {
        'infrastructure': `Your contribution will help improve campus facilities and learning environments.`,
        'scholarships': `This donation can provide scholarship support for ${Math.floor(amount / 5000)} students.`,
        'research': `Your support will fund ${Math.floor(amount / 10000)} months of research activities.`,
        'technology': `This will help upgrade technology infrastructure for ${Math.floor(amount / 2000)} students.`,
        'general': `Your donation will support various initiatives across the university.`
    };
    
    return impacts[purpose] || impacts.general;
}

function contactProspect(prospectId) {
    const prospect = alumniData.find(a => a.id === prospectId);
    if (prospect) {
        showNotification(`Contacting ${prospect.name} for donation opportunity`, 'info');
        // In a real application, this would open an email template or contact form
    }
}