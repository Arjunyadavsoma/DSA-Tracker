import { auth, db } from './firebase-config.js';
import { doc, getDoc, setDoc } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';

let questionsData = {};
let userProgress = {};
let currentUser = null;
let expandedTopics = new Set(); // Track which topics are expanded

// Check authentication and display user info
onAuthStateChanged(auth, (user) => {
    if (user) {
        currentUser = user;
        displayUserInfo(user);
    } else {
        window.location.href = 'login.html';
    }
});

// Display user information
function displayUserInfo(user) {
    const displayName = user.displayName || user.email.split('@')[0];
    const userDisplayElement = document.getElementById('user-display-name');
    const userNameElement = document.getElementById('user-name');
    
    if (userDisplayElement) {
        userDisplayElement.textContent = displayName;
    }
    
    if (userNameElement) {
        userNameElement.textContent = displayName;
    }
}

// Scroll to topics section
window.scrollToTopics = function() {
    document.getElementById('topics-section')?.scrollIntoView({ 
        behavior: 'smooth' 
    });
};

// Show stats (scroll to stats)
window.showStats = function() {
    document.querySelector('.stats-section')?.scrollIntoView({ 
        behavior: 'smooth' 
    });
};

// Load questions data
async function loadQuestions() {
    try {
        const response = await fetch('./data/questions.json');
        questionsData = await response.json();
        await loadUserProgress();
        renderTopics();
        updateStats();
    } catch (error) {
        console.error('Error loading questions:', error);
        showError('Failed to load questions. Please refresh the page.');
    }
}

// Show error message
function showError(message) {
    const container = document.getElementById('topics-container');
    if (container) {
        container.innerHTML = `
            <div style="text-align: center; padding: 2rem; color: var(--danger-color);">
                <p>${message}</p>
            </div>
        `;
    }
}

// Load user progress from Firestore or localStorage
async function loadUserProgress() {
    const user = auth.currentUser;
    
    if (user) {
        try {
            const docRef = doc(db, 'userProgress', user.uid);
            const docSnap = await getDoc(docRef);
            
            if (docSnap.exists()) {
                userProgress = docSnap.data();
            } else {
                userProgress = {};
            }
        } catch (error) {
            console.error('Error loading progress:', error);
            userProgress = JSON.parse(localStorage.getItem('dsaProgress') || '{}');
        }
    } else {
        userProgress = JSON.parse(localStorage.getItem('dsaProgress') || '{}');
    }
}

// Save user progress
async function saveUserProgress() {
    const user = auth.currentUser;
    
    if (user) {
        try {
            await setDoc(doc(db, 'userProgress', user.uid), userProgress);
        } catch (error) {
            console.error('Error saving progress:', error);
        }
    }
    
    localStorage.setItem('dsaProgress', JSON.stringify(userProgress));
}

// Render topics
function renderTopics() {
    const container = document.getElementById('topics-container');
    if (!container) return;
    
    container.innerHTML = '';
    
    Object.keys(questionsData).forEach(topic => {
        const topicCard = createTopicCard(topic, questionsData[topic]);
        container.appendChild(topicCard);
    });
}

// Create topic card with expand/collapse
function createTopicCard(topicName, questions) {
    const solvedCount = questions.filter(q => userProgress[q.id]).length;
    const totalCount = questions.length;
    const isExpanded = expandedTopics.has(topicName);
    
    const card = document.createElement('div');
    card.className = 'topic-card';
    card.innerHTML = `
        <div class="topic-header" data-topic="${topicName}">
            <div class="topic-title-section">
                <span class="topic-expand-icon">${isExpanded ? '▼' : '▶'}</span>
                <h3>${topicName}</h3>
            </div>
            <div class="topic-stats">
                <span class="topic-progress">${solvedCount}/${totalCount} solved</span>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${totalCount > 0 ? (solvedCount/totalCount)*100 : 0}%"></div>
                </div>
            </div>
        </div>
        <div class="questions-content" style="display: ${isExpanded ? 'block' : 'none'};">
            <table class="questions-table">
                <thead>
                    <tr>
                        <th style="width: 60px;">Status</th>
                        <th>Problem</th>
                        <th style="width: 120px;">Difficulty</th>
                        <th style="width: 180px;">Link</th>
                    </tr>
                </thead>
                <tbody>
                    ${questions.map(q => createQuestionRow(q)).join('')}
                </tbody>
            </table>
        </div>
    `;
    
    // Add click event to header for expand/collapse
    const header = card.querySelector('.topic-header');
    header.addEventListener('click', () => toggleTopic(topicName, card));
    
    // Add checkbox listeners
    card.querySelectorAll('.checkbox-custom').forEach(checkbox => {
        checkbox.addEventListener('change', handleCheckboxChange);
        // Prevent checkbox click from toggling topic
        checkbox.addEventListener('click', (e) => e.stopPropagation());
    });
    
    // Prevent link clicks from toggling topic
    card.querySelectorAll('.leetcode-link').forEach(link => {
        link.addEventListener('click', (e) => e.stopPropagation());
    });
    
    return card;
}

// Toggle topic expand/collapse
function toggleTopic(topicName, card) {
    const content = card.querySelector('.questions-content');
    const icon = card.querySelector('.topic-expand-icon');
    
    if (expandedTopics.has(topicName)) {
        expandedTopics.delete(topicName);
        content.style.display = 'none';
        icon.textContent = '▶';
    } else {
        expandedTopics.add(topicName);
        content.style.display = 'block';
        icon.textContent = '▼';
    }
}

