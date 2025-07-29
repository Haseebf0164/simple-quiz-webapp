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
        
        // Split content into questions
        const questions = content.trim().split('\n\n');
        const shuffledQuestions = [];
        
        for (const questionBlock of questions) {
            if (!questionBlock.trim()) continue;
            
            const lines = questionBlock.trim().split('\n');
            if (lines.length < 6) { // Need at least question + 4 options + answer
                shuffledQuestions.push(questionBlock);
                continue;
            }
            
            // Extract question text
            const questionText = lines[0];
            
            // Extract options and answer
            const options = [];
            let answerLine = null;
            
            for (let i = 1; i < lines.length; i++) {
                const line = lines[i];
                if (line.startsWith('Answer:')) {
                    answerLine = line;
                    break;
                } else if (/^[A-D]\)/.test(line)) {
                    options.push(line);
                }
            }
            
            if (options.length !== 4 || !answerLine) {
                shuffledQuestions.push(questionBlock);
                continue;
            }
            
            // Extract current answer
            const currentAnswer = answerLine.split(':')[1].trim();
            
            // Create option pairs (letter, text)
            const optionPairs = options.map(option => {
                const letter = option[0];
                const text = option.substring(3); // Remove "A) " part
                return { letter, text };
            });
            
            // Shuffle options
            shuffleArray(optionPairs);
            
            // Find the correct answer text
            const correctOption = optionPairs.find(pair => pair.letter === currentAnswer);
            const correctText = correctOption ? correctOption.text : null;
            
            // Find new position of correct answer
            const newAnswerIndex = optionPairs.findIndex(pair => pair.text === correctText);
            const newAnswer = newAnswerIndex !== -1 ? String.fromCharCode(65 + newAnswerIndex) : currentAnswer;
            
            // Reconstruct question
            const newQuestionLines = [questionText];
            optionPairs.forEach((pair, index) => {
                const newLetter = String.fromCharCode(65 + index);
                newQuestionLines.push(`${newLetter}) ${pair.text}`);
            });
            newQuestionLines.push(`Answer: ${newAnswer}`);
            
            shuffledQuestions.push(newQuestionLines.join('\n'));
        }
        
        // Write shuffled questions to output file
        fs.writeFileSync(outputFile, shuffledQuestions.join('\n\n'), 'utf8');
        console.log(`Shuffled MCQs saved to ${outputFile}`);
        
    } catch (error) {
        console.error('Error processing file:', error.message);
    }
}

// Set random seed for reproducibility (optional)
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