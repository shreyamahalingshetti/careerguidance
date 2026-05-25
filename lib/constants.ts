// Constants and types for 10th Pass assessment
export const TOTAL_TIME_SECONDS: number = 60 * 60; // 1 hour (60 minutes)

// --- INTERFACES ---
export interface IAptitudeQuestion {
    id: string;
    section: 'Numerical' | 'Verbal' | 'Abstract';
    text: string;
    answerIndex: number; // Index of the correct option in APTITUDE_OPTIONS
}

export interface IProfileQuestion {
    id: string;
    type: string; // e.g., 'Realistic', 'Openness'
    factor: 'RIASEC' | 'OCEAN';
    text: string;
    isReversed: boolean; // True if the question is reverse-scored
    scale: 'Interest' | 'Agreement';
}

export interface IScoreBreakdown {
    [key: string]: number; // e.g., 'Numerical': 85
}

export interface IFinalRecommendation {
    name: string;
    confidence: number;
    flexibility: number;
    aptitudeBreakdown: IScoreBreakdown;
    profileBreakdown: IScoreBreakdown;
    timeExpired: boolean;
}

// --- A. APTITUDE QUESTIONS (24 QUESTIONS: 8 per section) ---
export const APTITUDE_QUESTIONS: IAptitudeQuestion[] = [
    // Numerical (8 Qs)
    { id: 'Q1', section: 'Numerical', text: 'What number should come next in the series: 3, 7, 15, 31, ?', answerIndex: 2 },
    { id: 'Q2', section: 'Numerical', text: 'A shopkeeper buys an item for Rs 400 and sells it at a 20% profit. What is the selling price?', answerIndex: 1 },
    { id: 'Q3', section: 'Numerical', text: 'If the ratio of A:B is 2:3, and B:C is 4:5, what is the combined ratio A:C?', answerIndex: 1 },
    { id: 'Q4', section: 'Numerical', text: 'A man can complete a job in 10 days. How many days would it take him to complete half of the same job?', answerIndex: 1 },
    { id: 'Q5', section: 'Numerical', text: 'If 15% of a certain number is 60, what is the number?', answerIndex: 1 },
    { id: 'Q6', section: 'Numerical', text: 'Convert a speed of 72 km/h to meters per second (m/s).', answerIndex: 1 },
    { id: 'Q7', section: 'Numerical', text: 'If the average of three numbers, 10, 20, and x, is 25, what is the value of x?', answerIndex: 3 },
    { id: 'Q8', section: 'Numerical', text: 'Calculate the simple interest on Rs 1,000 at 5% per annum for 2 years.', answerIndex: 1 },

    // Verbal (8 Qs)
    { id: 'Q13', section: 'Verbal', text: 'Choose the word that is closest in meaning (synonym) to PERILOUS.', answerIndex: 1 },
    { id: 'Q14', section: 'Verbal', text: 'Choose the word that is opposite in meaning (antonym) to EPHEMERAL.', answerIndex: 2 },
    { id: 'Q15', section: 'Verbal', text: 'SHIP is to OCEAN as CAMEL is to ?', answerIndex: 1 },
    { id: 'Q16', section: 'Verbal', text: 'Identify the word that does not belong in the following group: Sparrow, Eagle, Bat, Crow.', answerIndex: 2 },
    { id: 'Q17', section: 'Verbal', text: "Choose the correct term for 'one who studies birds'.", answerIndex: 1 },
    { id: 'Q18', section: 'Verbal', text: 'Arrange the following elements in a logical ascending order: (1) Family, (2) Member, (3) Country, (4) Community.', answerIndex: 1 },
    { id: 'Q19', section: 'Verbal', text: 'Choose the word that is closest in meaning (synonym) to METICULOUS.', answerIndex: 2 },
    { id: 'Q20', section: 'Verbal', text: 'Choose the word that is opposite in meaning (antonym) to CANDID.', answerIndex: 2 },

    // Abstract (8 Qs)
    { id: 'Q25', section: 'Abstract', text: 'Sequence: L shape rotates 90° clockwise at each step. What is the next figure?', answerIndex: 1 },
    { id: 'Q26', section: 'Abstract', text: 'Analogy: Solid Black Circle -> Hollow White Circle. Solid Black Square -> ?', answerIndex: 1 },
    { id: 'Q27', section: 'Abstract', text: 'Find the odd figure out based on the number of dots: (A) 5, (B) 9, (C) 16, (D) 25.', answerIndex: 0 },
    { id: 'Q28', section: 'Abstract', text: 'A figure sequence increases its number of vertical lines by one at each step (1, 2, 3). What is the next figure?', answerIndex: 1 },
    { id: 'Q29', section: 'Abstract', text: 'Which figure is the mirror image of an arrow pointing up and to the right?', answerIndex: 0 },
    { id: 'Q30', section: 'Abstract', text: 'Sequence of polygons by sides: Circle, Triangle (3), Square (4), Pentagon (5). Which figure comes next?', answerIndex: 2 },
    { id: 'Q31', section: 'Abstract', text: 'A black dot moves 90° clockwise through the corners of a square: TL -> TR -> BR -> ?', answerIndex: 2 },
    { id: 'Q32', section: 'Abstract', text: 'Analogy: Two intersecting vertical lines -> One vertical line. Two intersecting circles -> ?', answerIndex: 0 },
];

