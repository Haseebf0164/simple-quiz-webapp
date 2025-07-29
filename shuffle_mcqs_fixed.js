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
        
        // Split content into questions (split by double newline)
        const questions = content.split('\n\n').filter(q => q.trim());
        const shuffledQuestions = [];
        
        console.log(`Processing ${questions.length} questions...`);
        
        for (let i = 0; i < questions.length; i++) {
            const questionBlock = questions[i];
            const lines = questionBlock.trim().split('\n');
            
            // Skip if not enough lines
            if (lines.length < 6) {
                shuffledQuestions.push(questionBlock);
                continue;
            }
            
            // Extract question text (first line)
            const questionText = lines[0];
            
            // Extract options and find answer line
            const options = [];
            let answerLine = null;
            
            for (let j = 1; j < lines.length; j++) {
                const line = lines[j];
                if (line.startsWith('Answer:')) {
                    answerLine = line;
                    break;
                } else if (/^[A-D]\)/.test(line)) {
                    options.push(line);
                }
            }
            
            // Skip if we don't have exactly 4 options or no answer
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
            
            // Find the correct answer text
            const correctOption = optionPairs.find(pair => pair.letter === currentAnswer);
            if (!correctOption) {
                shuffledQuestions.push(questionBlock);
                continue;
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
            
            shuffledQuestions.push(newQuestionLines.join('\n'));
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