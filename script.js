// Global variables
let currentQuestions = [];
let currentQuestionIndex = 0;
let userAnswers = [];
let selectedSubject = null;
let numQuestions = 30;

// DOM elements
const subjectGrid = document.getElementById('subjectGrid');
const startBtn = document.getElementById('startBtn');
const quizArea = document.getElementById('quizArea');
const submitBtn = document.getElementById('submitBtn');
const resultArea = document.getElementById('resultArea');
const numQuestionsSelect = document.getElementById('numQuestions');

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
    // Subject selection
    subjectGrid.addEventListener('click', function(e) {
        if (e.target.classList.contains('subject-card')) {
            // Remove active class from all cards
            document.querySelectorAll('.subject-card').forEach(card => {
                card.classList.remove('active');
            });
            
            // Add active class to clicked card
            e.target.classList.add('active');
            selectedSubject = e.target.dataset.value;
            
            // Enable start button
            startBtn.disabled = false;
        }
    });

    // Start quiz
    startBtn.addEventListener('click', startQuiz);
    
    // Submit quiz
    submitBtn.addEventListener('click', submitQuiz);
    
    // Number of questions change
    numQuestionsSelect.addEventListener('change', function() {
        numQuestions = this.value;
    });
    
    // Initially disable start button
    startBtn.disabled = true;
});

// Start the quiz
async function startQuiz() {
    if (!selectedSubject) {
        alert('Please select a subject first!');
        return;
    }

    try {
        // Load questions
        await loadQuestions();
        
        // Hide subject selection and show quiz
        document.querySelector('.row').style.display = 'none';
        document.querySelector('.mt-4').style.display = 'none';
        
        // Show quiz area
        quizArea.style.display = 'block';
        submitBtn.style.display = 'block';
        
        // Display first question
        displayQuestion();
        
    } catch (error) {
        console.error('Error starting quiz:', error);
        alert('Error loading questions. Please try again.');
    }
}

// Load questions from selected subject
async function loadQuestions() {
    let questions = [];
    
    if (selectedSubject === 'all') {
        // Load questions from all subjects
        const subjectFiles = [
            'MCQs_Calculus.txt', 'MCQs_Computer_Architecture.txt', 'MCQs_Data_Structures.txt',
            'MCQs_Databases.txt', 'MCQs_Derivation.txt', 'MCQs_General_English.txt',
            'MCQs_General_Knowledge.txt', 'MCQs_Hardware.txt', 'MCQs_Information_Security.txt',
            'MCQs_Integration.txt', 'MCQs_Linear_Algebra.txt', 'MCQs_Networking.txt',
            'MCQs_OOPs.txt', 'MCQs_Operating_Systems.txt', 'MCQs_Quantitative_Reasoning.txt',
            'MCQs_SDLC.txt', 'MCQs_Software.txt', 'MCQs_IOT.txt', 'MCQs_NTS.txt'
        ];
        
        for (const file of subjectFiles) {
            try {
                const response = await fetch(file);
                if (response.ok) {
                    const text = await response.text();
                    const fileQuestions = parseQuestions(text);
                    questions = questions.concat(fileQuestions);
                }
            } catch (error) {
                console.warn(`Could not load ${file}:`, error);
            }
        }
    } else if (selectedSubject === 'cs_it_concepts') {
        // Load questions from CS/IT related subjects
        const csSubjects = [
            'MCQs_Computer_Architecture.txt', 'MCQs_Data_Structures.txt', 'MCQs_Databases.txt',
            'MCQs_Information_Security.txt', 'MCQs_Networking.txt', 'MCQs_OOPs.txt',
            'MCQs_Operating_Systems.txt', 'MCQs_SDLC.txt', 'MCQs_Software.txt', 'MCQs_Hardware.txt'
        ];
        
        for (const file of csSubjects) {
            try {
                const response = await fetch(file);
                if (response.ok) {
                    const text = await response.text();
                    const fileQuestions = parseQuestions(text);
                    questions = questions.concat(fileQuestions);
                }
            } catch (error) {
                console.warn(`Could not load ${file}:`, error);
            }
        }
    } else {
        // Load questions from specific subject
        const response = await fetch(selectedSubject);
        if (!response.ok) {
            throw new Error(`Failed to load ${selectedSubject}`);
        }
        const text = await response.text();
        questions = parseQuestions(text);
    }
    
    // Shuffle questions and limit to requested number
    questions = shuffleArray(questions);
    
    if (numQuestions !== 'all' && questions.length > numQuestions) {
        questions = questions.slice(0, numQuestions);
    }
    
    currentQuestions = questions;
    currentQuestionIndex = 0;
    userAnswers = new Array(questions.length).fill(null);
}

