// Get form and result elements
const form = document.getElementById('gradeForm');
const resultsDiv = document.getElementById('results');
const subjectsContainer = document.getElementById('subjectsContainer');
const totalSubjectsSpan = document.getElementById('totalSubjects');
const totalMarksSpan = document.getElementById('totalMarks');
const percentageSpan = document.getElementById('percentage');
const gradeSpan = document.getElementById('grade');
const statusSpan = document.getElementById('status');

// Maximum marks per subject
const MAX_MARKS_PER_SUBJECT = 100;

// Counter for unique subject IDs
let subjectIdCounter = 3;

// Add event listener to form
form.addEventListener('submit', function(e) {
    e.preventDefault();
    calculate();
});

// Function to add a new subject
function addSubject() {
    subjectIdCounter++;
    
    const subjectItem = document.createElement('div');
    subjectItem.className = 'input-group subject-item';
    subjectItem.setAttribute('data-subject-id', subjectIdCounter);
    
    subjectItem.innerHTML = `
        <div class="subject-header">
            <input type="text" class="subject-name" placeholder="Subject name" required>
            <button type="button" class="remove-btn" onclick="removeSubject(${subjectIdCounter})">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M18 6L6 18M6 6l12 12"/>
                </svg>
            </button>
        </div>
        <input type="number" class="subject-marks" placeholder="Enter marks (0-100)" min="0" max="100" required>
    `;
    
    subjectsContainer.appendChild(subjectItem);
    
    // Trigger animation
    setTimeout(() => {
        subjectItem.style.animation = 'slideInLeft 0.4s ease-out';
    }, 10);
    
    // Add focus animation to new inputs
    addInputAnimations(subjectItem);
}

// Function to remove a subject
function removeSubject(id) {
    const subjects = document.querySelectorAll('.subject-item');
    
    // Prevent removing if only one subject remains
    if (subjects.length <= 1) {
        alert('You must have at least one subject!');
        return;
    }
    
    const subjectToRemove = document.querySelector(`[data-subject-id="${id}"]`);
    
    if (subjectToRemove) {
        // Add fade out animation
        subjectToRemove.style.animation = 'fadeOut 0.3s ease-out';
        
        setTimeout(() => {
            subjectToRemove.remove();
        }, 300);
    }
}

// Add fade out animation to CSS dynamically
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeOut {
        from {
            opacity: 1;
            transform: translateX(0);
        }
        to {
            opacity: 0;
            transform: translateX(-20px);
        }
    }
`;
document.head.appendChild(style);

// Main calculation function
function calculate() {
    const subjects = document.querySelectorAll('.subject-item');
    
    if (subjects.length === 0) {
        alert('Please add at least one subject!');
        return;
    }
    
    let totalMarks = 0;
    let allSubjectsValid = true;
    const subjectDetails = [];
    
    // Collect and validate all subjects
    subjects.forEach((subject, index) => {
        const nameInput = subject.querySelector('.subject-name');
        const marksInput = subject.querySelector('.subject-marks');
        
        const subjectName = nameInput.value.trim();
        const marks = marksInput.value;
        
        // Validate subject name
        if (subjectName === '') {
            alert(`Please enter a name for subject ${index + 1}`);
            allSubjectsValid = false;
            nameInput.focus();
            return;
        }
        
        // Validate marks
        if (marks === '') {
            alert(`Please enter marks for ${subjectName}`);
            allSubjectsValid = false;
            marksInput.focus();
            return;
        }
        
        const marksValue = parseFloat(marks);
        
        // Check if marks is a valid number
        if (isNaN(marksValue)) {
            alert(`Please enter valid marks for ${subjectName}`);
            allSubjectsValid = false;
            marksInput.focus();
            return;
        }
        
        // Check if marks are within range
        if (marksValue < 0 || marksValue > 100) {
            alert(`Marks for ${subjectName} should be between 0 and 100`);
            allSubjectsValid = false;
            marksInput.focus();
            return;
        }
        
        // Add to total
        totalMarks += marksValue;
        subjectDetails.push({ name: subjectName, marks: marksValue });
    });
    
    // If validation failed, stop here
    if (!allSubjectsValid) {
        return;
    }
    
    // Calculate total possible marks
    const numberOfSubjects = subjects.length;
    const totalMaxMarks = MAX_MARKS_PER_SUBJECT * numberOfSubjects;
    
    // Calculate percentage
    const percentage = (totalMarks / totalMaxMarks) * 100;
    
    // Determine grade
    const grade = getGrade(percentage);
    
    // Determine pass/fail status
    const status = percentage >= 40 ? 'Pass' : 'Fail';
    
    // Display results
    displayResults(numberOfSubjects, totalMarks, totalMaxMarks, percentage, grade, status);
}

// Function to determine grade based on percentage
function getGrade(percentage) {
    if (percentage >= 90) {
        return 'A+';
    } else if (percentage >= 80) {
        return 'A';
    } else if (percentage >= 70) {
        return 'B+';
    } else if (percentage >= 60) {
        return 'B';
    } else if (percentage >= 50) {
        return 'C';
    } else if (percentage >= 40) {
        return 'D';
    } else {
        return 'F';
    }
}

// Function to display results with animation
function displayResults(numberOfSubjects, totalMarks, totalMaxMarks, percentage, grade, status) {
    // Show results div
    resultsDiv.classList.remove('hidden');
    
    // Animate numbers counting up
    animateValue(totalSubjectsSpan, 0, numberOfSubjects, 600, 0);
    
    // Animate total marks with max marks display
    let currentMarks = 0;
    const marksIncrement = totalMarks / 50;
    const marksTimer = setInterval(() => {
        currentMarks += marksIncrement;
        if (currentMarks >= totalMarks) {
            currentMarks = totalMarks;
            clearInterval(marksTimer);
        }
        totalMarksSpan.textContent = Math.round(currentMarks) + '/' + totalMaxMarks;
    }, 16);
    
    animateValue(percentageSpan, 0, percentage, 800, 2, '%');
    
    // Display grade with delay
    setTimeout(() => {
        gradeSpan.textContent = grade;
    }, 400);
    
    // Display status with delay and styling
    setTimeout(() => {
        statusSpan.textContent = status;
        statusSpan.className = 'result-value status-value ' + (status === 'Pass' ? 'pass' : 'fail');
    }, 600);
    
    // Scroll to results smoothly
    setTimeout(() => {
        resultsDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 200);
}

// Function to animate number counting
function animateValue(element, start, end, duration, decimals = 0, suffix = '') {
    const range = end - start;
    const increment = range / (duration / 16);
    let current = start;
    
    const timer = setInterval(() => {
        current += increment;
        if ((increment > 0 && current >= end) || (increment < 0 && current <= end)) {
            current = end;
            clearInterval(timer);
        }
        element.textContent = current.toFixed(decimals) + suffix;
    }, 16);
}

// Function to add input animations
function addInputAnimations(container) {
    const inputs = container.querySelectorAll('input');
    inputs.forEach(input => {
        input.addEventListener('focus', function() {
            this.parentElement.style.transform = 'translateX(4px)';
            this.parentElement.style.transition = 'transform 0.3s ease';
        });
        
        input.addEventListener('blur', function() {
            this.parentElement.style.transform = 'translateX(0)';
        });
    });
}

// Initialize animations for existing inputs
document.addEventListener('DOMContentLoaded', function() {
    const existingSubjects = document.querySelectorAll('.subject-item');
    existingSubjects.forEach(subject => {
        addInputAnimations(subject);
    });
});