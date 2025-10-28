import { auth } from './firebase-config.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { getFirestore, doc, getDoc, setDoc } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

// Import questions data
const QUESTIONS_BY_TOPIC = {
           
    "Array": [
        { id: 1, name: "Reverse the array", difficulty: "Easy", url: "https://practice.geeksforgeeks.org/problems/reverse-an-array/0" },
        { id: 2, name: "Find maximum and minimum element in an array", difficulty: "Easy", url: "https://practice.geeksforgeeks.org/problems/find-minimum-and-maximum-element-in-an-array4428/1" },
        { id: 3, name: "Find Kth max and min element of an array", difficulty: "Medium", url: "https://practice.geeksforgeeks.org/problems/kth-smallest-element5635/1" },
        { id: 4, name: "Sort array of 0s, 1s and 2s", difficulty: "Medium", url: "https://practice.geeksforgeeks.org/problems/sort-an-array-of-0s-1s-and-2s4231/1" },
        { id: 5, name: "Move all negative elements to one side", difficulty: "Easy", url: "https://www.geeksforgeeks.org/move-negative-numbers-beginning-positive-end-constant-extra-space/" },
        { id: 6, name: "Union and Intersection of two sorted arrays", difficulty: "Medium", url: "https://practice.geeksforgeeks.org/problems/union-of-two-arrays3538/1" },
        { id: 7, name: "Cyclically rotate an array by one", difficulty: "Easy", url: "https://practice.geeksforgeeks.org/problems/cyclically-rotate-an-array-by-one2614/1" },
        { id: 8, name: "Kadane's Algorithm - Maximum Subarray", difficulty: "Medium", url: "https://leetcode.com/problems/maximum-subarray/" },
        { id: 9, name: "Minimize the heights", difficulty: "Medium", url: "https://practice.geeksforgeeks.org/problems/minimize-the-heights3351/1" },
        { id: 10, name: "Minimum number of jumps", difficulty: "Medium", url: "https://practice.geeksforgeeks.org/problems/minimum-number-of-jumps-1587115620/1" },
        { id: 11, name: "Find duplicate in an array", difficulty: "Medium", url: "https://leetcode.com/problems/find-the-duplicate-number/" },
        { id: 12, name: "Merge two sorted arrays without extra space", difficulty: "Hard", url: "https://practice.geeksforgeeks.org/problems/merge-two-sorted-arrays5135/1" },
        { id: 13, name: "Merge Intervals", difficulty: "Medium", url: "https://leetcode.com/problems/merge-intervals/" },
        { id: 14, name: "Next Permutation", difficulty: "Medium", url: "https://leetcode.com/problems/next-permutation/" },
        { id: 15, name: "Count Inversions", difficulty: "Hard", url: "https://practice.geeksforgeeks.org/problems/inversion-of-array-1587115620/1" },
        { id: 16, name: "Best time to buy and sell stock", difficulty: "Easy", url: "https://leetcode.com/problems/best-time-to-buy-and-sell-stock/" },
        { id: 17, name: "Find all pairs with given sum", difficulty: "Easy", url: "https://practice.geeksforgeeks.org/problems/count-pairs-with-given-sum5022/1" },
        { id: 18, name: "Common elements in 3 sorted arrays", difficulty: "Medium", url: "https://practice.geeksforgeeks.org/problems/common-elements1132/1" },
        { id: 19, name: "Rearrange array alternating positive & negative", difficulty: "Medium", url: "https://practice.geeksforgeeks.org/problems/array-of-alternate-ve-and-ve-nos1401/1" },
        { id: 20, name: "Subarray with 0 sum", difficulty: "Medium", url: "https://practice.geeksforgeeks.org/problems/subarray-with-0-sum-1587115621/1" },
        { id: 21, name: "Factorial of large number", difficulty: "Hard", url: "https://practice.geeksforgeeks.org/problems/factorials-of-large-numbers2508/1" },
        { id: 22, name: "Maximum product subarray", difficulty: "Medium", url: "https://leetcode.com/problems/maximum-product-subarray/" },
        { id: 23, name: "Longest consecutive subsequence", difficulty: "Medium", url: "https://leetcode.com/problems/longest-consecutive-sequence/" },
        { id: 24, name: "Elements appearing more than n/k times", difficulty: "Hard", url: "https://practice.geeksforgeeks.org/problems/count-element-occurences/1" },
        { id: 25, name: "Best time to buy and sell stock twice", difficulty: "Hard", url: "https://leetcode.com/problems/best-time-to-buy-and-sell-stock-iii/" },
        { id: 26, name: "Array subset of another array", difficulty: "Easy", url: "https://practice.geeksforgeeks.org/problems/array-subset-of-another-array2317/1" },
        { id: 27, name: "Triplet sum in array", difficulty: "Medium", url: "https://leetcode.com/problems/3sum/" },
        { id: 28, name: "Trapping Rain Water", difficulty: "Hard", url: "https://leetcode.com/problems/trapping-rain-water/" },
        { id: 29, name: "Chocolate Distribution Problem", difficulty: "Easy", url: "https://practice.geeksforgeeks.org/problems/chocolate-distribution-problem3825/1" },
        { id: 30, name: "Smallest subarray with sum greater than x", difficulty: "Medium", url: "https://practice.geeksforgeeks.org/problems/smallest-subarray-with-sum-greater-than-x5651/1" },
        { id: 31, name: "Three way partitioning", difficulty: "Medium", url: "https://practice.geeksforgeeks.org/problems/three-way-partitioning/1" },
        { id: 32, name: "Minimum swaps to bring elements <= k together", difficulty: "Medium", url: "https://practice.geeksforgeeks.org/problems/minimum-swaps-required-to-bring-all-elements-less-than-or-equal-to-k-together4847/1" },
        { id: 33, name: "Minimum operations to make array palindrome", difficulty: "Medium", url: "https://practice.geeksforgeeks.org/problems/palindromic-array-1587115620/1" },
        { id: 34, name: "Median of 2 sorted arrays of equal size", difficulty: "Hard", url: "https://leetcode.com/problems/median-of-two-sorted-arrays/" },
        { id: 35, name: "Median of 2 sorted arrays of different size", difficulty: "Hard", url: "https://leetcode.com/problems/median-of-two-sorted-arrays/" },
        { id: 36, name: "Find missing and repeating", difficulty: "Medium", url: "https://practice.geeksforgeeks.org/problems/find-missing-and-repeating2512/1" }
    ],
    
    "Matrix": [
        { id: 37, name: "Spiral traversal of matrix", difficulty: "Medium", url: "https://leetcode.com/problems/spiral-matrix/" },
        { id: 38, name: "Search in a 2D matrix", difficulty: "Medium", url: "https://leetcode.com/problems/search-a-2d-matrix/" },
        { id: 39, name: "Median in row-wise sorted matrix", difficulty: "Hard", url: "https://practice.geeksforgeeks.org/problems/median-in-a-row-wise-sorted-matrix1527/1" },
        { id: 40, name: "Row with maximum 1's", difficulty: "Easy", url: "https://practice.geeksforgeeks.org/problems/row-with-max-1s0023/1" },
        { id: 41, name: "Print elements in sorted order", difficulty: "Hard", url: "https://practice.geeksforgeeks.org/problems/sorted-matrix2333/1" },
        { id: 42, name: "Maximum size rectangle", difficulty: "Hard", url: "https://practice.geeksforgeeks.org/problems/max-rectangle/1" },
        { id: 43, name: "Find specific pair in matrix", difficulty: "Hard", url: "https://www.geeksforgeeks.org/find-a-specific-pair-in-matrix/" },
        { id: 44, name: "Rotate matrix by 90 degrees", difficulty: "Medium", url: "https://leetcode.com/problems/rotate-image/" },
        { id: 45, name: "Kth smallest element in sorted matrix", difficulty: "Hard", url: "https://leetcode.com/problems/kth-smallest-element-in-a-sorted-matrix/" },
        { id: 46, name: "Common elements in all rows", difficulty: "Medium", url: "https://www.geeksforgeeks.org/common-elements-in-all-rows-of-a-given-matrix/" }
    ],

    "String": [
        { id: 47, name: "Reverse a String", difficulty: "Easy", url: "https://leetcode.com/problems/reverse-string/" },
        { id: 48, name: "Check if string is palindrome", difficulty: "Easy", url: "https://leetcode.com/problems/valid-palindrome/" },
        { id: 49, name: "Find duplicate characters", difficulty: "Easy", url: "https://practice.geeksforgeeks.org/problems/find-duplicates-in-an-array/1" },
        { id: 50, name: "Check if string is rotation of another", difficulty: "Easy", url: "https://leetcode.com/problems/rotate-string/" },
        { id: 51, name: "Valid shuffle of two strings", difficulty: "Medium", url: "https://practice.geeksforgeeks.org/problems/shuffle-integers0206/1" },
        { id: 52, name: "Count and Say problem", difficulty: "Medium", url: "https://leetcode.com/problems/count-and-say/" },
        { id: 53, name: "Longest palindrome in string", difficulty: "Medium", url: "https://leetcode.com/problems/longest-palindromic-substring/" },
        { id: 54, name: "Longest recurring subsequence", difficulty: "Hard", url: "https://practice.geeksforgeeks.org/problems/longest-repeating-subsequence2004/1" },
        { id: 55, name: "Print all subsequences", difficulty: "Medium", url: "https://practice.geeksforgeeks.org/problems/print-all-subsequences-of-a-string/1" },
        { id: 56, name: "Print all permutations", difficulty: "Medium", url: "https://leetcode.com/problems/permutations/" },
        { id: 57, name: "Split binary string with equal 0s and 1s", difficulty: "Easy", url: "https://practice.geeksforgeeks.org/problems/split-the-binary-string-into-substrings-with-equal-number-of-0s-and-1s/1" },
        { id: 58, name: "Word Wrap Problem", difficulty: "Hard", url: "https://practice.geeksforgeeks.org/problems/word-wrap1646/1" },
        { id: 59, name: "Edit Distance", difficulty: "Hard", url: "https://leetcode.com/problems/edit-distance/" },
        { id: 60, name: "Next greater number with same digits", difficulty: "Medium", url: "https://leetcode.com/problems/next-permutation/" },
        { id: 61, name: "Balanced parenthesis", difficulty: "Medium", url: "https://leetcode.com/problems/valid-parentheses/" },
        { id: 62, name: "Word break problem", difficulty: "Hard", url: "https://leetcode.com/problems/word-break/" },
        { id: 63, name: "Rabin Karp Algorithm", difficulty: "Hard", url: "https://leetcode.com/problems/repeated-string-match/" },
        { id: 64, name: "KMP Algorithm", difficulty: "Hard", url: "https://leetcode.com/problems/implement-strstr/" },
        { id: 65, name: "Convert sentence to mobile keypad sequence", difficulty: "Easy", url: "https://practice.geeksforgeeks.org/problems/convert-a-sentence-into-its-equivalent-mobile-numeric-keypad-sequence0547/1" },
        { id: 66, name: "Minimum bracket reversals", difficulty: "Medium", url: "https://practice.geeksforgeeks.org/problems/count-the-reversals0401/1" },
        { id: 67, name: "Count palindromic subsequences", difficulty: "Hard", url: "https://practice.geeksforgeeks.org/problems/count-palindromic-subsequences/1" },
        { id: 68, name: "Count string occurrences in 2D array", difficulty: "Medium", url: "https://practice.geeksforgeeks.org/problems/count-occurences-of-a-given-word-in-a-2-d-array/1" },
        { id: 69, name: "Search word in 2D grid", difficulty: "Medium", url: "https://leetcode.com/problems/word-search/" },
        { id: 70, name: "Boyer Moore Algorithm", difficulty: "Hard", url: "https://www.geeksforgeeks.org/boyer-moore-algorithm-for-pattern-searching/" },
        { id: 71, name: "Roman to Decimal", difficulty: "Easy", url: "https://leetcode.com/problems/roman-to-integer/" },
        { id: 72, name: "Longest Common Prefix", difficulty: "Easy", url: "https://leetcode.com/problems/longest-common-prefix/" },
        { id: 73, name: "Number of flips to make binary string alternate", difficulty: "Easy", url: "https://practice.geeksforgeeks.org/problems/min-number-of-flips3210/1" },
        { id: 74, name: "Find first repeated word", difficulty: "Easy", url: "https://practice.geeksforgeeks.org/problems/second-most-repeated-string-in-a-sequence0534/1" },
        { id: 75, name: "Minimum swaps for bracket balancing", difficulty: "Medium", url: "https://practice.geeksforgeeks.org/problems/minimum-swaps-for-bracket-balancing2704/1" },
        { id: 76, name: "Longest Common Subsequence", difficulty: "Medium", url: "https://leetcode.com/problems/longest-common-subsequence/" },
        { id: 77, name: "Generate all valid IP addresses", difficulty: "Hard", url: "https://leetcode.com/problems/restore-ip-addresses/" },
        { id: 78, name: "Smallest window containing all characters", difficulty: "Hard", url: "https://practice.geeksforgeeks.org/problems/smallest-distant-window3132/1" },
        { id: 79, name: "Rearrange characters - no two adjacent same", difficulty: "Hard", url: "https://practice.geeksforgeeks.org/problems/rearrange-characters4649/1" },
        { id: 80, name: "Minimum characters to add at front for palindrome", difficulty: "Hard", url: "https://www.geeksforgeeks.org/minimum-characters-added-front-make-string-palindrome/" },
        { id: 81, name: "Print anagrams together", difficulty: "Medium", url: "https://leetcode.com/problems/group-anagrams/" },
        { id: 82, name: "Minimum window substring", difficulty: "Hard", url: "https://leetcode.com/problems/minimum-window-substring/" },
        { id: 83, name: "Remove adjacent duplicates recursively", difficulty: "Easy", url: "https://leetcode.com/problems/remove-all-adjacent-duplicates-in-string/" },
        { id: 84, name: "String matching with wildcards", difficulty: "Hard", url: "https://leetcode.com/problems/wildcard-matching/" },
        { id: 85, name: "Function to find customers without computer", difficulty: "Medium", url: "https://www.geeksforgeeks.org/function-to-find-number-of-customers-who-could-not-get-a-computer/" },
        { id: 86, name: "Transform one string to another", difficulty: "Hard", url: "https://practice.geeksforgeeks.org/problems/transform-string5648/1" },
        { id: 87, name: "Check if two strings are k-anagrams", difficulty: "Easy", url: "https://practice.geeksforgeeks.org/problems/check-if-two-strings-are-k-anagrams-or-not/1" },
        { id: 88, name: "Minimum insertions to form palindrome", difficulty: "Hard", url: "https://practice.geeksforgeeks.org/problems/minimum-insertions-to-form-a-palindrome/1" },
        { id: 89, name: "Check if strings are rotations", difficulty: "Easy", url: "https://leetcode.com/problems/rotate-string/" },
        { id: 90, name: "Longest repeating character replacement", difficulty: "Medium", url: "https://leetcode.com/problems/longest-repeating-character-replacement/" }
    ],

    "Searching & Sorting": [
        { id: 91, name: "First and last position in sorted array", difficulty: "Medium", url: "https://leetcode.com/problems/find-first-and-last-position-of-element-in-sorted-array/" },
        { id: 92, name: "Find fixed point in array", difficulty: "Easy", url: "https://practice.geeksforgeeks.org/problems/value-equal-to-index-value1330/1" },
        { id: 93, name: "Search in rotated sorted array", difficulty: "Medium", url: "https://leetcode.com/problems/search-in-rotated-sorted-array/" },
        { id: 94, name: "Square root of integer", difficulty: "Easy", url: "https://leetcode.com/problems/sqrtx/" },
        { id: 95, name: "Max and min with minimum comparisons", difficulty: "Easy", url: "https://www.geeksforgeeks.org/maximum-and-minimum-in-an-array/" },
        { id: 96, name: "Optimum location to minimize distance", difficulty: "Hard", url: "https://www.geeksforgeeks.org/optimum-location-point-minimize-total-distance/" },
        { id: 97, name: "Find repeating and missing", difficulty: "Medium", url: "https://practice.geeksforgeeks.org/problems/find-missing-and-repeating2512/1" },
        { id: 98, name: "Majority element", difficulty: "Medium", url: "https://leetcode.com/problems/majority-element/" },
        { id: 99, name: "Search in array where adjacent differ by k", difficulty: "Medium", url: "https://www.geeksforgeeks.org/searching-array-adjacent-differ-k/" },
        { id: 100, name: "Find pair with given difference", difficulty: "Easy", url: "https://practice.geeksforgeeks.org/problems/find-pair-given-difference1559/1" },
        { id: 101, name: "Four elements with given sum", difficulty: "Medium", url: "https://leetcode.com/problems/4sum/" },
        { id: 102, name: "Maximum sum with no adjacent elements", difficulty: "Medium", url: "https://leetcode.com/problems/house-robber/" },
        { id: 103, name: "Count triplets with sum smaller than value", difficulty: "Medium", url: "https://practice.geeksforgeeks.org/problems/count-triplets-with-sum-smaller-than-x5549/1" },
        { id: 104, name: "Merge two sorted arrays", difficulty: "Easy", url: "https://leetcode.com/problems/merge-sorted-array/" },
        { id: 105, name: "Print subarrays with 0 sum", difficulty: "Medium", url: "https://practice.geeksforgeeks.org/problems/zero-sum-subarrays1825/1" },
        { id: 106, name: "Product array puzzle", difficulty: "Medium", url: "https://leetcode.com/problems/product-of-array-except-self/" },
        { id: 107, name: "Sort by set bit count", difficulty: "Medium", url: "https://practice.geeksforgeeks.org/problems/sort-by-set-bit-count1153/1" },
        { id: 108, name: "Minimum swaps to sort array", difficulty: "Medium", url: "https://practice.geeksforgeeks.org/problems/minimum-swaps/1" },
        { id: 109, name: "Bishu and Soldiers", difficulty: "Easy", url: "https://www.hackerearth.com/problem/algorithm/bishu-and-soldiers/" },
        { id: 110, name: "Rasta and Kheshtak", difficulty: "Medium", url: "https://www.hackerearth.com/problem/algorithm/rasta-and-kheshtak/" },
        { id: 111, name: "Kth smallest number again", difficulty: "Hard", url: "https://www.spoj.com/problems/KQUERY/" },
        { id: 112, name: "Find pivot in sorted array", difficulty: "Easy", url: "https://practice.geeksforgeeks.org/problems/rotation4723/1" },
        { id: 113, name: "Kth element of two sorted arrays", difficulty: "Hard", url: "https://practice.geeksforgeeks.org/problems/k-th-element-of-two-sorted-array1317/1" },
        { id: 114, name: "Aggressive cows", difficulty: "Hard", url: "https://www.spoj.com/problems/AGGRCOW/" },
        { id: 115, name: "Book allocation problem", difficulty: "Hard", url: "https://practice.geeksforgeeks.org/problems/allocate-minimum-number-of-pages0937/1" },
        { id: 116, name: "EKO SPOJ", difficulty: "Medium", url: "https://www.spoj.com/problems/EKO/" },
        { id: 117, name: "Job scheduling algorithm", difficulty: "Hard", url: "https://practice.geeksforgeeks.org/problems/job-sequencing-problem-1587115620/1" },
        { id: 118, name: "Missing number in AP", difficulty: "Easy", url: "https://practice.geeksforgeeks.org/problems/arithmetic-number2815/1" },
        { id: 119, name: "Smallest number with n trailing zeroes", difficulty: "Hard", url: "https://practice.geeksforgeeks.org/problems/smallest-factorial-number5929/1" },
        { id: 120, name: "Painters partition problem", difficulty: "Hard", url: "https://practice.geeksforgeeks.org/problems/the-painters-partition-problem1535/1" },
        { id: 121, name: "ROTI-Prata SPOJ", difficulty: "Medium", url: "https://www.spoj.com/problems/PRATA/" },
        { id: 122, name: "DoubleHelix SPOJ", difficulty: "Hard", url: "https://www.spoj.com/problems/ANARC05B/" },
        { id: 123, name: "Subset sums", difficulty: "Medium", url: "https://www.spoj.com/problems/SUBSUMS/" },
        { id: 124, name: "Inversion count", difficulty: "Hard", url: "https://practice.geeksforgeeks.org/problems/inversion-of-array-1587115620/1" },
        { id: 125, name: "Implement merge sort in-place", difficulty: "Hard", url: "https://www.geeksforgeeks.org/in-place-merge-sort/" },
        { id: 126, name: "Partitioning arrays with repeated entries", difficulty: "Hard", url: "https://www.geeksforgeeks.org/partitioning-and-sorting-arrays-with-many-repeated-entries/" }
    ],

    "LinkedList": [
        { id: 127, name: "Reverse a linked list", difficulty: "Easy", url: "https://leetcode.com/problems/reverse-linked-list/" },
        { id: 128, name: "Reverse linked list in groups", difficulty: "Medium", url: "https://leetcode.com/problems/reverse-nodes-in-k-group/" },
        { id: 129, name: "Detect loop in linked list", difficulty: "Easy", url: "https://leetcode.com/problems/linked-list-cycle/" },
        { id: 130, name: "Delete loop in linked list", difficulty: "Medium", url: "https://practice.geeksforgeeks.org/problems/remove-loop-in-linked-list/1" },
        { id: 131, name: "Find starting point of loop", difficulty: "Medium", url: "https://leetcode.com/problems/linked-list-cycle-ii/" },
        { id: 132, name: "Remove duplicates from sorted list", difficulty: "Easy", url: "https://leetcode.com/problems/remove-duplicates-from-sorted-list/" },
        { id: 133, name: "Remove duplicates from unsorted list", difficulty: "Medium", url: "https://practice.geeksforgeeks.org/problems/remove-duplicates-from-an-unsorted-linked-list/1" },
        { id: 134, name: "Move last element to front", difficulty: "Easy", url: "https://www.geeksforgeeks.org/move-last-element-to-front-of-a-given-linked-list/" },
        { id: 135, name: "Add 1 to number represented as linked list", difficulty: "Medium", url: "https://practice.geeksforgeeks.org/problems/add-1-to-a-number-represented-as-linked-list/1" },
        { id: 136, name: "Add two numbers as linked lists", difficulty: "Medium", url: "https://leetcode.com/problems/add-two-numbers/" },
        { id: 137, name: "Intersection of two sorted linked lists", difficulty: "Easy", url: "https://practice.geeksforgeeks.org/problems/intersection-of-two-sorted-linked-lists/1" },
        { id: 138, name: "Intersection point of two linked lists", difficulty: "Medium", url: "https://leetcode.com/problems/intersection-of-two-linked-lists/" },
        { id: 139, name: "Merge sort for linked lists", difficulty: "Medium", url: "https://leetcode.com/problems/sort-list/" },
        { id: 140, name: "Quicksort for linked lists", difficulty: "Hard", url: "https://practice.geeksforgeeks.org/problems/quick-sort-on-linked-list/1" },
        { id: 141, name: "Find middle of linked list", difficulty: "Easy", url: "https://leetcode.com/problems/middle-of-the-linked-list/" },
        { id: 142, name: "Check if circular linked list", difficulty: "Easy", url: "https://practice.geeksforgeeks.org/problems/circular-linked-list/1" },
        { id: 143, name: "Split circular linked list into halves", difficulty: "Medium", url: "https://practice.geeksforgeeks.org/problems/split-a-circular-linked-list-into-two-halves/1" },
        { id: 144, name: "Check if linked list is palindrome", difficulty: "Easy", url: "https://leetcode.com/problems/palindrome-linked-list/" },
        { id: 145, name: "Deletion from circular linked list", difficulty: "Easy", url: "https://www.geeksforgeeks.org/deletion-circular-linked-list/" },
        { id: 146, name: "Reverse doubly linked list", difficulty: "Easy", url: "https://practice.geeksforgeeks.org/problems/reverse-a-doubly-linked-list/1" },
        { id: 147, name: "Find pairs with given sum in DLL", difficulty: "Easy", url: "https://www.geeksforgeeks.org/find-pairs-given-sum-doubly-linked-list/" },
        { id: 148, name: "Count triplets in sorted DLL", difficulty: "Medium", url: "https://www.geeksforgeeks.org/count-triplets-sorted-doubly-linked-list-whose-sum-equal-given-value-x/" },
        { id: 149, name: "Sort k sorted doubly linked list", difficulty: "Hard", url: "https://www.geeksforgeeks.org/sort-k-sorted-doubly-linked-list/" },
        { id: 150, name: "Rotate doubly linked list by N nodes", difficulty: "Medium", url: "https://www.geeksforgeeks.org/rotate-doubly-linked-list-n-nodes/" },
        { id: 151, name: "Rotate DLL in groups", difficulty: "Hard", url: "https://www.geeksforgeeks.org/reverse-doubly-linked-list-groups-given-size/" },
        { id: 152, name: "Can we reverse in less than O(n)", difficulty: "Hard", url: "https://www.geeksforgeeks.org/can-we-reverse-a-linked-list-in-less-than-on/" },
        { id: 153, name: "Why quicksort for arrays and mergesort for lists", difficulty: "Easy", url: "https://www.geeksforgeeks.org/why-quick-sort-preferred-for-arrays-and-merge-sort-for-linked-lists/" },
        { id: 154, name: "Flatten a linked list", difficulty: "Hard", url: "https://practice.geeksforgeeks.org/problems/flattening-a-linked-list/1" },
        { id: 155, name: "Sort linked list of 0s 1s 2s", difficulty: "Easy", url: "https://practice.geeksforgeeks.org/problems/given-a-linked-list-of-0s-1s-and-2s-sort-it/1" },
        { id: 156, name: "Clone list with random pointer", difficulty: "Hard", url: "https://leetcode.com/problems/copy-list-with-random-pointer/" },
        { id: 157, name: "Merge K sorted lists", difficulty: "Hard", url: "https://leetcode.com/problems/merge-k-sorted-lists/" },
        { id: 158, name: "Multiply two linked lists", difficulty: "Hard", url: "https://practice.geeksforgeeks.org/problems/multiply-two-linked-lists/1" },
        { id: 159, name: "Delete nodes with greater value on right", difficulty: "Medium", url: "https://practice.geeksforgeeks.org/problems/delete-nodes-having-greater-value-on-right/1" },
        { id: 160, name: "Segregate even and odd nodes", difficulty: "Easy", url: "https://leetcode.com/problems/odd-even-linked-list/" },
        { id: 161, name: "Nth node from end", difficulty: "Easy", url: "https://leetcode.com/problems/remove-nth-node-from-end-of-list/" },
        { id: 162, name: "First non-repeating character from stream", difficulty: "Medium", url: "https://practice.geeksforgeeks.org/problems/first-non-repeating-character-in-a-stream1216/1" }
    ],

    "Binary Trees": [
        { id: 163, name: "Level order traversal", difficulty: "Easy", url: "https://leetcode.com/problems/binary-tree-level-order-traversal/" },
        { id: 164, name: "Reverse level order traversal", difficulty: "Easy", url: "https://practice.geeksforgeeks.org/problems/reverse-level-order-traversal/1" },
        { id: 165, name: "Height of tree", difficulty: "Easy", url: "https://leetcode.com/problems/maximum-depth-of-binary-tree/" },
        { id: 166, name: "Diameter of tree", difficulty: "Easy", url: "https://leetcode.com/problems/diameter-of-binary-tree/" },
        { id: 167, name: "Mirror of tree", difficulty: "Easy", url: "https://leetcode.com/problems/invert-binary-tree/" },
        { id: 168, name: "Inorder traversal", difficulty: "Easy", url: "https://leetcode.com/problems/binary-tree-inorder-traversal/" },
        { id: 169, name: "Preorder traversal", difficulty: "Easy", url: "https://leetcode.com/problems/binary-tree-preorder-traversal/" },
        { id: 170, name: "Postorder traversal", difficulty: "Easy", url: "https://leetcode.com/problems/binary-tree-postorder-traversal/" },
        { id: 171, name: "Left view of tree", difficulty: "Easy", url: "https://practice.geeksforgeeks.org/problems/left-view-of-binary-tree/1" },
        { id: 172, name: "Right view of tree", difficulty: "Easy", url: "https://leetcode.com/problems/binary-tree-right-side-view/" },
        { id: 173, name: "Top view of tree", difficulty: "Medium", url: "https://practice.geeksforgeeks.org/problems/top-view-of-binary-tree/1" },
        { id: 174, name: "Bottom view of tree", difficulty: "Medium", url: "https://practice.geeksforgeeks.org/problems/bottom-view-of-binary-tree/1" },
        { id: 175, name: "Zig-zag traversal", difficulty: "Medium", url: "https://leetcode.com/problems/binary-tree-zigzag-level-order-traversal/" },
        { id: 176, name: "Check if tree is balanced", difficulty: "Easy", url: "https://leetcode.com/problems/balanced-binary-tree/" },
        { id: 177, name: "Diagonal traversal", difficulty: "Medium", url: "https://practice.geeksforgeeks.org/problems/diagonal-traversal-of-binary-tree/1" },
        { id: 178, name: "Boundary traversal", difficulty: "Medium", url: "https://practice.geeksforgeeks.org/problems/boundary-traversal-of-binary-tree/1" },
        { id: 179, name: "Construct tree from string with brackets", difficulty: "Medium", url: "https://leetcode.com/problems/construct-string-from-binary-tree/" },
        { id: 180, name: "Convert tree to doubly linked list", difficulty: "Hard", url: "https://practice.geeksforgeeks.org/problems/binary-tree-to-dll/1" },
        { id: 181, name: "Convert tree to sum tree", difficulty: "Medium", url: "https://practice.geeksforgeeks.org/problems/transform-to-sum-tree/1" },
        { id: 182, name: "Construct tree from inorder and preorder", difficulty: "Medium", url: "https://leetcode.com/problems/construct-binary-tree-from-preorder-and-inorder-traversal/" },
        { id: 183, name: "Minimum swaps to convert to BST", difficulty: "Hard", url: "https://www.geeksforgeeks.org/minimum-swap-required-convert-binary-tree-binary-search-tree/" },
        { id: 184, name: "Check if sum tree", difficulty: "Medium", url: "https://practice.geeksforgeeks.org/problems/sum-tree/1" },
        { id: 185, name: "Check if all leaves at same level", difficulty: "Easy", url: "https://practice.geeksforgeeks.org/problems/leaf-at-same-level/1" },
        { id: 186, name: "Check for duplicate subtrees", difficulty: "Hard", url: "https://practice.geeksforgeeks.org/problems/duplicate-subtree-in-binary-tree/1" },
        { id: 187, name: "Check if trees are mirror", difficulty: "Easy", url: "https://practice.geeksforgeeks.org/problems/check-mirror-in-n-ary-tree1528/1" },
        { id: 188, name: "Sum of longest path from root to leaf", difficulty: "Medium", url: "https://practice.geeksforgeeks.org/problems/sum-of-the-longest-bloodline-of-a-tree/1" },
        { id: 189, name: "Check if graph is tree", difficulty: "Medium", url: "https://www.geeksforgeeks.org/check-given-graph-tree/" },
        { id: 190, name: "Find largest subtree sum", difficulty: "Medium", url: "https://practice.geeksforgeeks.org/problems/maximum-sum-of-non-adjacent-nodes/1" },
        { id: 191, name: "Maximum sum of non-adjacent nodes", difficulty: "Hard", url: "https://practice.geeksforgeeks.org/problems/maximum-sum-of-non-adjacent-nodes/1" },
        { id: 192, name: "Print k sum paths", difficulty: "Hard", url: "https://leetcode.com/problems/path-sum-iii/" },
        { id: 193, name: "Find LCA in binary tree", difficulty: "Medium", url: "https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-tree/" },
        { id: 194, name: "Find distance between two nodes", difficulty: "Medium", url: "https://practice.geeksforgeeks.org/problems/min-distance-between-two-given-nodes-of-a-binary-tree/1" },
        { id: 195, name: "Kth ancestor of node", difficulty: "Hard", url: "https://www.geeksforgeeks.org/kth-ancestor-node-binary-tree-set-2/" },
        { id: 196, name: "Find all duplicate subtrees", difficulty: "Hard", url: "https://leetcode.com/problems/find-duplicate-subtrees/" },
        { id: 197, name: "Tree isomorphism problem", difficulty: "Hard", url: "https://practice.geeksforgeeks.org/problems/check-if-tree-is-isomorphic/1" }
    ],

    "Binary Search Trees": [
        { id: 198, name: "Find value in BST", difficulty: "Easy", url: "https://leetcode.com/problems/search-in-a-binary-search-tree/" },
        { id: 199, name: "Delete node in BST", difficulty: "Medium", url: "https://leetcode.com/problems/delete-node-in-a-bst/" },
        { id: 200, name: "Find min and max in BST", difficulty: "Easy", url: "https://practice.geeksforgeeks.org/problems/minimum-element-in-bst/1" },
        { id: 201, name: "Find inorder successor and predecessor", difficulty: "Medium", url: "https://practice.geeksforgeeks.org/problems/predecessor-and-successor/1" },
        { id: 202, name: "Check if tree is BST", difficulty: "Medium", url: "https://leetcode.com/problems/validate-binary-search-tree/" },
        { id: 203, name: "Populate inorder successor for all nodes", difficulty: "Medium", url: "https://practice.geeksforgeeks.org/problems/populate-inorder-successor-for-all-nodes/1" },
        { id: 204, name: "Find LCA of two nodes in BST", difficulty: "Easy", url: "https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-search-tree/" },
        { id: 205, name: "Construct BST from preorder", difficulty: "Medium", url: "https://leetcode.com/problems/construct-binary-search-tree-from-preorder-traversal/" },
        { id: 206, name: "Convert binary tree to BST", difficulty: "Medium", url: "https://practice.geeksforgeeks.org/problems/binary-tree-to-bst/1" },
        { id: 207, name: "Convert BST to balanced BST", difficulty: "Hard", url: "https://leetcode.com/problems/balance-a-binary-search-tree/" },
        { id: 208, name: "Merge two BSTs", difficulty: "Hard", url: "https://www.geeksforgeeks.org/merge-two-balanced-binary-search-trees/" },
        { id: 209, name: "Find Kth largest element", difficulty: "Medium", url: "https://leetcode.com/problems/kth-smallest-element-in-a-bst/" },
        { id: 210, name: "Find Kth smallest element", difficulty: "Easy", url: "https://leetcode.com/problems/kth-smallest-element-in-a-bst/" },
        { id: 211, name: "Count pairs from 2 BSTs with given sum", difficulty: "Hard", url: "https://practice.geeksforgeeks.org/problems/brothers-from-different-root/1" },
        { id: 212, name: "Find median of BST in O(n) time O(1) space", difficulty: "Hard", url: "https://www.geeksforgeeks.org/find-median-bst-time-o1-space/" },
        { id: 213, name: "Count BST nodes in given range", difficulty: "Easy", url: "https://practice.geeksforgeeks.org/problems/count-bst-nodes-that-lie-in-a-given-range/1" },
        { id: 214, name: "Replace with least greater element on right", difficulty: "Hard", url: "https://www.geeksforgeeks.org/replace-every-element-with-the-least-greater-element-on-its-right/" },
        { id: 215, name: "Find conflicting appointments", difficulty: "Medium", url: "https://www.geeksforgeeks.org/given-n-appointments-find-conflicting-appointments/" },
        { id: 216, name: "Check if preorder is valid", difficulty: "Medium", url: "https://practice.geeksforgeeks.org/problems/preorder-to-postorder4423/1" },
        { id: 217, name: "Check if BST contains dead end", difficulty: "Hard", url: "https://practice.geeksforgeeks.org/problems/check-whether-bst-contains-dead-end/1" },
        { id: 218, name: "Largest BST in binary tree", difficulty: "Hard", url: "https://practice.geeksforgeeks.org/problems/largest-bst/1" },
        { id: 219, name: "Flatten BST to sorted list", difficulty: "Medium", url: "https://www.geeksforgeeks.org/flatten-bst-to-sorted-list-increasing-order/" }
    ],

    "Greedy": [
        { id: 220, name: "Activity selection problem", difficulty: "Easy", url: "https://practice.geeksforgeeks.org/problems/n-meetings-in-one-room-1587115620/1" },
        { id: 221, name: "Job sequencing problem", difficulty: "Medium", url: "https://practice.geeksforgeeks.org/problems/job-sequencing-problem-1587115620/1" },
        { id: 222, name: "Huffman coding", difficulty: "Hard", url: "https://practice.geeksforgeeks.org/problems/huffman-encoding3345/1" },
        { id: 223, name: "Water connection problem", difficulty: "Medium", url: "https://practice.geeksforgeeks.org/problems/water-connection-problem5822/1" },
        { id: 224, name: "Fractional knapsack", difficulty: "Medium", url: "https://practice.geeksforgeeks.org/problems/fractional-knapsack-1587115620/1" },
        { id: 225, name: "Minimum number of coins", difficulty: "Easy", url: "https://practice.geeksforgeeks.org/problems/-minimum-number-of-coins4426/1" },
        { id: 226, name: "Maximum trains for which stoppage can be provided", difficulty: "Medium", url: "https://www.geeksforgeeks.org/maximum-trains-stoppage-can-provided/" },
        { id: 227, name: "Minimum platforms problem", difficulty: "Medium", url: "https://practice.geeksforgeeks.org/problems/minimum-platforms-1587115620/1" },
        { id: 228, name: "Buy maximum stocks", difficulty: "Medium", url: "https://www.geeksforgeeks.org/buy-maximum-stocks-stocks-can-bought-th-day/" },
        { id: 229, name: "Min and max amount to buy candies", difficulty: "Easy", url: "https://practice.geeksforgeeks.org/problems/shop-in-candy-store1145/1" },
        { id: 230, name: "Minimize cash flow", difficulty: "Hard", url: "https://www.geeksforgeeks.org/minimize-cash-flow-among-given-set-friends-borrowed-money/" },
        { id: 231, name: "Minimum cost to cut board into squares", difficulty: "Medium", url: "https://www.geeksforgeeks.org/minimum-cost-cut-board-squares/" },
        { id: 232, name: "Check if possible to survive on island", difficulty: "Medium", url: "https://www.geeksforgeeks.org/survival/" },
        { id: 233, name: "Find maximum meetings in one room", difficulty: "Easy", url: "https://practice.geeksforgeeks.org/problems/n-meetings-in-one-room-1587115620/1" },
        { id: 234, name: "Maximum product subset", difficulty: "Medium", url: "https://www.geeksforgeeks.org/maximum-product-subset-array/" },
        { id: 235, name: "Maximize array sum after K negations", difficulty: "Easy", url: "https://practice.geeksforgeeks.org/problems/maximize-sum-after-k-negations1149/1" },
        { id: 236, name: "Maximize sum of arr[i]*i", difficulty: "Easy", url: "https://practice.geeksforgeeks.org/problems/maximize-arrii-of-an-array0026/1" },
        { id: 237, name: "Maximum sum of absolute differences", difficulty: "Medium", url: "https://www.geeksforgeeks.org/maximum-sum-absolute-difference-array/" },
        { id: 238, name: "Maximize consecutive differences in circular array", difficulty: "Hard", url: "https://practice.geeksforgeeks.org/problems/swap-the-array-elements/1" },
        { id: 239, name: "Minimum sum of absolute difference of pairs", difficulty: "Easy", url: "https://www.geeksforgeeks.org/minimum-sum-absolute-difference-pairs-two-arrays/" },
        { id: 240, name: "Shortest Job First scheduling", difficulty: "Easy", url: "https://www.geeksforgeeks.org/program-for-shortest-job-first-or-sjf-cpu-scheduling-set-1-non-preemptive/" },
        { id: 241, name: "LRU cache implementation", difficulty: "Medium", url: "https://leetcode.com/problems/lru-cache/" },
        { id: 242, name: "Smallest subset with sum greater than all", difficulty: "Easy", url: "https://www.geeksforgeeks.org/smallest-subset-sum-greater-elements/" },
        { id: 243, name: "Chocolate distribution", difficulty: "Easy", url: "https://practice.geeksforgeeks.org/problems/chocolate-distribution-problem3825/1" },
        { id: 244, name: "DEFKIN - Defense of Kingdom", difficulty: "Easy", url: "https://www.spoj.com/problems/DEFKIN/" },
        { id: 245, name: "DIEHARD - Die Hard", difficulty: "Medium", url: "https://www.spoj.com/problems/DIEHARD/" },
        { id: 246, name: "GERGOVIA - Wine trading", difficulty: "Medium", url: "https://www.spoj.com/problems/GERGOVIA/" },
        { id: 247, name: "Picking up chicks", difficulty: "Easy", url: "https://www.spoj.com/problems/GCJ101BB/" },
        { id: 248, name: "CHOCOLA - Chocolate", difficulty: "Medium", url: "https://www.spoj.com/problems/CHOCOLA/" },
        { id: 249, name: "ARRANGE - Arranging amplifiers", difficulty: "Hard", url: "https://www.spoj.com/problems/ARRANGE/" },
        { id: 250, name: "K centers problem", difficulty: "Hard", url: "https://www.geeksforgeeks.org/k-centers-problem-set-1-greedy-approximate-algorithm/" },
        { id: 251, name: "Minimum cost of ropes", difficulty: "Easy", url: "https://practice.geeksforgeeks.org/problems/minimum-cost-of-ropes-1587115620/1" },
        { id: 252, name: "Find smallest number with given digits and sum", difficulty: "Easy", url: "https://practice.geeksforgeeks.org/problems/smallest-number5829/1" },
        { id: 253, name: "Rearrange characters no two adjacent same", difficulty: "Hard", url: "https://practice.geeksforgeeks.org/problems/rearrange-characters4649/1" },
        { id: 254, name: "Maximum equal sum of three stacks", difficulty: "Easy", url: "https://practice.geeksforgeeks.org/problems/maximum-equal-sum-of-three-stacks/1" }
    ],

    "BackTracking": [
        { id: 255, name: "Rat in a maze", difficulty: "Medium", url: "https://practice.geeksforgeeks.org/problems/rat-in-a-maze-problem/1" },
        { id: 256, name: "N-Queen problem", difficulty: "Hard", url: "https://leetcode.com/problems/n-queens/" },
        { id: 257, name: "Word break using backtracking", difficulty: "Hard", url: "https://practice.geeksforgeeks.org/problems/word-break-part-23249/1" },
        { id: 258, name: "Remove invalid parentheses", difficulty: "Hard", url: "https://leetcode.com/problems/remove-invalid-parentheses/" },
        { id: 259, name: "Sudoku solver", difficulty: "Hard", url: "https://leetcode.com/problems/sudoku-solver/" },
        { id: 260, name: "M coloring problem", difficulty: "Hard", url: "https://practice.geeksforgeeks.org/problems/m-coloring-problem-1587115620/1" },
        { id: 261, name: "Print palindromic partitions", difficulty: "Hard", url: "https://leetcode.com/problems/palindrome-partitioning/" },
        { id: 262, name: "Subset sum problem", difficulty: "Medium", url: "https://practice.geeksforgeeks.org/problems/subset-sum-problem-1611555638/1" },
        { id: 263, name: "Knight's tour problem", difficulty: "Hard", url: "https://www.geeksforgeeks.org/the-knights-tour-problem-backtracking-1/" },
        { id: 264, name: "Tug of war", difficulty: "Hard", url: "https://www.geeksforgeeks.org/tug-of-war/" },
        { id: 265, name: "Shortest safe route with landmines", difficulty: "Hard", url: "https://www.geeksforgeeks.org/find-shortest-safe-route-in-a-path-with-landmines/" },
        { id: 266, name: "Combination sum", difficulty: "Medium", url: "https://leetcode.com/problems/combination-sum/" },
        { id: 267, name: "Maximum number with K swaps", difficulty: "Hard", url: "https://practice.geeksforgeeks.org/problems/largest-number-in-k-swaps-1587115620/1" },
        { id: 268, name: "Print all permutations", difficulty: "Medium", url: "https://leetcode.com/problems/permutations/" },
        { id: 269, name: "Path of more than k length", difficulty: "Hard", url: "https://www.geeksforgeeks.org/find-if-there-is-a-path-of-more-than-k-length-from-a-source/" },
        { id: 270, name: "Longest route in matrix with hurdles", difficulty: "Hard", url: "https://www.geeksforgeeks.org/longest-possible-route-in-a-matrix-with-hurdles/" },
        { id: 271, name: "Print paths from top-left to bottom-right", difficulty: "Medium", url: "https://www.geeksforgeeks.org/print-all-possible-paths-from-top-left-to-bottom-right-of-a-mxn-matrix/" },
        { id: 272, name: "Partition into K subsets with equal sum", difficulty: "Hard", url: "https://practice.geeksforgeeks.org/problems/partition-array-to-k-subsets/1" },
        { id: 273, name: "Kth permutation sequence", difficulty: "Hard", url: "https://leetcode.com/problems/permutation-sequence/" }
    ],

    "Stacks and Queues": [
        { id: 274, name: "Implement stack from scratch", difficulty: "Easy", url: "https://www.geeksforgeeks.org/stack-data-structure-introduction-program/" },
        { id: 275, name: "Implement queue from scratch", difficulty: "Easy", url: "https://www.geeksforgeeks.org/queue-set-1introduction-and-array-implementation/" },
        { id: 276, name: "Implement 2 stacks in array", difficulty: "Easy", url: "https://practice.geeksforgeeks.org/problems/implement-two-stacks-in-an-array/1" },
        { id: 277, name: "Find middle element of stack", difficulty: "Easy", url: "https://www.geeksforgeeks.org/design-a-stack-with-find-middle-operation/" },
        { id: 278, name: "Implement N stacks in array", difficulty: "Hard", url: "https://www.geeksforgeeks.org/efficiently-implement-k-stacks-single-array/" },
        { id: 279, name: "Check for balanced parentheses", difficulty: "Easy", url: "https://leetcode.com/problems/valid-parentheses/" },
        { id: 280, name: "Reverse string using stack", difficulty: "Easy", url: "https://practice.geeksforgeeks.org/problems/reverse-a-string-using-stack/1" },
        { id: 281, name: "Design stack with getMin in O(1)", difficulty: "Easy", url: "https://leetcode.com/problems/min-stack/" },
        { id: 282, name: "Find next greater element", difficulty: "Medium", url: "https://leetcode.com/problems/next-greater-element-i/" },
        { id: 283, name: "The celebrity problem", difficulty: "Medium", url: "https://practice.geeksforgeeks.org/problems/the-celebrity-problem/1" },
        { id: 284, name: "Arithmetic expression evaluation", difficulty: "Hard", url: "https://practice.geeksforgeeks.org/problems/evaluation-of-postfix-expression1735/1" },
        { id: 285, name: "Evaluation of postfix expression", difficulty: "Easy", url: "https://leetcode.com/problems/evaluate-reverse-polish-notation/" },
        { id: 286, name: "Insert element at bottom of stack", difficulty: "Easy", url: "https://www.geeksforgeeks.org/program-to-insert-an-element-at-the-bottom-of-a-stack/" },
        { id: 287, name: "Reverse stack using recursion", difficulty: "Medium", url: "https://www.geeksforgeeks.org/reverse-a-stack-using-recursion/" },
        { id: 288, name: "Sort stack using recursion", difficulty: "Medium", url: "https://practice.geeksforgeeks.org/problems/sort-a-stack/1" },
        { id: 289, name: "Merge overlapping intervals", difficulty: "Medium", url: "https://leetcode.com/problems/merge-intervals/" },
        { id: 290, name: "Largest rectangle in histogram", difficulty: "Hard", url: "https://leetcode.com/problems/largest-rectangle-in-histogram/" },
        { id: 291, name: "Length of longest valid substring", difficulty: "Hard", url: "https://leetcode.com/problems/longest-valid-parentheses/" },
        { id: 292, name: "Check for redundant brackets", difficulty: "Easy", url: "https://www.geeksforgeeks.org/expression-contains-redundant-bracket-not/" },
        { id: 293, name: "Implement stack using queue", difficulty: "Easy", url: "https://leetcode.com/problems/implement-stack-using-queues/" },
        { id: 294, name: "Implement stack using deque", difficulty: "Easy", url: "https://www.geeksforgeeks.org/implement-stack-queue-using-deque/" },
        { id: 295, name: "Stack permutations", difficulty: "Medium", url: "https://www.geeksforgeeks.org/stack-permutations-check-if-an-array-is-stack-permutation-of-other/" },
        { id: 296, name: "Implement queue using stack", difficulty: "Easy", url: "https://leetcode.com/problems/implement-queue-using-stacks/" },
        { id: 297, name: "Implement n queues in array", difficulty: "Hard", url: "https://www.geeksforgeeks.org/efficiently-implement-k-queues-single-array/" },
        { id: 298, name: "Implement circular queue", difficulty: "Easy", url: "https://leetcode.com/problems/design-circular-queue/" },
        { id: 299, name: "LRU cache", difficulty: "Hard", url: "https://leetcode.com/problems/lru-cache/" },
        { id: 300, name: "Reverse queue using recursion", difficulty: "Easy", url: "https://practice.geeksforgeeks.org/problems/queue-reversal/1" },
        { id: 301, name: "Reverse first K elements of queue", difficulty: "Easy", url: "https://practice.geeksforgeeks.org/problems/reverse-first-k-elements-of-queue/1" },
        { id: 302, name: "Interleave first and second half of queue", difficulty: "Medium", url: "https://www.geeksforgeeks.org/interleave-first-half-queue-second-half/" },
        { id: 303, name: "Circular tour visiting all petrol pumps", difficulty: "Medium", url: "https://practice.geeksforgeeks.org/problems/circular-tour-1587115620/1" },
        { id: 304, name: "Minimum time to rot all oranges", difficulty: "Medium", url: "https://leetcode.com/problems/rotting-oranges/" },
        { id: 305, name: "Distance of nearest cell having 1", difficulty: "Medium", url: "https://leetcode.com/problems/01-matrix/" },
        { id: 306, name: "First negative in window of size k", difficulty: "Easy", url: "https://practice.geeksforgeeks.org/problems/first-negative-integer-in-every-window-of-size-k3345/1" },
        { id: 307, name: "Check if levels of two trees are anagrams", difficulty: "Hard", url: "https://www.geeksforgeeks.org/check-if-all-levels-of-two-trees-are-anagrams-or-not/" },
        { id: 308, name: "Sum of min and max in all subarrays of size k", difficulty: "Medium", url: "https://www.geeksforgeeks.org/sum-minimum-maximum-elements-subarrays-size-k/" },
        { id: 309, name: "Min sum of squares after removing k characters", difficulty: "Hard", url: "https://practice.geeksforgeeks.org/problems/game-with-string4100/1" },
        { id: 310, name: "First non-repeating character in stream", difficulty: "Medium", url: "https://practice.geeksforgeeks.org/problems/first-non-repeating-character-in-a-stream1216/1" },
        { id: 311, name: "Next smaller element", difficulty: "Medium", url: "https://www.geeksforgeeks.org/next-smaller-element/" }
    ],

    "Heap": [
        { id: 312, name: "Implement max heap/min heap", difficulty: "Easy", url: "https://www.geeksforgeeks.org/building-heap-from-array/" },
        { id: 313, name: "Sort array using heap sort", difficulty: "Medium", url: "https://www.geeksforgeeks.org/heap-sort/" },
        { id: 314, name: "Maximum of subarrays of size k", difficulty: "Hard", url: "https://leetcode.com/problems/sliding-window-maximum/" },
        { id: 315, name: "Kth largest element", difficulty: "Easy", url: "https://leetcode.com/problems/kth-largest-element-in-an-array/" },
        { id: 316, name: "Kth smallest element", difficulty: "Medium", url: "https://practice.geeksforgeeks.org/problems/kth-smallest-element5635/1" },
        { id: 317, name: "Merge K sorted arrays", difficulty: "Hard", url: "https://practice.geeksforgeeks.org/problems/merge-k-sorted-arrays/1" },
        { id: 318, name: "Merge 2 binary max heaps", difficulty: "Easy", url: "https://practice.geeksforgeeks.org/problems/merge-two-binary-max-heap0144/1" },
        { id: 319, name: "Kth largest sum continuous subarrays", difficulty: "Medium", url: "https://www.geeksforgeeks.org/k-th-largest-sum-contiguous-subarray/" },
        { id: 320, name: "Reorganize string", difficulty: "Medium", url: "https://leetcode.com/problems/reorganize-string/" },
        { id: 321, name: "Merge K sorted lists", difficulty: "Hard", url: "https://leetcode.com/problems/merge-k-sorted-lists/" },
        { id: 322, name: "Smallest range in K lists", difficulty: "Hard", url: "https://leetcode.com/problems/smallest-range-covering-elements-from-k-lists/" },
        { id: 323, name: "Median in stream of integers", difficulty: "Hard", url: "https://leetcode.com/problems/find-median-from-data-stream/" },
        { id: 324, name: "Check if binary tree is heap", difficulty: "Medium", url: "https://practice.geeksforgeeks.org/problems/is-binary-tree-heap/1" },
        { id: 325, name: "Connect n ropes with minimum cost", difficulty: "Easy", url: "https://practice.geeksforgeeks.org/problems/minimum-cost-of-ropes-1587115620/1" },
        { id: 326, name: "Convert BST to min heap", difficulty: "Hard", url: "https://www.geeksforgeeks.org/convert-bst-min-heap/" },
        { id: 327, name: "Convert min heap to max heap", difficulty: "Easy", url: "https://www.geeksforgeeks.org/convert-min-heap-to-max-heap/" },
        { id: 328, name: "Rearrange characters no two adjacent same", difficulty: "Hard", url: "https://practice.geeksforgeeks.org/problems/rearrange-characters4649/1" },
        { id: 329, name: "Minimum sum of two numbers from digits", difficulty: "Medium", url: "https://practice.geeksforgeeks.org/problems/minimum-sum4058/1" }
    ],

    "Graph": [
        { id: 330, name: "Create graph and print", difficulty: "Easy", url: "https://www.geeksforgeeks.org/graph-and-its-representations/" },
        { id: 331, name: "Implement BFS", difficulty: "Easy", url: "https://practice.geeksforgeeks.org/problems/bfs-traversal-of-graph/1" },
        { id: 332, name: "Implement DFS", difficulty: "Easy", url: "https://practice.geeksforgeeks.org/problems/depth-first-traversal-for-a-graph/1" },
        { id: 333, name: "Detect cycle in directed graph", difficulty: "Medium", url: "https://practice.geeksforgeeks.org/problems/detect-cycle-in-a-directed-graph/1" },
        { id: 334, name: "Detect cycle in undirected graph", difficulty: "Medium", url: "https://practice.geeksforgeeks.org/problems/detect-cycle-in-an-undirected-graph/1" },
        { id: 335, name: "Search in maze", difficulty: "Medium", url: "https://practice.geeksforgeeks.org/problems/rat-in-a-maze-problem/1" },
        { id: 336, name: "Minimum steps by knight", difficulty: "Medium", url: "https://practice.geeksforgeeks.org/problems/steps-by-knight5927/1" },
        { id: 337, name: "Flood fill algorithm", difficulty: "Easy", url: "https://leetcode.com/problems/flood-fill/" },
        { id: 338, name: "Clone a graph", difficulty: "Medium", url: "https://leetcode.com/problems/clone-graph/" },
        { id: 339, name: "Making wired connections", difficulty: "Medium", url: "https://leetcode.com/problems/number-of-operations-to-make-network-connected/" },
        { id: 340, name: "Word ladder", difficulty: "Hard", url: "https://leetcode.com/problems/word-ladder/" },
        { id: 341, name: "Dijkstra's algorithm", difficulty: "Medium", url: "https://practice.geeksforgeeks.org/problems/implementing-dijkstra-set-1-adjacency-matrix/1" },
        { id: 342, name: "Topological sort", difficulty: "Medium", url: "https://practice.geeksforgeeks.org/problems/topological-sort/1" },
        { id: 343, name: "Minimum time for jobs in DAG", difficulty: "Hard", url: "https://www.geeksforgeeks.org/minimum-time-taken-by-each-job-to-be-completed-given-by-a-directed-acyclic-graph/" },
        { id: 344, name: "Find if possible to finish all tasks", difficulty: "Medium", url: "https://leetcode.com/problems/course-schedule/" },
        { id: 345, name: "Number of islands", difficulty: "Medium", url: "https://leetcode.com/problems/number-of-islands/" },
        { id: 346, name: "Alien dictionary", difficulty: "Hard", url: "https://practice.geeksforgeeks.org/problems/alien-dictionary/1" },
        { id: 347, name: "Kruskal's algorithm", difficulty: "Medium", url: "https://practice.geeksforgeeks.org/problems/minimum-spanning-tree/1" },
        { id: 348, name: "Prim's algorithm", difficulty: "Medium", url: "https://practice.geeksforgeeks.org/problems/minimum-spanning-tree/1" },
        { id: 349, name: "Total spanning trees in graph", difficulty: "Hard", url: "https://www.geeksforgeeks.org/total-number-spanning-trees-graph/" },
        { id: 350, name: "Bellman Ford algorithm", difficulty: "Medium", url: "https://practice.geeksforgeeks.org/problems/distance-from-the-source-bellman-ford-algorithm/1" },
        { id: 351, name: "Floyd Warshall algorithm", difficulty: "Medium", url: "https://practice.geeksforgeeks.org/problems/implementing-floyd-warshall2042/1" },
        { id: 352, name: "Travelling salesman problem", difficulty: "Hard", url: "https://www.geeksforgeeks.org/travelling-salesman-problem-set-1/" },
        { id: 353, name: "Graph coloring", difficulty: "Hard", url: "https://www.geeksforgeeks.org/graph-coloring-applications/" },
        { id: 354, name: "Snakes and ladders", difficulty: "Medium", url: "https://leetcode.com/problems/snakes-and-ladders/" },
        { id: 355, name: "Find bridge in graph", difficulty: "Hard", url: "https://practice.geeksforgeeks.org/problems/bridge-edge-in-graph/1" },
        { id: 356, name: "Count strongly connected components", difficulty: "Hard", url: "https://practice.geeksforgeeks.org/problems/strongly-connected-components-kosarajus-algo/1" },
        { id: 357, name: "Check if graph is bipartite", difficulty: "Medium", url: "https://leetcode.com/problems/is-graph-bipartite/" },
        { id: 358, name: "Detect negative cycle", difficulty: "Medium", url: "https://practice.geeksforgeeks.org/problems/negative-weight-cycle3504/1" },
        { id: 359, name: "Longest path in DAG", difficulty: "Hard", url: "https://www.geeksforgeeks.org/find-longest-path-directed-acyclic-graph/" },
        { id: 360, name: "Journey to the moon", difficulty: "Medium", url: "https://www.hackerrank.com/challenges/journey-to-the-moon/problem" },
        { id: 361, name: "Cheapest flights within K stops", difficulty: "Medium", url: "https://leetcode.com/problems/cheapest-flights-within-k-stops/" },
        { id: 362, name: "Oliver and the game", difficulty: "Hard", url: "https://www.hackerearth.com/practice/algorithms/graphs/topological-sort/practice-problems/algorithm/oliver-and-the-game-3/" },
        { id: 363, name: "Water jug problem", difficulty: "Medium", url: "https://www.geeksforgeeks.org/water-jug-problem-using-bfs/" },
        { id: 364, name: "Path of more than k length", difficulty: "Hard", url: "https://www.geeksforgeeks.org/find-if-there-is-a-path-of-more-than-k-length-from-a-source/" },
        { id: 365, name: "M-coloring problem", difficulty: "Hard", url: "https://practice.geeksforgeeks.org/problems/m-coloring-problem-1587115620/1" },
        { id: 366, name: "Minimum edges to reverse", difficulty: "Hard", url: "https://www.geeksforgeeks.org/minimum-edges-reverse-make-path-source-destination/" },
        { id: 367, name: "Paths using each edge (Seven Bridges)", difficulty: "Hard", url: "https://www.geeksforgeeks.org/paths-travel-nodes-using-edgeseven-bridges-konigsberg/" },
        { id: 368, name: "Vertex cover problem", difficulty: "Hard", url: "https://www.geeksforgeeks.org/vertex-cover-problem-set-1-introduction-approximate-algorithm-2/" },
        { id: 369, name: "Chinese postman", difficulty: "Hard", url: "https://www.geeksforgeeks.org/chinese-postman-route-inspection-set-1-introduction/" },
        { id: 370, name: "Number of triangles in graph", difficulty: "Medium", url: "https://www.geeksforgeeks.org/number-of-triangles-in-directed-and-undirected-graphs/" },
        { id: 371, name: "Minimize cashflow", difficulty: "Hard", url: "https://www.geeksforgeeks.org/minimize-cash-flow-among-given-set-friends-borrowed-money/" },
        { id: 372, name: "Two clique problem", difficulty: "Hard", url: "https://www.geeksforgeeks.org/two-clique-problem-check-graph-can-divided-two-cliques/" }
    ],

    "Trie": [
        { id: 373, name: "Construct trie from scratch", difficulty: "Medium", url: "https://leetcode.com/problems/implement-trie-prefix-tree/" },
        { id: 374, name: "Find shortest unique prefix", difficulty: "Medium", url: "https://www.geeksforgeeks.org/find-all-shortest-unique-prefixes-to-represent-each-word-in-a-given-list/" },
        { id: 375, name: "Word break using trie", difficulty: "Medium", url: "https://www.geeksforgeeks.org/word-break-problem-trie-solution/" },
        { id: 376, name: "Print anagrams together", difficulty: "Medium", url: "https://practice.geeksforgeeks.org/problems/k-anagrams-1587115620/1" },
        { id: 377, name: "Implement phone directory", difficulty: "Hard", url: "https://practice.geeksforgeeks.org/problems/phone-directory4628/1" },
        { id: 378, name: "Print unique rows in boolean matrix", difficulty: "Medium", url: "https://practice.geeksforgeeks.org/problems/unique-rows-in-boolean-matrix/1" }
    ],

    "Dynamic Programming": [
        { id: 379, name: "Coin change problem", difficulty: "Medium", url: "https://leetcode.com/problems/coin-change/" },
        { id: 380, name: "0-1 Knapsack", difficulty: "Medium", url: "https://practice.geeksforgeeks.org/problems/0-1-knapsack-problem0945/1" },
        { id: 381, name: "Binomial coefficient", difficulty: "Easy", url: "https://practice.geeksforgeeks.org/problems/ncr1019/1" },
        { id: 382, name: "Permutation coefficient", difficulty: "Easy", url: "https://www.geeksforgeeks.org/permutation-coefficient/" },
        { id: 383, name: "Nth Catalan number", difficulty: "Hard", url: "https://www.geeksforgeeks.org/program-nth-catalan-number/" },
        { id: 384, name: "Matrix chain multiplication", difficulty: "Hard", url: "https://practice.geeksforgeeks.org/problems/matrix-chain-multiplication0303/1" },
        { id: 385, name: "Edit distance", difficulty: "Hard", url: "https://leetcode.com/problems/edit-distance/" },
        { id: 386, name: "Subset sum", difficulty: "Medium", url: "https://practice.geeksforgeeks.org/problems/subset-sum-problem-1611555638/1" },
        { id: 387, name: "Friends pairing", difficulty: "Easy", url: "https://practice.geeksforgeeks.org/problems/friends-pairing-problem5425/1" },
        { id: 388, name: "Gold mine problem", difficulty: "Medium", url: "https://practice.geeksforgeeks.org/problems/gold-mine-problem2608/1" },
        { id: 389, name: "Assembly line scheduling", difficulty: "Hard", url: "https://www.geeksforgeeks.org/assembly-line-scheduling-dp-34/" },
        { id: 390, name: "Painting the fence", difficulty: "Easy", url: "https://practice.geeksforgeeks.org/problems/painting-the-fence3727/1" },
        { id: 391, name: "Maximize the cut segments", difficulty: "Easy", url: "https://practice.geeksforgeeks.org/problems/cutted-segments1642/1" },
        { id: 392, name: "Longest common subsequence", difficulty: "Medium", url: "https://leetcode.com/problems/longest-common-subsequence/" },
        { id: 393, name: "Longest repeated subsequence", difficulty: "Hard", url: "https://practice.geeksforgeeks.org/problems/longest-repeating-subsequence2004/1" },
        { id: 394, name: "Longest increasing subsequence", difficulty: "Medium", url: "https://leetcode.com/problems/longest-increasing-subsequence/" },
        { id: 395, name: "Space optimized LCS", difficulty: "Hard", url: "https://www.geeksforgeeks.org/space-optimized-solution-lcs/" },
        { id: 396, name: "LCS of three strings", difficulty: "Hard", url: "https://practice.geeksforgeeks.org/problems/lcs-of-three-strings0028/1" },
        { id: 397, name: "Maximum sum increasing subsequence", difficulty: "Medium", url: "https://practice.geeksforgeeks.org/problems/maximum-sum-increasing-subsequence4749/1" },
        { id: 398, name: "Count subsequences with product less than K", difficulty: "Medium", url: "https://www.geeksforgeeks.org/count-subsequences-product-less-k/" },
        { id: 399, name: "Longest subsequence adjacent diff one", difficulty: "Medium", url: "https://practice.geeksforgeeks.org/problems/longest-subsequence-such-that-difference-between-adjacents-is-one4724/1" },
        { id: 400, name: "Maximum subsequence sum no three consecutive", difficulty: "Medium", url: "https://www.geeksforgeeks.org/maximum-subsequence-sum-such-that-no-three-are-consecutive/" },
        { id: 401, name: "Egg dropping puzzle", difficulty: "Hard", url: "https://leetcode.com/problems/super-egg-drop/" },
        { id: 402, name: "Maximum length chain of pairs", difficulty: "Medium", url: "https://practice.geeksforgeeks.org/problems/max-length-chain/1" },
        { id: 403, name: "Maximum size square sub-matrix with 1s", difficulty: "Medium", url: "https://leetcode.com/problems/maximal-square/" },
        { id: 404, name: "Maximum sum of pairs with specific difference", difficulty: "Medium", url: "https://practice.geeksforgeeks.org/problems/pairs-with-specific-difference1533/1" },
        { id: 405, name: "Min cost path", difficulty: "Medium", url: "https://practice.geeksforgeeks.org/problems/path-in-matrix3805/1" },
        { id: 406, name: "Maximum difference of zeros and ones", difficulty: "Medium", url: "https://practice.geeksforgeeks.org/problems/maximum-difference-of-zeros-and-ones-in-binary-string4111/1" },
        { id: 407, name: "Minimum jumps to reach end", difficulty: "Medium", url: "https://practice.geeksforgeeks.org/problems/minimum-number-of-jumps-1587115620/1" },
        { id: 408, name: "Minimum cost to fill weight in bag", difficulty: "Medium", url: "https://practice.geeksforgeeks.org/problems/minimum-cost-to-fill-given-weight-in-a-bag1956/1" },
        { id: 409, name: "Minimum removals to make max-min <= K", difficulty: "Hard", url: "https://www.geeksforgeeks.org/minimum-removals-array-make-max-min-k/" },
        { id: 410, name: "Longest common substring", difficulty: "Medium", url: "https://practice.geeksforgeeks.org/problems/longest-common-substring1452/1" },
        { id: 411, name: "Count ways to reach score", difficulty: "Medium", url: "https://practice.geeksforgeeks.org/problems/reach-a-given-score-1587115621/1" },
        { id: 412, name: "Count balanced binary trees of height h", difficulty: "Hard", url: "https://practice.geeksforgeeks.org/problems/bbt-counter4914/1" },
        { id: 413, name: "Largest sum contiguous subarray", difficulty: "Medium", url: "https://leetcode.com/problems/maximum-subarray/" },
        { id: 414, name: "Smallest sum contiguous subarray", difficulty: "Easy", url: "https://www.geeksforgeeks.org/smallest-sum-contiguous-subarray/" },
        { id: 415, name: "Unbounded knapsack", difficulty: "Medium", url: "https://practice.geeksforgeeks.org/problems/knapsack-with-duplicate-items4201/1" },
        { id: 416, name: "Word break", difficulty: "Medium", url: "https://leetcode.com/problems/word-break/" },
        { id: 417, name: "Largest independent set", difficulty: "Hard", url: "https://www.geeksforgeeks.org/largest-independent-set-problem-dp-26/" },
        { id: 418, name: "Partition problem", difficulty: "Hard", url: "https://practice.geeksforgeeks.org/problems/subset-sum-problem2014/1" },
        { id: 419, name: "Longest palindromic subsequence", difficulty: "Medium", url: "https://leetcode.com/problems/longest-palindromic-subsequence/" },
        { id: 420, name: "Count palindromic subsequences", difficulty: "Hard", url: "https://practice.geeksforgeeks.org/problems/count-palindromic-subsequences/1" },
        { id: 421, name: "Longest alternating subsequence", difficulty: "Medium", url: "https://practice.geeksforgeeks.org/problems/longest-alternating-subsequence5951/1" },
        { id: 422, name: "Weighted job scheduling", difficulty: "Hard", url: "https://www.geeksforgeeks.org/weighted-job-scheduling/" },
        { id: 423, name: "Coin game winner", difficulty: "Medium", url: "https://www.geeksforgeeks.org/coin-game-winner-every-player-three-choices/" },
        { id: 424, name: "Count derangements", difficulty: "Hard", url: "https://www.geeksforgeeks.org/count-derangements-permutation-such-that-no-element-appears-in-its-original-position/" },
        { id: 425, name: "Best time to buy and sell stock twice", difficulty: "Hard", url: "https://leetcode.com/problems/best-time-to-buy-and-sell-stock-iii/" },
        { id: 426, name: "Optimal strategy for a game", difficulty: "Hard", url: "https://practice.geeksforgeeks.org/problems/optimal-strategy-for-a-game-1587115620/1" },
        { id: 427, name: "Optimal binary search tree", difficulty: "Hard", url: "https://www.geeksforgeeks.org/optimal-binary-search-tree-dp-24/" },
        { id: 428, name: "Palindrome partitioning", difficulty: "Hard", url: "https://leetcode.com/problems/palindrome-partitioning-ii/" },
        { id: 429, name: "Word wrap", difficulty: "Hard", url: "https://practice.geeksforgeeks.org/problems/word-wrap1646/1" },
        { id: 430, name: "Mobile numeric keypad", difficulty: "Medium", url: "https://practice.geeksforgeeks.org/problems/mobile-numeric-keypad5456/1" },
        { id: 431, name: "Boolean parenthesization", difficulty: "Hard", url: "https://practice.geeksforgeeks.org/problems/boolean-parenthesization5610/1" },
        { id: 432, name: "Largest rectangular sub-matrix with sum 0", difficulty: "Hard", url: "https://www.geeksforgeeks.org/largest-rectangular-sub-matrix-whose-sum-0/" },
        { id: 433, name: "Largest area rectangle equal 1s and 0s", difficulty: "Hard", url: "https://www.geeksforgeeks.org/largest-area-rectangular-sub-matrix-equal-number-1s-0s/" },
        { id: 434, name: "Maximum sum rectangle in 2D matrix", difficulty: "Hard", url: "https://practice.geeksforgeeks.org/problems/maximum-sum-rectangle2948/1" },
        { id: 435, name: "Best time to buy and sell stock k times", difficulty: "Hard", url: "https://leetcode.com/problems/best-time-to-buy-and-sell-stock-iv/" },
        { id: 436, name: "Check if string is interleaved", difficulty: "Hard", url: "https://practice.geeksforgeeks.org/problems/interleaved-strings/1" },
        { id: 437, name: "Maximum length of pair chain", difficulty: "Medium", url: "https://leetcode.com/problems/maximum-length-of-pair-chain/" }
    ],

    "Bit Manipulation": [
        { id: 438, name: "Count set bits", difficulty: "Easy", url: "https://leetcode.com/problems/number-of-1-bits/" },
        { id: 439, name: "Find two non-repeating elements", difficulty: "Medium", url: "https://practice.geeksforgeeks.org/problems/finding-the-numbers0215/1" },
        { id: 440, name: "Count bits to flip A to B", difficulty: "Easy", url: "https://practice.geeksforgeeks.org/problems/bit-difference-1587115620/1" },
        { id: 441, name: "Count total set bits from 1 to n", difficulty: "Medium", url: "https://practice.geeksforgeeks.org/problems/count-total-set-bits-1587115620/1" },
        { id: 442, name: "Check if number is power of two", difficulty: "Easy", url: "https://leetcode.com/problems/power-of-two/" },
        { id: 443, name: "Find position of only set bit", difficulty: "Easy", url: "https://practice.geeksforgeeks.org/problems/find-position-of-set-bit3706/1" },
        { id: 444, name: "Copy set bits in range", difficulty: "Medium", url: "https://www.geeksforgeeks.org/copy-set-bits-in-a-range/" },
        { id: 445, name: "Divide two integers without operators", difficulty: "Medium", url: "https://leetcode.com/problems/divide-two-integers/" },
        { id: 446, name: "Calculate square without operators", difficulty: "Medium", url: "https://www.geeksforgeeks.org/calculate-square-of-a-number-without-using-and-pow/" },
        { id: 447, name: "Power set", difficulty: "Medium", url: "https://leetcode.com/problems/subsets/" }
    ]
};




