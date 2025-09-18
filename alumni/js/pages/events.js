// Events page functionality

document.addEventListener('DOMContentLoaded', function() {
    initializeEventsPage();
    loadEvents();
});

function initializeEventsPage() {
    // Initialize filter tabs
    const filterTabs = document.querySelectorAll('.filter-tab');
    filterTabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            // Remove active class from all tabs
            filterTabs.forEach(t => t.classList.remove('active'));
            // Add active class to clicked tab
            e.target.classList.add('active');
            
            // Filter events by type
            const filterType = e.target.dataset.filter;
            filterEvents(filterType);
        });
    });
    
    // Initialize view toggle
    const viewBtns = document.querySelectorAll('.view-btn');
    viewBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            viewBtns.forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            
            const viewType = e.target.dataset.view;
            toggleView(viewType);
        });
    });
    
    // Initialize load more button
    const loadMoreBtn = document.querySelector('.load-more-btn');
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', loadMoreEvents);
    }
}

function loadEvents() {
    // Initialize with all events
    currentFilter = 'all';
    currentFilteredEvents = eventsData;
    currentVisibleCount = 5;
    
    const visibleEvents = currentFilteredEvents.slice(0, currentVisibleCount);
    displayEvents(visibleEvents);
    
    // Show/hide load more button
    updateLoadMoreButton();
}

function displayEvents(events) {
    const eventsGrid = document.getElementById('eventsGrid');
    if (!eventsGrid) return;

    function formatDate(dateStr) {
        const date = new Date(dateStr);
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return `${days[date.getDay()]}, ${months[date.getMonth()]} ${date.getDate()}`;
    }

    function getAttendancePercentage(registered, max) {
        return Math.round((registered / max) * 100);
    }

    function getCategoryColor(type) {
        const colors = {
            networking: '#3B82F6',
            workshop: '#10B981', 
            reunion: '#8B5CF6',
            entrepreneurship: '#F59E0B',
            career: '#06B6D4'
        };
        return colors[type] || '#6B7280';
    }

    const eventCards = events.map(event => {
        const attendancePercent = getAttendancePercentage(event.registeredCount, event.maxAttendees);
        const categoryColor = getCategoryColor(event.type);
        
        return `
            <div class="event-card-new">
                <div class="event-title">${event.title}</div>
                <div class="event-category" style="background-color: ${categoryColor}">${event.type}</div>
                <div class="event-description">${event.description}</div>
                
                <div class="event-meta">
                    <div class="event-date">📅 ${formatDate(event.date)}</div>
                    <div class="event-time">🕒 ${event.time}</div>
                    <div class="event-location">📍 ${event.location}</div>
                    <div class="event-attendees">👥 ${event.registeredCount} / ${event.maxAttendees} attendees</div>
                </div>
                
                <div class="event-rsvp">
                    <button class="rsvp-btn ${event.userRegistered ? 'manage-rsvp' : 'rsvp-new'}" onclick="handleRSVP(${event.id})">
                        ${event.userRegistered ? 'Manage RSVP' : 'RSVP'}
                    </button>
                </div>
                
                <div class="attendance-section">
                    <div class="attendance-label">Attendance</div>
                    <div class="attendance-bar">
                        <div class="attendance-progress" style="width: ${attendancePercent}%"></div>
                    </div>
                    <div class="attendance-percentage">${attendancePercent}% full</div>
                </div>
            </div>
        `;
    }).join('');

    eventsGrid.innerHTML = eventCards;
}

function filterEvents(filterType) {
    // Update current filter state
    currentFilter = filterType;
    
    if (filterType === 'all') {
        currentFilteredEvents = eventsData;
    } else {
        currentFilteredEvents = eventsData.filter(event => 
            event.type.toLowerCase() === filterType.toLowerCase()
        );
    }
    
    // Reset visible count for filtered results
    currentVisibleCount = Math.min(5, currentFilteredEvents.length);
    const visibleEvents = currentFilteredEvents.slice(0, currentVisibleCount);
    displayEvents(visibleEvents);
    
    // Update load more button
    updateLoadMoreButton();
}

function toggleView(viewType) {
    const eventsGrid = document.getElementById('eventsGrid');
    if (viewType === 'list') {
        eventsGrid.classList.add('list-view');
    } else {
        eventsGrid.classList.remove('list-view');
    }
}

let currentVisibleCount = 5;
let currentFilter = 'all';
let currentFilteredEvents = [];

function loadMoreEvents() {
    const totalFilteredEvents = currentFilteredEvents.length;
    if (currentVisibleCount >= totalFilteredEvents) {
        updateLoadMoreButton();
        return;
    }
    
    // Show 3 more events each time
    currentVisibleCount = Math.min(currentVisibleCount + 3, totalFilteredEvents);
    const visibleEvents = currentFilteredEvents.slice(0, currentVisibleCount);
    displayEvents(visibleEvents);
    
    updateLoadMoreButton();
}

