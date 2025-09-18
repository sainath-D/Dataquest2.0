// Machine Learning Algorithms for DQAI_5 Alumni Platform

// Utility Functions
class MLUtils {
    // Calculate TF-IDF vectors for text analysis
    static calculateTFIDF(documents) {
        // Tokenize and clean documents
        const tokenizedDocs = documents.map(doc => 
            doc.toLowerCase()
                .replace(/[^\w\s]/g, ' ')
                .split(/\s+/)
                .filter(word => word.length > 2)
        );

        // Calculate term frequency for each document
        const tfVectors = tokenizedDocs.map(tokens => {
            const tf = {};
            const totalTokens = tokens.length;
            
            tokens.forEach(token => {
                tf[token] = (tf[token] || 0) + 1;
            });
            
            // Normalize by document length
            Object.keys(tf).forEach(term => {
                tf[term] = tf[term] / totalTokens;
            });
            
            return tf;
        });

        // Calculate IDF for all unique terms
        const allTerms = [...new Set(tokenizedDocs.flat())];
        const idf = {};
        const totalDocs = documents.length;

        allTerms.forEach(term => {
            const docsWithTerm = tokenizedDocs.filter(tokens => 
                tokens.includes(term)
            ).length;
            idf[term] = Math.log(totalDocs / (1 + docsWithTerm));
        });

        // Calculate TF-IDF vectors
        return tfVectors.map(tf => {
            const tfidf = {};
            Object.keys(tf).forEach(term => {
                tfidf[term] = tf[term] * idf[term];
            });
            return tfidf;
        });
    }

    // Calculate cosine similarity between two vectors
    static cosineSimilarity(vectorA, vectorB) {
        const keysA = Object.keys(vectorA);
        const keysB = Object.keys(vectorB);
        const allKeys = [...new Set([...keysA, ...keysB])];

        let dotProduct = 0;
        let normA = 0;
        let normB = 0;

        allKeys.forEach(key => {
            const a = vectorA[key] || 0;
            const b = vectorB[key] || 0;
            
            dotProduct += a * b;
            normA += a * a;
            normB += b * b;
        });

        const denominator = Math.sqrt(normA) * Math.sqrt(normB);
        return denominator === 0 ? 0 : dotProduct / denominator;
    }

    // Calculate Jaccard similarity for sets
    static jaccardSimilarity(setA, setB) {
        const intersection = setA.filter(item => setB.includes(item));
        const union = [...new Set([...setA, ...setB])];
        return union.length === 0 ? 0 : intersection.length / union.length;
    }

    // Normalize scores to 0-1 range
    static normalizeScores(scores) {
        const max = Math.max(...scores);
        const min = Math.min(...scores);
        const range = max - min;
        
        if (range === 0) return scores.map(() => 0.5);
        
        return scores.map(score => (score - min) / range);
    }

    // Simple keyword-based sentiment analysis
    static analyzeSentiment(text) {
        const positiveWords = [
            'amazing', 'excellent', 'fantastic', 'great', 'good', 'wonderful', 'awesome',
            'brilliant', 'outstanding', 'superb', 'perfect', 'love', 'like', 'best',
            'helpful', 'useful', 'easy', 'smooth', 'clean', 'intuitive', 'recommend',
            'impressed', 'satisfied', 'pleased', 'happy', 'delighted', 'thank'
        ];

        const negativeWords = [
            'terrible', 'awful', 'bad', 'horrible', 'worst', 'hate', 'dislike',
            'problem', 'issue', 'bug', 'error', 'broken', 'slow', 'difficult',
            'confusing', 'annoying', 'disappointing', 'frustrated', 'concerned',
            'complaint', 'fail', 'crash', 'wrong', 'poor', 'lacking', 'missing'
        ];

        const words = text.toLowerCase().split(/\s+/);
        let positiveScore = 0;
        let negativeScore = 0;

        words.forEach(word => {
            if (positiveWords.includes(word)) positiveScore++;
            if (negativeWords.includes(word)) negativeScore++;
        });

        const totalScore = positiveScore - negativeScore;
        const normalizedScore = Math.max(-1, Math.min(1, totalScore * 0.1));

        if (normalizedScore > 0.2) return { sentiment: 'positive', score: normalizedScore };
        if (normalizedScore < -0.2) return { sentiment: 'negative', score: normalizedScore };
        return { sentiment: 'neutral', score: normalizedScore };
    }
}

