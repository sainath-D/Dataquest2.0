// Feedback page functionality with sentiment analysis

document.addEventListener('DOMContentLoaded', function() {
    initializeFeedbackPage();
    loadSentimentDashboard();
    loadRecentFeedback();
});

let sentimentChart;

function initializeFeedbackPage() {
    const feedbackForm = document.getElementById('feedbackForm');
    const feedbackText = document.getElementById('feedbackText');
    const charCount = document.getElementById('charCount');

    // Character counter
    if (feedbackText && charCount) {
        feedbackText.addEventListener('input', (e) => {
            const count = e.target.value.length;
            charCount.textContent = count;
            
            if (count > 1000) {
                charCount.style.color = 'var(--error-red)';
                e.target.value = e.target.value.substring(0, 1000);
                charCount.textContent = 1000;
            } else {
                charCount.style.color = 'inherit';
            }
            
            // Real-time sentiment analysis
            if (count > 10) {
                performRealtimeSentimentAnalysis(e.target.value);
            } else {
                hideSentimentPreview();
            }
        });
    }

    // Form submission
    if (feedbackForm) {
        feedbackForm.addEventListener('submit', handleFeedbackSubmission);
    }
}

function performRealtimeSentimentAnalysis(text) {
    if (!sentimentAnalyzer) return;

    const analysis = sentimentAnalyzer.analyzeFeedback(text);
    showSentimentPreview(analysis);
}

function showSentimentPreview(analysis) {
    const sentimentPreview = document.getElementById('sentimentPreview');
    const sentimentBadge = document.getElementById('sentimentBadge');
    const confidenceScore = document.getElementById('confidenceScore');

    if (!sentimentPreview) return;

    sentimentPreview.classList.remove('hidden');
    sentimentBadge.textContent = analysis.sentiment.charAt(0).toUpperCase() + analysis.sentiment.slice(1);
    sentimentBadge.className = `sentiment-badge ${analysis.sentiment}`;
    confidenceScore.textContent = `${Math.round(analysis.confidence * 100)}%`;
}

function hideSentimentPreview() {
    const sentimentPreview = document.getElementById('sentimentPreview');
    if (sentimentPreview) {
        sentimentPreview.classList.add('hidden');
    }
}

function handleFeedbackSubmission(e) {
    e.preventDefault();
    
    const feedbackText = document.getElementById('feedbackText').value.trim();
    const category = document.getElementById('feedbackCategory').value;
    const authorName = document.getElementById('authorName').value.trim() || 'Anonymous';
    
    if (!feedbackText || !category) {
        showNotification('Please fill in all required fields', 'error');
        return;
    }
    
    if (feedbackText.length < 10) {
        showNotification('Feedback must be at least 10 characters long', 'error');
        return;
    }
    
    // Process feedback with AI
    const submitBtn = document.querySelector('.submit-btn');
    const btnText = submitBtn.querySelector('.btn-text');
    
    btnText.textContent = 'Analyzing...';
    submitBtn.disabled = true;
    
    setTimeout(() => {
        const analysis = submitFeedback(feedbackText, category, authorName);
        
        // Reset form
        e.target.reset();
        document.getElementById('charCount').textContent = '0';
        hideSentimentPreview();
        
        // Show success
        btnText.textContent = 'Submit Feedback';
        submitBtn.disabled = false;
        
        showThankYouModal(analysis);
        
        // Refresh dashboard
        loadSentimentDashboard();
        loadRecentFeedback();
    }, 1500);
}

function submitFeedback(text, category, author) {
    if (!sentimentAnalyzer) {
        console.error('Sentiment analyzer not initialized');
        return { sentiment: 'neutral', score: 0 };
    }
    
    // Add feedback to analyzer
    const feedback = sentimentAnalyzer.addFeedback(text, author);
    feedback.category = category;
    
    // Save to localStorage
    const allFeedback = JSON.parse(localStorage.getItem('platformFeedback') || '[]');
    allFeedback.unshift(feedback);
    localStorage.setItem('platformFeedback', JSON.stringify(allFeedback.slice(0, 100))); // Keep last 100
    
    return feedback;
}

