import random
import re

def shuffle_mcqs(input_file, output_file):
    """
    Shuffle MCQ options while maintaining correct answer relationships.
    """
    with open(input_file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Split content into questions
    questions = content.strip().split('\n\n')
    shuffled_questions = []
    
    for question_block in questions:
        if not question_block.strip():
            continue
            
        lines = question_block.strip().split('\n')
        if len(lines) < 6:  # Need at least question + 4 options + answer
            shuffled_questions.append(question_block)
            continue
        
        # Extract question text
        question_text = lines[0]
        
        # Extract options
        options = []
        answer_line = None
        
        for line in lines[1:]:
            if line.startswith('Answer:'):
                answer_line = line
                break
            elif re.match(r'^[A-D]\)', line):
                options.append(line)
        
        if len(options) != 4 or not answer_line:
            shuffled_questions.append(question_block)
            continue
        
        # Extract current answer
        current_answer = answer_line.split(':')[1].strip()
        
        # Create option pairs (letter, text)
        option_pairs = []
        for option in options:
            letter = option[0]
            text = option[3:]  # Remove "A) " part
            option_pairs.append((letter, text))
        
        # Shuffle options
        random.shuffle(option_pairs)
        
        # Find the correct answer text
        correct_text = None
        for letter, text in option_pairs:
            if letter == current_answer:
                correct_text = text
                break
        
        # Find new position of correct answer
        new_answer = None
        for i, (letter, text) in enumerate(option_pairs):
            if text == correct_text:
                new_answer = chr(65 + i)  # Convert 0,1,2,3 to A,B,C,D
                break
        
        # Reconstruct question
        new_question_lines = [question_text]
        for i, (letter, text) in enumerate(option_pairs):
            new_letter = chr(65 + i)
            new_question_lines.append(f"{new_letter}) {text}")
        
        new_question_lines.append(f"Answer: {new_answer}")
        
        shuffled_questions.append('\n'.join(new_question_lines))
    
    # Write shuffled questions to output file
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write('\n\n'.join(shuffled_questions))
    
    print(f"Shuffled MCQs saved to {output_file}")

if __name__ == "__main__":
    # Set random seed for reproducibility (optional)
    random.seed(42)
    
    # Shuffle the MCQs
    shuffle_mcqs('all_mcqs.txt', 'all_mcqs_shuffled.txt') 