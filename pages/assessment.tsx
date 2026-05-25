'use client';

import React, { useState, useEffect, useCallback, FC } from 'react';
import {
    TOTAL_TIME_SECONDS,
    APTITUDE_QUESTIONS,
    APTITUDE_OPTIONS,
    PROFILE_QUESTIONS,
    SCALES,
    TOTAL_QUESTIONS_APTITUDE,
    TOTAL_QUESTIONS_PROFILE,
    TOTAL_QUESTIONS,
    IFinalRecommendation,
    IProfileQuestion,
    IAptitudeQuestion
} from '../lib/constants';

/**
 * Helper function for time formatting
 */
const formatTime = (totalSeconds: number): string => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

/**
 * Type definitions for component state
 */
type Answers = { [key: string]: number }; // Key is question ID, value is selected index (0-3) or score (1-5)

/**
 * Main Combined Assessment Component (Next.js Page)
 */
const AssessmentPage: FC = () => {
    // STATE
    const [step, setStep] = useState<number>(0);
    const [aptitudeAnswers, setAptitudeAnswers] = useState<Answers>({});
    const [profileAnswers, setProfileAnswers] = useState<Answers>({});
    const [finalScores, setFinalScores] = useState<IFinalRecommendation | null>(null);
    const [timeLeft, setTimeLeft] = useState<number>(TOTAL_TIME_SECONDS);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    // --- TIMER LOGIC ---
    const calculateAndSubmitScores = useCallback(async (timeExpired: boolean = false) => {
        setIsLoading(true);
        setStep(2); // Move to loading screen

        // 1. Calculate Aptitude Score components (Numerical, Verbal, Abstract)
        const aptBreakdown: { [key: string]: number } = {};
        const correctCounts: { [key: string]: number } = {};
        const totalCounts: { [key: string]: number } = {};

        APTITUDE_QUESTIONS.forEach((q: IAptitudeQuestion) => {
            totalCounts[q.section] = (totalCounts[q.section] || 0) + 1;
            if (aptitudeAnswers[q.id] !== undefined && aptitudeAnswers[q.id] === q.answerIndex) {
                correctCounts[q.section] = (correctCounts[q.section] || 0) + 1;
            }
        });
        
        Object.keys(correctCounts).forEach((section: string) => {
            const count = totalCounts[section] || 1;
            aptBreakdown[section] = Math.round(((correctCounts[section] || 0) / count) * 100);
        });

        // 2. Calculate RIASEC/OCEAN Scores
        const factorSums: { [key: string]: number } = {};
        const factorCounts: { [key: string]: number } = {};

        PROFILE_QUESTIONS.forEach((q: IProfileQuestion) => {
            const rawScore = profileAnswers[q.id]; // 1 to 5
            if (rawScore === undefined) return;

            const finalScore = q.isReversed ? 6 - rawScore : rawScore;
            
            factorSums[q.type] = (factorSums[q.type] || 0) + finalScore;
            factorCounts[q.type] = (factorCounts[q.type] || 0) + 1;
        });

        const profileBreakdown: { [key: string]: number } = {};
        Object.entries(factorSums).forEach(([type, sum]) => {
            const average = sum / factorCounts[type];
            // Normalized to 0-100 scale: ((Avg - 1) / 4) * 100
            profileBreakdown[type] = parseFloat((((average - 1) / 4) * 100).toFixed(1));
        });

        // --- MOCK AI CLASSIFICATION (Weighted matching simulation) ---
        await new Promise(resolve => setTimeout(resolve, 2500)); 
        
        // Mock stream fit based on sample scoring model
        const scienceFit = (aptBreakdown.Numerical * 0.4 + (profileBreakdown.Investigative || 0) * 0.3) * 1.2;
        const commerceFit = (aptBreakdown.Numerical * 0.3 + (profileBreakdown.Conventional || 0) * 0.4) * 1.2;
        const artsFit = (aptBreakdown.Verbal * 0.45 + (profileBreakdown.Artistic || 0) * 0.4) * 1.2;

        const scores = [
            { name: "Science", score: scienceFit, flex: 90 },
            { name: "Commerce", score: commerceFit, flex: 70 },
            { name: "Arts/Humanities", score: artsFit, flex: 50 },
        ].sort((a, b) => b.score - a.score);

        const mockRecommendation: IFinalRecommendation = {
            name: scores[0].name,
            confidence: Math.min(100, Math.round(scores[0].score)),
            flexibility: scores[0].flex,
            aptitudeBreakdown: aptBreakdown,
            profileBreakdown: profileBreakdown,
            timeExpired: timeExpired
        };
        
        setFinalScores(mockRecommendation);
        setStep(3);
        setIsLoading(false);
    }, [aptitudeAnswers, profileAnswers]);
    
    useEffect(() => {
        // Run timer only during active test steps (Aptitude and Profile)
        if (step === 0 || step === 2 || step === 3) return; 
        
        const timer = setInterval(() => {
            setTimeLeft(prevTime => {
                if (prevTime <= 1) {
                    clearInterval(timer);
                    calculateAndSubmitScores(true); // Auto-submit if time runs out
                    return 0;
                }
                return prevTime - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [step, calculateAndSubmitScores]);
    
    
    // --- HANDLERS ---
    
    const handleAptitudeStart = () => {
        setStep(0.5); // Start the test interface
    };

    const handleAptitudeAnswerSelect = useCallback((qId: string, answerIndex: number) => {
        if (step !== 0.5) return;
        setAptitudeAnswers(prev => ({ ...prev, [qId]: answerIndex }));
    }, [step]);

    const handleAptitudeSubmit = useCallback(() => {
        setCurrentQuestionIndex(TOTAL_QUESTIONS_APTITUDE);
        setStep(1.5); // Move to profile display step
    }, []);

    const handleProfileAnswerSelect = useCallback((qId: string, score: number) => {
        if (step !== 1.5) return;
        setProfileAnswers(prev => ({ ...prev, [qId]: score }));
    }, [step]);

    // --- RENDER FUNCTIONS ---

    const renderHeader = (title: string, stepText: string) => (
        <header className="bg-indigo-600 p-6 rounded-t-xl text-white flex justify-between items-center">
            <div>
                <h1 className="text-3xl font-bold">{title}</h1>
                <p className="mt-1 opacity-80">10th Pass: Stream Selection Profile</p>
            </div>
            <span className="text-xl font-semibold bg-indigo-700 py-2 px-4 rounded-full shadow-md">{stepText}</span>
        </header>
    );

    const renderIntroduction = () => (
        <div className="p-8 text-center">
            <h3 className="text-2xl font-semibold mb-4 text-gray-800">Start Your Comprehensive Profile Assessment</h3>
            <p className="text-gray-600 mb-8">This combined assessment measures all factors for your stream recommendation in **one hour**.</p>
            <div className="grid grid-cols-3 gap-4 mb-10 text-lg font-medium">
                <p className="p-4 bg-indigo-50 rounded-lg shadow-md">Aptitude (24 Qs)</p>
                <p className="p-4 bg-indigo-50 rounded-lg shadow-md">Interests (18 Qs)</p>
                <p className="p-4 bg-indigo-50 rounded-lg shadow-md">Personality (15 Qs)</p>
            </div>
            <p className="text-lg font-bold text-red-600 mb-4">Total Time Limit: {formatTime(TOTAL_TIME_SECONDS)}</p>
            <button onClick={handleAptitudeStart} className="w-full max-w-md bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg shadow-lg transition duration-200">
                Begin Assessment (69 Questions Total)
            </button>
        </div>
    );

    const renderTestInterface = (isAptitude: boolean) => {
        const questions: (IAptitudeQuestion | IProfileQuestion)[] = isAptitude ? APTITUDE_QUESTIONS : PROFILE_QUESTIONS;
        const answers = isAptitude ? aptitudeAnswers : profileAnswers;
        const handleSelect = isAptitude ? handleAptitudeAnswerSelect : handleProfileAnswerSelect;
        
        // Handle question index transition
        const qIndexInCurrentSet = isAptitude ? currentQuestionIndex : currentQuestionIndex - TOTAL_QUESTIONS_APTITUDE;
        const q = questions[qIndexInCurrentSet];

        if (!q) return null; 
        
        const qId = q.id;

        const isFinalInSet = qIndexInCurrentSet === questions.length - 1;
        const questionNumber = currentQuestionIndex + 1;

        // UI elements specific to question type
        const typeLabel = (q as IAptitudeQuestion).section ? `Aptitude - ${(q as IAptitudeQuestion).section}` : `${(q as IProfileQuestion).factor} - ${(q as IProfileQuestion).type}`;
        const scaleTitle = isAptitude ? 'Select the correct option' : SCALES[(q as IProfileQuestion).scale].title;
        
        const nextAction = isAptitude 
            ? (isFinalInSet ? handleAptitudeSubmit : () => setCurrentQuestionIndex(prev => prev + 1)) 
            : (isFinalInSet ? calculateAndSubmitScores : () => setCurrentQuestionIndex(prev => prev + 1));
        
        const isNextDisabled = (answers[qId] === undefined && !isFinalInSet) || timeLeft <= 0;

        return (
            <div className="p-8 relative">
                <div className="flex justify-between items-center mb-6 pb-4 border-b">
                    <span className="text-xs font-semibold uppercase px-3 py-1 rounded-full bg-yellow-100 text-yellow-700">
                        {typeLabel}
                    </span>
                    <div className={`text-lg font-bold p-2 rounded-md ${timeLeft < 300 ? 'text-red-600 animate-pulse' : 'text-indigo-600'}`}>
                        Time Remaining: {formatTime(timeLeft)}
                    </div>
                </div>
                
                <h4 className="text-xl font-bold mb-4 text-gray-800">
                    Question {questionNumber}/{TOTAL_QUESTIONS}: {q.text}
                </h4>
                
                {/* Answer Options / Scale */}
                {isAptitude ? (
                    <div className="space-y-3">
                        {APTITUDE_OPTIONS[qId].map((option, index) => (
                            <button
                                key={index}
                                onClick={() => handleSelect(qId, index)}
                                disabled={timeLeft <= 0}
                                className={`w-full text-left p-3 rounded-lg border-2 transition duration-150 ${
                                    answers[qId] === index ? 'bg-indigo-100 border-indigo-600 font-semibold' : 'bg-white border-gray-200 hover:bg-gray-100'
                                }`}
                            >
                                <span className="font-bold mr-2">{String.fromCharCode(65 + index)}.</span> {option}
                            </button>
                        ))}
                    </div>
                ) : (
                    <>
                        <p className="text-sm text-gray-600 mb-3">{scaleTitle}:</p>
                        <div className="flex justify-between items-center space-x-2 p-4 bg-gray-50 rounded-lg shadow-inner">
                            {SCALES[(q as IProfileQuestion).scale].labels.map((label, index) => {
                                const scoreValue = index + 1;
                                const isSelected = answers[qId] === scoreValue;
                                return (
                                    <div key={scoreValue} className="flex flex-col items-center flex-1">
                                        <button
                                            onClick={() => handleSelect(qId, scoreValue)}
                                            disabled={timeLeft <= 0}
                                            className={`w-12 h-12 rounded-full text-lg font-bold transition duration-200 shadow-md flex items-center justify-center ${
                                                isSelected ? 'bg-purple-600 text-white transform scale-110' : 'bg-white text-gray-700 border-2 border-gray-300 hover:bg-purple-50'
                                            }`}
                                            title={label}
                                        >
                                            {scoreValue}
                                        </button>
                                        <p className="text-xs mt-2 text-center text-gray-500 max-w-[80%]">{label}</p>
                                    </div>
                                );
                            })}
                        </div>
                    </>
                )}

                {/* Navigation and Submission Buttons */}
                <div className="mt-8 flex justify-between">
                    <button onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))} 
                        disabled={currentQuestionIndex === 0 || timeLeft <= 0}
                        className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 transition">
                        &larr; Previous
                    </button>
                    <button
                        onClick={() => {
                            // If nextAction is async, call it without passing event
                            nextAction();
                        }}
                        disabled={isNextDisabled || timeLeft <= 0}
                        className={`px-6 py-3 font-semibold rounded-lg transition duration-200 ${
                            isNextDisabled ? 'bg-indigo-300' : (isFinalInSet && !isAptitude) ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-indigo-500 hover:bg-indigo-600 text-white'
                        }`}>
                        {isFinalInSet ? 'Final Submission' : 'Next Question →'}
                    </button>
                </div>
            </div>
        );
    };

    const renderLoading = () => (
        <div className="text-center p-12">
            <svg className="animate-spin h-10 w-10 text-indigo-500 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="mt-4 text-lg font-semibold text-gray-700">Running Stream Classification AI...</p>
            <p className="text-sm text-gray-500">Combining 57 data points for your final recommendation.</p>
        </div>
    );
    
    const renderResults = () => {
        if (!finalScores) return null;
        
        const { name, confidence, flexibility, aptitudeBreakdown, profileBreakdown, timeExpired } = finalScores;

        return (
            <div className="p-8 text-center">
                {timeExpired && (
                    <div className="mb-4 p-3 bg-red-100 text-red-700 font-semibold rounded-lg">
                        ⚠️ Time Expired! Results calculated based on completed answers.
                    </div>
                )}
                
                <h3 className="text-3xl font-extrabold text-indigo-700 mb-4">Your Recommended Stream: {name.toUpperCase()}</h3>

                <div className="bg-indigo-50 border-4 border-indigo-600 rounded-2xl p-6 mb-8 shadow-lg">
                    <p className="text-2xl font-black text-indigo-800">{name}</p>
                    <p className="text-lg text-gray-600 mt-2">Confidence Score: <span className="font-bold text-green-600">{confidence}%</span></p>
                    <p className="text-lg text-gray-600">Flexibility Score: {flexibility}%</p>
                </div>
                
                <h4 className="text-2xl font-bold text-gray-800 mb-4 border-b pb-2">Profile Snapshot (0-100)</h4>
                
                <div className="grid grid-cols-2 gap-4 text-left">
                    {/* Aptitude Snapshot */}
                    <div className="p-4 bg-gray-100 rounded-lg shadow-md">
                        <p className="font-bold text-indigo-700 mb-2">Aptitude (Readiness)</p>
                        {Object.entries(aptitudeBreakdown).map(([key, value]) => (
                            <p key={key} className="text-sm">{key}: <span className="font-semibold">{value}%</span></p>
                        ))}
                    </div>
                    {/* Personality Snapshot */}
                    <div className="p-4 bg-gray-100 rounded-lg shadow-md">
                         <p className="font-bold text-indigo-700 mb-2">Key Profile Traits</p>
                        {Object.entries(profileBreakdown).filter(([key]) => ['Conscientiousness', 'Investigative', 'Openness'].includes(key)).map(([key, value]) => (
                            <p key={key} className="text-sm">{key}: <span className="font-semibold">{value}%</span></p>
                        ))}
                    </div>
                </div>
            </div>
        );
    };


    // --- Main Component Switch ---
    
    let content;
    const currentStepText = `Step ${Math.ceil(step) + 1} of 4`;
    const isAptitudeTest = currentQuestionIndex < TOTAL_QUESTIONS_APTITUDE;

    if (step === 0) {
        content = renderIntroduction();
    } else if (isAptitudeTest) {
        content = renderTestInterface(true); // Aptitude Test
    } else if (currentQuestionIndex < TOTAL_QUESTIONS) {
        content = renderTestInterface(false); // Profile Test
    } else if (step === 2) {
        content = renderLoading();
    } else if (step === 3) {
        content = renderResults();
    } else {
        content = <div className="p-8 text-red-500">Assessment Error.</div>;
    }

    return (
        <div className="max-w-4xl mx-auto my-8 bg-white rounded-xl shadow-2xl">
            {renderHeader("10th Pass Stream Classification", currentStepText)}
            {content}
        </div>
    );
};

export default AssessmentPage;