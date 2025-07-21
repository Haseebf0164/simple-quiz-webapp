// List of all subject files
const subjectFiles = [
    "MCQs_Calculus.txt",
    "MCQs_Computer_Architecture.txt",
    "MCQs_Data_Structures.txt",
    "MCQs_Databases.txt",
    "MCQs_Derivation.txt",
    "MCQs_General_English.txt",
    "MCQs_General_Knowledge.txt",
    "MCQs_Hardware.txt",
    "MCQs_Information_Security.txt",
    "MCQs_Integration.txt",
    "MCQs_Linear_Algebra.txt",
    "MCQs_Networking.txt",
    "MCQs_OOPs.txt",
    "MCQs_Operating_Systems.txt",
    "MCQs_Quantitative_Reasoning.txt",
    "MCQs_SDLC.txt",
    "MCQs_Software.txt"
];

function parseMCQs(text) {
    const questions = [];
    // Accept both "Q: " and numbered format
    const blocks = text.split(/\n(?=\d+\.|Q: )/g);
    for (let block of blocks) {
        // Try to extract question
        let qMatch = block.match(/^(?:\d+\. |Q: )(.*)/);
        if (!qMatch) continue;
        const question = qMatch[1].trim();
        const options = [];
        const optionMatches = [...block.matchAll(/([A-D])\) (.*)/g)];
        for (let m of optionMatches) {
            options.push({ key: m[1], text: m[2].trim() });
        }
        const answerMatch = block.match(/Answer: ([A-D])/);
        if (!answerMatch || options.length < 2) continue;
        questions.push({
            question,
            options,
            answer: answerMatch[1]
        });
    }
    return questions;
}

let quizQuestions = [];

// Get references to DOM elements
const quizArea = document.getElementById('quizArea');
const submitBtn = document.getElementById('submitBtn');
const resultArea = document.getElementById('resultArea');
const startBtn = document.getElementById('startBtn');

// Get selectedSubject from the global window (set in HTML inline script)
let selectedSubject = window.selectedSubject || 'all';

// Listen for subject card clicks to update selectedSubject
if (window.document.querySelectorAll) {
    document.querySelectorAll('.subject-card').forEach(card => {
        card.addEventListener('click', () => {
            document.querySelectorAll('.subject-card').forEach(c => c.classList.remove('active'));
            card.classList.add('active');
            selectedSubject = card.getAttribute('data-value');
        });
    });
}

startBtn.onclick = async function() {
    let allQuestions = [];
    if (selectedSubject === 'all') {
        // Fetch all files and combine
        const fetches = subjectFiles.map(f => fetch(f).then(r => r.ok ? r.text() : ''));
        const texts = await Promise.all(fetches);
        for (let text of texts) {
            allQuestions = allQuestions.concat(parseMCQs(text));
        }
    } else {
        // Fetch only selected subject
        const text = await fetch(selectedSubject).then(r => r.ok ? r.text() : '');
        allQuestions = parseMCQs(text);
    }
    if (allQuestions.length < 1) {
        alert('No valid MCQs found for this subject.');
        return;
    }
    // Shuffle and pick 50
    quizQuestions = allQuestions.sort(() => Math.random() - 0.5).slice(0, 50);
    showQuiz();
};

function showQuiz() {
    quizArea.innerHTML = '';
    quizQuestions.forEach((q, idx) => {
        const div = document.createElement('div');
        div.className = 'question mb-4 p-3 rounded';
        div.style.background = '#23232b';
        div.innerHTML = `<div class="mb-2"><b>Q${idx+1}:</b> ${q.question}</div>`;
        const optsDiv = document.createElement('div');
        optsDiv.className = 'options';
        q.options.forEach(opt => {
            const id = `q${idx}_opt_${opt.key}`;
            optsDiv.innerHTML += `
                <label class="form-check-label d-block mb-2"><input type="radio" class="form-check-input me-2" name="q${idx}" value="${opt.key}" id="${id}"> ${opt.key}) ${opt.text}</label>
            `;
        });
        div.appendChild(optsDiv);
        quizArea.appendChild(div);
    });
    quizArea.style.display = '';
    submitBtn.style.display = '';
    resultArea.style.display = 'none';
}

submitBtn.onclick = function() {
    let score = 0;
    let results = '';
    quizQuestions.forEach((q, idx) => {
        const selected = document.querySelector(`input[name='q${idx}']:checked`);
        const userAns = selected ? selected.value : null;
        const isCorrect = userAns === q.answer;
        if (isCorrect) score++;
        // Show all options, mark correct/wrong with tick/cross
        let optionsHtml = '';
        q.options.forEach(opt => {
            let symbol = '';
            let optClass = '';
            if (opt.key === q.answer) {
                symbol = '✔️';
                optClass = 'correct';
            }
            if (userAns && opt.key === userAns && userAns !== q.answer) {
                symbol = '❌';
                optClass = 'incorrect';
            }
            optionsHtml += `<div class="d-flex align-items-center mb-1 ${optClass}">
                <span style="width:2em;display:inline-block;">${symbol}</span>
                <span>${opt.key}) ${opt.text}</span>
            </div>`;
        });
        results += `<div class="question mb-3 p-3 rounded" style="background:#23232b;">
            <div><b>Q${idx+1}:</b> ${q.question}</div>
            <div class="ms-2">${optionsHtml}</div>
            <div>Your answer: <span class="${isCorrect ? 'correct' : 'incorrect'}">${userAns ? userAns : 'No answer'}</span></div>
            <div>Correct answer: <span class="correct">${q.answer}</span></div>
        </div>`;
    });
    resultArea.innerHTML = `<h2 class="mb-4">Result: ${score} / ${quizQuestions.length}</h2>` + results;
    resultArea.style.display = '';
    quizArea.style.display = 'none';
    submitBtn.style.display = 'none';
}; 