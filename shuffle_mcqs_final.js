const fs = require('fs');

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function shuffleMCQs(inputFile, outputFile) {
    try {
        // Read the input file
        const content = fs.readFileSync(inputFile, 'utf8');
        
        // Split content into lines
        const lines = content.split('\n');
        const shuffledQuestions = [];
        let currentQuestion = [];
        
        console.log(`Processing ${lines.length} lines...`);
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            
            // Skip empty lines
            if (!line) continue;
            
            // Check if this is a new question (starts with a number and dot)
            if (/^\d+\./.test(line)) {
                // If we have a previous question, process it
                if (currentQuestion.length > 0) {
                    shuffledQuestions.push(processQuestion(currentQuestion));
                }
                // Start new question
                currentQuestion = [line];
            } else {
                // Add line to current question
                currentQuestion.push(line);
            }
        }
        
        // Process the last question
        if (currentQuestion.length > 0) {
            shuffledQuestions.push(processQuestion(currentQuestion));
        }
        
        // Write shuffled questions to output file
        const outputContent = shuffledQuestions.join('\n\n');
        fs.writeFileSync(outputFile, outputContent, 'utf8');
        console.log(`Shuffled MCQs saved to ${outputFile}`);
        console.log(`Processed ${shuffledQuestions.length} questions`);
        
    } catch (error) {
        console.error('Error processing file:', error.message);
    }
}

function processQuestion(questionLines) {
    if (questionLines.length < 6) {
        return questionLines.join('\n');
    }
    
    // Extract question text (first line)
    const questionText = questionLines[0];
    
    // Extract options and find answer line
    const options = [];
    let answerLine = null;
    
    for (let i = 1; i < questionLines.length; i++) {
        const line = questionLines[i];
        if (line.startsWith('Answer:')) {
            answerLine = line;
            break;
        } else if (/^[A-D]\)/.test(line)) {
            options.push(line);
        }
    }
    
    // Skip if we don't have exactly 4 options or no answer
    if (options.length !== 4 || !answerLine) {
        return questionLines.join('\n');
    }
    
    // Extract current answer
    const currentAnswer = answerLine.split(':')[1].trim();
    
    // Create option pairs (letter, text)
    const optionPairs = options.map(option => {
        const letter = option[0];
        const text = option.substring(3); // Remove "A) " part
        return { letter, text };
    });
    
    // Find the correct answer text
    const correctOption = optionPairs.find(pair => pair.letter === currentAnswer);
    if (!correctOption) {
        return questionLines.join('\n');
    }
    
    const correctText = correctOption.text;
    
    // Shuffle options
    shuffleArray(optionPairs);
    
    // Find new position of correct answer
    const newAnswerIndex = optionPairs.findIndex(pair => pair.text === correctText);
    const newAnswer = String.fromCharCode(65 + newAnswerIndex);
    
    // Reconstruct question
    const newQuestionLines = [questionText];
    optionPairs.forEach((pair, index) => {
        const newLetter = String.fromCharCode(65 + index);
        newQuestionLines.push(`${newLetter}) ${pair.text}`);
    });
    newQuestionLines.push(`Answer: ${newAnswer}`);
    
    return newQuestionLines.join('\n');
}

// Set random seed for reproducibility
Math.seedrandom = function(seed) {
    let x = seed;
    return function() {
        x = (x * 9301 + 49297) % 233280;
        return x / 233280;
    };
};

// Use a fixed seed for reproducible results
const random = Math.seedrandom(42);
Math.random = random;

// Shuffle the MCQs
shuffleMCQs('all_mcqs.txt', 'all_mcqs_shuffled.txt'); 