// 1. Semantic Search Engine
class SemanticSearchEngine {
    constructor(alumniData) {
        this.alumni = alumniData;
        this.precomputedVectors = this.precomputeTFIDF();
    }

    precomputeTFIDF() {
        const documents = this.alumni.map(alumni => 
            `${alumni.name} ${alumni.jobTitle} ${alumni.company} ${alumni.location} ${alumni.interests.join(' ')} ${alumni.skills.join(' ')}`
        );
        return MLUtils.calculateTFIDF(documents);
    }

    search(query, limit = 5) {
        // Create TF-IDF vector for query
        const queryVector = MLUtils.calculateTFIDF([query])[0];
        
        // Calculate similarities
        const similarities = this.precomputedVectors.map((vector, index) => ({
            alumni: this.alumni[index],
            score: MLUtils.cosineSimilarity(queryVector, vector),
            index
        }));

        // Sort by similarity score and return top results
        const results = similarities
            .filter(result => result.score > 0.01) // Minimum threshold
            .sort((a, b) => b.score - a.score)
            .slice(0, limit);

        // Add match explanations
        return results.map(result => ({
            ...result.alumni,
            matchScore: Math.round(result.score * 100) / 100,
            matchReason: this.generateMatchReason(query, result.alumni)
        }));
    }

    generateMatchReason(query, alumni) {
        const queryWords = query.toLowerCase().split(/\s+/).filter(word => word.length > 2);
        const alumniText = `${alumni.jobTitle} ${alumni.company} ${alumni.location} ${alumni.interests.join(' ')} ${alumni.skills.join(' ')}`.toLowerCase();
        
        const matches = queryWords.filter(word => 
            alumniText.includes(word) || 
            alumni.skills.some(skill => skill.toLowerCase().includes(word)) ||
            alumni.interests.some(interest => interest.toLowerCase().includes(word))
        );

        return matches.length > 0 
            ? `Matched on: ${matches.slice(0, 3).join(', ')}`
            : 'General profile match';
    }

    getRecommendations(userInterests, limit = 4) {
        const userVector = MLUtils.calculateTFIDF([userInterests.join(' ')])[0];
        
        const recommendations = this.precomputedVectors.map((vector, index) => ({
            alumni: this.alumni[index],
            score: MLUtils.cosineSimilarity(userVector, vector)
        }))
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);

        return recommendations.map(rec => ({
            ...rec.alumni,
            recommendationScore: Math.round(rec.score * 100) / 100
        }));
    }
}

// 2. Job Recommendation Engine
class JobRecommendationEngine {
    constructor(jobsData) {
        this.jobs = jobsData;
    }

    getRecommendations(userSkills, limit = 8) {
        const recommendations = this.jobs.map(job => {
            const similarity = MLUtils.jaccardSimilarity(
                userSkills.map(s => s.toLowerCase()),
                job.tags.map(t => t.toLowerCase())
            );

            return {
                ...job,
                matchScore: Math.round(similarity * 100) / 100,
                matchedSkills: userSkills.filter(skill => 
                    job.tags.some(tag => 
                        tag.toLowerCase().includes(skill.toLowerCase()) ||
                        skill.toLowerCase().includes(tag.toLowerCase())
                    )
                )
            };
        })
        .filter(job => job.matchScore > 0)
        .sort((a, b) => b.matchScore - a.matchScore)
        .slice(0, limit);

        return recommendations;
    }
}

// 3. Event Engagement Prediction
class EventEngagementPredictor {
    constructor(alumniData, eventsData) {
        this.alumni = alumniData;
        this.events = eventsData;
    }