function updateLoadMoreButton() {
    const loadMoreBtn = document.querySelector('.load-more-btn');
    if (loadMoreBtn) {
        const shouldShow = currentFilteredEvents.length > currentVisibleCount;
        loadMoreBtn.style.display = shouldShow ? 'block' : 'none';
    }
}

function handleRSVP(eventId) {
    const event = eventsData.find(e => e.id === eventId);
    if (!event) return;
    
    if (event.userRegistered) {
        // Show manage RSVP options
        showNotification('RSVP management options would appear here', 'info');
    } else {
        // Register for event
        registerForEvent(eventId);
    }
}

// Removed AI prediction functions as they're not in the new design

function showEventDetails(eventId) {
    const event = eventsData.find(e => e.id === eventId);
    if (!event) return;

    const isUserRegistered = isRegistered(eventId);
    const prediction = eventEngagementPredictor ? eventEngagementPredictor.getEventPrediction(eventId) : null;

    const modalContent = `
        <div class="event-details-modal">
            <div class="event-modal-header">
                <div class="event-modal-date">
                    <div class="modal-day">${new Date(event.date).getDate()}</div>
                    <div class="modal-month">${new Date(event.date).toLocaleDateString('en-US', {month: 'long'})}</div>
                    <div class="modal-year">${new Date(event.date).getFullYear()}</div>
                </div>
                <div class="event-modal-info">
                    <h2>${event.title}</h2>
                    <div class="event-modal-meta">
                        <span class="modal-type">${event.type}</span>
                        <span class="modal-location">📍 ${event.location}</span>
                        <span class="modal-time">🕒 ${event.time}</span>
                    </div>
                </div>
            </div>
            
            <div class="event-modal-description">
                <h4>About This Event</h4>
                <p>${event.description}</p>
            </div>
            
            <div class="event-modal-details">
                <div class="detail-item">
                    <span class="detail-label">Capacity:</span>
                    <span class="detail-value">${event.maxAttendees} attendees</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Registered:</span>
                    <span class="detail-value">${event.registeredCount} people</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Available Spots:</span>
                    <span class="detail-value">${event.maxAttendees - event.registeredCount} remaining</span>
                </div>
            </div>
            
            <div class="event-modal-tags">
                <h4>Topics</h4>
                <div class="modal-tags">
                    ${event.tags.map(tag => `<span class="event-tag">${tag}</span>`).join('')}
                </div>
            </div>
            
            ${prediction && auth.isAdmin() ? `
                <div class="event-modal-ai">
                    <h4>🤖 AI Attendance Prediction</h4>
                    <div class="ai-prediction">
                        <div class="prediction-score-large">${prediction.predictedAttendance}%</div>
                        <div class="prediction-details">
                            <p>Based on alumni engagement patterns, interest alignment, and historical data.</p>
                            <div class="prediction-factors">
                                <span class="factor">Activity Level Analysis</span>
                                <span class="factor">Interest Matching</span>
                                <span class="factor">Past Attendance</span>
                                <span class="factor">Location Factor</span>
                            </div>
                        </div>
                    </div>
                </div>
            ` : ''}
            
            <div class="event-modal-actions">
                <button class="btn-primary" onclick="registerForEvent(${event.id})">
                    ${isUserRegistered ? 'Update Registration' : 'Register Now'}
                </button>
                <button class="btn-secondary" onclick="shareEvent(${event.id})">
                    Share Event
                </button>
                <button class="btn-secondary" onclick="addToCalendar(${event.id})">
                    Add to Calendar
                </button>
            </div>
        </div>
    `;

    document.getElementById('eventModalContent').innerHTML = modalContent;
    openModal('eventModal');
}

function registerForEvent(eventId) {
    const event = eventsData.find(e => e.id === eventId);
    if (!event) return;

    if (event.registeredCount >= event.maxAttendees) {
        showNotification('Sorry, this event is fully booked!', 'error');
        return;
    }

    // Update user registration status
    event.userRegistered = true;
    event.registeredCount++;
    showNotification(`Successfully registered for ${event.title}!`, 'success');
    loadEvents(); // Refresh the events display
}

function shareEvent(eventId) {
    const event = eventsData.find(e => e.id === eventId);
    if (!event) return;

    if (navigator.share) {
        navigator.share({
            title: event.title,
            text: `Join me at ${event.title} - ${event.description}`,
            url: window.location.href
        });
    } else {
        showNotification('Event details copied to clipboard!', 'success');
    }
}

function addToCalendar(eventId) {
    const event = eventsData.find(e => e.id === eventId);
    if (!event) return;

    const startDate = new Date(event.date + ' ' + event.time);
    const endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000); // 2 hours duration

    const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${startDate.toISOString().replace(/[:-]/g, '').replace(/\.\d{3}/, '')}/${endDate.toISOString().replace(/[:-]/g, '').replace(/\.\d{3}/, '')}&details=${encodeURIComponent(event.description)}&location=${encodeURIComponent(event.location)}`;

    window.open(googleCalendarUrl, '_blank');
}