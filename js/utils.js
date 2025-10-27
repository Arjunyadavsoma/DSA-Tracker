// Utility functions

// Format date
function formatDate(date) {
    return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

// Export progress as JSON
function exportProgress() {
    const dataStr = JSON.stringify(userProgress, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = 'dsa-progress-export.json';
    link.click();
}

// Calculate streak
function calculateStreak(progressHistory) {
    // Implementation for tracking daily streak
    // This would require storing dates of completed problems
    return 0;
}