console.log('🔍 Debug: QUESTIONS_BY_TOPIC loaded:', Object.keys(QUESTIONS_BY_TOPIC).length, 'topics');

class RandomQuestionGenerator {
    constructor() {
        console.log('🚀 RandomQuestionGenerator constructor called');
        
        this.currentUser = null;
        this.db = getFirestore();
        this.allQuestions = [];
        this.solvedQuestions = new Set();
        this.topics = Object.keys(QUESTIONS_BY_TOPIC);
        this.selectedTopic = '';
        this.selectedDifficulty = 'all';
        this.questionCount = 5;
        this.generatedQuestions = [];
        
        console.log('📋 Topics available:', this.topics);
        
        this.init();
    }

    init() {
        console.log('🔧 Initializing...');
        
        // Flatten all questions from topics
        Object.keys(QUESTIONS_BY_TOPIC).forEach(topic => {
            QUESTIONS_BY_TOPIC[topic].forEach(q => {
                this.allQuestions.push({ ...q, topic });
            });
        });

        console.log('✅ Total questions loaded:', this.allQuestions.length);
        console.log('📝 Sample question:', this.allQuestions[0]);

        this.setupAuthListener();
        this.populateTopics();
        this.setupEventListeners();
    }

    setupAuthListener() {
        console.log('🔐 Setting up auth listener...');
        
        onAuthStateChanged(auth, async (user) => {
            if (user) {
                console.log('✅ User authenticated:', user.email);
                this.currentUser = user;
                await this.loadProgress();
                this.updateFilteredCount();
            } else {
                console.log('❌ No user authenticated, redirecting...');
                window.location.href = 'login.html';
            }
        });
    }