    predictEngagement(alumni, event) {
        let score = 0.1; // Base score
        const now = Date.now();
        const daysSinceLogin = (now - alumni.lastLogin) / (1000 * 60 * 60 * 24);

        // Activity level factor
        if (alumni.activityLevel === 'high') score += 0.4;
        else if (alumni.activityLevel === 'medium') score += 0.2;

        // Profile completion factor
        if (alumni.profileCompletion > 80) score += 0.3;
        else if (alumni.profileCompletion > 60) score += 0.1;

        // Past event attendance factor
        if (alumni.pastEventCount > 10) score += 0.3;
        else if (alumni.pastEventCount > 5) score += 0.2;
        else if (alumni.pastEventCount > 0) score += 0.1;

        // Recent activity factor
        if (daysSinceLogin < 7) score += 0.2;
        else if (daysSinceLogin < 30) score += 0.1;

        // Interest alignment factor
        const interestMatch = alumni.interests.some(interest =>
            event.tags.some(tag => 
                tag.toLowerCase().includes(interest.toLowerCase()) ||
                interest.toLowerCase().includes(tag.toLowerCase())
            )
        );
        if (interestMatch) score += 0.2;

        // Location factor
        if (alumni.location === event.location || event.location === 'Virtual') {
            score += 0.1;
        }

        return Math.min(1.0, score);
    }

    getPredictionsForEvent(eventId) {
        const event = this.events.find(e => e.id === eventId);
        if (!event) return [];

        const predictions = this.alumni.map(alumni => ({
            alumni,
            probability: this.predictEngagement(alumni, event),
            likelihood: this.getLikelihoodLabel(this.predictEngagement(alumni, event))
        }))
        .filter(pred => pred.probability > 0.5)
        .sort((a, b) => b.probability - a.probability)
        .slice(0, 10);

        return predictions;
    }

    getEventPrediction(eventId) {
        const predictions = this.getPredictionsForEvent(eventId);
        const likelyAttendees = predictions.length;
        const averageProbability = predictions.length > 0 
            ? predictions.reduce((sum, pred) => sum + pred.probability, 0) / predictions.length
            : 0;

        return {
            eventId,
            predictedAttendance: Math.round(averageProbability * 100),
            likelyAttendees: predictions.slice(0, 5).map(p => ({
                name: p.alumni.name,
                company: p.alumni.company,
                probability: Math.round(p.probability * 100),
                likelihood: p.likelihood
            }))
        };
    }

    getLikelihoodLabel(probability) {
        if (probability >= 0.8) return 'Very Likely';
        if (probability >= 0.6) return 'Likely';
        if (probability >= 0.4) return 'Maybe';
        return 'Unlikely';
    }
}

// 4. Donation Forecasting Engine
class DonationPredictor {
    constructor(alumniData) {
        this.alumni = alumniData;
    }

    predictDonationProbability(alumni) {
        let score = 0.1; // Base score

        // Graduation year factor (older alumni more likely to donate)
        const currentYear = new Date().getFullYear();
        const yearsGraduated = currentYear - alumni.graduationYear;
        if (yearsGraduated >= 10) score += 0.3;
        else if (yearsGraduated >= 5) score += 0.2;
        else if (yearsGraduated >= 2) score += 0.1;

        // Company factor (high-paying companies)
        const highValueCompanies = ['Google', 'Microsoft', 'Amazon', 'Apple', 'Meta', 'OpenAI', 'Netflix'];
        if (highValueCompanies.includes(alumni.company)) score += 0.3;

        // Past donation history
        if (alumni.pastDonations > 50000) score += 0.4;
        else if (alumni.pastDonations > 20000) score += 0.3;
        else if (alumni.pastDonations > 5000) score += 0.2;
        else if (alumni.pastDonations > 0) score += 0.1;

        // Activity level factor
        if (alumni.activityLevel === 'high') score += 0.2;
        else if (alumni.activityLevel === 'medium') score += 0.1;

        // Event participation factor
        if (alumni.pastEventCount > 10) score += 0.2;
        else if (alumni.pastEventCount > 5) score += 0.1;

        return Math.min(1.0, score);
    }

