import { auth, db } from './firebase-config.js';
import { doc, getDoc } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

let userProgress = {};
const TOTAL_QUESTIONS = 65; // Update this based on your questions.json

// Redirect to questions page
window.goToQuestions = function() {
    window.location.href = 'questions.html';
};

// Scroll to stats
window.scrollToStats = function() {
    document.getElementById('stats-section')?.scrollIntoView({ 
        behavior: 'smooth' 
    });
};

// Load user progress
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
    
    updateStats();
}

// Update statistics
function updateStats() {
    const totalSolved = Object.values(userProgress).filter(Boolean).length;
    const percentage = TOTAL_QUESTIONS > 0 ? ((totalSolved / TOTAL_QUESTIONS) * 100).toFixed(1) : 0;
    
    // Update stat cards
    const totalSolvedEl = document.getElementById('total-solved');
    const totalQuestionsEl = document.getElementById('total-questions');
    const progressPercentageEl = document.getElementById('progress-percentage');
    
    if (totalSolvedEl) totalSolvedEl.textContent = totalSolved;
    if (totalQuestionsEl) totalQuestionsEl.textContent = TOTAL_QUESTIONS;
    if (progressPercentageEl) progressPercentageEl.textContent = percentage + '%';
    
    // Update motivation text
    updateMotivationText(totalSolved, percentage);
    
    // Update weekly progress (simplified)
    const weeklyEl = document.getElementById('weekly-progress');
    if (weeklyEl) {
        weeklyEl.textContent = `${totalSolved} problems solved`;
    }
    
    // Update next milestone
    updateNextMilestone(totalSolved);
}

// Update motivation text based on progress
function updateMotivationText(solved, percentage) {
    const motivationEl = document.getElementById('motivation-text');
    if (!motivationEl) return;
    
    let message = '';
    
    if (solved === 0) {
        message = "Start your journey! Solve your first problem today 💪";
    } else if (solved < 10) {
        message = `Great start! You've solved ${solved} problems. Keep going! 🎉`;
    } else if (solved < 25) {
        message = `Awesome progress! ${solved} problems down! 🚀`;
    } else if (solved < 50) {
        message = `You're on fire! ${solved} problems solved! 🔥`;
    } else if (percentage < 100) {
        message = `Amazing! You've completed ${percentage}% of all problems! 🌟`;
    } else {
        message = "Congratulations! You've completed all problems! 🏆";
    }
    
    motivationEl.textContent = message;
}

// Update next milestone
function updateNextMilestone(solved) {
    const milestoneEl = document.getElementById('next-milestone');
    if (!milestoneEl) return;
    
    let milestone = '';
    
    if (solved === 0) {
        milestone = "Solve your first problem!";
    } else if (solved < 10) {
        milestone = `${10 - solved} more to reach 10 problems!`;
    } else if (solved < 25) {
        milestone = `${25 - solved} more to reach 25 problems!`;
    } else if (solved < 50) {
        milestone = `${50 - solved} more to reach 50 problems!`;
    } else if (solved < TOTAL_QUESTIONS) {
        milestone = `${TOTAL_QUESTIONS - solved} more to complete all!`;
    } else {
        milestone = "All problems completed! 🎉";
    }
    
    milestoneEl.textContent = milestone;
}

// Initialize
if (document.getElementById('dashboard-content')) {
    // Wait a bit for auth to complete
    setTimeout(loadUserProgress, 1000);
}
