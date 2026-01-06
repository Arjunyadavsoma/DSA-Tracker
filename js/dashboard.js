import { auth, db } from './firebase-config.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { doc, getDoc } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

const TOPICS_META = {
    "Array": { count: 36, easy: 12, medium: 18, hard: 6 },
    "Matrix": { count: 10, easy: 2, medium: 5, hard: 3 },
    "String": { count: 43, easy: 8, medium: 25, hard: 10 },
    "Searching & Sorting": { count: 36, easy: 6, medium: 20, hard: 10 },
    "LinkedList": { count: 36, easy: 10, medium: 20, hard: 6 },
    "Binary Trees": { count: 35, easy: 8, medium: 22, hard: 5 },
    "Binary Search Trees": { count: 22, easy: 4, medium: 12, hard: 6 },
    "Greedy": { count: 35, easy: 8, medium: 20, hard: 7 },
    "BackTracking": { count: 19, easy: 0, medium: 8, hard: 11 },
    "Stacks and Queues": { count: 38, easy: 10, medium: 20, hard: 8 },
    "Heap": { count: 18, easy: 4, medium: 10, hard: 4 },
    "Graph": { count: 44, easy: 4, medium: 25, hard: 15 },
    "Trie": { count: 6, easy: 0, medium: 5, hard: 1 },
    "Dynamic Programming": { count: 60, easy: 6, medium: 40, hard: 14 },
    "Bit Manipulation": { count: 10, easy: 5, medium: 4, hard: 1 }
};

const TOPIC_ID_RANGES = {
    "Array": [1, 36],
    "Matrix": [37, 46],
    "String": [47, 90],
    "Searching & Sorting": [91, 126],
    "LinkedList": [127, 162],
    "Binary Trees": [163, 197],
    "Binary Search Trees": [198, 219],
    "Greedy": [220, 254],
    "BackTracking": [255, 273],
    "Stacks and Queues": [274, 311],
    "Heap": [312, 329],
    "Graph": [330, 372],
    "Trie": [373, 378],
    "Dynamic Programming": [379, 437],
    "Bit Manipulation": [438, 447]
};

let solvedQuestions = new Set();
let solvedDates = {}; // { "2025-01-01": count }
let currentUser = null;

// Calculate totals
let totalQuestions = 0;
let totalEasy = 0;
let totalMedium = 0;
let totalHard = 0;

Object.values(TOPICS_META).forEach(topic => {
    totalQuestions += topic.count;
    totalEasy += topic.easy;
    totalMedium += topic.medium;
    totalHard += topic.hard;
});

// Auth check
onAuthStateChanged(auth, async (user) => {
    if (user) {
        currentUser = user;
        const displayName = user.displayName || user.email.split('@')[0];
        document.getElementById('user-display-name').textContent = displayName;
        
        await loadProgress(user.uid);
        updateStats();
        renderHeatmap();
        renderSkills();
        renderRecentSubmissions();
        hideLoading();
    } else {
        window.location.href = 'login.html';
    }
});

async function loadProgress(uid) {
    try {
        const docRef = doc(db, 'userProgress', uid);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
            const data = docSnap.data();
            solvedQuestions = new Set(data.solved || []);
            solvedDates = data.solvedDates || {};
        }
    } catch (error) {
        console.error('Error loading progress:', error);
        const saved = localStorage.getItem('solvedQuestions');
        if (saved) {
            solvedQuestions = new Set(JSON.parse(saved));
        }
    }
}

function hideLoading() {
    setTimeout(() => {
        document.getElementById('loading-indicator').style.display = 'none';
        document.getElementById('dashboard-data').style.opacity = '1';
    }, 500);
}

function updateStats() {
    const totalSolved = solvedQuestions.size;
    const percentage = totalQuestions > 0 ? Math.round((totalSolved / totalQuestions) * 100) : 0;
    
    // Calculate difficulty-wise
    let easySolved = 0;
    let mediumSolved = 0;
    let hardSolved = 0;

    Object.entries(TOPICS_META).forEach(([topic, meta]) => {
        const [startId, endId] = TOPIC_ID_RANGES[topic];
        const topicSolved = Array.from(solvedQuestions).filter(
            id => id >= startId && id <= endId
        );
        const topicPercentage = topicSolved.length / meta.count;
        easySolved += Math.round(meta.easy * topicPercentage);
        mediumSolved += Math.round(meta.medium * topicPercentage);
        hardSolved += Math.round(meta.hard * topicPercentage);
    });
    
    // Update UI
    document.getElementById('total-solved-display').textContent = totalSolved;
    document.getElementById('total-questions-display').textContent = totalQuestions;
    document.getElementById('circular-percentage').textContent = percentage + '%';
    document.getElementById('total-solved-year').textContent = totalSolved;
    
    document.getElementById('easy-solved').textContent = easySolved;
    document.getElementById('easy-total').textContent = totalEasy;
    document.getElementById('medium-solved').textContent = mediumSolved;
    document.getElementById('medium-total').textContent = totalMedium;
    document.getElementById('hard-solved').textContent = hardSolved;
    document.getElementById('hard-total').textContent = totalHard;
    
    // Circular progress
    const circle = document.getElementById('progress-ring-progress');
    const radius = 70;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percentage / 100) * circumference;
    circle.style.strokeDasharray = `${circumference} ${circumference}`;
    circle.style.strokeDashoffset = offset;
}