export const APTITUDE_OPTIONS: { [key: string]: string[] } = {
    'Q1': ['47', '55', '63', '71'], 'Q2': ['Rs 460', 'Rs 480', 'Rs 500', 'Rs 520'], 'Q3': ['6:8', '8:15', '2:5', '10:12'],
    'Q4': ['2 days', '5 days', '7.5 days', '10 days'], 'Q5': ['90', '400', '600', '900'], 'Q6': ['15 m/s', '20 m/s', '25 m/s', '36 m/s'],
    'Q7': ['30', '35', '40', '45'], 'Q8': ['Rs 50', 'Rs 100', 'Rs 105', 'Rs 150'],
    'Q13': ['Calm', 'Dangerous', 'Fragile', 'Temporary'], 'Q14': ['Fleeting', 'Temporary', 'Permanent', 'Vague'], 'Q15': ['Sky', 'Desert', 'Land', 'Mountain'],
    'Q16': ['Sparrow', 'Eagle', 'Bat', 'Crow'], 'Q17': ['Archaeologist', 'Ornithologist', 'Entomologist', 'Anthropologist'], 'Q18': ['(1), (2), (4), (3)', '(2), (1), (4), (3)', '(3), (4), (1), (2)', '(2), (4), (1), (3)'],
    'Q19': ['Careless', 'Lazy', 'Detailed', 'Rude'], 'Q20': ['Honest', 'Truthful', 'Devious', 'Direct'],
    'Q25': ['L facing down and right', 'L facing up and left', 'L facing down and left', 'The original L shape'], 'Q26': ['Solid Black Circle', 'Hollow White Square', 'Hollow White Triangle', 'Solid White Square'], 'Q27': ['Box with 5 dots', 'Box with 9 dots', 'Box with 16 dots', 'Box with 25 dots'],
    'Q28': ['A figure with 3 lines', 'A figure with 4 lines', 'A figure with 5 lines', 'A figure with 6 lines'], 'Q29': ['Arrow pointing up and to the left', 'Arrow pointing down and to the left', 'Arrow pointing up and to the right', 'Arrow pointing down and to the right'],
    'Q30': ['Octagon', 'Heptagon', 'Hexagon', 'Decagon'], 'Q31': ['Top-Left', 'Top-Right', 'Bottom-Left', 'The Center'], 'Q32': ['One circle', 'Two intersecting horizontal lines', 'Three circles', 'One square'],
};