    async loadProgress() {
        console.log('📥 Loading user progress...');
        
        try {
            const docRef = doc(this.db, 'userProgress', this.currentUser.uid);
            const docSnap = await getDoc(docRef);
            
            if (docSnap.exists()) {
                this.solvedQuestions = new Set(docSnap.data().solved || []);
                console.log('✅ Loaded solved questions:', this.solvedQuestions.size);
                this.updateProgressSummary();
            } else {
                console.log('ℹ️ No existing progress found');
            }
        } catch (error) {
            console.error('❌ Error loading progress:', error);
        }
    }

    async saveProgress() {
        console.log('💾 Saving progress...');
        
        try {
            const solvedArray = Array.from(this.solvedQuestions);
            await setDoc(doc(this.db, 'userProgress', this.currentUser.uid), {
                solved: solvedArray,
                lastUpdated: new Date().toISOString()
            }, { merge: true });
            
            console.log('✅ Progress saved successfully');
        } catch (error) {
            console.error('❌ Error saving progress:', error);
            throw error;
        }
    }

    updateProgressSummary() {
        const solved = this.solvedQuestions.size;
        const total = this.allQuestions.length;
        const percentage = total > 0 ? Math.round((solved / total) * 100) : 0;

        console.log('📊 Progress:', { solved, total, percentage });

        document.getElementById('total-completed').textContent = solved;
        document.getElementById('completion-rate').textContent = `${percentage}%`;
        
        // Calculate streak (simplified - you can enhance this)
        this.calculateStreak();
    }

