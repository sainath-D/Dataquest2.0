// Dashboard page functionality with comprehensive analytics

document.addEventListener('DOMContentLoaded', function() {
    // Require admin access
    if (!auth.requireAdmin()) {
        return;
    }
    
    initializeDashboard();
    loadQuickStats();
    loadCharts();
    loadAIInsights();
    loadRecentActivity();
    loadHighValueProspects();
    loadAdvancedAnalytics();
});

let charts = {};

function initializeDashboard() {
    const adminName = document.getElementById('adminName');
    const user = auth.getCurrentUser();
    if (adminName && user) {
        adminName.textContent = user.name;
    }

    // Button event listeners
    const exportBtn = document.getElementById('exportBtn');
    const resetDemoBtn = document.getElementById('resetDemoBtn');
    const aiInsightsBtn = document.getElementById('aiInsightsBtn');

    if (exportBtn) {
        exportBtn.addEventListener('click', () => openModal('exportModal'));
    }
    if (resetDemoBtn) {
        resetDemoBtn.addEventListener('click', resetDemo);
    }
    if (aiInsightsBtn) {
        aiInsightsBtn.addEventListener('click', () => openModal('aiInsightsModal'));
    }
}

function loadQuickStats() {
    if (!dashboardAnalytics) return;

    const engagement = dashboardAnalytics.getEngagementMetrics();
    const donationSummary = donationPredictor ? donationPredictor.getForecastSummary() : { totalPredicted: 0 };
    const sentimentData = sentimentAnalyzer ? sentimentAnalyzer.getSentimentDistribution() : { percentages: { positive: 0 } };

    // Animate stats
    setTimeout(() => {
        animateCounter(document.getElementById('totalAlumni'), engagement.totalAlumni);
        animateCounter(document.getElementById('engagementRate'), engagement.engagementRate);
        
        const donationsElement = document.getElementById('donationsTotal');
        donationsElement.textContent = formatCurrency(donationSummary.totalPredicted);
        
        animateCounter(document.getElementById('sentimentScore'), sentimentData.percentages.positive);
    }, 500);
}

function loadCharts() {
    if (!dashboardAnalytics) return;

    // Department Distribution
    const deptData = dashboardAnalytics.getDepartmentDistribution();
    createDepartmentChart(deptData);

    // Skills Distribution
    const skillsData = dashboardAnalytics.getSkillsDistribution();
    createSkillsChart(skillsData);

    // Engagement Chart
    createEngagementChart();

    // Donation Chart
    createDonationChart();
}

function createDepartmentChart(data) {
    const ctx = document.getElementById('departmentChart');
    if (!ctx) return;

    charts.department = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: Object.keys(data),
            datasets: [{
                data: Object.values(data),
                backgroundColor: [
                    'var(--primary-blue)',
                    'var(--secondary-teal)',
                    'var(--accent-orange)',
                    'var(--success-green)',
                    'var(--warning-yellow)'
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
                    position: 'bottom'
                }
            }
        }
    });
}

function createSkillsChart(data) {
    const ctx = document.getElementById('skillsChart');
    if (!ctx) return;

    charts.skills = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: Object.keys(data),
            datasets: [{
                label: 'Alumni Count',
                data: Object.values(data),
                backgroundColor: 'var(--secondary-teal)',
                borderColor: 'var(--secondary-teal)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                }
            }
        }
    });
}

function createEngagementChart() {
    const ctx = document.getElementById('engagementChart');
    if (!ctx) return;

    // Mock engagement data over time
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const engagementData = [65, 70, 75, 78, 82, 85];

    charts.engagement = new Chart(ctx, {
        type: 'line',
        data: {
            labels: months,
            datasets: [{
                label: 'Engagement Rate (%)',
                data: engagementData,
                borderColor: 'var(--success-green)',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100
                }
            }
        }
    });
}

function createDonationChart() {
    const ctx = document.getElementById('donationChart');
    if (!ctx) return;

    // Mock donation data over time
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const donationData = [150000, 180000, 220000, 280000, 350000, 420000];

    charts.donation = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: months,
            datasets: [{
                label: 'Donations (₹)',
                data: donationData,
                backgroundColor: 'var(--accent-orange)',
                borderColor: 'var(--accent-orange)',
                borderWidth: 1
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
                            return 'Donations: ' + formatCurrency(context.parsed.y);
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return formatCurrency(value);
                        }
                    }
                }
            }
        }
    });
}

