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

export const ONET_ATTRIBUTION_NOTICE =
  'This application includes information from the O*NET Interest Profiler Short Form by the U.S. Department of Labor, Employment and Training Administration (USDOL/ETA). Used under the O*NET Developer License.'

// --- B. RIASEC + OCEAN QUESTIONS (75 Questions: 60 RIASEC + 15 OCEAN) ---
export const PROFILE_QUESTIONS: IProfileQuestion[] = [
    // Realistic (10 Qs - Verbatim O*NET Interest Profiler Short Form)
    { id: 'R1', type: 'Realistic', factor: 'RIASEC', text: 'Build kitchen cabinets', isReversed: false, scale: 'Interest' },
    { id: 'R2', type: 'Realistic', factor: 'RIASEC', text: 'Lay brick or tile', isReversed: false, scale: 'Interest' },
    { id: 'R3', type: 'Realistic', factor: 'RIASEC', text: 'Repair household appliances', isReversed: false, scale: 'Interest' },
    { id: 'R4', type: 'Realistic', factor: 'RIASEC', text: 'Raise fish in a fish hatchery', isReversed: false, scale: 'Interest' },
    { id: 'R5', type: 'Realistic', factor: 'RIASEC', text: 'Assemble electronic parts', isReversed: false, scale: 'Interest' },
    { id: 'R6', type: 'Realistic', factor: 'RIASEC', text: 'Drive a taxi or bus', isReversed: false, scale: 'Interest' },
    { id: 'R7', type: 'Realistic', factor: 'RIASEC', text: 'Operate a grinding machine in a factory', isReversed: false, scale: 'Interest' },
    { id: 'R8', type: 'Realistic', factor: 'RIASEC', text: 'Fix a broken faucet', isReversed: false, scale: 'Interest' },
    { id: 'R9', type: 'Realistic', factor: 'RIASEC', text: 'Install satellite dishes', isReversed: false, scale: 'Interest' },
    { id: 'R10', type: 'Realistic', factor: 'RIASEC', text: 'Refinish wood furniture', isReversed: false, scale: 'Interest' },
    
    // Investigative (10 Qs - Verbatim O*NET Interest Profiler Short Form)
    { id: 'I1', type: 'Investigative', factor: 'RIASEC', text: 'Study the structure of the human body', isReversed: false, scale: 'Interest' },
    { id: 'I2', type: 'Investigative', factor: 'RIASEC', text: 'Conduct biological research', isReversed: false, scale: 'Interest' },
    { id: 'I3', type: 'Investigative', factor: 'RIASEC', text: 'Study animal behavior', isReversed: false, scale: 'Interest' },
    { id: 'I4', type: 'Investigative', factor: 'RIASEC', text: 'Develop a new medical treatment or procedure', isReversed: false, scale: 'Interest' },
    { id: 'I5', type: 'Investigative', factor: 'RIASEC', text: 'Read books or articles about science', isReversed: false, scale: 'Interest' },
    { id: 'I6', type: 'Investigative', factor: 'RIASEC', text: 'Conduct chemical experiments', isReversed: false, scale: 'Interest' },
    { id: 'I7', type: 'Investigative', factor: 'RIASEC', text: 'Analyze data to solve a problem', isReversed: false, scale: 'Interest' },
    { id: 'I8', type: 'Investigative', factor: 'RIASEC', text: 'Examine microscopic organisms', isReversed: false, scale: 'Interest' },
    { id: 'I9', type: 'Investigative', factor: 'RIASEC', text: 'Study weather patterns', isReversed: false, scale: 'Interest' },
    { id: 'I10', type: 'Investigative', factor: 'RIASEC', text: 'Research the history of ancient civilizations', isReversed: false, scale: 'Interest' },
    
    // Artistic (10 Qs - Verbatim O*NET Interest Profiler Short Form)
    { id: 'A1', type: 'Artistic', factor: 'RIASEC', text: 'Conduct a musical choir', isReversed: false, scale: 'Interest' },
    { id: 'A2', type: 'Artistic', factor: 'RIASEC', text: 'Direct a play', isReversed: false, scale: 'Interest' },
    { id: 'A3', type: 'Artistic', factor: 'RIASEC', text: 'Design artwork for magazines or websites', isReversed: false, scale: 'Interest' },
    { id: 'A4', type: 'Artistic', factor: 'RIASEC', text: 'Write a song', isReversed: false, scale: 'Interest' },
    { id: 'A5', type: 'Artistic', factor: 'RIASEC', text: 'Write books, stories, or plays', isReversed: false, scale: 'Interest' },
    { id: 'A6', type: 'Artistic', factor: 'RIASEC', text: 'Paint portraits or landscapes', isReversed: false, scale: 'Interest' },
    { id: 'A7', type: 'Artistic', factor: 'RIASEC', text: 'Create pottery or sculpture', isReversed: false, scale: 'Interest' },
    { id: 'A8', type: 'Artistic', factor: 'RIASEC', text: 'Play a musical instrument in public', isReversed: false, scale: 'Interest' },
    { id: 'A9', type: 'Artistic', factor: 'RIASEC', text: 'Design clothing or fashion accessories', isReversed: false, scale: 'Interest' },
    { id: 'A10', type: 'Artistic', factor: 'RIASEC', text: 'Create visual animations', isReversed: false, scale: 'Interest' },
    
    // Social (10 Qs - Verbatim O*NET Interest Profiler Short Form)
    { id: 'S1', type: 'Social', factor: 'RIASEC', text: 'Give career guidance to people', isReversed: false, scale: 'Interest' },
    { id: 'S2', type: 'Social', factor: 'RIASEC', text: 'Do volunteer work at a non-profit organization', isReversed: false, scale: 'Interest' },
    { id: 'S3', type: 'Social', factor: 'RIASEC', text: 'Help people who have problems with drugs or alcohol', isReversed: false, scale: 'Interest' },
    { id: 'S4', type: 'Social', factor: 'RIASEC', text: 'Teach an individual an exercise routine', isReversed: false, scale: 'Interest' },
    { id: 'S5', type: 'Social', factor: 'RIASEC', text: 'Help people with family-related problems', isReversed: false, scale: 'Interest' },
    { id: 'S6', type: 'Social', factor: 'RIASEC', text: 'Teach children how to read', isReversed: false, scale: 'Interest' },
    { id: 'S7', type: 'Social', factor: 'RIASEC', text: 'Care for sick or injured people', isReversed: false, scale: 'Interest' },
    { id: 'S8', type: 'Social', factor: 'RIASEC', text: 'Work as a counselor in a school or community center', isReversed: false, scale: 'Interest' },
    { id: 'S9', type: 'Social', factor: 'RIASEC', text: 'Help elderly people with daily tasks', isReversed: false, scale: 'Interest' },
    { id: 'S10', type: 'Social', factor: 'RIASEC', text: 'Organize recreational activities for a group', isReversed: false, scale: 'Interest' },
    
    // Enterprising (10 Qs - Verbatim O*NET Interest Profiler Short Form)
    { id: 'E1', type: 'Enterprising', factor: 'RIASEC', text: 'Sell merchandise at a department store', isReversed: false, scale: 'Interest' },
    { id: 'E2', type: 'Enterprising', factor: 'RIASEC', text: 'Manage the operations of a hotel', isReversed: false, scale: 'Interest' },
    { id: 'E3', type: 'Enterprising', factor: 'RIASEC', text: 'Manage a department within a large company', isReversed: false, scale: 'Interest' },
    { id: 'E4', type: 'Enterprising', factor: 'RIASEC', text: 'Negotiate business contracts', isReversed: false, scale: 'Interest' },
    { id: 'E5', type: 'Enterprising', factor: 'RIASEC', text: 'Pitch a product or business idea to investors', isReversed: false, scale: 'Interest' },
    { id: 'E6', type: 'Enterprising', factor: 'RIASEC', text: 'Lead a marketing campaign', isReversed: false, scale: 'Interest' },
    { id: 'E7', type: 'Enterprising', factor: 'RIASEC', text: 'Operate a small business', isReversed: false, scale: 'Interest' },
    { id: 'E8', type: 'Enterprising', factor: 'RIASEC', text: 'Direct the work of a sales team', isReversed: false, scale: 'Interest' },
    { id: 'E9', type: 'Enterprising', factor: 'RIASEC', text: 'Convince people to buy a product or service', isReversed: false, scale: 'Interest' },
    { id: 'E10', type: 'Enterprising', factor: 'RIASEC', text: 'Manage budget and sales targets for a business', isReversed: false, scale: 'Interest' },
    
    // Conventional (10 Qs - Verbatim O*NET Interest Profiler Short Form)
    { id: 'C1', type: 'Conventional', factor: 'RIASEC', text: 'Generate monthly payroll checks for an office', isReversed: false, scale: 'Interest' },
    { id: 'C2', type: 'Conventional', factor: 'RIASEC', text: 'Inventory supplies using a computer system', isReversed: false, scale: 'Interest' },
    { id: 'C3', type: 'Conventional', factor: 'RIASEC', text: 'Use a computer program to generate customer bills', isReversed: false, scale: 'Interest' },
    { id: 'C4', type: 'Conventional', factor: 'RIASEC', text: 'Maintain employee records and files', isReversed: false, scale: 'Interest' },
    { id: 'C5', type: 'Conventional', factor: 'RIASEC', text: 'Compute and record statistical and numerical data', isReversed: false, scale: 'Interest' },
    { id: 'C6', type: 'Conventional', factor: 'RIASEC', text: 'Keep financial records for a business', isReversed: false, scale: 'Interest' },
    { id: 'C7', type: 'Conventional', factor: 'RIASEC', text: 'Audit financial statements for accuracy', isReversed: false, scale: 'Interest' },
    { id: 'C8', type: 'Conventional', factor: 'RIASEC', text: 'Organize and file office documents', isReversed: false, scale: 'Interest' },
    { id: 'C9', type: 'Conventional', factor: 'RIASEC', text: 'Enter data into database spreadsheets', isReversed: false, scale: 'Interest' },
    { id: 'C10', type: 'Conventional', factor: 'RIASEC', text: 'Inspect incoming shipments for quality and completeness', isReversed: false, scale: 'Interest' },
    
    // OCEAN (15 Qs - Untouched)
    { id: 'O1', type: 'Openness', factor: 'OCEAN', text: 'I often find myself fascinated by abstract theories or ideas.', isReversed: false, scale: 'Agreement' },
    { id: 'O2', type: 'Openness', factor: 'OCEAN', text: 'I love trying new activities and dislike routine.', isReversed: false, scale: 'Agreement' },
    { id: 'O3', type: 'Openness', factor: 'OCEAN', text: 'I prefer to stick to tried-and-true methods.', isReversed: true, scale: 'Agreement' }, 
    
    { id: 'C4_OCEAN', type: 'Conscientiousness', factor: 'OCEAN', text: 'I am very organized and like to plan ahead.', isReversed: false, scale: 'Agreement' },
    { id: 'C5_OCEAN', type: 'Conscientiousness', factor: 'OCEAN', text: 'I always finish what I start, even if it is difficult.', isReversed: false, scale: 'Agreement' },
    { id: 'C6_OCEAN', type: 'Conscientiousness', factor: 'OCEAN', text: 'I often put off important tasks until the last minute.', isReversed: true, scale: 'Agreement' }, 
    
    { id: 'E4_OCEAN', type: 'Extraversion', factor: 'OCEAN', text: 'I am energized by large social gatherings.', isReversed: false, scale: 'Agreement' },
    { id: 'E5_OCEAN', type: 'Extraversion', factor: 'OCEAN', text: 'I find it easy to speak up and lead conversations.', isReversed: false, scale: 'Agreement' },
    { id: 'E6_OCEAN', type: 'Extraversion', factor: 'OCEAN', text: 'I prefer to work and spend time quietly and alone.', isReversed: true, scale: 'Agreement' }, 
    
    { id: 'A4_OCEAN', type: 'Agreeableness', factor: 'OCEAN', text: 'I sympathize with others and try to avoid conflicts.', isReversed: false, scale: 'Agreement' },
    { id: 'A5_OCEAN', type: 'Agreeableness', factor: 'OCEAN', text: 'I assume the best in people and trust them easily.', isReversed: false, scale: 'Agreement' },
    { id: 'A6_OCEAN', type: 'Agreeableness', factor: 'OCEAN', text: "I don't hesitate to tell people when they are wrong.", isReversed: true, scale: 'Agreement' }, 
    
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