// Create question row
function createQuestionRow(question) {
    const isCompleted = userProgress[question.id] || false;
    const difficultyClass = `difficulty-${question.difficulty.toLowerCase()}`;
    
    return `
        <tr class="question-row ${isCompleted ? 'completed' : ''}" data-question-id="${question.id}">
            <td>
                <input 
                    type="checkbox" 
                    class="checkbox-custom" 
                    ${isCompleted ? 'checked' : ''} 
                    data-question-id="${question.id}"
                    title="${isCompleted ? 'Mark as incomplete' : 'Mark as complete'}"
                >
            </td>
            <td class="question-name">${question.name}</td>
            <td><span class="difficulty-badge ${difficultyClass}">${question.difficulty}</span></td>
            <td>
                <a href="${question.leetcodeUrl}" target="_blank" rel="noopener noreferrer" class="leetcode-link">
                    Solve on LeetCode →
                </a>
            </td>
        </tr>
    `;
}

// Handle checkbox change
async function handleCheckboxChange(e) {
    const questionId = parseInt(e.target.dataset.questionId);
    const isChecked = e.target.checked;
    
    userProgress[questionId] = isChecked;
    await saveUserProgress();
    
    // Update row appearance
    const row = e.target.closest('.question-row');
    if (isChecked) {
        row.classList.add('completed');
        e.target.title = 'Mark as incomplete';
    } else {
        row.classList.remove('completed');
        e.target.title = 'Mark as complete';
    }
    
    // Update the topic card progress
    const topicCard = e.target.closest('.topic-card');
    const topicName = topicCard.querySelector('.topic-header').dataset.topic;
    updateTopicProgress(topicCard, topicName);
    
    updateStats();
}

// Update topic progress bar and count
function updateTopicProgress(topicCard, topicName) {
    const questions = questionsData[topicName];
    const solvedCount = questions.filter(q => userProgress[q.id]).length;
    const totalCount = questions.length;
    const percentage = totalCount > 0 ? (solvedCount / totalCount) * 100 : 0;
    
    const progressText = topicCard.querySelector('.topic-progress');
    const progressFill = topicCard.querySelector('.progress-fill');
    
    if (progressText) {
        progressText.textContent = `${solvedCount}/${totalCount} solved`;
    }
    
    if (progressFill) {
        progressFill.style.width = `${percentage}%`;
    }
}

// Update statistics
function updateStats() {
    const totalQuestions = Object.values(questionsData).flat().length;
    const totalSolved = Object.values(userProgress).filter(Boolean).length;
    const percentage = totalQuestions > 0 ? ((totalSolved / totalQuestions) * 100).toFixed(1) : 0;
    
    const totalSolvedEl = document.getElementById('total-solved');
    const totalQuestionsEl = document.getElementById('total-questions');
    const progressPercentageEl = document.getElementById('progress-percentage');
    
    if (totalSolvedEl) totalSolvedEl.textContent = totalSolved;
    if (totalQuestionsEl) totalQuestionsEl.textContent = totalQuestions;
    if (progressPercentageEl) progressPercentageEl.textContent = percentage + '%';
}

// Filter questions
function filterQuestions() {
    const searchTerm = document.getElementById('search-box')?.value.toLowerCase() || '';
    const difficulty = document.getElementById('difficulty-filter')?.value || 'all';
    
    document.querySelectorAll('.question-row').forEach(row => {
        const questionName = row.querySelector('.question-name')?.textContent.toLowerCase() || '';
        const questionDifficulty = row.querySelector('.difficulty-badge')?.textContent || '';
        
        const matchesSearch = questionName.includes(searchTerm);
        const matchesDifficulty = difficulty === 'all' || questionDifficulty === difficulty;
        
        row.style.display = (matchesSearch && matchesDifficulty) ? '' : 'none';
    });
    
    // Hide topics with no visible questions
    document.querySelectorAll('.topic-card').forEach(card => {
        const visibleRows = Array.from(card.querySelectorAll('.question-row'))
            .filter(row => row.style.display !== 'none');
        card.style.display = visibleRows.length > 0 ? '' : 'none';
    });
}

// Expand all topics
window.expandAll = function() {
    document.querySelectorAll('.topic-card').forEach(card => {
        const topicName = card.querySelector('.topic-header').dataset.topic;
        const content = card.querySelector('.questions-content');
        const icon = card.querySelector('.topic-expand-icon');
        
        expandedTopics.add(topicName);
        content.style.display = 'block';
        icon.textContent = '▼';
    });
};

// Collapse all topics
window.collapseAll = function() {
    document.querySelectorAll('.topic-card').forEach(card => {
        const topicName = card.querySelector('.topic-header').dataset.topic;
        const content = card.querySelector('.questions-content');
        const icon = card.querySelector('.topic-expand-icon');
        
        expandedTopics.delete(topicName);
        content.style.display = 'none';
        icon.textContent = '▶';
    });
};

// Initialize on page load
if (document.getElementById('topics-container')) {
    loadQuestions();
    
    // Attach search/filter event listeners
    const searchBox = document.getElementById('search-box');
    const difficultyFilter = document.getElementById('difficulty-filter');
    
    if (searchBox) {
        searchBox.addEventListener('input', filterQuestions);
    }
    
    if (difficultyFilter) {
        difficultyFilter.addEventListener('change', filterQuestions);
    }
}