function loadAIInsights() {
    if (!dashboardAnalytics) return;

    const insights = dashboardAnalytics.getAIInsights();
    const aiInsightsContent = document.getElementById('aiInsightsContent');

    if (aiInsightsContent) {
        aiInsightsContent.innerHTML = `
            <div class="insights-summary">
                <div class="insight-header">
                    <h4>${insights.summary}</h4>
                    <div class="confidence-badge">${insights.confidence}% Confidence</div>
                </div>
                <div class="insights-list">
                    ${insights.insights.map(insight => `
                        <div class="insight-item">
                            <span class="insight-icon">💡</span>
                            <span class="insight-text">${insight}</span>
                        </div>
                    `).join('')}
                </div>
                <div class="insights-timestamp">
                    Last updated: ${timeAgo(insights.lastUpdated)}
                </div>
            </div>
        `;
    }

    // Load detailed insights for modal
    loadDetailedAIInsights(insights);
}

function loadDetailedAIInsights(insights) {
    const detailContent = document.getElementById('aiInsightsDetailContent');
    if (!detailContent) return;

    const engagement = dashboardAnalytics.getEngagementMetrics();
    const donationSummary = donationPredictor ? donationPredictor.getForecastSummary() : {};
    const sentimentData = sentimentAnalyzer ? sentimentAnalyzer.getFeedbackInsights() : {};

    detailContent.innerHTML = `
        <div class="detailed-insights">
            <div class="insight-section">
                <h4>📊 Engagement Analysis</h4>
                <div class="insight-metrics">
                    <div class="metric-item">
                        <span class="metric-label">Total Alumni:</span>
                        <span class="metric-value">${engagement.totalAlumni}</span>
                    </div>
                    <div class="metric-item">
                        <span class="metric-label">Active Alumni:</span>
                        <span class="metric-value">${engagement.activeAlumni}</span>
                    </div>
                    <div class="metric-item">
                        <span class="metric-label">Engagement Rate:</span>
                        <span class="metric-value">${engagement.engagementRate}%</span>
                    </div>
                </div>
                <p class="insight-analysis">
                    ${engagement.engagementRate > 70 ? 
                        'Excellent engagement levels indicate a healthy, active alumni community.' :
                        'Engagement levels could be improved through targeted outreach campaigns.'
                    }
                </p>
            </div>

            <div class="insight-section">
                <h4>💰 Donation Forecasting</h4>
                <div class="insight-metrics">
                    <div class="metric-item">
                        <span class="metric-label">Predicted Total:</span>
                        <span class="metric-value">${formatCurrency(donationSummary.totalPredicted || 0)}</span>
                    </div>
                    <div class="metric-item">
                        <span class="metric-label">High Probability Donors:</span>
                        <span class="metric-value">${donationSummary.highProbabilityDonors || 0}</span>
                    </div>
                </div>
                <p class="insight-analysis">
                    Our AI model identifies key prospects based on graduation year, company, and engagement history.
                </p>
            </div>

            <div class="insight-section">
                <h4>😊 Sentiment Analysis</h4>
                <div class="sentiment-summary">
                    <div class="sentiment-item">
                        <span class="sentiment-emoji">😊</span>
                        <span class="sentiment-percent">${sentimentData.distribution?.positive || 0}%</span>
                    </div>
                    <div class="sentiment-item">
                        <span class="sentiment-emoji">😐</span>
                        <span class="sentiment-percent">${sentimentData.distribution?.neutral || 0}%</span>
                    </div>
                    <div class="sentiment-item">
                        <span class="sentiment-emoji">😞</span>
                        <span class="sentiment-percent">${sentimentData.distribution?.negative || 0}%</span>
                    </div>
                </div>
                <p class="insight-analysis">
                    Overall sentiment trend: ${sentimentData.overallSentiment || 'neutral'}
                    ${sentimentData.trend ? ` (${sentimentData.trend})` : ''}
                </p>
            </div>

            <div class="insight-section">
                <h4>🔮 Predictive Recommendations</h4>
                <ul class="recommendations-list">
                    <li>Focus on tech alumni for higher donation potential</li>
                    <li>Organize virtual events to increase participation</li>
                    <li>Implement mentorship programs to boost engagement</li>
                    <li>Target recent graduates for networking events</li>
                </ul>
            </div>
        </div>
    `;
}

function loadRecentActivity() {
    const recentActivity = document.getElementById('recentActivity');
    if (!recentActivity) return;

    // Mock recent activity data
    const activities = [
        { type: 'registration', user: 'John Doe', action: 'registered for Tech Meetup', time: '2 hours ago' },
        { type: 'donation', user: 'Anonymous', action: 'donated ₹5,000', time: '4 hours ago' },
        { type: 'connection', user: 'Jane Smith', action: 'connected with 2 alumni', time: '6 hours ago' },
        { type: 'feedback', user: 'Alumni User', action: 'submitted positive feedback', time: '8 hours ago' },
        { type: 'profile', user: 'Mike Johnson', action: 'updated profile information', time: '1 day ago' }
    ];

    recentActivity.innerHTML = activities.map(activity => `
        <div class="activity-item">
            <div class="activity-icon ${activity.type}">
                ${getActivityIcon(activity.type)}
            </div>
            <div class="activity-info">
                <div class="activity-text">
                    <strong>${activity.user}</strong> ${activity.action}
                </div>
                <div class="activity-time">${activity.time}</div>
            </div>
        </div>
    `).join('');
}

