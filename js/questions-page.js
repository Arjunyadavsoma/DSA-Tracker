let expandedTopics = new Set();
let currentView = 'topics';
let currentSort = 'default';
let questionsData = window.QUESTIONS_DATA;
let allQuestions = [];

// Initialize
window.addEventListener('DOMContentLoaded', () => {
    initializeData();
    populateTopicFilter();
    loadQuestions();
    attachEventListeners();
});

// Initialize flat questions array
function initializeData() {
    allQuestions = [];
    Object.keys(questionsData).forEach(topic => {
        questionsData[topic].forEach(q => {
            allQuestions.push({ ...q, topic });
        });
    });
}

// Populate topic filter
function populateTopicFilter() {
    const topicFilter = document.getElementById('topic-filter');
    Object.keys(questionsData).forEach(topic => {
        const option = document.createElement('option');
        option.value = topic;
        option.textContent = topic;
        topicFilter.appendChild(option);
    });
}

// Load questions
function loadQuestions() {
    document.getElementById('loading').style.display = 'none';
    renderCurrentView();
    updateStats();
    document.getElementById('stats-panel').style.display = 'flex';
}

// Render current view
function renderCurrentView() {
    if (currentView === 'topics') {
        renderTopicsView();
    } else {
        renderListView();
    }
}

// Render topics view
function renderTopicsView() {
    const container = document.getElementById('topics-view');
    const listView = document.getElementById('list-view');
    
    container.innerHTML = '';
    container.style.display = 'block';
    listView.style.display = 'none';
    
    const filteredData = getFilteredData();
    const sortedData = getSortedData(filteredData);
    
    Object.keys(sortedData).forEach(topic => {
        if (sortedData[topic].length > 0) {
            const card = createTopicCard(topic, sortedData[topic]);
            container.appendChild(card);
        }
    });
    
    updateResultsCount();
}

