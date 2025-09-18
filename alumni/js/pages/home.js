// Home page specific functionality

document.addEventListener('DOMContentLoaded', function() {
    // Initialize AI models showcase
    initializeAIModelsShowcase();
    
    // Initialize feature cards animations
    initializeFeatureCards();
});

function initializeAIModelsShowcase() {
    const models = document.querySelectorAll('.ai-model');
    
    models.forEach((model, index) => {
        // Add hover effects and click interactions
        model.addEventListener('click', () => {
            showAIModelDetails(index + 1);
        });
    });
}

function showAIModelDetails(modelNumber) {
    const modelDetails = {
        1: {
            title: 'Semantic Search Engine',
            algorithm: 'TF-IDF + Cosine Similarity',
            description: 'Advanced natural language processing that understands context and intent in search queries.',
            accuracy: '94%',
            features: ['Natural language queries', 'Context understanding', 'Relevance scoring', 'Match explanations']
        },
        2: {
            title: 'Job Matching System',
            algorithm: 'Jaccard Similarity',
            description: 'Intelligent job recommendations based on skills, experience, and career preferences.',
            accuracy: '89%',
            features: ['Skill matching', 'Experience analysis', 'Career progression', 'Industry trends']
        },
        3: {
            title: 'Event Prediction Model',
            algorithm: 'Multi-factor Classifier',
            description: 'Predicts event attendance based on alumni engagement patterns and preferences.',
            accuracy: '92%',
            features: ['Attendance prediction', 'Interest alignment', 'Historical patterns', 'Engagement scoring']
        },
        4: {
            title: 'Donation Forecasting',
            algorithm: 'Weighted Scoring System',
            description: 'AI-powered donation likelihood and amount prediction for fundraising optimization.',
            accuracy: '87%',
            features: ['Donation probability', 'Amount prediction', 'Prospect ranking', 'Timing optimization']
        },
        5: {
            title: 'Sentiment Analysis',
            algorithm: 'NLP Keyword Classification',
            description: 'Real-time sentiment analysis of feedback and communications.',
            accuracy: '91%',
            features: ['Emotion detection', 'Trend analysis', 'Real-time processing', 'Confidence scoring']
        },
        6: {
            title: 'Analytics Dashboard',
            algorithm: 'Comprehensive ML Insights',
            description: 'Integrated analytics combining all AI models for actionable insights.',
            accuracy: '95%',
            features: ['Multi-model integration', 'Predictive insights', 'Trend visualization', 'Actionable recommendations']
        }
    };

    const details = modelDetails[modelNumber];
    if (!details) return;

    const modalContent = `
        <div class="ai-model-details">
            <h2>${details.title}</h2>
            <div class="model-stats">
                <div class="stat">
                    <strong>Algorithm:</strong> ${details.algorithm}
                </div>
                <div class="stat">
                    <strong>Accuracy:</strong> ${details.accuracy}
                </div>
            </div>
            <p class="model-description">${details.description}</p>
            <div class="model-features">
                <h4>Key Features:</h4>
                <ul>
                    ${details.features.map(feature => `<li>${feature}</li>`).join('')}
                </ul>
            </div>
            <div class="model-demo">
                <button class="btn-primary" onclick="tryModelDemo(${modelNumber})">
                    Try Demo
                </button>
            </div>
        </div>
    `;

    document.getElementById('profileModalContent').innerHTML = modalContent;
    openModal('profileModal');
}

function tryModelDemo(modelNumber) {
    const demoPages = {
        1: 'directory.html',
        2: 'jobs.html',
        3: 'events.html',
        4: 'donate.html',
        5: 'feedback.html',
        6: 'dashboard.html'
    };

    const page = demoPages[modelNumber];
    if (page) {
        window.location.href = page;
    }
}

function initializeFeatureCards() {
    const cards = document.querySelectorAll('.feature-card');
    
    cards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-10px)';
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0)';
        });
    });
}