// Parse questions from text file
function parseQuestions(text) {
    const questions = [];
    const lines = text.split('\n');
    let currentQuestion = null;
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        
        if (line === '') continue;
        
        // Check if line starts with a number followed by a dot (question)
        if (/^\d+\./.test(line)) {
            if (currentQuestion) {
                questions.push(currentQuestion);
            }
            
            currentQuestion = {
                question: line.replace(/^\d+\.\s*/, ''),
                options: [],
                answer: null
            };
        }
        // Check if line starts with A), B), C), or D) (options)
        else if (/^[A-D]\)/.test(line)) {
            if (currentQuestion) {
                currentQuestion.options.push(line.replace(/^[A-D]\)\s*/, ''));
            }
        }
        // Check if line contains "Answer:"
        else if (line.startsWith('Answer:')) {
            if (currentQuestion) {
                currentQuestion.answer = line.replace('Answer:', '').trim();
            }
        }
    }
    
    // Add the last question
    if (currentQuestion && currentQuestion.options.length === 4 && currentQuestion.answer) {
        questions.push(currentQuestion);
    }
    
    return questions;
}

// Display current question
function displayQuestion() {
    if (currentQuestionIndex >= currentQuestions.length) {
        submitQuiz();
        return;
    }
    
    const question = currentQuestions[currentQuestionIndex];
    
    quizArea.innerHTML = `
        <div class="question-container">
            <div class="progress mb-3">
                <div class="progress-bar" role="progressbar" style="width: ${((currentQuestionIndex + 1) / currentQuestions.length) * 100}%" 
                     aria-valuenow="${currentQuestionIndex + 1}" aria-valuemin="0" aria-valuemax="${currentQuestions.length}">
                    Question ${currentQuestionIndex + 1} of ${currentQuestions.length}
                </div>
            </div>
            
            <h3 class="mb-4">${question.question}</h3>
            
            <div class="options-container">
                ${question.options.map((option, index) => `
                    <div class="form-check mb-3">
                        <input class="form-check-input" type="radio" name="question${currentQuestionIndex}" 
                               id="option${index}" value="${String.fromCharCode(65 + index)}" 
                               ${userAnswers[currentQuestionIndex] === String.fromCharCode(65 + index) ? 'checked' : ''}>
                        <label class="form-check-label" for="option${index}">
                            ${String.fromCharCode(65 + index)}) ${option}
                        </label>
                    </div>
                `).join('')}
            </div>
            
            <div class="navigation-buttons mt-4">
                ${currentQuestionIndex > 0 ? '<button class="btn btn-secondary me-2" onclick="previousQuestion()">← Previous</button>' : ''}
                <button class="btn btn-primary" onclick="nextQuestion()">
                    ${currentQuestionIndex === currentQuestions.length - 1 ? 'Finish' : 'Next →'}
                </button>
            </div>
        </div>
    `;
    
    // Add event listeners to radio buttons
    const radioButtons = quizArea.querySelectorAll('input[type="radio"]');
    radioButtons.forEach(radio => {
        radio.addEventListener('change', function() {
            userAnswers[currentQuestionIndex] = this.value;
        });
    });
}

// Navigate to next question
function nextQuestion() {
    if (currentQuestionIndex < currentQuestions.length - 1) {
        currentQuestionIndex++;
        displayQuestion();
    } else {
        submitQuiz();
    }
}