// Render list view
function renderListView() {
    const container = document.getElementById('list-view');
    const topicsView = document.getElementById('topics-view');
    const tbody = document.getElementById('list-view-body');
    
    container.style.display = 'block';
    topicsView.style.display = 'none';
    tbody.innerHTML = '';
    
    const filtered = getFilteredQuestions();
    const sorted = sortQuestions(filtered);
    
    sorted.forEach((q, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="question-number">${index + 1}</td>
            <td class="question-name">${q.name}</td>
            <td><span class="topic-badge">${q.topic}</span></td>
            <td><span class="difficulty-badge difficulty-${q.difficulty.toLowerCase()}">${q.difficulty}</span></td>
            <td><a href="${q.leetcodeUrl}" target="_blank" class="leetcode-link">Solve →</a></td>
        `;
        tbody.appendChild(row);
    });
    
    updateResultsCount();
}

// Create topic card
function createTopicCard(topicName, questions) {
    const isExpanded = expandedTopics.has(topicName);
    const card = document.createElement('div');
    card.className = 'topic-card';
    
    const percentage = 0; // Can be enhanced with progress tracking
    
    card.innerHTML = `
        <div class="topic-header" onclick="toggleTopic('${topicName}', this)">
            <div class="topic-title-section">
                <span class="topic-expand-icon">${isExpanded ? '▼' : '▶'}</span>
                <h3>${topicName}</h3>
                <span class="topic-count">${questions.length} problems</span>
            </div>
            <div class="topic-progress-bar">
                <div class="progress-fill" style="width: ${percentage}%"></div>
            </div>
        </div>
        <div class="questions-content" style="display: ${isExpanded ? 'block' : 'none'};">
            <table class="questions-table">
                <thead>
                    <tr>
                        <th style="width: 50px;">#</th>
                        <th>Problem Name</th>
                        <th style="width: 120px;">Difficulty</th>
                        <th style="width: 120px;">Action</th>
                    </tr>
                </thead>
                <tbody>
                    ${questions.map((q, i) => `
                        <tr class="question-row">
                            <td class="question-number">${i + 1}</td>
                            <td class="question-name">${q.name}</td>
                            <td><span class="difficulty-badge difficulty-${q.difficulty.toLowerCase()}">${q.difficulty}</span></td>
                            <td><a href="${q.leetcodeUrl}" target="_blank" class="leetcode-link">Solve →</a></td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
    
    return card;
}

// Toggle topic
function toggleTopic(topicName, element) {
    const card = element.closest('.topic-card');
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

// Expand/Collapse all
window.expandAll = function() {
    Object.keys(questionsData).forEach(topic => expandedTopics.add(topic));
    renderCurrentView();
};

window.collapseAll = function() {
    expandedTopics.clear();
    renderCurrentView();
};

// Get filtered data
function getFilteredData() {
    const searchTerm = document.getElementById('search-box').value.toLowerCase();
    const difficulty = document.getElementById('difficulty-filter').value;
    const topicFilter = document.getElementById('topic-filter').value;
    
    const filtered = {};
    
    Object.keys(questionsData).forEach(topic => {
        if (topicFilter !== 'all' && topic !== topicFilter) return;
        
        filtered[topic] = questionsData[topic].filter(q => {
            const matchesSearch = q.name.toLowerCase().includes(searchTerm);
            const matchesDifficulty = difficulty === 'all' || q.difficulty === difficulty;
            return matchesSearch && matchesDifficulty;
        });
    });
    
    return filtered;
}

// Get filtered questions (for list view)
function getFilteredQuestions() {
    const searchTerm = document.getElementById('search-box').value.toLowerCase();
    const difficulty = document.getElementById('difficulty-filter').value;
    const topicFilter = document.getElementById('topic-filter').value;
    
    return allQuestions.filter(q => {
        const matchesSearch = q.name.toLowerCase().includes(searchTerm);
        const matchesDifficulty = difficulty === 'all' || q.difficulty === difficulty;
        const matchesTopic = topicFilter === 'all' || q.topic === topicFilter;
        return matchesSearch && matchesDifficulty && matchesTopic;
    });
}

// Sort data
function getSortedData(data) {
    const sorted = {};
    Object.keys(data).forEach(topic => {
        sorted[topic] = sortQuestions(data[topic]);
    });
    return sorted;
}

// Sort questions
function sortQuestions(questions) {
    const sorted = [...questions];
    
    switch(currentSort) {
        case 'name-asc':
            sorted.sort((a, b) => a.name.localeCompare(b.name));
            break;
        case 'name-desc':
            sorted.sort((a, b) => b.name.localeCompare(a.name));
            break;
        case 'difficulty-asc':
            sorted.sort((a, b) => {
                const order = { 'Easy': 1, 'Medium': 2, 'Hard': 3 };
                return order[a.difficulty] - order[b.difficulty];
            });
            break;
        case 'difficulty-desc':
            sorted.sort((a, b) => {
                const order = { 'Easy': 1, 'Medium': 2, 'Hard': 3 };
                return order[b.difficulty] - order[a.difficulty];
            });
            break;
    }
    
    return sorted;
}

// Update stats
function updateStats() {
    const filtered = getFilteredQuestions();
    document.getElementById('total-questions').textContent = allQuestions.length;
    document.getElementById('total-topics').textContent = Object.keys(questionsData).length;
    document.getElementById('easy-count').textContent = allQuestions.filter(q => q.difficulty === 'Easy').length;
    document.getElementById('medium-count').textContent = allQuestions.filter(q => q.difficulty === 'Medium').length;
    document.getElementById('hard-count').textContent = allQuestions.filter(q => q.difficulty === 'Hard').length;
}

// Update results count
function updateResultsCount() {
    const filtered = getFilteredQuestions();
    const count = filtered.length;
    document.getElementById('results-count').textContent = `${count} question${count !== 1 ? 's' : ''}`;
}

// Attach event listeners
function attachEventListeners() {
    // Search
    document.getElementById('search-box').addEventListener('input', () => {
        renderCurrentView();
    });
    
    // Filters
    document.getElementById('difficulty-filter').addEventListener('change', () => {
        renderCurrentView();
    });
    
    document.getElementById('topic-filter').addEventListener('change', () => {
        renderCurrentView();
    });
    
    // Sort
    document.getElementById('sort-select').addEventListener('change', (e) => {
        currentSort = e.target.value;
        renderCurrentView();
    });
    
    // View toggle
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentView = btn.dataset.view;
            renderCurrentView();
        });
    });
}
// Love Babbar DSA 450 Questions - Complete Database
export const QUESTIONS_DATA = {
    "Array": [
      { "id": 1, "name": "Reverse the array", "difficulty": "Easy", "leetcodeUrl": "https://practice.geeksforgeeks.org/problems/reverse-an-array/0" },
      { "id": 2, "name": "Find the maximum and minimum element in an array", "difficulty": "Easy", "leetcodeUrl": "https://practice.geeksforgeeks.org/problems/find-minimum-and-maximum-element-in-an-array4428/1" },
      { "id": 3, "name": "Find the \"Kth\" max and min element of an array", "difficulty": "Medium", "leetcodeUrl": "https://practice.geeksforgeeks.org/problems/kth-smallest-element5635/1" },
      { "id": 4, "name": "Given an array which consists of only 0, 1 and 2. Sort the array without using any sorting algo", "difficulty": "Medium", "leetcodeUrl": "https://practice.geeksforgeeks.org/problems/sort-an-array-of-0s-1s-and-2s4231/1" },
      { "id": 5, "name": "Move all the negative elements to one side of the array", "difficulty": "Easy", "leetcodeUrl": "https://www.geeksforgeeks.org/move-negative-numbers-beginning-positive-end-constant-extra-space/" },
      { "id": 6, "name": "Find the Union and Intersection of the two sorted arrays", "difficulty": "Medium", "leetcodeUrl": "https://practice.geeksforgeeks.org/problems/union-of-two-arrays3538/1" },
      { "id": 7, "name": "Write a program to cyclically rotate an array by one", "difficulty": "Easy", "leetcodeUrl": "https://practice.geeksforgeeks.org/problems/cyclically-rotate-an-array-by-one2614/1" },
      { "id": 8, "name": "Find Largest sum contiguous Subarray [V. IMP]", "difficulty": "Medium", "leetcodeUrl": "https://leetcode.com/problems/maximum-subarray/" },
      { "id": 9, "name": "Minimize the maximum difference between heights [V.IMP]", "difficulty": "Medium", "leetcodeUrl": "https://practice.geeksforgeeks.org/problems/minimize-the-heights3351/1" },
      { "id": 10, "name": "Minimum no. of Jumps to reach end of an array", "difficulty": "Medium", "leetcodeUrl": "https://practice.geeksforgeeks.org/problems/minimum-number-of-jumps-1587115620/1" },
      { "id": 11, "name": "Find duplicate in an array of N+1 Integers", "difficulty": "Medium", "leetcodeUrl": "https://leetcode.com/problems/find-the-duplicate-number/" },
      { "id": 12, "name": "Merge 2 sorted arrays without using Extra space", "difficulty": "Hard", "leetcodeUrl": "https://practice.geeksforgeeks.org/problems/merge-two-sorted-arrays5135/1" },
      { "id": 13, "name": "Kadane's Algorithm", "difficulty": "Medium", "leetcodeUrl": "https://leetcode.com/problems/maximum-subarray/" },
      { "id": 14, "name": "Merge Intervals", "difficulty": "Medium", "leetcodeUrl": "https://leetcode.com/problems/merge-intervals/" },
      { "id": 15, "name": "Next Permutation", "difficulty": "Medium", "leetcodeUrl": "https://leetcode.com/problems/next-permutation/" },
      { "id": 16, "name": "Count Inversion", "difficulty": "Hard", "leetcodeUrl": "https://practice.geeksforgeeks.org/problems/inversion-of-array-1587115620/1" },
      { "id": 17, "name": "Best time to buy and Sell stock", "difficulty": "Easy", "leetcodeUrl": "https://leetcode.com/problems/best-time-to-buy-and-sell-stock/" },
      { "id": 18, "name": "Find all pairs on integer array whose sum is equal to given number", "difficulty": "Easy", "leetcodeUrl": "https://practice.geeksforgeeks.org/problems/count-pairs-with-given-sum5022/1" },
      { "id": 19, "name": "Find common elements In 3 sorted arrays", "difficulty": "Medium", "leetcodeUrl": "https://practice.geeksforgeeks.org/problems/common-elements1132/1" },
      { "id": 20, "name": "Rearrange array in alternating positive & negative items with O(1) extra space", "difficulty": "Medium", "leetcodeUrl": "https://practice.geeksforgeeks.org/problems/array-of-alternate-ve-and-ve-nos1401/1" },
      { "id": 21, "name": "Find if there is any subarray with sum equal to 0", "difficulty": "Medium", "leetcodeUrl": "https://practice.geeksforgeeks.org/problems/subarray-with-0-sum-1587115621/1" },
      { "id": 22, "name": "Find factorial of a large number", "difficulty": "Hard", "leetcodeUrl": "https://practice.geeksforgeeks.org/problems/factorials-of-large-numbers2508/1" },
      { "id": 23, "name": "Find maximum product subarray", "difficulty": "Medium", "leetcodeUrl": "https://leetcode.com/problems/maximum-product-subarray/" },
      { "id": 24, "name": "Find longest consecutive subsequence", "difficulty": "Medium", "leetcodeUrl": "https://leetcode.com/problems/longest-consecutive-sequence/" },
      { "id": 25, "name": "Given an array of size n and a number k, find all elements that appear more than n/k times", "difficulty": "Hard", "leetcodeUrl": "https://practice.geeksforgeeks.org/problems/count-element-occurences/1" },
      { "id": 26, "name": "Maximum profit by buying and selling a share atmost twice", "difficulty": "Hard", "leetcodeUrl": "https://leetcode.com/problems/best-time-to-buy-and-sell-stock-iii/" },
      { "id": 27, "name": "Find whether an array is a subset of another array", "difficulty": "Easy", "leetcodeUrl": "https://practice.geeksforgeeks.org/problems/array-subset-of-another-array2317/1" },
      { "id": 28, "name": "Find the triplet that sum to a given value", "difficulty": "Medium", "leetcodeUrl": "https://leetcode.com/problems/3sum/" },
      { "id": 29, "name": "Trapping Rain water problem", "difficulty": "Hard", "leetcodeUrl": "https://leetcode.com/problems/trapping-rain-water/" },
      { "id": 30, "name": "Chocolate Distribution problem", "difficulty": "Easy", "leetcodeUrl": "https://practice.geeksforgeeks.org/problems/chocolate-distribution-problem3825/1" },
      { "id": 31, "name": "Smallest Subarray with sum greater than a given value", "difficulty": "Medium", "leetcodeUrl": "https://practice.geeksforgeeks.org/problems/smallest-subarray-with-sum-greater-than-x5651/1" },
      { "id": 32, "name": "Three way partitioning of an array around a given value", "difficulty": "Medium", "leetcodeUrl": "https://practice.geeksforgeeks.org/problems/three-way-partitioning/1" },
      { "id": 33, "name": "Minimum swaps required bring elements less equal K together", "difficulty": "Medium", "leetcodeUrl": "https://practice.geeksforgeeks.org/problems/minimum-swaps-required-to-bring-all-elements-less-than-or-equal-to-k-together4847/1" },
      { "id": 34, "name": "Minimum no. of operations required to make an array palindrome", "difficulty": "Medium", "leetcodeUrl": "https://practice.geeksforgeeks.org/problems/palindromic-array-1587115620/1" },
      { "id": 35, "name": "Median of 2 sorted arrays of equal size", "difficulty": "Hard", "leetcodeUrl": "https://leetcode.com/problems/median-of-two-sorted-arrays/" },
      { "id": 36, "name": "Median of 2 sorted arrays of different size", "difficulty": "Hard", "leetcodeUrl": "https://leetcode.com/problems/median-of-two-sorted-arrays/" }
    ],
    
    "Matrix": [
      { "id": 37, "name": "Spiral traversal on a Matrix", "difficulty": "Medium", "leetcodeUrl": "https://leetcode.com/problems/spiral-matrix/" },
      { "id": 38, "name": "Search an element in a matriix", "difficulty": "Medium", "leetcodeUrl": "https://leetcode.com/problems/search-a-2d-matrix/" },
      { "id": 39, "name": "Find median in a row wise sorted matrix", "difficulty": "Hard", "leetcodeUrl": "https://practice.geeksforgeeks.org/problems/median-in-a-row-wise-sorted-matrix1527/1" },
      { "id": 40, "name": "Find row with maximum no. of 1's", "difficulty": "Easy", "leetcodeUrl": "https://practice.geeksforgeeks.org/problems/row-with-max-1s0023/1" },
      { "id": 41, "name": "Print elements in sorted order using row-column wise sorted matrix", "difficulty": "Hard", "leetcodeUrl": "https://practice.geeksforgeeks.org/problems/sorted-matrix2333/1" },
      { "id": 42, "name": "Maximum size rectangle", "difficulty": "Hard", "leetcodeUrl": "https://practice.geeksforgeeks.org/problems/max-rectangle/1" },
      { "id": 43, "name": "Find a specific pair in matrix", "difficulty": "Hard", "leetcodeUrl": "https://www.geeksforgeeks.org/find-a-specific-pair-in-matrix/" },
      { "id": 44, "name": "Rotate matrix by 90 degrees", "difficulty": "Medium", "leetcodeUrl": "https://leetcode.com/problems/rotate-image/" },
      { "id": 45, "name": "Kth smallest element in a row-column wise sorted matrix", "difficulty": "Hard", "leetcodeUrl": "https://leetcode.com/problems/kth-smallest-element-in-a-sorted-matrix/" },
      { "id": 46, "name": "Common elements in all rows of a given matrix", "difficulty": "Medium", "leetcodeUrl": "https://www.geeksforgeeks.org/common-elements-in-all-rows-of-a-given-matrix/" }
    ],
  
    "String": [
      { "id": 47, "name": "Reverse a String", "difficulty": "Easy", "leetcodeUrl": "https://leetcode.com/problems/reverse-string/" },
      { "id": 48, "name": "Check whether a String is Palindrome or not", "difficulty": "Easy", "leetcodeUrl": "https://leetcode.com/problems/valid-palindrome/" },
      { "id": 49, "name": "Find Duplicate characters in a string", "difficulty": "Easy", "leetcodeUrl": "https://practice.geeksforgeeks.org/problems/find-duplicates-in-an-array/1" },
      { "id": 50, "name": "Why strings are immutable in Java?", "difficulty": "Easy", "leetcodeUrl": "https://www.geeksforgeeks.org/java-string-is-immutable-what-exactly-is-the-meaning/" },
      { "id": 51, "name": "Write a Code to check whether one string is a rotation of another", "difficulty": "Easy", "leetcodeUrl": "https://leetcode.com/problems/rotate-string/" },
      { "id": 52, "name": "Write a Program to check whether a string is a valid shuffle of two strings or not", "difficulty": "Medium", "leetcodeUrl": "https://practice.geeksforgeeks.org/problems/shuffle-integers0206/1" },
      { "id": 53, "name": "Count and Say problem", "difficulty": "Medium", "leetcodeUrl": "https://leetcode.com/problems/count-and-say/" },
      { "id": 54, "name": "Write a program to find the longest Palindrome in a string", "difficulty": "Medium", "leetcodeUrl": "https://leetcode.com/problems/longest-palindromic-substring/" },
      { "id": 55, "name": "Find Longest Recurring Subsequence in String", "difficulty": "Hard", "leetcodeUrl": "https://practice.geeksforgeeks.org/problems/longest-repeating-subsequence2004/1" },
      { "id": 56, "name": "Print all Subsequences of a string", "difficulty": "Medium", "leetcodeUrl": "https://practice.geeksforgeeks.org/problems/print-all-subsequences-of-a-string/1" },
      { "id": 57, "name": "Print all the permutations of the given string", "difficulty": "Medium", "leetcodeUrl": "https://leetcode.com/problems/permutations/" },
      { "id": 58, "name": "Split the Binary string into two substring with equal 0's and 1's", "difficulty": "Easy", "leetcodeUrl": "https://practice.geeksforgeeks.org/problems/split-the-binary-string-into-substrings-with-equal-number-of-0s-and-1s/1" },
      { "id": 59, "name": "Word Wrap Problem", "difficulty": "Hard", "leetcodeUrl": "https://practice.geeksforgeeks.org/problems/word-wrap1646/1" },
      { "id": 60, "name": "EDIT Distance", "difficulty": "Hard", "leetcodeUrl": "https://leetcode.com/problems/edit-distance/" },
      { "id": 61, "name": "Find next greater number with same set of digits", "difficulty": "Medium", "leetcodeUrl": "https://leetcode.com/problems/next-permutation/" },
      { "id": 62, "name": "Balanced Parenthesis problem", "difficulty": "Medium", "leetcodeUrl": "https://leetcode.com/problems/valid-parentheses/" },
      { "id": 63, "name": "Word break Problem", "difficulty": "Hard", "leetcodeUrl": "https://leetcode.com/problems/word-break/" },
      { "id": 64, "name": "Rabin Karp Algorithm", "difficulty": "Hard", "leetcodeUrl": "https://leetcode.com/problems/repeated-string-match/" },
      { "id": 65, "name": "KMP Algorithm", "difficulty": "Hard", "leetcodeUrl": "https://leetcode.com/problems/implement-strstr/" },
      { "id": 66, "name": "Convert a Sentence into its equivalent mobile numeric keypad sequence", "difficulty": "Easy", "leetcodeUrl": "https://practice.geeksforgeeks.org/problems/convert-a-sentence-into-its-equivalent-mobile-numeric-keypad-sequence0547/1" },
      { "id": 67, "name": "Minimum number of bracket reversals needed to make an expression balanced", "difficulty": "Medium", "leetcodeUrl": "https://practice.geeksforgeeks.org/problems/count-the-reversals0401/1" },
      { "id": 68, "name": "Count All Palindromic Subsequence in a given String", "difficulty": "Hard", "leetcodeUrl": "https://practice.geeksforgeeks.org/problems/count-palindromic-subsequences/1" },
      { "id": 69, "name": "Count of number of given string in 2D character array", "difficulty": "Medium", "leetcodeUrl": "https://practice.geeksforgeeks.org/problems/count-occurences-of-a-given-word-in-a-2-d-array/1" },
      { "id": 70, "name": "Search a Word in a 2D Grid of characters", "difficulty": "Medium", "leetcodeUrl": "https://leetcode.com/problems/word-search/" },
      { "id": 71, "name": "Boyer Moore Algorithm for Pattern Searching", "difficulty": "Hard", "leetcodeUrl": "https://www.geeksforgeeks.org/boyer-moore-algorithm-for-pattern-searching/" },
      { "id": 72, "name": "Converting Roman Numerals to Decimal", "difficulty": "Easy", "leetcodeUrl": "https://leetcode.com/problems/roman-to-integer/" },
      { "id": 73, "name": "Longest Common Prefix", "difficulty": "Easy", "leetcodeUrl": "https://leetcode.com/problems/longest-common-prefix/" },
      { "id": 74, "name": "Number of flips to make binary string alternate", "difficulty": "Easy", "leetcodeUrl": "https://practice.geeksforgeeks.org/problems/min-number-of-flips3210/1" },
      { "id": 75, "name": "Find the first repeated word in string", "difficulty": "Easy", "leetcodeUrl": "https://practice.geeksforgeeks.org/problems/second-most-repeated-string-in-a-sequence0534/1" },
      { "id": 76, "name": "Minimum number of swaps for bracket balancing", "difficulty": "Medium", "leetcodeUrl": "https://practice.geeksforgeeks.org/problems/minimum-swaps-for-bracket-balancing2704/1" },
      { "id": 77, "name": "Find the longest common subsequence between two strings", "difficulty": "Medium", "leetcodeUrl": "https://leetcode.com/problems/longest-common-subsequence/" },
      { "id": 78, "name": "Program to generate all possible valid IP addresses from given string", "difficulty": "Hard", "leetcodeUrl": "https://leetcode.com/problems/restore-ip-addresses/" },
      { "id": 79, "name": "Write a program to find the smallest window that contains all characters of string itself", "difficulty": "Hard", "leetcodeUrl": "https://practice.geeksforgeeks.org/problems/smallest-distant-window3132/1" },
      { "id": 80, "name": "Rearrange characters in a string such that no two adjacent are same", "difficulty": "Hard", "leetcodeUrl": "https://practice.geeksforgeeks.org/problems/rearrange-characters4649/1" },
      { "id": 81, "name": "Minimum characters to be added at front to make string palindrome", "difficulty": "Hard", "leetcodeUrl": "https://www.geeksforgeeks.org/minimum-characters-added-front-make-string-palindrome/" },
      { "id": 82, "name": "Given a sequence of words, print all anagrams together", "difficulty": "Medium", "leetcodeUrl": "https://leetcode.com/problems/group-anagrams/" },
      { "id": 83, "name": "Find the smallest window in a string containing all characters of another string", "difficulty": "Hard", "leetcodeUrl": "https://leetcode.com/problems/minimum-window-substring/" },
      { "id": 84, "name": "Recursively remove all adjacent duplicates", "difficulty": "Easy", "leetcodeUrl": "https://leetcode.com/problems/remove-all-adjacent-duplicates-in-string/" },
      { "id": 85, "name": "String matching where one string contains wildcard characters", "difficulty": "Hard", "leetcodeUrl": "https://leetcode.com/problems/wildcard-matching/" },
      { "id": 86, "name": "Function to find Number of customers who could not get a computer", "difficulty": "Medium", "leetcodeUrl": "https://www.geeksforgeeks.org/function-to-find-number-of-customers-who-could-not-get-a-computer/" },
      { "id": 87, "name": "Transform One String to Another using Minimum Number of Given Operation", "difficulty": "Hard", "leetcodeUrl": "https://practice.geeksforgeeks.org/problems/transform-string5648/1" },
      { "id": 88, "name": "Check if two strings are k-anagrams or not", "difficulty": "Easy", "leetcodeUrl": "https://practice.geeksforgeeks.org/problems/check-if-two-strings-are-k-anagrams-or-not/1" },
      { "id": 89, "name": "Find the smallest window in a string containing all characters of another string", "difficulty": "Hard", "leetcodeUrl": "https://leetcode.com/problems/minimum-window-substring/" },
      { "id": 90, "name": "Minimum insertions to form a palindrome", "difficulty": "Hard", "leetcodeUrl": "https://practice.geeksforgeeks.org/problems/minimum-insertions-to-form-a-palindrome/1" }
    ],
  
    "Searching & Sorting": [
      { "id": 91, "name": "Find first and last positions of an element in a sorted array", "difficulty": "Medium", "leetcodeUrl": "https://leetcode.com/problems/find-first-and-last-position-of-element-in-sorted-array/" },
      { "id": 92, "name": "Find a Fixed Point (Value equal to index) in a given array", "difficulty": "Easy", "leetcodeUrl": "https://practice.geeksforgeeks.org/problems/value-equal-to-index-value1330/1" },
      { "id": 93, "name": "Search in a rotated sorted array", "difficulty": "Medium", "leetcodeUrl": "https://leetcode.com/problems/search-in-rotated-sorted-array/" },
      { "id": 94, "name": "Square root of an integer", "difficulty": "Easy", "leetcodeUrl": "https://leetcode.com/problems/sqrtx/" },
      { "id": 95, "name": "Maximum and minimum of an array using minimum number of comparisons", "difficulty": "Easy", "leetcodeUrl": "https://www.geeksforgeeks.org/maximum-and-minimum-in-an-array/" },
      { "id": 96, "name": "Optimum location of point to minimize total distance", "difficulty": "Hard", "leetcodeUrl": "https://www.geeksforgeeks.org/optimum-location-point-minimize-total-distance/" },
      { "id": 97, "name": "Find the repeating and the missing", "difficulty": "Medium", "leetcodeUrl": "https://practice.geeksforgeeks.org/problems/find-missing-and-repeating2512/1" },
      { "id": 98, "name": "Find majority element", "difficulty": "Medium", "leetcodeUrl": "https://leetcode.com/problems/majority-element/" },
      { "id": 99, "name": "Searching in an array where adjacent differ by at most k", "difficulty": "Medium", "leetcodeUrl": "https://www.geeksforgeeks.org/searching-array-adjacent-differ-k/" },
      { "id": 100, "name": "Find a pair with a given difference", "difficulty": "Easy", "leetcodeUrl": "https://practice.geeksforgeeks.org/problems/find-pair-given-difference1559/1" },
      { "id": 101, "name": "Find four elements that sum to a given value", "difficulty": "Medium", "leetcodeUrl": "https://leetcode.com/problems/4sum/" },
      { "id": 102, "name": "Maximum Sum such that No 2 Elements are Adjacent", "difficulty": "Medium", "leetcodeUrl": "https://leetcode.com/problems/house-robber/" },
      { "id": 103, "name": "Count triplet with sum smaller than a given value", "difficulty": "Medium", "leetcodeUrl": "https://practice.geeksforgeeks.org/problems/count-triplets-with-sum-smaller-than-x5549/1" },
      { "id": 104, "name": "Merge 2 sorted arrays", "difficulty": "Easy", "leetcodeUrl": "https://leetcode.com/problems/merge-sorted-array/" },
      { "id": 105, "name": "Print all subarrays with 0 sum", "difficulty": "Medium", "leetcodeUrl": "https://practice.geeksforgeeks.org/problems/zero-sum-subarrays1825/1" },
      { "id": 106, "name": "Product array Puzzle", "difficulty": "Medium", "leetcodeUrl": "https://leetcode.com/problems/product-of-array-except-self/" },
      { "id": 107, "name": "Sort array according to count of set bits", "difficulty": "Medium", "leetcodeUrl": "https://practice.geeksforgeeks.org/problems/sort-by-set-bit-count1153/1" },
      { "id": 108, "name": "Minimum no. of swaps required to sort the array", "difficulty": "Medium", "leetcodeUrl": "https://practice.geeksforgeeks.org/problems/minimum-swaps/1" },
      { "id": 109, "name": "Bishu and Soldiers", "difficulty": "Easy", "leetcodeUrl": "https://www.hackerearth.com/problem/algorithm/bishu-and-soldiers/" },
      { "id": 110, "name": "Rasta and Kheshtak", "difficulty": "Medium", "leetcodeUrl": "https://www.hackerearth.com/problem/algorithm/rasta-and-kheshtak/" },
      { "id": 111, "name": "Kth smallest number again", "difficulty": "Hard", "leetcodeUrl": "https://www.spoj.com/problems/KQUERY/" },
      { "id": 112, "name": "Find pivot element in a sorted array", "difficulty": "Easy", "leetcodeUrl": "https://practice.geeksforgeeks.org/problems/rotation4723/1" },
      { "id": 113, "name": "K-th Element of Two Sorted Arrays", "difficulty": "Hard", "leetcodeUrl": "https://practice.geeksforgeeks.org/problems/k-th-element-of-two-sorted-array1317/1" },
      { "id": 114, "name": "Aggressive cows", "difficulty": "Hard", "leetcodeUrl": "https://www.spoj.com/problems/AGGRCOW/" },
      { "id": 115, "name": "Book Allocation Problem", "difficulty": "Hard", "leetcodeUrl": "https://practice.geeksforgeeks.org/problems/allocate-minimum-number-of-pages0937/1" },
      { "id": 116, "name": "EKOSPOJ", "difficulty": "Medium", "leetcodeUrl": "https://www.spoj.com/problems/EKO/" },
      { "id": 117, "name": "Job Scheduling Algo", "difficulty": "Hard", "leetcodeUrl": "https://practice.geeksforgeeks.org/problems/job-sequencing-problem-1587115620/1" },
      { "id": 118, "name": "Missing Number in AP", "difficulty": "Easy", "leetcodeUrl": "https://practice.geeksforgeeks.org/problems/arithmetic-number2815/1" },
      { "id": 119, "name": "Smallest number with atleast n trailing zeroes in factorial", "difficulty": "Hard", "leetcodeUrl": "https://practice.geeksforgeeks.org/problems/smallest-factorial-number5929/1" },
      { "id": 120, "name": "Painters Partition Problem", "difficulty": "Hard", "leetcodeUrl": "https://practice.geeksforgeeks.org/problems/the-painters-partition-problem1535/1" },
      { "id": 121, "name": "ROTI-Prata SPOJ", "difficulty": "Medium", "leetcodeUrl": "https://www.spoj.com/problems/PRATA/" },
      { "id": 122, "name": "DoubleHelix SPOJ", "difficulty": "Hard", "leetcodeUrl": "https://www.spoj.com/problems/ANARC05B/" },
      { "id": 123, "name": "Subset Sums", "difficulty": "Medium", "leetcodeUrl": "https://www.spoj.com/problems/SUBSUMS/" },
      { "id": 124, "name": "Find the inversion count", "difficulty": "Hard", "leetcodeUrl": "https://practice.geeksforgeeks.org/problems/inversion-of-array-1587115620/1" },
      { "id": 125, "name": "Implement Merge-sort in-place", "difficulty": "Hard", "leetcodeUrl": "https://www.geeksforgeeks.org/in-place-merge-sort/" },
      { "id": 126, "name": "Partitioning and Sorting Arrays with Many Repeated Entries", "difficulty": "Hard", "leetcodeUrl": "https://www.geeksforgeeks.org/partitioning-and-sorting-arrays-with-many-repeated-entries/" }
    ],
  
    "LinkedList": [
      { "id": 127, "name": "Write a Program to reverse the Linked List", "difficulty": "Easy", "leetcodeUrl": "https://leetcode.com/problems/reverse-linked-list/" },
      { "id": 128, "name": "Reverse a Linked List in group of Given Size", "difficulty": "Medium", "leetcodeUrl": "https://leetcode.com/problems/reverse-nodes-in-k-group/" },
      { "id": 129, "name": "Write a program to Detect loop in a linked list", "difficulty": "Easy", "leetcodeUrl": "https://leetcode.com/problems/linked-list-cycle/" },
      { "id": 130, "name": "Write a program to Delete loop in a linked list", "difficulty": "Medium", "leetcodeUrl": "https://practice.geeksforgeeks.org/problems/remove-loop-in-linked-list/1" },
      { "id": 131, "name": "Find the starting point of the loop", "difficulty": "Medium", "leetcodeUrl": "https://leetcode.com/problems/linked-list-cycle-ii/" },
      { "id": 132, "name": "Remove Duplicates in a sorted Linked List", "difficulty": "Easy", "leetcodeUrl": "https://leetcode.com/problems/remove-duplicates-from-sorted-list/" },
      { "id": 133, "name": "Remove Duplicates in an Unsorted Linked List", "difficulty": "Medium", "leetcodeUrl": "https://practice.geeksforgeeks.org/problems/remove-duplicates-from-an-unsorted-linked-list/1" },
      { "id": 134, "name": "Write a Program to Move the last element to Front in a Linked List", "difficulty": "Easy", "leetcodeUrl": "https://www.geeksforgeeks.org/move-last-element-to-front-of-a-given-linked-list/" },
      { "id": 135, "name": "Add 1 to a number represented as a Linked List", "difficulty": "Medium", "leetcodeUrl": "https://practice.geeksforgeeks.org/problems/add-1-to-a-number-represented-as-linked-list/1" },
      { "id": 136, "name": "Add two numbers represented by linked lists", "difficulty": "Medium", "leetcodeUrl": "https://leetcode.com/problems/add-two-numbers/" },
      { "id": 137, "name": "Intersection of two Sorted Linked List", "difficulty": "Easy", "leetcodeUrl": "https://practice.geeksforgeeks.org/problems/intersection-of-two-sorted-linked-lists/1" },
      { "id": 138, "name": "Intersection Point of two Linked Lists", "difficulty": "Medium", "leetcodeUrl": "https://leetcode.com/problems/intersection-of-two-linked-lists/" },
      { "id": 139, "name": "Merge Sort For Linked lists", "difficulty": "Medium", "leetcodeUrl": "https://leetcode.com/problems/sort-list/" },
      { "id": 140, "name": "Quicksort for Linked Lists", "difficulty": "Hard", "leetcodeUrl": "https://practice.geeksforgeeks.org/problems/quick-sort-on-linked-list/1" },
      { "id": 141, "name": "Find the middle Element of a linked list", "difficulty": "Easy", "leetcodeUrl": "https://leetcode.com/problems/middle-of-the-linked-list/" },
      { "id": 142, "name": "Check if a linked list is a circular linked list", "difficulty": "Easy", "leetcodeUrl": "https://practice.geeksforgeeks.org/problems/circular-linked-list/1" },
      { "id": 143, "name": "Split a Circular linked list into two halves", "difficulty": "Medium", "leetcodeUrl": "https://practice.geeksforgeeks.org/problems/split-a-circular-linked-list-into-two-halves/1" },
      { "id": 144, "name": "Write a Program to check whether the Singly Linked list is a palindrome or not", "difficulty": "Easy", "leetcodeUrl": "https://leetcode.com/problems/palindrome-linked-list/" },
      { "id": 145, "name": "Deletion from a Circular Linked List", "difficulty": "Easy", "leetcodeUrl": "https://www.geeksforgeeks.org/deletion-circular-linked-list/" },
      { "id": 146, "name": "Reverse a Doubly Linked list", "difficulty": "Easy", "leetcodeUrl": "https://practice.geeksforgeeks.org/problems/reverse-a-doubly-linked-list/1" },
      { "id": 147, "name": "Find pairs with a given sum in a DLL", "difficulty": "Easy", "leetcodeUrl": "https://www.geeksforgeeks.org/find-pairs-given-sum-doubly-linked-list/" },
      { "id": 148, "name": "Count triplets in a sorted DLL whose sum is equal to given value X", "difficulty": "Medium", "leetcodeUrl": "https://www.geeksforgeeks.org/count-triplets-sorted-doubly-linked-list-whose-sum-equal-given-value-x/" },
      { "id": 149, "name": "Sort a k sorted doubly linked list", "difficulty": "Hard", "leetcodeUrl": "https://www.geeksforgeeks.org/sort-k-sorted-doubly-linked-list/" },
      { "id": 150, "name": "Rotate DoublyLinked list by N nodes", "difficulty": "Medium", "leetcodeUrl": "https://www.geeksforgeeks.org/rotate-doubly-linked-list-n-nodes/" },
      { "id": 151, "name": "Rotate a Doubly Linked list in group of Given Size", "difficulty": "Hard", "leetcodeUrl": "https://www.geeksforgeeks.org/reverse-doubly-linked-list-groups-given-size/" },
      { "id": 152, "name": "Can we reverse a linked list in less than O(n)", "difficulty": "Hard", "leetcodeUrl": "https://www.geeksforgeeks.org/can-we-reverse-a-linked-list-in-less-than-on/" },
      { "id": 153, "name": "Why Quicksort is preferred for Arrays and Merge Sort for LinkedLists", "difficulty": "Easy", "leetcodeUrl": "https://www.geeksforgeeks.org/why-quick-sort-preferred-for-arrays-and-merge-sort-for-linked-lists/" },
      { "id": 154, "name": "Flatten a Linked List", "difficulty": "Hard", "leetcodeUrl": "https://practice.geeksforgeeks.org/problems/flattening-a-linked-list/1" },
      { "id": 155, "name": "Sort a LL of 0's, 1's and 2's", "difficulty": "Easy", "leetcodeUrl": "https://practice.geeksforgeeks.org/problems/given-a-linked-list-of-0s-1s-and-2s-sort-it/1" },
      { "id": 156, "name": "Clone a linked list with next and random pointer", "difficulty": "Hard", "leetcodeUrl": "https://leetcode.com/problems/copy-list-with-random-pointer/" },
      { "id": 157, "name": "Merge K sorted Linked list", "difficulty": "Hard", "leetcodeUrl": "https://leetcode.com/problems/merge-k-sorted-lists/" },
      { "id": 158, "name": "Multiply 2 no. represented by LL", "difficulty": "Hard", "leetcodeUrl": "https://practice.geeksforgeeks.org/problems/multiply-two-linked-lists/1" },
      { "id": 159, "name": "Delete nodes which have a greater value on right side", "difficulty": "Medium", "leetcodeUrl": "https://practice.geeksforgeeks.org/problems/delete-nodes-having-greater-value-on-right/1" },
      { "id": 160, "name": "Segregate even and odd nodes in a Linked List", "difficulty": "Easy", "leetcodeUrl": "https://leetcode.com/problems/odd-even-linked-list/" },
      { "id": 161, "name": "Program for n'th node from the end of a Linked List", "difficulty": "Easy", "leetcodeUrl": "https://leetcode.com/problems/remove-nth-node-from-end-of-list/" },
      { "id": 162, "name": "Find the first non-repeating character from a stream of characters", "difficulty": "Medium", "leetcodeUrl": "https://practice.geeksforgeeks.org/problems/first-non-repeating-character-in-a-stream1216/1" }
    ],
  
    "Binary Trees": [
      { "id": 163, "name": "Level order traversal", "difficulty": "Easy", "leetcodeUrl": "https://leetcode.com/problems/binary-tree-level-order-traversal/" },
      { "id": 164, "name": "Reverse Level Order traversal", "difficulty": "Easy", "leetcodeUrl": "https://practice.geeksforgeeks.org/problems/reverse-level-order-traversal/1" },
      { "id": 165, "name": "Height of a tree", "difficulty": "Easy", "leetcodeUrl": "https://leetcode.com/problems/maximum-depth-of-binary-tree/" },
      { "id": 166, "name": "Diameter of a tree", "difficulty": "Easy", "leetcodeUrl": "https://leetcode.com/problems/diameter-of-binary-tree/" },
      { "id": 167, "name": "Mirror of a tree", "difficulty": "Easy", "leetcodeUrl": "https://leetcode.com/problems/invert-binary-tree/" },
      { "id": 168, "name": "Inorder Traversal of a tree both using recursion and Iteration", "difficulty": "Easy", "leetcodeUrl": "https://leetcode.com/problems/binary-tree-inorder-traversal/" },
      { "id": 169, "name": "Preorder Traversal of a tree both using recursion and Iteration", "difficulty": "Easy", "leetcodeUrl": "https://leetcode.com/problems/binary-tree-preorder-traversal/" },
      { "id": 170, "name": "Postorder Traversal of a tree both using recursion and Iteration", "difficulty": "Easy", "leetcodeUrl": "https://leetcode.com/problems/binary-tree-postorder-traversal/" },
      { "id": 171, "name": "Left View of a tree", "difficulty": "Easy", "leetcodeUrl": "https://practice.geeksforgeeks.org/problems/left-view-of-binary-tree/1" },
      { "id": 172, "name": "Right View of Tree", "difficulty": "Easy", "leetcodeUrl": "https://leetcode.com/problems/binary-tree-right-side-view/" },
      { "id": 173, "name": "Top View of a tree", "difficulty": "Medium", "leetcodeUrl": "https://practice.geeksforgeeks.org/problems/top-view-of-binary-tree/1" },
      { "id": 174, "name": "Bottom View of a tree", "difficulty": "Medium", "leetcodeUrl": "https://practice.geeksforgeeks.org/problems/bottom-view-of-binary-tree/1" },
      { "id": 175, "name": "Zig-Zag traversal of a binary tree", "difficulty": "Medium", "leetcodeUrl": "https://leetcode.com/problems/binary-tree-zigzag-level-order-traversal/" },
      { "id": 176, "name": "Check if a tree is balanced or not", "difficulty": "Easy", "leetcodeUrl": "https://leetcode.com/problems/balanced-binary-tree/" },
      { "id": 177, "name": "Diagonal Traversal of a Binary tree", "difficulty": "Medium", "leetcodeUrl": "https://practice.geeksforgeeks.org/problems/diagonal-traversal-of-binary-tree/1" },
      { "id": 178, "name": "Boundary traversal of a Binary tree", "difficulty": "Medium", "leetcodeUrl": "https://practice.geeksforgeeks.org/problems/boundary-traversal-of-binary-tree/1" },
      { "id": 179, "name": "Construct Binary Tree from String with Bracket Representation", "difficulty": "Medium", "leetcodeUrl": "https://leetcode.com/problems/construct-string-from-binary-tree/" },
      { "id": 180, "name": "Convert Binary tree into Doubly Linked List", "difficulty": "Hard", "leetcodeUrl": "https://practice.geeksforgeeks.org/problems/binary-tree-to-dll/1" },
      { "id": 181, "name": "Convert Binary tree into Sum tree", "difficulty": "Medium", "leetcodeUrl": "https://practice.geeksforgeeks.org/problems/transform-to-sum-tree/1" },
      { "id": 182, "name": "Construct Binary tree from Inorder and preorder traversal", "difficulty": "Medium", "leetcodeUrl": "https://leetcode.com/problems/construct-binary-tree-from-preorder-and-inorder-traversal/" },
      { "id": 183, "name": "Find minimum swaps required to convert a Binary tree into BST", "difficulty": "Hard", "leetcodeUrl": "https://www.geeksforgeeks.org/minimum-swap-required-convert-binary-tree-binary-search-tree/" },
      { "id": 184, "name": "Check if Binary tree is Sum tree or not", "difficulty": "Medium", "leetcodeUrl": "https://practice.geeksforgeeks.org/problems/sum-tree/1" },
      { "id": 185, "name": "Check if all leaf nodes are at same level or not", "difficulty": "Easy", "leetcodeUrl": "https://practice.geeksforgeeks.org/problems/leaf-at-same-level/1" },
      { "id": 186, "name": "Check if a Binary Tree contains duplicate subtrees of size 2 or more", "difficulty": "Hard", "leetcodeUrl": "https://practice.geeksforgeeks.org/problems/duplicate-subtree-in-binary-tree/1" },
      { "id": 187, "name": "Check if 2 trees are mirror or not", "difficulty": "Easy", "leetcodeUrl": "https://practice.geeksforgeeks.org/problems/check-mirror-in-n-ary-tree1528/1" },
      { "id": 188, "name": "Sum of Nodes on the Longest path from root to leaf node", "difficulty": "Medium", "leetcodeUrl": "https://practice.geeksforgeeks.org/problems/sum-of-the-longest-bloodline-of-a-tree/1" },
      { "id": 189, "name": "Check if given graph is tree or not", "difficulty": "Medium", "leetcodeUrl": "https://www.geeksforgeeks.org/check-given-graph-tree/" },
      { "id": 190, "name": "Find Largest subtree sum in a tree", "difficulty": "Medium", "leetcodeUrl": "https://practice.geeksforgeeks.org/problems/maximum-sum-of-non-adjacent-nodes/1" },
      { "id": 191, "name": "Maximum Sum of nodes in Binary tree such that no two are adjacent", "difficulty": "Hard", "leetcodeUrl": "https://practice.geeksforgeeks.org/problems/maximum-sum-of-non-adjacent-nodes/1" },
      { "id": 192, "name": "Print all k Sum paths in a Binary tree", "difficulty": "Hard", "leetcodeUrl": "https://leetcode.com/problems/path-sum-iii/" },
      { "id": 193, "name": "Find LCA in a Binary tree", "difficulty": "Medium", "leetcodeUrl": "https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-tree/" },
      { "id": 194, "name": "Find distance between 2 nodes in a Binary tree", "difficulty": "Medium", "leetcodeUrl": "https://practice.geeksforgeeks.org/problems/min-distance-between-two-given-nodes-of-a-binary-tree/1" },
      { "id": 195, "name": "Kth Ancestor of node in a Binary tree", "difficulty": "Hard", "leetcodeUrl": "https://www.geeksforgeeks.org/kth-ancestor-node-binary-tree-set-2/" },
      { "id": 196, "name": "Find all Duplicate subtrees in a Binary tree", "difficulty": "Hard", "leetcodeUrl": "https://leetcode.com/problems/find-duplicate-subtrees/" },
      { "id": 197, "name": "Tree Isomorphism Problem", "difficulty": "Hard", "leetcodeUrl": "https://practice.geeksforgeeks.org/problems/check-if-tree-is-isomorphic/1" }
    ],
  
    "Binary Search Trees": [
      { "id": 198, "name": "Find a value in a BST", "difficulty": "Easy", "leetcodeUrl": "https://leetcode.com/problems/search-in-a-binary-search-tree/" },
      { "id": 199, "name": "Deletion of a node in a BST", "difficulty": "Medium", "leetcodeUrl": "https://leetcode.com/problems/delete-node-in-a-bst/" },
      { "id": 200, "name": "Find min and max value in a BST", "difficulty": "Easy", "leetcodeUrl": "https://practice.geeksforgeeks.org/problems/minimum-element-in-bst/1" },
      { "id": 201, "name": "Find inorder successor and inorder predecessor in a BST", "difficulty": "Medium", "leetcodeUrl": "https://practice.geeksforgeeks.org/problems/predecessor-and-successor/1" },
      { "id": 202, "name": "Check if a tree is a BST or not", "difficulty": "Medium", "leetcodeUrl": "https://leetcode.com/problems/validate-binary-search-tree/" },
      { "id": 203, "name": "Populate Inorder successor of all nodes", "difficulty": "Medium", "leetcodeUrl": "https://practice.geeksforgeeks.org/problems/populate-inorder-successor-for-all-nodes/1" },
      { "id": 204, "name": "Find LCA of 2 nodes in a BST", "difficulty": "Easy", "leetcodeUrl": "https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-search-tree/" },
      { "id": 205, "name": "Construct BST from preorder traversal", "difficulty": "Medium", "leetcodeUrl": "https://leetcode.com/problems/construct-binary-search-tree-from-preorder-traversal/" },
      { "id": 206, "name": "Convert Binary tree into BST", "difficulty": "Medium", "leetcodeUrl": "https://practice.geeksforgeeks.org/problems/binary-tree-to-bst/1" },
      { "id": 207, "name": "Convert a normal BST into a Balanced BST", "difficulty": "Hard", "leetcodeUrl": "https://leetcode.com/problems/balance-a-binary-search-tree/" },
      { "id": 208, "name": "Merge two BST", "difficulty": "Hard", "leetcodeUrl": "https://www.geeksforgeeks.org/merge-two-balanced-binary-search-trees/" },
      { "id": 209, "name": "Find Kth largest element in a BST", "difficulty": "Medium", "leetcodeUrl": "https://leetcode.com/problems/kth-smallest-element-in-a-bst/" },
      { "id": 210, "name": "Find Kth smallest element in a BST", "difficulty": "Easy", "leetcodeUrl": "https://leetcode.com/problems/kth-smallest-element-in-a-bst/" },
      { "id": 211, "name": "Count pairs from 2 BST whose sum is equal to given value X", "difficulty": "Hard", "leetcodeUrl": "https://practice.geeksforgeeks.org/problems/brothers-from-different-root/1" },
      { "id": 212, "name": "Find the median of BST in O(n) time and O(1) space", "difficulty": "Hard", "leetcodeUrl": "https://www.geeksforgeeks.org/find-median-bst-time-o1-space/" },
      { "id": 213, "name": "Count BST ndoes that lie in a given range", "difficulty": "Easy", "leetcodeUrl": "https://practice.geeksforgeeks.org/problems/count-bst-nodes-that-lie-in-a-given-range/1" },
      { "id": 214, "name": "Replace every element with the least greater element on its right", "difficulty": "Hard", "leetcodeUrl": "https://www.geeksforgeeks.org/replace-every-element-with-the-least-greater-element-on-its-right/" },
      { "id": 215, "name": "Given n appointments, find the conflicting appointments", "difficulty": "Medium", "leetcodeUrl": "https://www.geeksforgeeks.org/given-n-appointments-find-conflicting-appointments/" },
      { "id": 216, "name": "Check preorder is valid or not", "difficulty": "Medium", "leetcodeUrl": "https://practice.geeksforgeeks.org/problems/preorder-to-postorder4423/1" },
      { "id": 217, "name": "Check whether BST contains Dead end", "difficulty": "Hard", "leetcodeUrl": "https://practice.geeksforgeeks.org/problems/check-whether-bst-contains-dead-end/1" },
      { "id": 218, "name": "Largest BST in a Binary Tree", "difficulty": "Hard", "leetcodeUrl": "https://practice.geeksforgeeks.org/problems/largest-bst/1" },
      { "id": 219, "name": "Flatten BST to sorted list", "difficulty": "Medium", "leetcodeUrl": "https://www.geeksforgeeks.org/flatten-bst-to-sorted-list-increasing-order/" }
    ],
  
    "Greedy": [
      { "id": 220, "name": "Activity Selection Problem", "difficulty": "Easy", "leetcodeUrl": "https://practice.geeksforgeeks.org/problems/n-meetings-in-one-room-1587115620/1" },
      { "id": 221, "name": "Job Sequencing Problem", "difficulty": "Medium", "leetcodeUrl": "https://practice.geeksforgeeks.org/problems/job-sequencing-problem-1587115620/1" },
      { "id": 222, "name": "Huffman Coding", "difficulty": "Hard", "leetcodeUrl": "https://practice.geeksforgeeks.org/problems/huffman-encoding3345/1" },
      { "id": 223, "name": "Water Connection Problem", "difficulty": "Medium", "leetcodeUrl": "https://practice.geeksforgeeks.org/problems/water-connection-problem5822/1" },
      { "id": 224, "name": "Fractional Knapsack Problem", "difficulty": "Medium", "leetcodeUrl": "https://practice.geeksforgeeks.org/problems/fractional-knapsack-1587115620/1" },
      { "id": 225, "name": "Greedy Algorithm to find Minimum number of Coins", "difficulty": "Easy", "leetcodeUrl": "https://practice.geeksforgeeks.org/problems/-minimum-number-of-coins4426/1" },
      { "id": 226, "name": "Maximum trains for which stoppage can be provided", "difficulty": "Medium", "leetcodeUrl": "https://www.geeksforgeeks.org/maximum-trains-stoppage-can-provided/" },
      { "id": 227, "name": "Minimum Platforms Problem", "difficulty": "Medium", "leetcodeUrl": "https://practice.geeksforgeeks.org/problems/minimum-platforms-1587115620/1" },
      { "id": 228, "name": "Buy Maximum Stocks if i stocks can be bought on i-th day", "difficulty": "Medium", "leetcodeUrl": "https://www.geeksforgeeks.org/buy-maximum-stocks-stocks-can-bought-th-day/" },
      { "id": 229, "name": "Find the minimum and maximum amount to buy all N candies", "difficulty": "Easy", "leetcodeUrl": "https://practice.geeksforgeeks.org/problems/shop-in-candy-store1145/1" },
      { "id": 230, "name": "Minimize Cash Flow among a given set of friends who have borrowed money from each other", "difficulty": "Hard", "leetcodeUrl": "https://www.geeksforgeeks.org/minimize-cash-flow-among-given-set-friends-borrowed-money/" },
      { "id": 231, "name": "Minimum Cost to cut a board into squares", "difficulty": "Medium", "leetcodeUrl": "https://www.geeksforgeeks.org/minimum-cost-cut-board-squares/" },
      { "id": 232, "name": "Check if it is possible to survive on Island", "difficulty": "Medium", "leetcodeUrl": "https://www.geeksforgeeks.org/survival/" },
      { "id": 233, "name": "Find maximum meetings in one room", "difficulty": "Easy", "leetcodeUrl": "https://practice.geeksforgeeks.org/problems/n-meetings-in-one-room-1587115620/1" },
      { "id": 234, "name": "Maximum product subset of an array", "difficulty": "Medium", "leetcodeUrl": "https://www.geeksforgeeks.org/maximum-product-subset-array/" },
      { "id": 235, "name": "Maximize array sum after K negations", "difficulty": "Easy", "leetcodeUrl": "https://practice.geeksforgeeks.org/problems/maximize-sum-after-k-negations1149/1" },
      { "id": 236, "name": "Maximize the sum of arr[i]*i", "difficulty": "Easy", "leetcodeUrl": "https://practice.geeksforgeeks.org/problems/maximize-arrii-of-an-array0026/1" },
      { "id": 237, "name": "Maximum sum of absolute difference of an array", "difficulty": "Medium", "leetcodeUrl": "https://www.geeksforgeeks.org/maximum-sum-absolute-difference-array/" },
      { "id": 238, "name": "Maximize sum of consecutive differences in a circular array", "difficulty": "Hard", "leetcodeUrl": "https://practice.geeksforgeeks.org/problems/swap-the-array-elements/1" },
      { "id": 239, "name": "Minimum sum of absolute difference of pairs of two arrays", "difficulty": "Easy", "leetcodeUrl": "https://www.geeksforgeeks.org/minimum-sum-absolute-difference-pairs-two-arrays/" },
      { "id": 240, "name": "Program for Shortest Job First (or SJF) CPU Scheduling", "difficulty": "Easy", "leetcodeUrl": "https://www.geeksforgeeks.org/program-for-shortest-job-first-or-sjf-cpu-scheduling-set-1-non-preemptive/" },
      { "id": 241, "name": "Program for Least Recently Used (LRU) Page Replacement algorithm", "difficulty": "Medium", "leetcodeUrl": "https://leetcode.com/problems/lru-cache/" },
      { "id": 242, "name": "Smallest subset with sum greater than all other elements", "difficulty": "Easy", "leetcodeUrl": "https://www.geeksforgeeks.org/smallest-subset-sum-greater-elements/" },
      { "id": 243, "name": "Chocolate Distribution Problem", "difficulty": "Easy", "leetcodeUrl": "https://practice.geeksforgeeks.org/problems/chocolate-distribution-problem3825/1" },
      { "id": 244, "name": "DEFKIN -Defense of a Kingdom", "difficulty": "Easy", "leetcodeUrl": "https://www.spoj.com/problems/DEFKIN/" },
      { "id": 245, "name": "DIEHARD -DIE HARD", "difficulty": "Medium", "leetcodeUrl": "https://www.spoj.com/problems/DIEHARD/" },
      { "id": 246, "name": "GERGOVIA -Wine trading in Gergovia", "difficulty": "Medium", "leetcodeUrl": "https://www.spoj.com/problems/GERGOVIA/" },
      { "id": 247, "name": "Picking Up Chicks", "difficulty": "Easy", "leetcodeUrl": "https://www.spoj.com/problems/GCJ101BB/" },
      { "id": 248, "name": "CHOCOLA –Chocolate", "difficulty": "Medium", "leetcodeUrl": "https://www.spoj.com/problems/CHOCOLA/" },
      { "id": 249, "name": "ARRANGE -Arranging Amplifiers", "difficulty": "Hard", "leetcodeUrl": "https://www.spoj.com/problems/ARRANGE/" },
      { "id": 250, "name": "K Centers Problem", "difficulty": "Hard", "leetcodeUrl": "https://www.geeksforgeeks.org/k-centers-problem-set-1-greedy-approximate-algorithm/" },
      { "id": 251, "name": "Minimum Cost of ropes", "difficulty": "Easy", "leetcodeUrl": "https://practice.geeksforgeeks.org/problems/minimum-cost-of-ropes-1587115620/1" },
      { "id": 252, "name": "Find smallest number with given number of digits and sum of digits", "difficulty": "Easy", "leetcodeUrl": "https://practice.geeksforgeeks.org/problems/smallest-number5829/1" },
      { "id": 253, "name": "Rearrange characters in a string such that no two adjacent are same", "difficulty": "Hard", "leetcodeUrl": "https://practice.geeksforgeeks.org/problems/rearrange-characters4649/1" },
      { "id": 254, "name": "Find maximum sum possible equal sum of three stacks", "difficulty": "Easy", "leetcodeUrl": "https://practice.geeksforgeeks.org/problems/maximum-equal-sum-of-three-stacks/1" }
    ],
  
    "BackTracking": [
      { "id": 255, "name": "Rat in a maze Problem", "difficulty": "Medium", "leetcodeUrl": "https://practice.geeksforgeeks.org/problems/rat-in-a-maze-problem/1" },
      { "id": 256, "name": "Printing all solutions in N-Queen Problem", "difficulty": "Hard", "leetcodeUrl": "https://leetcode.com/problems/n-queens/" },
      { "id": 257, "name": "Word Break Problem using Backtracking", "difficulty": "Hard", "leetcodeUrl": "https://practice.geeksforgeeks.org/problems/word-break-part-23249/1" },
      { "id": 258, "name": "Remove Invalid Parentheses", "difficulty": "Hard", "leetcodeUrl": "https://leetcode.com/problems/remove-invalid-parentheses/" },
      { "id": 259, "name": "Sudoku Solver", "difficulty": "Hard", "leetcodeUrl": "https://leetcode.com/problems/sudoku-solver/" },
      { "id": 260, "name": "m Coloring Problem", "difficulty": "Hard", "leetcodeUrl": "https://practice.geeksforgeeks.org/problems/m-coloring-problem-1587115620/1" },
      { "id": 261, "name": "Print all palindromic partitions of a string", "difficulty": "Hard", "leetcodeUrl": "https://leetcode.com/problems/palindrome-partitioning/" },
      { "id": 262, "name": "Subset Sum Problem", "difficulty": "Medium", "leetcodeUrl": "https://practice.geeksforgeeks.org/problems/subset-sum-problem-1611555638/1" },
      { "id": 263, "name": "The Knight's tour problem", "difficulty": "Hard", "leetcodeUrl": "https://www.geeksforgeeks.org/the-knights-tour-problem-backtracking-1/" },
      { "id": 264, "name": "Tug of War", "difficulty": "Hard", "leetcodeUrl": "https://www.geeksforgeeks.org/tug-of-war/" },
      { "id": 265, "name": "Find shortest safe route in a path with landmines", "difficulty": "Hard", "leetcodeUrl": "https://www.geeksforgeeks.org/find-shortest-safe-route-in-a-path-with-landmines/" },
      { "id": 266, "name": "Combinational Sum", "difficulty": "Medium", "leetcodeUrl": "https://leetcode.com/problems/combination-sum/" },
      { "id": 267, "name": "Find Maximum number possible by doing at-most K swaps", "difficulty": "Hard", "leetcodeUrl": "https://practice.geeksforgeeks.org/problems/largest-number-in-k-swaps-1587115620/1" },
      { "id": 268, "name": "Print all permutations of a string", "difficulty": "Medium", "leetcodeUrl": "https://leetcode.com/problems/permutations/" },
      { "id": 269, "name": "Find if there is a path of more than k length from a source", "difficulty": "Hard", "leetcodeUrl": "https://www.geeksforgeeks.org/find-if-there-is-a-path-of-more-than-k-length-from-a-source/" },
      { "id": 270, "name": "Longest Possible Route in a Matrix with Hurdles", "difficulty": "Hard", "leetcodeUrl": "https://www.geeksforgeeks.org/longest-possible-route-in-a-matrix-with-hurdles/" },
      { "id": 271, "name": "Print all possible paths from top left to bottom right of a mXn matrix", "difficulty": "Medium", "leetcodeUrl": "https://www.geeksforgeeks.org/print-all-possible-paths-from-top-left-to-bottom-right-of-a-mxn-matrix/" },
      { "id": 272, "name": "Partition of a set intoK subsets with equal sum", "difficulty": "Hard", "leetcodeUrl": "https://practice.geeksforgeeks.org/problems/partition-array-to-k-subsets/1" },
      { "id": 273, "name": "Find the K-th Permutation Sequence of first N natural numbers", "difficulty": "Hard", "leetcodeUrl": "https://leetcode.com/problems/permutation-sequence/" }
    ],
  
    "Stacks and Queues": [
      { "id": 274, "name": "Implement Stack from Scratch", "difficulty": "Easy", "leetcodeUrl": "https://www.geeksforgeeks.org/stack-data-structure-introduction-program/" },
      { "id": 275, "name": "Implement Queue from Scratch", "difficulty": "Easy", "leetcodeUrl": "https://www.geeksforgeeks.org/queue-set-1introduction-and-array-implementation/" },
      { "id": 276, "name": "Implement 2 stack in an array", "difficulty": "Easy", "leetcodeUrl": "https://practice.geeksforgeeks.org/problems/implement-two-stacks-in-an-array/1" },
      { "id": 277, "name": "Find the middle element of a stack", "difficulty": "Easy", "leetcodeUrl": "https://www.geeksforgeeks.org/design-a-stack-with-find-middle-operation/" },
      { "id": 278, "name": "Implement N stacks in an Array", "difficulty": "Hard", "leetcodeUrl": "https://www.geeksforgeeks.org/efficiently-implement-k-stacks-single-array/" },
      { "id": 279, "name": "Check the expression has valid or Balanced parenthesis or not", "difficulty": "Easy", "leetcodeUrl": "https://leetcode.com/problems/valid-parentheses/" },
      { "id": 280, "name": "Reverse a String using Stack", "difficulty": "Easy", "leetcodeUrl": "https://practice.geeksforgeeks.org/problems/reverse-a-string-using-stack/1" },
      { "id": 281, "name": "Design a Stack that supports getMin() in O(1) time and O(1) extra space", "difficulty": "Easy", "leetcodeUrl": "https://leetcode.com/problems/min-stack/" },
      { "id": 282, "name": "Find the next Greater element", "difficulty": "Medium", "leetcodeUrl": "https://leetcode.com/problems/next-greater-element-i/" },
      { "id": 283, "name": "The celebrity Problem", "difficulty": "Medium", "leetcodeUrl": "https://practice.geeksforgeeks.org/problems/the-celebrity-problem/1" },
      { "id": 284, "name": "Arithmetic Expression evaluation", "difficulty": "Hard", "leetcodeUrl": "https://practice.geeksforgeeks.org/problems/evaluation-of-postfix-expression1735/1" },
      { "id": 285, "name": "Evaluation of Postfix expression", "difficulty": "Easy", "leetcodeUrl": "https://leetcode.com/problems/evaluate-reverse-polish-notation/" },
      { "id": 286, "name": "Implement a method to insert an element at its bottom without using any other data structure", "difficulty": "Easy", "leetcodeUrl": "https://www.geeksforgeeks.org/program-to-insert-an-element-at-the-bottom-of-a-stack/" },
      { "id": 287, "name": "Reverse a stack using recursion", "difficulty": "Medium", "leetcodeUrl": "https://www.geeksforgeeks.org/reverse-a-stack-using-recursion/" },
      { "id": 288, "name": "Sort a Stack using recursion", "difficulty": "Medium", "leetcodeUrl": "https://practice.geeksforgeeks.org/problems/sort-a-stack/1" },
      { "id": 289, "name": "Merge Overlapping Intervals", "difficulty": "Medium", "leetcodeUrl": "https://leetcode.com/problems/merge-intervals/" },
      { "id": 290, "name": "Largest rectangular Area in Histogram", "difficulty": "Hard", "leetcodeUrl": "https://leetcode.com/problems/largest-rectangle-in-histogram/" },
      { "id": 291, "name": "Length of the Longest Valid Substring", "difficulty": "Hard", "leetcodeUrl": "https://leetcode.com/problems/longest-valid-parentheses/" },
      { "id": 292, "name": "Expression contains redundant bracket or not", "difficulty": "Easy", "leetcodeUrl": "https://www.geeksforgeeks.org/expression-contains-redundant-bracket-not/" },
      { "id": 293, "name": "Implement Stack using Queue", "difficulty": "Easy", "leetcodeUrl": "https://leetcode.com/problems/implement-stack-using-queues/" },
      { "id": 294, "name": "Implement Stack using Deque", "difficulty": "Easy", "leetcodeUrl": "https://www.geeksforgeeks.org/implement-stack-queue-using-deque/" },
      { "id": 295, "name": "Stack Permutations (Check if an array is stack permutation of other)", "difficulty": "Medium", "leetcodeUrl": "https://www.geeksforgeeks.org/stack-permutations-check-if-an-array-is-stack-permutation-of-other/" },
      { "id": 296, "name": "Implement Queue using Stack", "difficulty": "Easy", "leetcodeUrl": "https://leetcode.com/problems/implement-queue-using-stacks/" },
      { "id": 297, "name": "Implement n queue in an array", "difficulty": "Hard", "leetcodeUrl": "https://www.geeksforgeeks.org/efficiently-implement-k-queues-single-array/" },
      { "id": 298, "name": "Implement a Circular queue", "difficulty": "Easy", "leetcodeUrl": "https://leetcode.com/problems/design-circular-queue/" },
      { "id": 299, "name": "LRU Cache Implementation", "difficulty": "Hard", "leetcodeUrl": "https://leetcode.com/problems/lru-cache/" },
      { "id": 300, "name": "Reverse a Queue using recursion", "difficulty": "Easy", "leetcodeUrl": "https://practice.geeksforgeeks.org/problems/queue-reversal/1" },
      { "id": 301, "name": "Reverse the first K elements of a queue", "difficulty": "Easy", "leetcodeUrl": "https://practice.geeksforgeeks.org/problems/reverse-first-k-elements-of-queue/1" },
      { "id": 302, "name": "Interleave the first half of the queue with second half", "difficulty": "Medium", "leetcodeUrl": "https://www.geeksforgeeks.org/interleave-first-half-queue-second-half/" },
      { "id": 303, "name": "Find the first circular tour that visits all Petrol Pumps", "difficulty": "Medium", "leetcodeUrl": "https://practice.geeksforgeeks.org/problems/circular-tour-1587115620/1" },
      { "id": 304, "name": "Minimum time required to rot all oranges", "difficulty": "Medium", "leetcodeUrl": "https://leetcode.com/problems/rotting-oranges/" },
      { "id": 305, "name": "Distance of nearest cell having 1 in a binary matrix", "difficulty": "Medium", "leetcodeUrl": "https://leetcode.com/problems/01-matrix/" },
      { "id": 306, "name": "First negative integer in every window of size k", "difficulty": "Easy", "leetcodeUrl": "https://practice.geeksforgeeks.org/problems/first-negative-integer-in-every-window-of-size-k3345/1" },
      { "id": 307, "name": "Check if all levels of two trees are anagrams or not", "difficulty": "Hard", "leetcodeUrl": "https://www.geeksforgeeks.org/check-if-all-levels-of-two-trees-are-anagrams-or-not/" },
      { "id": 308, "name": "Sum of minimum and maximum elements of all subarrays of size k", "difficulty": "Medium", "leetcodeUrl": "https://www.geeksforgeeks.org/sum-minimum-maximum-elements-subarrays-size-k/" },
      { "id": 309, "name": "Minimum sum of squares of character counts in a given string after removing k characters", "difficulty": "Hard", "leetcodeUrl": "https://practice.geeksforgeeks.org/problems/game-with-string4100/1" },
      { "id": 310, "name": "Queue based approach or first non-repeating character in a stream", "difficulty": "Medium", "leetcodeUrl": "https://practice.geeksforgeeks.org/problems/first-non-repeating-character-in-a-stream1216/1" },
      { "id": 311, "name": "Next Smaller Element", "difficulty": "Medium", "leetcodeUrl": "https://www.geeksforgeeks.org/next-smaller-element/" }
    ],
  
    "Heap": [
      { "id": 312, "name": "Implement a Maxheap/MinHeap using arrays and recursion", "difficulty": "Easy", "leetcodeUrl": "https://www.geeksforgeeks.org/building-heap-from-array/" },
      { "id": 313, "name": "Sort an Array using heap (HeapSort)", "difficulty": "Medium", "leetcodeUrl": "https://www.geeksforgeeks.org/heap-sort/" },
      { "id": 314, "name": "Maximum of all subarrays of size k", "difficulty": "Hard", "leetcodeUrl": "https://leetcode.com/problems/sliding-window-maximum/" },
      { "id": 315, "name": "k largest element in an array", "difficulty": "Easy", "leetcodeUrl": "https://leetcode.com/problems/kth-largest-element-in-an-array/" },
      { "id": 316, "name": "Kth smallest and largest element in an unsorted array", "difficulty": "Medium", "leetcodeUrl": "https://practice.geeksforgeeks.org/problems/kth-smallest-element5635/1" },
      { "id": 317, "name": "Merge K sorted arrays", "difficulty": "Hard", "leetcodeUrl": "https://practice.geeksforgeeks.org/problems/merge-k-sorted-arrays/1" },
      { "id": 318, "name": "Merge 2 Binary Max Heaps", "difficulty": "Easy", "leetcodeUrl": "https://practice.geeksforgeeks.org/problems/merge-two-binary-max-heap0144/1" },
      { "id": 319, "name": "Kth largest sum continuous subarrays", "difficulty": "Medium", "leetcodeUrl": "https://www.geeksforgeeks.org/k-th-largest-sum-contiguous-subarray/" },
      { "id": 320, "name": "Leetcode- reorganize strings", "difficulty": "Medium", "leetcodeUrl": "https://leetcode.com/problems/reorganize-string/" },
      { "id": 321, "name": "Merge K Sorted Linked Lists", "difficulty": "Hard", "leetcodeUrl": "https://leetcode.com/problems/merge-k-sorted-lists/" },
      { "id": 322, "name": "Smallest range in K lists", "difficulty": "Hard", "leetcodeUrl": "https://leetcode.com/problems/smallest-range-covering-elements-from-k-lists/" },
      { "id": 323, "name": "Median in a stream of Integers", "difficulty": "Hard", "leetcodeUrl": "https://leetcode.com/problems/find-median-from-data-stream/" },
      { "id": 324, "name": "Check if a Binary Tree is Heap", "difficulty": "Medium", "leetcodeUrl": "https://practice.geeksforgeeks.org/problems/is-binary-tree-heap/1" },
      { "id": 325, "name": "Connect n ropes with minimum cost", "difficulty": "Easy", "leetcodeUrl": "https://practice.geeksforgeeks.org/problems/minimum-cost-of-ropes-1587115620/1" },
      { "id": 326, "name": "Convert BST to Min Heap", "difficulty": "Hard", "leetcodeUrl": "https://www.geeksforgeeks.org/convert-bst-min-heap/" },
      { "id": 327, "name": "Convert min heap to max heap", "difficulty": "Easy", "leetcodeUrl": "https://www.geeksforgeeks.org/convert-min-heap-to-max-heap/" },
      { "id": 328, "name": "Rearrange characters in a string such that no two adjacent are same", "difficulty": "Hard", "leetcodeUrl": "https://practice.geeksforgeeks.org/problems/rearrange-characters4649/1" },
      { "id": 329, "name": "Minimum sum of two numbers formed from digits of an array", "difficulty": "Medium", "leetcodeUrl": "https://practice.geeksforgeeks.org/problems/minimum-sum4058/1" }
    ],
  
    "Graph": [
      { "id": 330, "name": "Create a Graph, print it", "difficulty": "Easy", "leetcodeUrl": "https://www.geeksforgeeks.org/graph-and-its-representations/" },
      { "id": 331, "name": "Implement BFS algorithm", "difficulty": "Easy", "leetcodeUrl": "https://practice.geeksforgeeks.org/problems/bfs-traversal-of-graph/1" },
      { "id": 332, "name": "Implement DFS Algo", "difficulty": "Easy", "leetcodeUrl": "https://practice.geeksforgeeks.org/problems/depth-first-traversal-for-a-graph/1" },
      { "id": 333, "name": "Detect Cycle in Directed Graph using BFS/DFS Algo", "difficulty": "Medium", "leetcodeUrl": "https://practice.geeksforgeeks.org/problems/detect-cycle-in-a-directed-graph/1" },
      { "id": 334, "name": "Detect Cycle in UnDirected Graph using BFS/DFS Algo", "difficulty": "Medium", "leetcodeUrl": "https://practice.geeksforgeeks.org/problems/detect-cycle-in-an-undirected-graph/1" },
      { "id": 335, "name": "Search in a Maze", "difficulty": "Medium", "leetcodeUrl": "https://practice.geeksforgeeks.org/problems/rat-in-a-maze-problem/1" },
      { "id": 336, "name": "Minimum Step by Knight", "difficulty": "Medium", "leetcodeUrl": "https://practice.geeksforgeeks.org/problems/steps-by-knight5927/1" },
      { "id": 337, "name": "Flood fill algo", "difficulty": "Easy", "leetcodeUrl": "https://leetcode.com/problems/flood-fill/" },
      { "id": 338, "name": "Clone a graph", "difficulty": "Medium", "leetcodeUrl": "https://leetcode.com/problems/clone-graph/" },
      { "id": 339, "name": "Making wired Connections", "difficulty": "Medium", "leetcodeUrl": "https://leetcode.com/problems/number-of-operations-to-make-network-connected/" },
      { "id": 340, "name": "Word Ladder", "difficulty": "Hard", "leetcodeUrl": "https://leetcode.com/problems/word-ladder/" },
      { "id": 341, "name": "Dijkstra algo", "difficulty": "Medium", "leetcodeUrl": "https://practice.geeksforgeeks.org/problems/implementing-dijkstra-set-1-adjacency-matrix/1" },
      { "id": 342, "name": "Implement Topological Sort", "difficulty": "Medium", "leetcodeUrl": "https://practice.geeksforgeeks.org/problems/topological-sort/1" },
      { "id": 343, "name": "Minimum time taken by each job to be completed given by a Directed Acyclic Graph", "difficulty": "Hard", "leetcodeUrl": "https://www.geeksforgeeks.org/minimum-time-taken-by-each-job-to-be-completed-given-by-a-directed-acyclic-graph/" },
      { "id": 344, "name": "Find whether it is possible to finish all tasks or not from given dependencies", "difficulty": "Medium", "leetcodeUrl": "https://leetcode.com/problems/course-schedule/" },
      { "id": 345, "name": "Find the no. of Islands", "difficulty": "Medium", "leetcodeUrl": "https://leetcode.com/problems/number-of-islands/" },
      { "id": 346, "name": "Given a sorted Dictionary of an Alien Language, find order of characters", "difficulty": "Hard", "leetcodeUrl": "https://practice.geeksforgeeks.org/problems/alien-dictionary/1" },
      { "id": 347, "name": "Implement Kruskals Algorithm", "difficulty": "Medium", "leetcodeUrl": "https://practice.geeksforgeeks.org/problems/minimum-spanning-tree/1" },
      { "id": 348, "name": "Implement Prims Algorithm", "difficulty": "Medium", "leetcodeUrl": "https://practice.geeksforgeeks.org/problems/minimum-spanning-tree/1" },
      { "id": 349, "name": "Total no. of Spanning tree in a graph", "difficulty": "Hard", "leetcodeUrl": "https://www.geeksforgeeks.org/total-number-spanning-trees-graph/" },
      { "id": 350, "name": "Implement Bellman Ford Algorithm", "difficulty": "Medium", "leetcodeUrl": "https://practice.geeksforgeeks.org/problems/distance-from-the-source-bellman-ford-algorithm/1" },
      { "id": 351, "name": "Implement Floyd warshall Algorithm", "difficulty": "Medium", "leetcodeUrl": "https://practice.geeksforgeeks.org/problems/implementing-floyd-warshall2042/1" },
      { "id": 352, "name": "Travelling Salesman Problem", "difficulty": "Hard", "leetcodeUrl": "https://www.geeksforgeeks.org/travelling-salesman-problem-set-1/" },
      { "id": 353, "name": "Graph Colouring Problem", "difficulty": "Hard", "leetcodeUrl": "https://www.geeksforgeeks.org/graph-coloring-applications/" },
      { "id": 354, "name": "Snake and Ladders Problem", "difficulty": "Medium", "leetcodeUrl": "https://leetcode.com/problems/snakes-and-ladders/" },
      { "id": 355, "name": "Find bridge in a graph", "difficulty": "Hard", "leetcodeUrl": "https://practice.geeksforgeeks.org/problems/bridge-edge-in-graph/1" },
      { "id": 356, "name": "Count Strongly connected Components(Kosaraju Algo)", "difficulty": "Hard", "leetcodeUrl": "https://practice.geeksforgeeks.org/problems/strongly-connected-components-kosarajus-algo/1" },
      { "id": 357, "name": "Check whether a graph is Bipartite or Not", "difficulty": "Medium", "leetcodeUrl": "https://leetcode.com/problems/is-graph-bipartite/" },
      { "id": 358, "name": "Detect Negative cycle in a graph", "difficulty": "Medium", "leetcodeUrl": "https://practice.geeksforgeeks.org/problems/negative-weight-cycle3504/1" },
      { "id": 359, "name": "Longest path in a Directed Acyclic Graph", "difficulty": "Hard", "leetcodeUrl": "https://www.geeksforgeeks.org/find-longest-path-directed-acyclic-graph/" },
      { "id": 360, "name": "Journey to the Moon", "difficulty": "Medium", "leetcodeUrl": "https://www.hackerrank.com/challenges/journey-to-the-moon/problem" },
      { "id": 361, "name": "Cheapest Flights Within K Stops", "difficulty": "Medium", "leetcodeUrl": "https://leetcode.com/problems/cheapest-flights-within-k-stops/" },
      { "id": 362, "name": "Oliver and the Game", "difficulty": "Hard", "leetcodeUrl": "https://www.hackerearth.com/practice/algorithms/graphs/topological-sort/practice-problems/algorithm/oliver-and-the-game-3/" },
      { "id": 363, "name": "Water Jug problem using BFS", "difficulty": "Medium", "leetcodeUrl": "https://www.geeksforgeeks.org/water-jug-problem-using-bfs/" },
      { "id": 364, "name": "Find if there is a path of more than k length from a source", "difficulty": "Hard", "leetcodeUrl": "https://www.geeksforgeeks.org/find-if-there-is-a-path-of-more-than-k-length-from-a-source/" },
      { "id": 365, "name": "M-Colouring Problem", "difficulty": "Hard", "leetcodeUrl": "https://practice.geeksforgeeks.org/problems/m-coloring-problem-1587115620/1" },
      { "id": 366, "name": "Minimum edges to reverse to make path from source to destination", "difficulty": "Hard", "leetcodeUrl": "https://www.geeksforgeeks.org/minimum-edges-reverse-make-path-source-destination/" },
      { "id": 367, "name": "Paths to travel each nodes using each edge (Seven Bridges)", "difficulty": "Hard", "leetcodeUrl": "https://www.geeksforgeeks.org/paths-travel-nodes-using-edgeseven-bridges-konigsberg/" },
      { "id": 368, "name": "Vertex Cover Problem", "difficulty": "Hard", "leetcodeUrl": "https://www.geeksforgeeks.org/vertex-cover-problem-set-1-introduction-approximate-algorithm-2/" },
      { "id": 369, "name": "Chinese Postman or Route Inspection", "difficulty": "Hard", "leetcodeUrl": "https://www.geeksforgeeks.org/chinese-postman-route-inspection-set-1-introduction/" },
      { "id": 370, "name": "Number of Triangles in a Directed and Undirected Graph", "difficulty": "Medium", "leetcodeUrl": "https://www.geeksforgeeks.org/number-of-triangles-in-directed-and-undirected-graphs/" },
      { "id": 371, "name": "Minimise the cashflow among a given set of friends who have borrowed money from each other", "difficulty": "Hard", "leetcodeUrl": "https://www.geeksforgeeks.org/minimize-cash-flow-among-given-set-friends-borrowed-money/" },
      { "id": 372, "name": "Two Clique Problem", "difficulty": "Hard", "leetcodeUrl": "https://www.geeksforgeeks.org/two-clique-problem-check-graph-can-divided-two-cliques/" }
    ],
  
    "Trie": [
      { "id": 373, "name": "Construct a trie from scratch", "difficulty": "Medium", "leetcodeUrl": "https://leetcode.com/problems/implement-trie-prefix-tree/" },
      { "id": 374, "name": "Find shortest unique prefix for every word in a given list", "difficulty": "Medium", "leetcodeUrl": "https://www.geeksforgeeks.org/find-all-shortest-unique-prefixes-to-represent-each-word-in-a-given-list/" },
      { "id": 375, "name": "Word Break Problem | (Trie solution)", "difficulty": "Medium", "leetcodeUrl": "https://www.geeksforgeeks.org/word-break-problem-trie-solution/" },
      { "id": 376, "name": "Given a sequence of words, print all anagrams together", "difficulty": "Medium", "leetcodeUrl": "https://practice.geeksforgeeks.org/problems/k-anagrams-1587115620/1" },
      { "id": 377, "name": "Implement a Phone Directory", "difficulty": "Hard", "leetcodeUrl": "https://practice.geeksforgeeks.org/problems/phone-directory4628/1" },
      { "id": 378, "name": "Print unique rows in a given boolean matrix", "difficulty": "Medium", "leetcodeUrl": "https://practice.geeksforgeeks.org/problems/unique-rows-in-boolean-matrix/1" }
    ],
  
    "Dynamic Programming":
    [    { "id": 405, "name": "Min Cost Path Problem", "difficulty": "Medium", "leetcodeUrl": "https://practice.geeksforgeeks.org/problems/path-in-matrix3805/1" },
        { "id": 406, "name": "Maximum difference of zeros and ones in binary string", "difficulty": "Medium", "leetcodeUrl": "https://practice.geeksforgeeks.org/problems/maximum-difference-of-zeros-and-ones-in-binary-string4111/1" },
        { "id": 407, "name": "Minimum number of jumps to reach end", "difficulty": "Medium", "leetcodeUrl": "https://practice.geeksforgeeks.org/problems/minimum-number-of-jumps-1587115620/1" },
        { "id": 408, "name": "Minimum cost to fill given weight in a bag", "difficulty": "Medium", "leetcodeUrl": "https://practice.geeksforgeeks.org/problems/minimum-cost-to-fill-given-weight-in-a-bag1956/1" },
        { "id": 409, "name": "Minimum removals from array to make max – min <= K", "difficulty": "Hard", "leetcodeUrl": "https://www.geeksforgeeks.org/minimum-removals-array-make-max-min-k/" },
        { "id": 410, "name": "Longest Common Substring", "difficulty": "Medium", "leetcodeUrl": "https://practice.geeksforgeeks.org/problems/longest-common-substring1452/1" },
        { "id": 411, "name": "Count number of ways to reacha given score in a game", "difficulty": "Medium", "leetcodeUrl": "https://practice.geeksforgeeks.org/problems/reach-a-given-score-1587115621/1" },
        { "id": 412, "name": "Count Balanced Binary Trees of Height h", "difficulty": "Hard", "leetcodeUrl": "https://practice.geeksforgeeks.org/problems/bbt-counter4914/1" },
        { "id": 413, "name": "LargestSum Contiguous Subarray", "difficulty": "Medium", "leetcodeUrl": "https://leetcode.com/problems/maximum-subarray/" },
        { "id": 414, "name": "Smallest sum contiguous subarray", "difficulty": "Easy", "leetcodeUrl": "https://www.geeksforgeeks.org/smallest-sum-contiguous-subarray/" },
        { "id": 415, "name": "Unbounded Knapsack (Repetition of items allowed)", "difficulty": "Medium", "leetcodeUrl": "https://practice.geeksforgeeks.org/problems/knapsack-with-duplicate-items4201/1" },
        { "id": 416, "name": "Word Break Problem", "difficulty": "Medium", "leetcodeUrl": "https://leetcode.com/problems/word-break/" },
        { "id": 417, "name": "Largest Independent Set Problem", "difficulty": "Hard", "leetcodeUrl": "https://www.geeksforgeeks.org/largest-independent-set-problem-dp-26/" },
        { "id": 418, "name": "Partition problem", "difficulty": "Hard", "leetcodeUrl": "https://practice.geeksforgeeks.org/problems/subset-sum-problem2014/1" },
        { "id": 419, "name": "Longest Palindromic Subsequence", "difficulty": "Medium", "leetcodeUrl": "https://leetcode.com/problems/longest-palindromic-subsequence/" },
        { "id": 420, "name": "Count All Palindromic Subsequence in a given String", "difficulty": "Hard", "leetcodeUrl": "https://practice.geeksforgeeks.org/problems/count-palindromic-subsequences/1" },
        { "id": 421, "name": "Longest alternating subsequence", "difficulty": "Medium", "leetcodeUrl": "https://practice.geeksforgeeks.org/problems/longest-alternating-subsequence5951/1" },
        { "id": 422, "name": "Weighted Job Scheduling", "difficulty": "Hard", "leetcodeUrl": "https://www.geeksforgeeks.org/weighted-job-scheduling/" },
        { "id": 423, "name": "Coin game winner where every player has three choices", "difficulty": "Medium", "leetcodeUrl": "https://www.geeksforgeeks.org/coin-game-winner-every-player-three-choices/" },
        { "id": 424, "name": "Count Derangements (Permutation such that no element appears in its original position)", "difficulty": "Hard", "leetcodeUrl": "https://www.geeksforgeeks.org/count-derangements-permutation-such-that-no-element-appears-in-its-original-position/" },
        { "id": 425, "name": "Maximum profit by buying and selling a share at most twice", "difficulty": "Hard", "leetcodeUrl": "https://leetcode.com/problems/best-time-to-buy-and-sell-stock-iii/" },
        { "id": 426, "name": "Optimal Strategy for a Game", "difficulty": "Hard", "leetcodeUrl": "https://practice.geeksforgeeks.org/problems/optimal-strategy-for-a-game-1587115620/1" },
        { "id": 427, "name": "Optimal Binary Search Tree", "difficulty": "Hard", "leetcodeUrl": "https://www.geeksforgeeks.org/optimal-binary-search-tree-dp-24/" },
        { "id": 428, "name": "Palindrome PartitioningProblem", "difficulty": "Hard", "leetcodeUrl": "https://leetcode.com/problems/palindrome-partitioning-ii/" },
        { "id": 429, "name": "Word Wrap Problem", "difficulty": "Hard", "leetcodeUrl": "https://practice.geeksforgeeks.org/problems/word-wrap1646/1" },
        { "id": 430, "name": "Mobile Numeric Keypad Problem", "difficulty": "Medium", "leetcodeUrl": "https://practice.geeksforgeeks.org/problems/mobile-numeric-keypad5456/1" },
        { "id": 431, "name": "Boolean Parenthesization Problem", "difficulty": "Hard", "leetcodeUrl": "https://practice.geeksforgeeks.org/problems/boolean-parenthesization5610/1" },
        { "id": 432, "name": "Largest rectangular sub-matrix whose sum is 0", "difficulty": "Hard", "leetcodeUrl": "https://www.geeksforgeeks.org/largest-rectangular-sub-matrix-whose-sum-0/" },
        { "id": 433, "name": "Largest area rectangular sub-matrix with equal number of 1's and 0's", "difficulty": "Hard", "leetcodeUrl": "https://www.geeksforgeeks.org/largest-area-rectangular-sub-matrix-equal-number-1s-0s/" },
        { "id": 434, "name": "Maximum sum rectangle in a 2D matrix", "difficulty": "Hard", "leetcodeUrl": "https://practice.geeksforgeeks.org/problems/maximum-sum-rectangle2948/1" },
        { "id": 435, "name": "Maximum profit by buying and selling a share at most k times", "difficulty": "Hard", "leetcodeUrl": "https://leetcode.com/problems/best-time-to-buy-and-sell-stock-iv/" },
        { "id": 436, "name": "Find if a string is interleaved of two other strings", "difficulty": "Hard", "leetcodeUrl": "https://practice.geeksforgeeks.org/problems/interleaved-strings/1" },
        { "id": 437, "name": "Maximum Length of Pair Chain", "difficulty": "Medium", "leetcodeUrl": "https://leetcode.com/problems/maximum-length-of-pair-chain/" }
      ],
    
      "Bit Manipulation": [
        { "id": 438, "name": "Count set bits in an integer", "difficulty": "Easy", "leetcodeUrl": "https://leetcode.com/problems/number-of-1-bits/" },
        { "id": 439, "name": "Find the two non-repeating elements in an array of repeating elements", "difficulty": "Medium", "leetcodeUrl": "https://practice.geeksforgeeks.org/problems/finding-the-numbers0215/1" },
        { "id": 440, "name": "Count number of bits to be flipped to convert A to B", "difficulty": "Easy", "leetcodeUrl": "https://practice.geeksforgeeks.org/problems/bit-difference-1587115620/1" },
        { "id": 441, "name": "Count total set bits in all numbers from 1 to n", "difficulty": "Medium", "leetcodeUrl": "https://practice.geeksforgeeks.org/problems/count-total-set-bits-1587115620/1" },
        { "id": 442, "name": "Program to find whether a no is power of two", "difficulty": "Easy", "leetcodeUrl": "https://leetcode.com/problems/power-of-two/" },
        { "id": 443, "name": "Find position of the only set bit", "difficulty": "Easy", "leetcodeUrl": "https://practice.geeksforgeeks.org/problems/find-position-of-set-bit3706/1" },
        { "id": 444, "name": "Copy set bits in a range", "difficulty": "Medium", "leetcodeUrl": "https://www.geeksforgeeks.org/copy-set-bits-in-a-range/" },
        { "id": 445, "name": "Divide two integers without using multiplication, division and mod operator", "difficulty": "Medium", "leetcodeUrl": "https://leetcode.com/problems/divide-two-integers/" },
        { "id": 446, "name": "Calculate square of a number without using *, / and pow()", "difficulty": "Medium", "leetcodeUrl": "https://www.geeksforgeeks.org/calculate-square-of-a-number-without-using-and-pow/" },
        { "id": 447, "name": "Power Set", "difficulty": "Medium", "leetcodeUrl": "https://leetcode.com/problems/subsets/" }
      ]
    };
    
    // Topic metadata
    export const TOPICS_META = {
      "Array": { count: 36, icon: "📊", color: "#8b5cf6" },
      "Matrix": { count: 10, icon: "🔢", color: "#ec4899" },
      "String": { count: 44, icon: "📝", color: "#06b6d4" },
      "Searching & Sorting": { count: 36, icon: "🔍", color: "#10b981" },
      "LinkedList": { count: 36, icon: "🔗", color: "#f59e0b" },
      "Binary Trees": { count: 35, icon: "🌲", color: "#8b5cf6" },
      "Binary Search Trees": { count: 22, icon: "🌳", color: "#ec4899" },
      "Greedy": { count: 35, icon: "💰", color: "#06b6d4" },
      "BackTracking": { count: 19, icon: "🔙", color: "#10b981" },
      "Stacks and Queues": { count: 38, icon: "📚", color: "#f59e0b" },
      "Heap": { count: 18, icon: "⛰️", color: "#8b5cf6" },
      "Graph": { count: 44, icon: "🕸️", color: "#ec4899" },
      "Trie": { count: 6, icon: "🔤", color: "#06b6d4" },
      "Dynamic Programming": { count: 60, icon: "⚡", color: "#10b981" },
      "Bit Manipulation": { count: 10, icon: "🔢", color: "#f59e0b" }
    };
    
    // Helper function to get all questions as a flat array
    export function getAllQuestions() {
        const questions = [];
        Object.keys(QUESTIONS_DATA).forEach(topic => {
            QUESTIONS_DATA[topic].forEach(q => {
                questions.push({ ...q, topic });
            });
        });
        return questions;
    }
    
    // Helper function to get questions by topic
    export function getQuestionsByTopic(topicName) {
        return QUESTIONS_DATA[topicName] || [];
    }
    
    // Helper function to count total questions
    export function getTotalQuestionCount() {
        return getAllQuestions().length;
    }
    
    // Helper function to get topic statistics
    export function getTopicStats(topicName) {
        const questions = QUESTIONS_DATA[topicName] || [];
        return {
            total: questions.length,
            easy: questions.filter(q => q.difficulty === 'Easy').length,
            medium: questions.filter(q => q.difficulty === 'Medium').length,
            hard: questions.filter(q => q.difficulty === 'Hard').length
        };
    }
    
  