function showThankYouModal(analysis) {
    const modalContent = document.getElementById('feedbackAnalysis');
    
    modalContent.innerHTML = `
        <div class="analysis-result">
            <div class="sentiment-result-large">
                <div class="sentiment-icon">${getSentimentEmoji(analysis.sentiment)}</div>
                <div class="sentiment-info">
                    <div class="sentiment-label">${analysis.sentiment.charAt(0).toUpperCase() + analysis.sentiment.slice(1)} Sentiment</div>
                    <div class="confidence-score">Confidence: ${Math.round(Math.abs(analysis.score) * 100)}%</div>
                </div>
            </div>
            <div class="analysis-insights">
                <h5>AI Insights:</h5>
                <p>${getSentimentInsight(analysis)}</p>
            </div>
        </div>
    `;
    
    openModal('thankYouModal');
}

function getSentimentEmoji(sentiment) {
    const emojis = {
        'positive': '😊',
        'neutral': '😐',
        'negative': '😞'
    };
    return emojis[sentiment] || '😐';
}

function getSentimentInsight(analysis) {
    if (analysis.sentiment === 'positive') {
        return "Great to hear positive feedback! Your insights help us understand what's working well.";
    } else if (analysis.sentiment === 'negative') {
        return "Thank you for the constructive feedback. We'll use this to improve the platform experience.";
    } else {
        return "Thanks for sharing your thoughts. Neutral feedback often provides valuable balanced perspectives.";
    }
}

function loadSentimentDashboard() {
    if (!sentimentAnalyzer) return;
    
    const distribution = sentimentAnalyzer.getSentimentDistribution();
    
    // Update counters
    document.getElementById('positiveCount').textContent = distribution.counts.positive;
    document.getElementById('neutralCount').textContent = distribution.counts.neutral;
    document.getElementById('negativeCount').textContent = distribution.counts.negative;
    
    // Create/update chart
    createSentimentChart(distribution.percentages);
}

function createSentimentChart(percentages) {
    const ctx = document.getElementById('sentimentChart');
    if (!ctx) return;
    
    // Destroy existing chart
    if (sentimentChart) {
        sentimentChart.destroy();
    }
    
    sentimentChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Positive', 'Neutral', 'Negative'],
            datasets: [{
                data: [percentages.positive, percentages.neutral, percentages.negative],
                backgroundColor: [
                    'var(--success-green)',
                    'var(--gray-400)',
                    'var(--error-red)'
                ],
                borderWidth: 2,
                borderColor: 'var(--white)'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return context.label + ': ' + context.parsed + '%';
                        }
                    }
                }
            },
            cutout: '60%'
        }
    });
}

function loadRecentFeedback() {
    const recentFeedbackList = document.getElementById('recentFeedbackList');
    if (!recentFeedbackList) return;
    
    // Load from localStorage and sentiment analyzer
    let allFeedback = [];
    
    if (sentimentAnalyzer) {
        allFeedback = sentimentAnalyzer.getRecentFeedback(10);
    }
    
    // Also load any additional feedback from localStorage
    const localFeedback = JSON.parse(localStorage.getItem('platformFeedback') || '[]');
    allFeedback = [...allFeedback, ...localFeedback].slice(0, 10);
    
    if (allFeedback.length === 0) {
        recentFeedbackList.innerHTML = `
            <div class="no-feedback">
                <p>No feedback yet. Be the first to share your thoughts!</p>
            </div>
        `;
        return;
    }
    
    const feedbackItems = allFeedback.map(feedback => `
        <div class="feedback-item">
            <div class="feedback-header">
                <div class="feedback-author">${feedback.author || 'Anonymous'}</div>
                <div class="feedback-sentiment ${feedback.sentiment}">
                    ${getSentimentEmoji(feedback.sentiment)} ${feedback.sentiment}
                </div>
                <div class="feedback-date">${timeAgo(feedback.date)}</div>
            </div>
            <div class="feedback-text">${feedback.text}</div>
            <div class="feedback-category">
                <span class="category-tag">${feedback.category || 'General'}</span>
            </div>
        </div>
    `).join('');
    
    recentFeedbackList.innerHTML = feedbackItems;
}