// --- B. RIASEC + OCEAN QUESTIONS (33 Questions) ---
export const PROFILE_QUESTIONS: IProfileQuestion[] = [
    // RIASEC (18 Qs)
    { id: 'R1', type: 'Realistic', factor: 'RIASEC', text: 'Working with tools to build or repair machinery.', isReversed: false, scale: 'Interest' },
    { id: 'R2', type: 'Realistic', factor: 'RIASEC', text: 'Doing physical work outdoors, perhaps with animals or plants.', isReversed: false, scale: 'Interest' },
    { id: 'R3', type: 'Realistic', factor: 'RIASEC', text: 'Operating heavy equipment or machinery.', isReversed: false, scale: 'Interest' },
    
    { id: 'I1', type: 'Investigative', factor: 'RIASEC', text: 'Reading complex articles about science or history.', isReversed: false, scale: 'Interest' },
    { id: 'I2', type: 'Investigative', factor: 'RIASEC', text: 'Spending time solving logical puzzles or mathematical problems.', isReversed: false, scale: 'Interest' },
    { id: 'I3', type: 'Investigative', factor: 'RIASEC', text: 'Conducting experiments to see how things work.', isReversed: false, scale: 'Interest' },
    
    { id: 'A1', type: 'Artistic', factor: 'RIASEC', text: 'Writing stories, poems, or scripts for a play.', isReversed: false, scale: 'Interest' },
    { id: 'A2', type: 'Artistic', factor: 'RIASEC', text: 'Designing visual things like websites, graphics, or clothing.', isReversed: false, scale: 'Interest' },
    { id: 'A3', type: 'Artistic', factor: 'RIASEC', text: 'Enjoying activities that have no specific rules or structure.', isReversed: false, scale: 'Interest' },
    
    { id: 'S1', type: 'Social', factor: 'RIASEC', text: 'Volunteering to help others with their personal problems or advice.', isReversed: false, scale: 'Interest' },
    { id: 'S2', type: 'Social', factor: 'RIASEC', text: 'Teaching or explaining difficult subjects to classmates.', isReversed: false, scale: 'Interest' },
    { id: 'S3', type: 'Social', factor: 'RIASEC', text: 'Working closely with a large team rather than working alone.', isReversed: false, scale: 'Interest' },
    
    { id: 'E1', type: 'Enterprising', factor: 'RIASEC', text: 'Leading a project or taking charge of a group meeting.', isReversed: false, scale: 'Interest' },
    { id: 'E2', type: 'Enterprising', factor: 'RIASEC', text: 'Trying to persuade people to agree with your point of view.', isReversed: false, scale: 'Interest' },
    { id: 'E3', type: 'Enterprising', factor: 'RIASEC', text: 'Setting ambitious goals and competing to win.', isReversed: false, scale: 'Interest' },
    
    { id: 'C1', type: 'Conventional', factor: 'RIASEC', text: 'Organizing data, records, or inventory in meticulous detail.', isReversed: false, scale: 'Interest' },
    { id: 'C2', type: 'Conventional', factor: 'RIASEC', text: 'Following a strict timetable or fixed set of rules and procedures.', isReversed: false, scale: 'Interest' },
    { id: 'C3', type: 'Conventional', factor: 'RIASEC', text: 'Handling financial records or managing a budget.', isReversed: false, scale: 'Interest' },
    
    // OCEAN (15 Qs)
    { id: 'O1', type: 'Openness', factor: 'OCEAN', text: 'I often find myself fascinated by abstract theories or ideas.', isReversed: false, scale: 'Agreement' },
    { id: 'O2', type: 'Openness', factor: 'OCEAN', text: 'I love trying new activities and dislike routine.', isReversed: false, scale: 'Agreement' },
    { id: 'O3', type: 'Openness', factor: 'OCEAN', text: 'I prefer to stick to tried-and-true methods.', isReversed: true, scale: 'Agreement' }, 
    
    { id: 'C4', type: 'Conscientiousness', factor: 'OCEAN', text: 'I am very organized and like to plan ahead.', isReversed: false, scale: 'Agreement' },
    { id: 'C5', type: 'Conscientiousness', factor: 'OCEAN', text: 'I always finish what I start, even if it is difficult.', isReversed: false, scale: 'Agreement' },
    { id: 'C6', type: 'Conscientiousness', factor: 'OCEAN', text: 'I often put off important tasks until the last minute.', isReversed: true, scale: 'Agreement' }, 
    
    { id: 'E4', type: 'Extraversion', factor: 'OCEAN', text: 'I am energized by large social gatherings.', isReversed: false, scale: 'Agreement' },
    { id: 'E5', type: 'Extraversion', factor: 'OCEAN', text: 'I find it easy to speak up and lead conversations.', isReversed: false, scale: 'Agreement' },
    { id: 'E6', type: 'Extraversion', factor: 'OCEAN', text: 'I prefer to work and spend time quietly and alone.', isReversed: true, scale: 'Agreement' }, 
    
    { id: 'A4', type: 'Agreeableness', factor: 'OCEAN', text: 'I sympathize with others and try to avoid conflicts.', isReversed: false, scale: 'Agreement' },
    { id: 'A5', type: 'Agreeableness', factor: 'OCEAN', text: 'I assume the best in people and trust them easily.', isReversed: false, scale: 'Agreement' },
    { id: 'A6', type: 'Agreeableness', factor: 'OCEAN', text: "I don't hesitate to tell people when they are wrong.", isReversed: true, scale: 'Agreement' }, 
    
    { id: 'N1', type: 'Neuroticism', factor: 'OCEAN', text: 'I often worry about things that might go wrong.', isReversed: false, scale: 'Agreement' },
    { id: 'N2', type: 'Neuroticism', factor: 'OCEAN', text: "I get upset easily when things don't go my way.", isReversed: false, scale: 'Agreement' },
    { id: 'N3', type: 'Neuroticism', factor: 'OCEAN', text: 'I am generally calm and rarely feel stressed.', isReversed: true, scale: 'Agreement' }, 
];

// --- SCORING SCALE LABELS ---
export const SCALES: { [key: string]: { labels: string[], title: string } } = {
    Interest: {
        labels: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
        title: "Interest/Enjoyment (RIASEC)",
    },
    Agreement: {
        labels: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
        title: "Agreement (OCEAN)",
    },
};

export const TOTAL_QUESTIONS_APTITUDE = APTITUDE_QUESTIONS.length;
export const TOTAL_QUESTIONS_PROFILE = PROFILE_QUESTIONS.length;
export const TOTAL_QUESTIONS = TOTAL_QUESTIONS_APTITUDE + TOTAL_QUESTIONS_PROFILE;