function renderHeatmap() {
    const container = document.getElementById('contribution-heatmap');
    container.innerHTML = '';
    
    const today = new Date();
    const oneYearAgo = new Date(today);
    oneYearAgo.setFullYear(today.getFullYear() - 1);
    
    // Generate weeks
    const weeks = [];
    let currentDate = new Date(oneYearAgo);
    currentDate.setDate(currentDate.getDate() - currentDate.getDay()); // Start from Sunday
    
    while (currentDate <= today) {
        const week = [];
        for (let i = 0; i < 7; i++) {
            const dateStr = currentDate.toISOString().split('T')[0];
            const count = solvedDates[dateStr] || 0;
            let level = 0;
            if (count > 0) level = 1;
            if (count >= 2) level = 2;
            if (count >= 4) level = 3;
            if (count >= 6) level = 4;
            
            week.push({ date: new Date(currentDate), dateStr, count, level });
            currentDate.setDate(currentDate.getDate() + 1);
        }
        weeks.push(week);
    }
    
    // Build heatmap
    const grid = document.createElement('div');
    grid.className = 'heatmap-grid';
    
    // Labels
    const labels = document.createElement('div');
    labels.className = 'heatmap-labels';
    ['Mon', '', 'Wed', '', 'Fri', '', ''].forEach(label => {
        const span = document.createElement('span');
        span.className = 'heatmap-label';
        span.textContent = label;
        labels.appendChild(span);
    });
    
    // Main area
    const mainArea = document.createElement('div');
    
    // Months
    const months = document.createElement('div');
    months.className = 'heatmap-months';
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    let lastMonth = -1;
    weeks.forEach((week, index) => {
        const month = week[0].date.getMonth();
        if (month !== lastMonth && index % 4 === 0) {
            const monthDiv = document.createElement('div');
            monthDiv.className = 'heatmap-month';
            monthDiv.textContent = monthNames[month];
            monthDiv.style.gridColumn = `${index + 1} / span 4`;
            months.appendChild(monthDiv);
            lastMonth = month;
        }
    });
    
    // Weeks
    const weeksContainer = document.createElement('div');
    weeksContainer.className = 'heatmap-weeks';
    weeks.forEach(week => {
        week.forEach(day => {
            const dayDiv = document.createElement('div');
            dayDiv.className = 'heatmap-day';
            dayDiv.setAttribute('data-level', day.level);
            dayDiv.setAttribute('data-date', day.dateStr);
            dayDiv.setAttribute('data-count', day.count);
            dayDiv.title = `${day.count} problems on ${day.dateStr}`;
            weeksContainer.appendChild(dayDiv);
        });
    });
    
    mainArea.appendChild(months);
    mainArea.appendChild(weeksContainer);
    
    grid.appendChild(labels);
    grid.appendChild(mainArea);
    container.appendChild(grid);
}

function renderSkills() {
    const container = document.getElementById('skills-grid');
    container.innerHTML = '';
    
    Object.entries(TOPICS_META).forEach(([topic, meta]) => {
        const [startId, endId] = TOPIC_ID_RANGES[topic];
        const topicSolved = Array.from(solvedQuestions).filter(
            id => id >= startId && id <= endId
        ).length;
        const percentage = Math.round((topicSolved / meta.count) * 100);
        
        const card = document.createElement('div');
        card.className = 'skill-card';
        card.onclick = () => window.location.href = `topic.html?name=${encodeURIComponent(topic)}`;
        
        card.innerHTML = `
            <div class="skill-header">
                <span class="skill-name">${topic}</span>
                <span class="skill-progress">${percentage}%</span>
            </div>
            <div class="skill-bar">
                <div class="skill-bar-fill" style="width: ${percentage}%"></div>
            </div>
            <div class="skill-details">
                <span>${topicSolved}/${meta.count} solved</span>
                <span>•</span>
                <span>E: ${meta.easy} M: ${meta.medium} H: ${meta.hard}</span>
            </div>
        `;
        container.appendChild(card);
    });
}

function renderRecentSubmissions() {
    const container = document.getElementById('recent-submissions-list');
    
    if (solvedQuestions.size === 0) {
        container.innerHTML = `
            <div class="submission-item">
                <div>
                    <div class="submission-title">No recent submissions</div>
                    <div class="submission-date">Start solving problems to see your activity</div>
                </div>
            </div>
        `;
        return;
    }
    
    // Show last 5 solved (mock data - replace with actual submission history)
    const recentSolved = Array.from(solvedQuestions).slice(-5).reverse();
    container.innerHTML = '';
    
    recentSolved.forEach(id => {
        const difficulty = id % 3 === 0 ? 'hard' : id % 2 === 0 ? 'medium' : 'easy';
        const item = document.createElement('div');
        item.className = 'submission-item';
        item.innerHTML = `
            <div>
                <div class="submission-title">Problem #${id}</div>
                <div class="submission-date">Recently solved</div>
            </div>
            <div class="submission-difficulty ${difficulty}">${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}</div>
        `;
        container.appendChild(item);
    });
}