    calculateStreak() {
        // Simple streak calculation based on last activity
        const streak = this.solvedQuestions.size > 0 ? Math.min(this.solvedQuestions.size, 99) : 0;
        document.getElementById('current-streak').textContent = streak;
    }

    populateTopics() {
        console.log('📝 Populating topics dropdown...');
        
        const topicSelect = document.getElementById('topic-select');
        
        if (!topicSelect) {
            console.error('❌ Topic select element not found!');
            return;
        }
        
        this.topics.forEach(topic => {
            const option = document.createElement('option');
            option.value = topic;
            option.textContent = topic;
            topicSelect.appendChild(option);
        });
        
        console.log('✅ Topics populated:', this.topics.length);
    }

    setupEventListeners() {
        console.log('🎧 Setting up event listeners...');
        
        // Topic selection
        const topicSelect = document.getElementById('topic-select');
        if (topicSelect) {
            topicSelect.addEventListener('change', (e) => {
                this.selectedTopic = e.target.value;
                console.log('📌 Topic selected:', this.selectedTopic);
                this.updateFilteredCount();
            });
        }

        // Difficulty chips
        document.querySelectorAll('.chip-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.chip-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.selectedDifficulty = e.target.dataset.difficulty;
                console.log('🎯 Difficulty selected:', this.selectedDifficulty);
                this.updateFilteredCount();
            });
        });

        // Question count controls
        const decreaseBtn = document.getElementById('decrease-btn');
        const increaseBtn = document.getElementById('increase-btn');
        const countInput = document.getElementById('question-count');

        if (decreaseBtn) {
            decreaseBtn.addEventListener('click', () => {
                const value = parseInt(countInput.value);
                if (value > 1) {
                    countInput.value = value - 1;
                    this.questionCount = value - 1;
                }
            });
        }

        if (increaseBtn) {
            increaseBtn.addEventListener('click', () => {
                const value = parseInt(countInput.value);
                if (value < 20) {
                    countInput.value = value + 1;
                    this.questionCount = value + 1;
                }
            });
        }

        if (countInput) {
            countInput.addEventListener('input', (e) => {
                let value = parseInt(e.target.value);
                if (value < 1) value = 1;
                if (value > 20) value = 20;
                e.target.value = value;
                this.questionCount = value;
            });
        }

        // Generate button
        const generateBtn = document.getElementById('generate-btn');
        if (generateBtn) {
            generateBtn.addEventListener('click', () => {
                console.log('🎲 Generate button clicked!');
                this.generateRandomQuestions();
            });
        } else {
            console.error('❌ Generate button not found!');
        }
        
        console.log('✅ Event listeners setup complete');
    }

    getFilteredQuestions() {
        let filtered = this.allQuestions;

        // Filter by topic
        if (this.selectedTopic) {
            filtered = filtered.filter(q => q.topic === this.selectedTopic);
        }

        // Filter by difficulty
        if (this.selectedDifficulty !== 'all') {
            filtered = filtered.filter(q => q.difficulty === this.selectedDifficulty);
        }

        console.log('🔍 Filtered questions:', filtered.length);
        return filtered;
    }

    getRandomQuestions(questions, count) {
        // Fisher-Yates shuffle algorithm
        const shuffled = [...questions];
        
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        
        return shuffled.slice(0, Math.min(count, shuffled.length));
    }

    updateFilteredCount() {
        const filtered = this.getFilteredQuestions();
        const totalCount = document.getElementById('total-count');
        const currentTopic = document.getElementById('current-topic');
        
        if (totalCount) {
            totalCount.textContent = filtered.length;
        }
        
        if (currentTopic) {
            currentTopic.textContent = this.selectedTopic || 'All Topics';
        }
    }

    generateRandomQuestions() {
        console.log('🎲 Generating random questions...');
        
        const filtered = this.getFilteredQuestions();
        
        console.log('📊 Filters:', {
            topic: this.selectedTopic || 'All',
            difficulty: this.selectedDifficulty,
            count: this.questionCount,
            available: filtered.length
        });
        
        if (filtered.length === 0) {
            console.log('⚠️ No questions match filters');
            this.displayEmptyState();
            return;
        }

        this.generatedQuestions = this.getRandomQuestions(filtered, this.questionCount);
        console.log('✅ Generated questions:', this.generatedQuestions.length);
        
        this.displayQuestions(this.generatedQuestions);
        
        // Show stats bar
        const statsBar = document.getElementById('stats-bar');
        if (statsBar) {
            statsBar.style.display = 'flex';
            this.updateStats();
        }
        
        // Smooth scroll to questions
        setTimeout(() => {
            const container = document.getElementById('questions-container');
            if (container) {
                container.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'start' 
                });
            }
        }, 100);
    }

    updateStats() {
        const filtered = this.getFilteredQuestions();
        document.getElementById('total-count').textContent = filtered.length;
        document.getElementById('generated-count').textContent = this.generatedQuestions.length;
        document.getElementById('current-topic').textContent = this.selectedTopic || 'All Topics';
    }

    displayQuestions(questions) {
        console.log('🖼️ Displaying questions:', questions.length);
        
        const container = document.getElementById('questions-container');
        
        if (!container) {
            console.error('❌ Questions container not found!');
            return;
        }
        
        if (questions.length === 0) {
            this.displayEmptyState();
            return;
        }
    
        const questionsHTML = questions.map((question, index) => {
            const difficultyClass = question.difficulty.toLowerCase();
            const isSolved = this.solvedQuestions.has(question.id);
            
            return `
                <div class="question-card ${isSolved ? 'completed' : ''}" 
                     data-question-id="${question.id}"
                     style="animation-delay: ${index * 0.05}s">
                    
                    <div class="question-left">
                        <div class="question-number">#${index + 1}</div>
                        
                        <div class="question-info">
                            <h3 class="question-title">${question.name}</h3>
                            <div class="question-badges">
                                <span class="badge badge-topic">${question.topic}</span>
                                <span class="badge badge-difficulty ${difficultyClass}">
                                    ${question.difficulty}
                                </span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="question-actions">
                        <button class="mark-done-btn ${isSolved ? 'completed' : ''}" 
                                data-question-btn="${question.id}">
                            ${isSolved ? `
                                <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                                    <path d="M16.667 5L7.5 14.167L3.333 10" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
                                </svg>
                                Mark as Done
                            ` : `
                                Mark as Done
                            `}
                        </button>
                        
                        <a href="${question.url}" target="_blank" rel="noopener noreferrer" class="platform-link">
                            Solve →
                        </a>
                    </div>
                </div>
            `;
        }).join('');
    
        container.innerHTML = `<div class="questions-grid">${questionsHTML}</div>`;
        console.log('✅ Questions displayed successfully');
    
        // Add event listeners to all mark done buttons
        document.querySelectorAll('.mark-done-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.handleMarkDone(e));
        });
    }
    

    async handleMarkDone(e) {
        e.preventDefault();
        const button = e.currentTarget;
        const questionId = parseInt(button.dataset.questionBtn);
        const card = button.closest('.question-card');
        
        console.log('✅ Mark done clicked for question:', questionId);
        
        const isDone = this.solvedQuestions.has(questionId);
        
        // Show loading state
        button.disabled = true;
        const originalContent = button.innerHTML;
        button.innerHTML = `
            <span class="loading-spinner"></span>
            ${isDone ? 'Removing...' : 'Saving...'}
        `;
        
        try {
            if (isDone) {
                // Remove from solved
                this.solvedQuestions.delete(questionId);
                button.classList.remove('completed');
                card.classList.remove('completed');
                button.innerHTML = `
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                        <circle cx="10" cy="10" r="8" stroke="currentColor" stroke-width="2"/>
                        <path d="M6 10L9 13L14 8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    Mark as Done
                `;
                this.showSuccessToast('Question unmarked! 🔄');
            } else {
                // Add to solved
                this.solvedQuestions.add(questionId);
                button.classList.add('completed');
                card.classList.add('completed');
                button.innerHTML = `
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                        <path d="M16.667 5L7.5 14.167L3.333 10" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    Done
                `;
                this.showSuccessToast('Question marked as completed! 🎉');
            }
            
            await this.saveProgress();
            this.updateProgressSummary();
            
        } catch (error) {
            console.error('❌ Error toggling question status:', error);
            button.innerHTML = originalContent;
            this.showErrorToast('Failed to save progress. Please try again.');
        } finally {
            button.disabled = false;
        }
    }

    displayEmptyState() {
        console.log('ℹ️ Displaying empty state');
        
        const container = document.getElementById('questions-container');
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">
                    <svg viewBox="0 0 100 100" fill="none" stroke="currentColor">
                        <circle cx="50" cy="50" r="40" stroke-width="3" stroke="#6366f1" opacity="0.3"/>
                        <path d="M50 30V50M50 60V60.1" stroke-width="4" stroke-linecap="round" stroke="#6366f1"/>
                    </svg>
                </div>
                <h3>No Questions Found</h3>
                <p>Try adjusting your filters or select a different topic and difficulty combination</p>
            </div>
        `;
    }

    showSuccessToast(message) {
        this.showToast(message, 'success');
    }

    showErrorToast(message) {
        this.showToast(message, 'error');
    }

    showToast(message, type = 'success') {
        const existingToast = document.querySelector('.toast');
        if (existingToast) existingToast.remove();

        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        
        const styles = `
            position: fixed;
            bottom: 2rem;
            right: 2rem;
            padding: 1rem 1.5rem;
            background: ${type === 'success' ? '#22c55e' : '#ef4444'};
            color: white;
            border-radius: 0.75rem;
            font-weight: 600;
            box-shadow: 0 10px 40px rgba(99, 102, 241, 0.2);
            z-index: 10000;
            animation: slideInUp 0.3s ease-out;
        `;
        
        toast.style.cssText = styles;
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.style.animation = 'slideOutDown 0.3s ease-out';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
}

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
    console.log('📄 DOM Content Loaded - Initializing RandomQuestionGenerator');
    window.randomGenerator = new RandomQuestionGenerator();
});

export default RandomQuestionGenerator;