function getActivityIcon(type) {
    const icons = {
        'registration': '📅',
        'donation': '💰',
        'connection': '🤝',
        'feedback': '📝',
        'profile': '👤'
    };
    return icons[type] || '📊';
}

function loadHighValueProspects() {
    if (!donationPredictor) return;

    const prospects = donationPredictor.getDonationProspects(5);
    const prospectsContainer = document.getElementById('highValueProspects');
    const prospectsCount = document.getElementById('prospectsCount');

    if (prospectsCount) {
        prospectsCount.textContent = prospects.length;
    }

    if (prospectsContainer) {
        prospectsContainer.innerHTML = prospects.map(prospect => `
            <div class="prospect-item">
                <div class="prospect-avatar">
                    <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(prospect.name)}&size=40&background=1E3A8A&color=fff" alt="${prospect.name}">
                </div>
                <div class="prospect-info">
                    <div class="prospect-name">${prospect.name}</div>
                    <div class="prospect-company">${prospect.company}</div>
                </div>
                <div class="prospect-score">
                    <div class="probability-badge ${prospect.probabilityLabel}">
                        ${Math.round(prospect.donationProbability * 100)}%
                    </div>
                    <div class="predicted-amount">${formatCurrency(prospect.predictedAmount)}</div>
                </div>
            </div>
        `).join('');
    }
}

function loadAdvancedAnalytics() {
    loadEventPredictions();
    loadJobMarketAnalysis();
}

function loadEventPredictions() {
    if (!eventEngagementPredictor) return;

    const eventPredictions = document.getElementById('eventPredictions');
    if (!eventPredictions) return;

    const predictions = eventsData.map(event => {
        const prediction = eventEngagementPredictor.getEventPrediction(event.id);
        return {
            event,
            prediction
        };
    });

    eventPredictions.innerHTML = predictions.map(({ event, prediction }) => `
        <div class="prediction-item">
            <div class="event-title">${event.title}</div>
            <div class="prediction-score">${prediction.predictedAttendance}%</div>
            <div class="prediction-details">
                ${prediction.likelyAttendees.slice(0, 2).map(attendee => 
                    `<span class="attendee-name">${attendee.name}</span>`
                ).join(', ')}
                ${prediction.likelyAttendees.length > 2 ? ` +${prediction.likelyAttendees.length - 2} more` : ''}
            </div>
        </div>
    `).join('');
}

function loadJobMarketAnalysis() {
    const jobMarketAnalysis = document.getElementById('jobMarketAnalysis');
    if (!jobMarketAnalysis) return;

    // Mock job market analysis
    const analysis = {
        topSkills: ['AI', 'JavaScript', 'Python', 'React', 'Machine Learning'],
        averageMatchRate: 73,
        topCompanies: ['Google', 'Microsoft', 'Amazon', 'OpenAI', 'Meta']
    };

    jobMarketAnalysis.innerHTML = `
        <div class="market-metric">
            <span class="metric-label">Average Match Rate:</span>
            <span class="metric-value">${analysis.averageMatchRate}%</span>
        </div>
        <div class="market-section">
            <h5>Top Skills in Demand:</h5>
            <div class="skills-tags">
                ${analysis.topSkills.map(skill => `<span class="skill-tag">${skill}</span>`).join('')}
            </div>
        </div>
        <div class="market-section">
            <h5>Top Hiring Companies:</h5>
            <div class="companies-list">
                ${analysis.topCompanies.map(company => `<span class="company-tag">${company}</span>`).join('')}
            </div>
        </div>
    `;
}

function refreshDepartmentChart() {
    if (charts.department && dashboardAnalytics) {
        const newData = dashboardAnalytics.getDepartmentDistribution();
        charts.department.data.labels = Object.keys(newData);
        charts.department.data.datasets[0].data = Object.values(newData);
        charts.department.update();
    }
}

function refreshSkillsChart() {
    if (charts.skills && dashboardAnalytics) {
        const newData = dashboardAnalytics.getSkillsDistribution();
        charts.skills.data.labels = Object.keys(newData);
        charts.skills.data.datasets[0].data = Object.values(newData);
        charts.skills.update();
    }
}