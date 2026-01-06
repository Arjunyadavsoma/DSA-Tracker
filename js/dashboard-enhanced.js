import { auth, db } from './firebase-config.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { doc, getDoc } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

const TOPICS_META = {
    "Array": { count: 36, easy: 12, medium: 18, hard: 6, pattern: "Two Pointers, Sliding Window" },
    "Matrix": { count: 10, easy: 2, medium: 5, hard: 3, pattern: "Grid Traversal" },
    "String": { count: 43, easy: 8, medium: 25, hard: 10, pattern: "Hashing, Frequency Map" },
    "Searching & Sorting": { count: 36, easy: 6, medium: 20, hard: 10, pattern: "Binary Search" },
    "LinkedList": { count: 36, easy: 10, medium: 20, hard: 6, pattern: "Fast-Slow Pointers" },
    "Binary Trees": { count: 35, easy: 8, medium: 22, hard: 5, pattern: "DFS, BFS, Traversals" },
    "Binary Search Trees": { count: 22, easy: 4, medium: 12, hard: 6, pattern: "In-order Traversal" },
    "Greedy": { count: 35, easy: 8, medium: 20, hard: 7, pattern: "Optimization" },
    "BackTracking": { count: 19, easy: 0, medium: 8, hard: 11, pattern: "Recursion, Pruning" },
    "Stacks and Queues": { count: 38, easy: 10, medium: 20, hard: 8, pattern: "Monotonic Stack" },
    "Heap": { count: 18, easy: 4, medium: 10, hard: 4, pattern: "Priority Queue" },
    "Graph": { count: 44, easy: 4, medium: 25, hard: 15, pattern: "BFS, DFS, Shortest Path" },
    "Trie": { count: 6, easy: 0, medium: 5, hard: 1, pattern: "Prefix Tree" },
    "Dynamic Programming": { count: 60, easy: 6, medium: 40, hard: 14, pattern: "Memoization, Tabulation" },
    "Bit Manipulation": { count: 10, easy: 5, medium: 4, hard: 1, pattern: "Bitwise Operations" }
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

const CORE_PATTERNS = [
    { name: "Two Pointers", topics: ["Array", "String"] },
    { name: "Sliding Window", topics: ["Array", "String"] },
    { name: "Binary Search", topics: ["Searching & Sorting"] },
    { name: "DFS/BFS", topics: ["Binary Trees", "Graph"] },
    { name: "Dynamic Programming", topics: ["Dynamic Programming"] },
    { name: "Backtracking", topics: ["BackTracking"] },
    { name: "Greedy", topics: ["Greedy"] },
    { name: "Stack/Queue", topics: ["Stacks and Queues"] }
];

let solvedQuestions = new Set();
let solvingHistory = {};
let currentUser = null;

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

// Generate demo data for testing (REMOVE IN PRODUCTION)
function generateDemoData() {
    const demo = {};
    const today = new Date();
    
    // Generate random activity for last 90 days
    for (let i = 0; i < 90; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        
        // Random chance of activity
        if (Math.random() > 0.3) {
            const numProblems = Math.floor(Math.random() * 8) + 1;
            const problems = [];
            for (let j = 0; j < numProblems; j++) {
                problems.push(Math.floor(Math.random() * 447) + 1);
            }
            demo[dateStr] = problems;
        }
    }
    
    return demo;
}

onAuthStateChanged(auth, async (user) => {
    if (user) {
        currentUser = user;
        const displayName = user.displayName || user.email.split('@')[0];
        const displayNameEl = document.getElementById('user-display-name');
        if (displayNameEl) displayNameEl.textContent = displayName;
        
        await loadProgress(user.uid);
        renderDashboard();
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
            solvingHistory = data.history || {};
            
            // If no history, generate demo data for testing
            if (Object.keys(solvingHistory).length === 0) {
                solvingHistory = generateDemoData();
                console.log('Demo data generated for testing');
            }
        } else {
            // Generate demo data for new users
            solvingHistory = generateDemoData();
        }
    } catch (error) {
        console.error('Error loading progress:', error);
        const saved = localStorage.getItem('solvedQuestions');
        if (saved) {
            try {
                solvedQuestions = new Set(JSON.parse(saved));
            } catch (e) {
                solvedQuestions = new Set();
            }
        }
        
        const historySaved = localStorage.getItem('solvingHistory');
        if (historySaved) {
            try {
                solvingHistory = JSON.parse(historySaved);
            } catch (e) {
                solvingHistory = generateDemoData();
            }
        } else {
            solvingHistory = generateDemoData();
        }
    }
}

function hideLoading() {
    const loadingIndicator = document.getElementById('loading-indicator');
    const dashboardData = document.getElementById('dashboard-data');
    
    if (loadingIndicator && dashboardData) {
        setTimeout(() => {
            loadingIndicator.style.display = 'none';
            dashboardData.style.opacity = '1';
        }, 300);
    }
}

function renderDashboard() {
    updatePrimaryStats();
    renderHeatmap();
    updateDifficultyStats();
    renderPatternProgress();
    renderTopicsGrid();
    renderRecentActivity();
}

function updatePrimaryStats() {
    const totalSolved = solvedQuestions.size;
    const percentage = totalQuestions > 0 ? Math.round((totalSolved / totalQuestions) * 100) : 0;
    
    const updateElement = (id, value) => {
        const el = document.getElementById(id);
        if (el) el.textContent = value;
    };
    
    updateElement('total-solved', totalSolved);
    updateElement('total-questions', totalQuestions);
    updateElement('completion-rate', percentage + '%');
    
    const { current, max } = calculateStreaks();
    updateElement('current-streak', current);
    updateElement('max-streak', max);
    
    const weekSolved = getWeekActivity();
    updateElement('week-solved', weekSolved);
}

function calculateStreaks() {
    const dates = Object.keys(solvingHistory).sort().reverse();
    if (dates.length === 0) return { current: 0, max: 0 };
    
    let currentStreak = 0;
    let maxStreak = 0;
    let tempStreak = 0;
    
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    
    if (dates[0] === today || dates[0] === yesterday) {
        currentStreak = 1;
        let checkDate = new Date(dates[0]);
        
        for (let i = 1; i < dates.length; i++) {
            checkDate = new Date(checkDate.getTime() - 86400000);
            const expectedDate = checkDate.toISOString().split('T')[0];
            
            if (dates[i] === expectedDate) {
                currentStreak++;
            } else {
                break;
            }
        }
    }
    
    tempStreak = 1;
    for (let i = 1; i < dates.length; i++) {
        const prevDate = new Date(dates[i - 1]);
        const currDate = new Date(dates[i]);
        const diffDays = Math.floor((prevDate - currDate) / 86400000);
        
        if (diffDays === 1) {
            tempStreak++;
            maxStreak = Math.max(maxStreak, tempStreak);
        } else {
            tempStreak = 1;
        }
    }
    
    maxStreak = Math.max(maxStreak, currentStreak, tempStreak);
    return { current: currentStreak, max: maxStreak };
}

function getWeekActivity() {
    const now = Date.now();
    const weekAgo = now - (7 * 86400000);
    
    return Object.entries(solvingHistory)
        .filter(([date]) => new Date(date).getTime() >= weekAgo)
        .reduce((sum, [, ids]) => sum + ids.length, 0);
}

function renderHeatmap() {
    const container = document.getElementById('heatmap-container');
    if (!container) return;
    
    container.innerHTML = '';
    
    const today = new Date();
    const oneYearAgo = new Date(today);
    oneYearAgo.setFullYear(today.getFullYear() - 1);
    
    const activityMap = {};
    let maxCount = 0;
    let totalInYear = 0;
    let bestDayCount = 0;
    
    Object.entries(solvingHistory).forEach(([date, ids]) => {
        const dateObj = new Date(date);
        if (dateObj >= oneYearAgo && dateObj <= today) {
            activityMap[date] = ids.length;
            maxCount = Math.max(maxCount, ids.length);
            totalInYear += ids.length;
            bestDayCount = Math.max(bestDayCount, ids.length);
        }
    });
    
    const weeks = [];
    let currentWeek = [];
    let currentDate = new Date(oneYearAgo);
    
    while (currentDate.getDay() !== 0) {
        currentDate.setDate(currentDate.getDate() - 1);
    }
    
    while (currentDate <= today) {
        const dateStr = currentDate.toISOString().split('T')[0];
        const count = activityMap[dateStr] || 0;
        const level = count === 0 ? 0 : Math.min(Math.ceil((count / Math.max(maxCount, 1)) * 4), 4);
        
        currentWeek.push({
            date: dateStr,
            count: count,
            level: level,
            day: currentDate.getDay()
        });
        
        if (currentDate.getDay() === 6) {
            weeks.push([...currentWeek]);
            currentWeek = [];
        }
        
        currentDate.setDate(currentDate.getDate() + 1);
    }
    
    if (currentWeek.length > 0) {
        weeks.push(currentWeek);
    }
    
    const monthLabels = document.createElement('div');
    monthLabels.className = 'heatmap-months';
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    let lastMonth = -1;
    
    weeks.forEach((week, weekIndex) => {
        if (week.length === 0) return;
        const firstDay = new Date(week[0].date);
        const month = firstDay.getMonth();
        
        if (month !== lastMonth && weekIndex > 0) {
            const label = document.createElement('span');
            label.textContent = months[month];
            label.style.gridColumn = weekIndex + 1;
            monthLabels.appendChild(label);
            lastMonth = month;
        }
    });
    
    container.appendChild(monthLabels);
    
    const dayLabels = document.createElement('div');
    dayLabels.className = 'heatmap-days';
    ['Mon', 'Wed', 'Fri'].forEach((day, index) => {
        const label = document.createElement('span');
        label.textContent = day;
        label.style.gridRow = index * 2 + 2;
        dayLabels.appendChild(label);
    });
    container.appendChild(dayLabels);
    
    const grid = document.createElement('div');
    grid.className = 'heatmap-grid';
    
    weeks.forEach(week => {
        week.forEach(day => {
            const cell = document.createElement('div');
            cell.className = `heatmap-cell level-${day.level}`;
            cell.title = `${day.date}: ${day.count} problem${day.count !== 1 ? 's' : ''}`;
            grid.appendChild(cell);
        });
    });
    
    container.appendChild(grid);
    
    const totalEl = document.getElementById('heatmap-total');
    const bestDayEl = document.getElementById('heatmap-best-day');
    
    if (totalEl) totalEl.textContent = `${totalInYear} problem${totalInYear !== 1 ? 's' : ''} in last year`;
    if (bestDayEl) bestDayEl.textContent = `Best day: ${bestDayCount} problem${bestDayCount !== 1 ? 's' : ''}`;
}

function updateDifficultyStats() {
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
    
    const easyPercent = totalEasy > 0 ? Math.round((easySolved / totalEasy) * 100) : 0;
    const mediumPercent = totalMedium > 0 ? Math.round((mediumSolved / totalMedium) * 100) : 0;
    const hardPercent = totalHard > 0 ? Math.round((hardSolved / totalHard) * 100) : 0;
    
    const updateDifficultyUI = (prefix, solved, total, percent) => {
        const solvedEl = document.getElementById(`${prefix}-solved`);
        const totalEl = document.getElementById(`${prefix}-total`);
        const barEl = document.getElementById(`${prefix}-bar`);
        const percentEl = document.getElementById(`${prefix}-percentage`);
        
        if (solvedEl) solvedEl.textContent = solved;
        if (totalEl) totalEl.textContent = total;
        if (barEl) barEl.style.width = `${percent}%`;
        if (percentEl) percentEl.textContent = `${percent}%`;
    };
    
    updateDifficultyUI('easy', easySolved, totalEasy, easyPercent);
    updateDifficultyUI('medium', mediumSolved, totalMedium, mediumPercent);
    updateDifficultyUI('hard', hardSolved, totalHard, hardPercent);
}

function renderPatternProgress() {
    const container = document.getElementById('patterns-grid');
    if (!container) return;
    
    container.innerHTML = '';
    
    CORE_PATTERNS.forEach(pattern => {
        let patternSolved = 0;
        let patternTotal = 0;
        
        pattern.topics.forEach(topic => {
            const meta = TOPICS_META[topic];
            if (!meta) return;
            
            const [startId, endId] = TOPIC_ID_RANGES[topic];
            const topicSolved = Array.from(solvedQuestions).filter(
                id => id >= startId && id <= endId
            ).length;
            
            patternSolved += topicSolved;
            patternTotal += meta.count;
        });
        
        const percentage = patternTotal > 0 ? Math.round((patternSolved / patternTotal) * 100) : 0;
        const circumference = 282.7;
        const strokeDasharray = `${percentage * 2.827} ${circumference}`;
        
        const card = document.createElement('div');
        card.className = 'pattern-card';
        card.innerHTML = `
            <div class="pattern-ring">
                <svg viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="45" class="ring-bg"></circle>
                    <circle cx="50" cy="50" r="45" class="ring-fill" 
                            style="stroke-dasharray: ${strokeDasharray};"></circle>
                </svg>
                <div class="ring-text">${percentage}%</div>
            </div>
            <h4>${pattern.name}</h4>
            <p>${patternSolved}/${patternTotal}</p>
        `;
        container.appendChild(card);
    });
}

function renderTopicsGrid() {
    const container = document.getElementById('topics-grid');
    if (!container) return;
    
    container.innerHTML = '';
    
    Object.entries(TOPICS_META).forEach(([topic, meta]) => {
        const [startId, endId] = TOPIC_ID_RANGES[topic];
        const topicSolved = Array.from(solvedQuestions).filter(
            id => id >= startId && id <= endId
        ).length;
        
        const topicPercentage = meta.count > 0 ? Math.round((topicSolved / meta.count) * 100) : 0;
        
        const card = document.createElement('div');
        card.className = 'topic-card';
        card.onclick = () => window.location.href = `topic.html?name=${encodeURIComponent(topic)}`;
        
        let statusClass = 'not-started';
        if (topicPercentage === 100) statusClass = 'completed';
        else if (topicPercentage > 0) statusClass = 'in-progress';
        
        card.innerHTML = `
            <div class="topic-header">
                <h4>${topic}</h4>
                <span class="topic-status ${statusClass}">${topicPercentage}%</span>
            </div>
            <div class="topic-meta">
                <span>${topicSolved}/${meta.count} solved</span>
            </div>
            <div class="topic-progress-bar">
                <div class="topic-progress-fill" style="width: ${topicPercentage}%;"></div>
            </div>
            <div class="topic-pattern">${meta.pattern}</div>
        `;
        
        container.appendChild(card);
    });
}

function renderRecentActivity() {
    const container = document.getElementById('recent-activity-list');
    if (!container) return;
    
    const recentDates = Object.keys(solvingHistory)
        .sort()
        .reverse()
        .slice(0, 7);
    
    if (recentDates.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <span class="empty-icon">📝</span>
                <p>No recent activity. Start solving problems!</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = '';
    
    recentDates.forEach(date => {
        const ids = solvingHistory[date];
        const dateObj = new Date(date);
        const formattedDate = dateObj.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric',
            year: 'numeric'
        });
        
        const item = document.createElement('div');
        item.className = 'activity-item';
        item.innerHTML = `
            <div class="activity-date">
                <span class="activity-icon">✅</span>
                <span>${formattedDate}</span>
            </div>
            <div class="activity-content">
                <strong>${ids.length} problem${ids.length > 1 ? 's' : ''} solved</strong>
                <div class="activity-ids">${ids.slice(0, 5).map(id => `#${id}`).join(', ')}${ids.length > 5 ? '...' : ''}</div>
            </div>
        `;
        
        container.appendChild(item);
    });
}