// Navigate to previous question
function previousQuestion() {
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        displayQuestion();
    }
}

// Submit quiz and show results
function submitQuiz() {
    // Calculate score
    let correctAnswers = 0;
    const results = [];
    
    currentQuestions.forEach((question, index) => {
        const userAnswer = userAnswers[index];
        const isCorrect = userAnswer === question.answer;
        
        if (isCorrect) {
            correctAnswers++;
        }
        
        results.push({
            question: question.question,
            userAnswer: userAnswer,
            correctAnswer: question.answer,
            isCorrect: isCorrect
        });
    });
    
    const score = (correctAnswers / currentQuestions.length) * 100;
    
    // Display results
    displayResults(score, correctAnswers, currentQuestions.length, results);
}

// Display quiz results
function displayResults(score, correctAnswers, totalQuestions, results) {
    quizArea.style.display = 'none';
    submitBtn.style.display = 'none';
    
    const scoreClass = score >= 80 ? 'text-success' : score >= 60 ? 'text-warning' : 'text-danger';
    const scoreEmoji = score >= 80 ? '🎉' : score >= 60 ? '👍' : '😔';
    
    resultArea.innerHTML = `
        <div class="results-container text-center">
            <h2 class="mb-4">${scoreEmoji} Quiz Results ${scoreEmoji}</h2>
            
            <div class="score-display mb-4">
                <h3 class="${scoreClass}">${score.toFixed(1)}%</h3>
                <p class="text-white">${correctAnswers} out of ${totalQuestions} questions correct</p>
            </div>
            
            <div class="detailed-results">
                <h4 class="mb-3">Detailed Results</h4>
                <div class="accordion" id="resultsAccordion">
                    ${results.map((result, index) => `
                        <div class="accordion-item" style="background: #1c1c1e; border: 1px solid #ffffff20;">
                            <h2 class="accordion-header" id="heading${index}">
                                <button class="accordion-button ${result.isCorrect ? 'text-success' : 'text-danger'}" 
                                        type="button" data-bs-toggle="collapse" data-bs-target="#collapse${index}" 
                                        aria-expanded="false" aria-controls="collapse${index}"
                                        style="background: #1c1c1e; color: ${result.isCorrect ? '#00b894' : '#e74c3c'}; border: none;">
                                    Question ${index + 1}: ${result.isCorrect ? '✓ Correct' : '✗ Incorrect'}
                                </button>
                            </h2>
                            <div id="collapse${index}" class="accordion-collapse collapse" aria-labelledby="heading${index}" 
                                 data-bs-parent="#resultsAccordion">
                                <div class="accordion-body" style="background: #1c1c1e; color: #ffffff;">
                                    <p><strong>Question:</strong> ${result.question}</p>
                                    <p class="text-danger"><strong>Your Answer:</strong> ${result.userAnswer || 'Not answered'}</p>
                                    <p class="text-success"><strong>Correct Answer:</strong> ${result.correctAnswer}</p>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <div class="mt-4">
                <button class="btn btn-primary me-2" onclick="restartQuiz()">🔄 Take Another Quiz</button>
                <button class="btn btn-secondary" onclick="goHome()">🏠 Go Home</button>
            </div>
        </div>
    `;
    
    resultArea.style.display = 'block';
}

// Restart quiz
function restartQuiz() {
    // Reset variables
    currentQuestions = [];
    currentQuestionIndex = 0;
    userAnswers = [];
    selectedSubject = null;
    
    // Reset UI
    document.querySelector('.row').style.display = 'grid';
    document.querySelector('.mt-4').style.display = 'block';
    quizArea.style.display = 'none';
    submitBtn.style.display = 'none';
    resultArea.style.display = 'none';
    
    // Reset subject selection
    document.querySelectorAll('.subject-card').forEach(card => {
        card.classList.remove('active');
    });
    
    // Reset start button
    startBtn.disabled = true;
}

// Go back to home
function goHome() {
    window.location.reload();
}

// Utility function to shuffle array
function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}