    getDonationProspects(limit = 10) {
        return this.alumni.map(alumni => ({
            ...alumni,
            donationProbability: this.predictDonationProbability(alumni),
            probabilityLabel: this.getProbabilityLabel(this.predictDonationProbability(alumni)),
            predictedAmount: this.predictDonationAmount(alumni)
        }))
        .sort((a, b) => b.donationProbability - a.donationProbability)
        .slice(0, limit);
    }

    getProbabilityLabel(probability) {
        if (probability >= 0.8) return 'high';
        if (probability >= 0.5) return 'medium';
        return 'low';
    }

    predictDonationAmount(alumni) {
        const baseProbability = this.predictDonationProbability(alumni);
        const companyMultiplier = ['Google', 'Microsoft', 'Amazon', 'Apple', 'Meta'].includes(alumni.company) ? 2 : 1;
        const experienceMultiplier = Math.max(1, (new Date().getFullYear() - alumni.graduationYear) * 0.1);
        
        return Math.round(baseProbability * companyMultiplier * experienceMultiplier * 10000);
    }

    getForecastSummary() {
        const prospects = this.getDonationProspects();
        const totalPredicted = prospects.reduce((sum, p) => sum + p.predictedAmount, 0);
        const highProbabilityDonors = prospects.filter(p => p.donationProbability >= 0.7);
        
        return {
            totalPredicted,
            totalProspects: prospects.length,
            highProbabilityDonors: highProbabilityDonors.length,
            averageDonation: Math.round(totalPredicted / prospects.length),
            topDonors: prospects.slice(0, 5)
        };
    }
}

// 5. Sentiment Analysis Engine
class SentimentAnalyzer {
    constructor(feedbackData = []) {
        this.feedback = [...feedbackData];
    }

    analyzeFeedback(text) {
        const result = MLUtils.analyzeSentiment(text);
        return {
            text,
            sentiment: result.sentiment,
            score: result.score,
            confidence: Math.abs(result.score),
            timestamp: new Date().toISOString()
        };
    }

    addFeedback(text, author = 'Anonymous') {
        const analysis = this.analyzeFeedback(text);
        const newFeedback = {
            id: this.feedback.length + 1,
            text,
            sentiment: analysis.sentiment,
            score: analysis.score,
            author,
            date: new Date().toISOString().split('T')[0],
            category: 'General'
        };

        this.feedback.unshift(newFeedback);
        return newFeedback;
    }

    getSentimentDistribution() {
        const distribution = {
            positive: this.feedback.filter(f => f.sentiment === 'positive').length,
            neutral: this.feedback.filter(f => f.sentiment === 'neutral').length,
            negative: this.feedback.filter(f => f.sentiment === 'negative').length
        };

        const total = distribution.positive + distribution.neutral + distribution.negative;
        
        return {
            counts: distribution,
            percentages: {
                positive: total > 0 ? Math.round((distribution.positive / total) * 100) : 0,
                neutral: total > 0 ? Math.round((distribution.neutral / total) * 100) : 0,
                negative: total > 0 ? Math.round((distribution.negative / total) * 100) : 0
            }
        };
    }

    getRecentFeedback(limit = 10) {
        return this.feedback
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, limit);
    }

    getFeedbackInsights() {
        const distribution = this.getSentimentDistribution();
        const total = this.feedback.length;
        const averageScore = total > 0 
            ? this.feedback.reduce((sum, f) => sum + f.score, 0) / total 
            : 0;

        return {
            totalFeedback: total,
            overallSentiment: averageScore > 0.1 ? 'positive' : averageScore < -0.1 ? 'negative' : 'neutral',
            averageScore: Math.round(averageScore * 100) / 100,
            distribution: distribution.percentages,
            trend: this.calculateTrend()
        };
    }

    calculateTrend() {
        if (this.feedback.length < 5) return 'insufficient_data';
        
        const recent = this.feedback.slice(0, Math.floor(this.feedback.length / 2));
        const older = this.feedback.slice(Math.floor(this.feedback.length / 2));
        
        const recentAvg = recent.reduce((sum, f) => sum + f.score, 0) / recent.length;
        const olderAvg = older.reduce((sum, f) => sum + f.score, 0) / older.length;
        
        const diff = recentAvg - olderAvg;
        if (diff > 0.2) return 'improving';
        if (diff < -0.2) return 'declining';
        return 'stable';
    }
}

// 6. Analytics Dashboard Engine
class DashboardAnalytics {
    constructor(alumniData, jobsData, eventsData, feedbackData) {
        this.alumni = alumniData;
        this.jobs = jobsData;
        this.events = eventsData;
        this.sentimentAnalyzer = new SentimentAnalyzer(feedbackData);
        this.donationPredictor = new DonationPredictor(alumniData);
        this.eventPredictor = new EventEngagementPredictor(alumniData, eventsData);
    }

    getDepartmentDistribution() {
        const departments = {};
        this.alumni.forEach(alumni => {
            departments[alumni.department] = (departments[alumni.department] || 0) + 1;
        });
        return departments;
    }

    getSkillsDistribution() {
        const skills = {};
        this.alumni.forEach(alumni => {
            alumni.skills.forEach(skill => {
                skills[skill] = (skills[skill] || 0) + 1;
            });
        });
        
        // Return top 10 skills
        return Object.entries(skills)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 10)
            .reduce((obj, [skill, count]) => {
                obj[skill] = count;
                return obj;
            }, {});
    }

    getEngagementMetrics() {
        const totalAlumni = this.alumni.length;
        const activeAlumni = this.alumni.filter(a => a.activityLevel === 'high').length;
        const mediumAlumni = this.alumni.filter(a => a.activityLevel === 'medium').length;
        
        return {
            totalAlumni,
            activeAlumni,
            engagementRate: Math.round((activeAlumni + mediumAlumni) / totalAlumni * 100),
            averageProfileCompletion: Math.round(
                this.alumni.reduce((sum, a) => sum + a.profileCompletion, 0) / totalAlumni
            )
        };
    }

    getAIInsights() {
        const engagement = this.getEngagementMetrics();
        const donation = this.donationPredictor.getForecastSummary();
        const sentiment = this.sentimentAnalyzer.getFeedbackInsights();
        
        const insights = [];
        
        if (engagement.engagementRate > 70) {
            insights.push("High alumni engagement detected - excellent community participation");
        }
        
        if (donation.highProbabilityDonors > 5) {
            insights.push(`${donation.highProbabilityDonors} high-value donation prospects identified`);
        }
        
        if (sentiment.overallSentiment === 'positive') {
            insights.push("Positive sentiment trend in alumni feedback");
        }
        
        const techAlumni = this.alumni.filter(a => 
            a.skills.some(skill => ['AI', 'Machine Learning', 'Python', 'JavaScript'].includes(skill))
        ).length;
        
        if (techAlumni > this.alumni.length * 0.6) {
            insights.push("Strong technology alumni network - leverage for tech events");
        }
        
        return {
            summary: "Our models predict 78% engagement this quarter",
            insights: insights.slice(0, 3),
            confidence: 92,
            lastUpdated: new Date().toISOString()
        };
    }
}

// Initialize ML Engines
let semanticSearchEngine;
let jobRecommendationEngine;
let eventEngagementPredictor;
let donationPredictor;
let sentimentAnalyzer;
let dashboardAnalytics;

// Initialize all ML engines when data is available
function initializeMLEngines() {
    if (typeof alumniData !== 'undefined' && typeof jobsData !== 'undefined' && 
        typeof eventsData !== 'undefined' && typeof feedbackData !== 'undefined') {
        
        semanticSearchEngine = new SemanticSearchEngine(alumniData);
        jobRecommendationEngine = new JobRecommendationEngine(jobsData);
        eventEngagementPredictor = new EventEngagementPredictor(alumniData, eventsData);
        donationPredictor = new DonationPredictor(alumniData);
        sentimentAnalyzer = new SentimentAnalyzer(feedbackData);
        dashboardAnalytics = new DashboardAnalytics(alumniData, jobsData, eventsData, feedbackData);
        
        console.log('ML Engines initialized successfully');
    }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        SemanticSearchEngine,
        JobRecommendationEngine,
        EventEngagementPredictor,
        DonationPredictor,
        SentimentAnalyzer,
        DashboardAnalytics,
        MLUtils,
        initializeMLEngines
    };
}