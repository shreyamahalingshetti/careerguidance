"use client";

import { useState, Suspense, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import YouTube from "react-youtube";
import { Video, RoadmapNode, fullStackRoadmapData, frontendRoadmapData, backendRoadmapData, devopsRoadmapData, dataEngineerRoadmapData, machineLearningRoadmapData, aiEngineerRoadmapData, cybersecurityRoadmapData, pathwayCertifications } from "./data";

type QuizQuestion = {
  question: string;
  options: string[];
  correctAnswer: string;
  topic?: string;
};

type Quiz = {
  questions: QuizQuestion[];
};

type RecommendedVideo = {
  title: string;
  videoId: string;
};

function RoadmapContent() {
  const searchParams = useSearchParams();
  const pathway = searchParams?.get("pathway");

  let roadmapData = fullStackRoadmapData;
  let title = "Full Stack Developer Learning Journey";

  if (pathway === "frontend") {
    roadmapData = frontendRoadmapData;
    title = "Frontend Developer Learning Journey";
  } else if (pathway === "devops") {
    roadmapData = devopsRoadmapData;
    title = "DevOps Learning Journey";
  } else if (pathway === "backend") {
    roadmapData = backendRoadmapData;
    title = "Backend Developer Learning Journey";
  } else if (pathway === "data-engineer") {
    roadmapData = dataEngineerRoadmapData;
    title = "Data Engineer Learning Journey";
  } else if (pathway === "machine-learning") {
    roadmapData = machineLearningRoadmapData;
    title = "Machine Learning Learning Journey";
  } else if (pathway === "ai-engineer") {
    roadmapData = aiEngineerRoadmapData;
    title = "AI Engineer Learning Journey";
  } else if (pathway === "cybersecurity") {
    roadmapData = cybersecurityRoadmapData;
    title = "Cybersecurity Expert Learning Journey";
  }

  let domainSelectionUrl = "/dashboard/technical-group";
  const swPathways = ["frontend", "backend", "devops", "full-stack"];
  const dataPathways = ["data-engineer", "machine-learning", "ai-engineer"];
  
  if (swPathways.includes(pathway || "full-stack")) {
    domainSelectionUrl = "/dashboard/technical-group/software-pathways";
  } else if (dataPathways.includes(pathway || "")) {
    domainSelectionUrl = "/dashboard/technical-group/data-pathways";
  }

  const [activeTab, setActiveTab] = useState<'interactive' | 'certifications'>('interactive');
  const [selectedNode, setSelectedNode] = useState<RoadmapNode | null>(null);
  const [videos, setVideos] = useState<RecommendedVideo[]>([]);
  const [videosError, setVideosError] = useState<string | null>(null);
  const [loadingVideos, setLoadingVideos] = useState(false);
  const [nextPageToken, setNextPageToken] = useState<string | null>(null);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [loadingQuiz, setLoadingQuiz] = useState(false);
  const [quizError, setQuizError] = useState<string | null>(null);
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [showResults, setShowResults] = useState(false);
  const [activeVideoToWatch, setActiveVideoToWatch] = useState<RecommendedVideo | null>(null);
  type NodeProgress = {
    nodeId: string;
    score: number;
    total: number;
    passed: boolean;
  };
  const [progressList, setProgressList] = useState<NodeProgress[]>([]);
  const [mlPrediction, setMlPrediction] = useState<{ label: string; confidence: number } | null>(null);
  const [mlLoading, setMlLoading] = useState(false);

  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    let loaded = false;
    const saved = sessionStorage.getItem(`roadmapState-${pathway || "full-stack"}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.nodeId) {
          const node = roadmapData.find(n => n.id === parsed.nodeId);
          if (node) {
            setSelectedNode(node);
            setQuiz(parsed.quiz || null);
            setShowResults(parsed.showResults || false);
            setUserAnswers(parsed.userAnswers || {});
            setMlPrediction(parsed.mlPrediction || null);
            setSelectedVideo(parsed.selectedVideo || null);
            setActiveVideoToWatch(parsed.activeVideoToWatch || null);
            loaded = true;
          }
        }
      } catch (e) {}
    }

    if (!loaded) {
      setSelectedNode(null);
      setVideos([]);
      setNextPageToken(null);
      setQuiz(null);
      setSelectedVideo(null);
      setShowResults(false);
      setUserAnswers({});
      setActiveVideoToWatch(null);
    }

    const fetchProgress = async () => {
      try {
        const res = await fetch(`/api/roadmap/progress?pathway=${pathway || "full-stack"}`);
        if (res.ok) {
          const data = await res.json();
          setProgressList(data.progress || []);
        }
      } catch (e) {
        console.error("Failed to load progress:", e);
      }
    };
    if (session?.user) {
      fetchProgress();
    }
  }, [pathway, session, roadmapData]);

  useEffect(() => {
    if (selectedNode) {
      sessionStorage.setItem(`roadmapState-${pathway || "full-stack"}`, JSON.stringify({
        nodeId: selectedNode.id,
        quiz,
        showResults,
        userAnswers,
        mlPrediction,
        selectedVideo,
        activeVideoToWatch
      }));
    }
  }, [selectedNode, quiz, showResults, userAnswers, mlPrediction, selectedVideo, activeVideoToWatch, pathway]);

  const fetchVideos = async (
    topic: string,
    options?: {
      append?: boolean;
      pageToken?: string | null;
      refresh?: boolean;
    },
  ) => {
    setLoadingVideos(true);
    setVideosError(null);

    try {
      const params = new URLSearchParams({
        topic,
        limit: "8",
      });

      if (options?.pageToken) {
        params.set("pageToken", options.pageToken);
      }

      if (options?.refresh) {
        params.set("seed", Date.now().toString());
      }

      const res = await fetch(`/api/videos?${params.toString()}`, {
        cache: "no-store",
      });

      if (!res.ok) {
        throw new Error("Failed to load videos");
      }

      const data = await res.json();
      const incoming: RecommendedVideo[] = Array.isArray(data?.videos)
        ? data.videos
        : [];

      setVideos((prev) => {
        const base = options?.append ? prev : [];
        const merged = [...base, ...incoming];
        return merged.filter(
          (video, index) =>
            merged.findIndex((item) => item.videoId === video.videoId) ===
            index,
        );
      });

      setNextPageToken(
        typeof data?.nextPageToken === "string" ? data.nextPageToken : null,
      );
    } catch (err) {
      console.error(err);
      setVideosError("Could not fetch recommendations. Try refresh.");
      if (!options?.append) {
        setVideos([]);
        setNextPageToken(null);
      }
    } finally {
      setLoadingVideos(false);
    }
  };

  const handleSelectNode = (node: RoadmapNode) => {
    setSelectedNode(node);
    setQuiz(null);
    setQuizError(null);
    setSelectedVideo(null);
    setShowResults(false);
    setUserAnswers({});
    setVideos([]);
    setNextPageToken(null);
    setActiveVideoToWatch(null);
    fetchVideos(node.title, { refresh: true });
  };

  const handleGenerateQuiz = async (video: Video) => {
    setLoadingQuiz(true);
    setQuizError(null);
    setUserAnswers({});
    setShowResults(false);
    setSelectedVideo(video);

    try {
      const response = await fetch("/api/generate-quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videoUrl: video.url, topic: selectedNode?.title }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to generate quiz");
      }

      const quizData: Quiz = await response.json();
      setQuiz(quizData);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unknown error occurred";
      setQuizError(message);
      setQuiz(null);
    } finally {
      setLoadingQuiz(false);
    }
  };

  const handleAnswerSelect = (questionIndex: number, answer: string) => {
    setUserAnswers((prev) => ({
      ...prev,
      [questionIndex]: answer,
    }));
  };

  const getWeakTopics = () => {
    if (!quiz) return [];
    const topicCount: Record<string, number> = {};

    quiz.questions.forEach((q, idx) => {
      const userAnswer = userAnswers[idx];
      const isWrong = !userAnswer || userAnswer.charAt(0) !== q.correctAnswer;
      if (isWrong && q.topic) {
        topicCount[q.topic] = (topicCount[q.topic] || 0) + 1;
      }
    });

    return Object.keys(topicCount).filter(topic => topicCount[topic] >= 2);
  };

  const calculateScore = () => {
    if (!quiz) return 0;
    let correct = 0;
    quiz.questions.forEach((q, idx) => {
      if (
        userAnswers[idx] &&
        userAnswers[idx].charAt(0) === q.correctAnswer
      ) {
        correct++;
      }
    });
    return correct;
  };

  const weakTopics = showResults ? getWeakTopics() : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-10">
      <h1 className="text-4xl font-bold text-center mb-6">
        {title}
      </h1>

      <div className="flex justify-center gap-4 mb-14">
        <Link 
          href="/dashboard"
          className="text-sm font-semibold text-[#1e6188] bg-white px-6 py-2 rounded-full shadow-sm border border-gray-200 hover:bg-gray-50 transition flex items-center gap-2"
        >
          ← Return to Dashboard
        </Link>
        <Link 
          href={domainSelectionUrl}
          className="text-sm font-semibold text-[#1e6188] bg-white px-6 py-2 rounded-full shadow-sm border border-gray-200 hover:bg-gray-50 transition flex items-center gap-2"
        >
          ← Back to Domain Selection
        </Link>
      </div>

      {/* TAB NAVIGATION */}
      <div className="flex justify-center mb-10">
        <div className="bg-white p-1 rounded-full border border-gray-200 shadow-sm inline-flex">
          <button
            onClick={() => setActiveTab('interactive')}
            className={`px-6 py-2.5 rounded-full text-sm font-bold transition duration-200 ${
              activeTab === 'interactive'
                ? 'bg-[#1e6188] text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-50 hover:text-[#1e6188]'
            }`}
          >
            🎥 Interactive Learning
          </button>
          <button
            onClick={() => setActiveTab('certifications')}
            className={`px-6 py-2.5 rounded-full text-sm font-bold transition duration-200 ${
              activeTab === 'certifications'
                ? 'bg-[#1e6188] text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-50 hover:text-[#1e6188]'
            }`}
          >
            🎓 Industry Certifications & Programs
          </button>
        </div>
      </div>

      {activeTab === 'interactive' ? (
        <div className="flex gap-14 max-w-7xl mx-auto">
        {/* LEFT – JOURNEY */}
        <div className="relative w-1/4">          {roadmapData.map((node, index) => {
            const isActive = selectedNode?.id === node.id;
            const nodeProg = progressList.find(p => p.nodeId === node.id);
            const isCompleted = !!nodeProg; // Any attempt turns it blue
            const scoreDisplay = nodeProg ? `${nodeProg.score}/${nodeProg.total}` : '';

            return (
              <div key={node.id} className="relative flex items-start mb-14">
                {/* DYNAMIC LINE SEGMENT TO NEXT NODE */}
                {index < roadmapData.length - 1 && (
                  <div
                    className={`absolute left-6 top-12 w-[2px] h-[3.5rem] -ml-[1px] transition-colors duration-500 z-0 ${
                      isCompleted ? "bg-blue-500" : "bg-gray-300"
                    }`}
                  />
                )}

                {/* DOT */}
                <div
                  onClick={() => handleSelectNode(node)}
                  className={`w-12 h-12 rounded-full flex items-center justify-center cursor-pointer font-bold z-10 transition
                    ${
                      isActive
                        ? "bg-blue-600 text-white shadow-lg scale-105"
                        : isCompleted
                        ? "bg-blue-500 text-white shadow border-2 border-blue-500"
                        : "bg-white border-2 border-gray-300 text-gray-600 hover:border-blue-400"
                    }
                  `}
                >
                  {isCompleted && !isActive ? "✓" : index + 1}
                </div>

                {/* LABEL */}
                <div className="ml-5">
                  <p
                    className={`text-lg font-semibold ${
                      isActive ? "text-blue-600" : isCompleted ? "text-blue-600" : "text-gray-700"
                    }`}
                  >
                    {node.title}
                  </p>
                  <p className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                    Step {index + 1}
                    {nodeProg && (
                      <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${nodeProg.passed ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        Best: {scoreDisplay}
                      </span>
                    )}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* RIGHT – CONTENT */}
        <div className="flex-1 bg-white rounded-2xl shadow-xl p-8 max-h-[85vh] overflow-y-auto">
          {!selectedNode ? (
            <p className="text-gray-600 text-center mt-20">
              Select a topic from the left to get started 👈
            </p>
          ) : quiz && selectedVideo ? (
            // QUIZ VIEW
            <div>
              <h2 className="text-3xl font-bold mb-2">
                {selectedVideo.title} – Quiz
              </h2>
              <p className="text-gray-600 mb-6">
                Test your understanding with AI-generated questions
              </p>

              {quizError ? (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 mb-4">
                  <p className="font-semibold">Error:</p>
                  <p className="text-sm">{quizError}</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {quiz.questions.map((q, idx) => (
                    <div key={idx} className="border rounded-lg p-4 bg-gray-50">
                      <h3 className="font-semibold mb-4 text-gray-800">
                        {idx + 1}. {q.question}
                        {q.topic && <span className="ml-2 text-xs font-normal text-blue-600 bg-blue-100 px-2 py-1 rounded">Topic: {q.topic}</span>}
                      </h3>
                      <div className="space-y-3">
                        {q.options.map((option, optIdx) => (
                          <label
                            key={optIdx}
                            className="flex items-start p-3 border rounded-lg cursor-pointer hover:bg-white transition"
                          >
                            <input
                              type="radio"
                              name={`question-${idx}`}
                              value={option}
                              checked={userAnswers[idx] === option}
                              onChange={() =>
                                handleAnswerSelect(idx, option)
                              }
                              className="mr-3 mt-1"
                              disabled={showResults}
                            />
                            <span className="text-gray-700">{option}</span>
                            {showResults && (
                              <span className="ml-auto font-semibold">
                                {option.charAt(0) === q.correctAnswer ? (
                                  <span className="text-green-600">✓ Correct</span>
                                ) : userAnswers[idx] === option ? (
                                  <span className="text-red-600">✗ Wrong</span>
                                ) : null}
                              </span>
                            )}
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}

                  {!showResults && (
                    <button
                      onClick={async () => {
                        setShowResults(true);
                        const _score = calculateScore();
                        const _weakTopics = getWeakTopics();
                        const total = quiz.questions.length;
                        const passed = _score >= Math.ceil(total * 0.7);

                        // Save progress to database
                        if (session?.user && selectedNode) {
                          try {
                            const res = await fetch("/api/roadmap/progress", {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({
                                pathway: pathway || "full-stack",
                                nodeId: selectedNode.id,
                                score: _score,
                                total: total,
                                passed: passed
                              })
                            });
                            if (res.ok) {
                              const data = await res.json();
                              // Update local state if the score was updated (or it's new)
                              setProgressList(prev => {
                                const newProgress = data.progress;
                                const index = prev.findIndex(p => p.nodeId === newProgress.nodeId);
                                if (index >= 0) {
                                  const updated = [...prev];
                                  updated[index] = newProgress;
                                  return updated;
                                }
                                return [...prev, newProgress];
                              });
                            }
                          } catch (e) {
                            console.error("Failed to save progress", e);
                          }
                        }

                        // Trigger email automatically
                        if (session?.user?.email) {
                          fetch("/api/send-email", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                              email: session.user.email,
                              name: session.user.name || "Student",
                              type: "test_report",
                              score: _score,
                              total: total,
                              weakTopics: _weakTopics
                            })
                          }).catch(err => console.error("Email API Error:", err));
                        }

                        // ML Skill-Gap Prediction
                        setMlLoading(true);
                        try {
                          const nodeProg = progressList.find(p => p.nodeId === selectedNode?.id);
                          const retryCount = nodeProg ? 1 : 0; // first attempt = 0 retries
                          const firstAttemptScore = nodeProg ? nodeProg.score : _score;
                          const accuracy = total > 0 ? parseFloat((_score / total).toFixed(2)) : 0;
                          // Approximate time: use a reasonable placeholder (seconds)
                          const timeTaken = Math.max(30, Math.round(total * 12 - _score * 5));

                          const mlRes = await fetch("/api/predict", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                              score: _score,
                              accuracy,
                              retry_count: retryCount,
                              time_taken: timeTaken,
                              first_attempt_score: firstAttemptScore
                            })
                          });
                          if (mlRes.ok) {
                            const mlData = await mlRes.json();
                            setMlPrediction(mlData);

                            // Save to database for admin CSV export
                            fetch("/api/skill-gap-records", {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({
                                pathway: pathway || "full-stack",
                                nodeId: selectedNode?.id,
                                score: _score,
                                accuracy,
                                retry_count: retryCount,
                                time_taken: timeTaken,
                                first_attempt_score: firstAttemptScore,
                                mlLabel: mlData.label,
                                mlConfidence: mlData.confidence,
                              })
                            }).catch(err => console.error("Skill gap record save error:", err));
                          }
                        } catch (e) {
                          console.error("ML prediction failed:", e);
                        } finally {
                          setMlLoading(false);
                        }
                      }}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition mt-6"
                    >
                      Submit Quiz
                    </button>
                  )}

                  {showResults && (
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6 mt-6">
                      <h3 className="font-bold text-2xl text-gray-800 mb-2">
                        Score: {calculateScore()} / {quiz.questions.length}
                      </h3>
                      <p className="text-gray-700 mb-4">
                        {calculateScore() === quiz.questions.length
                          ? "🎉 Perfect! Excellent understanding!"
                          : calculateScore() >=
                            Math.ceil(quiz.questions.length * 0.7)
                          ? "👍 Good job! You understand the basics."
                          : "📚 Keep studying and try again!"}
                      </p>

                      {/* ML Skill-Level Prediction Card */}
                      {mlLoading && (
                        <div className="mb-6 p-4 bg-indigo-50 border border-indigo-200 rounded-lg text-indigo-700 flex items-center gap-3">
                          <svg className="animate-spin h-5 w-5 text-indigo-600" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                          Analyzing your performance with ML model...
                        </div>
                      )}
                      {mlPrediction && !mlLoading && (
                        <div className={`mb-6 p-5 rounded-xl border-2 shadow-sm ${
                          mlPrediction.label === 'Strong'   ? 'bg-emerald-50 border-emerald-300' :
                          mlPrediction.label === 'Moderate' ? 'bg-blue-50 border-blue-300' :
                          mlPrediction.label === 'Weak'     ? 'bg-amber-50 border-amber-300' :
                                                              'bg-red-50 border-red-300'
                        }`}>
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-bold text-lg flex items-center gap-2">
                              🤖 ML Skill-Level Prediction
                            </h4>
                            <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                              mlPrediction.label === 'Strong'   ? 'bg-emerald-200 text-emerald-800' :
                              mlPrediction.label === 'Moderate' ? 'bg-blue-200 text-blue-800' :
                              mlPrediction.label === 'Weak'     ? 'bg-amber-200 text-amber-800' :
                                                                  'bg-red-200 text-red-800'
                            }`}>
                              {mlPrediction.label.toUpperCase()}
                            </span>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="flex-1">
                              <div className="w-full bg-gray-200 rounded-full h-3">
                                <div
                                  className={`h-3 rounded-full transition-all duration-700 ${
                                    mlPrediction.label === 'Strong'   ? 'bg-emerald-500' :
                                    mlPrediction.label === 'Moderate' ? 'bg-blue-500' :
                                    mlPrediction.label === 'Weak'     ? 'bg-amber-500' :
                                                                        'bg-red-500'
                                  }`}
                                  style={{ width: `${mlPrediction.confidence}%` }}
                                />
                              </div>
                            </div>
                            <span className="text-sm font-bold text-gray-700">{mlPrediction.confidence}%</span>
                          </div>
                          <p className="text-sm text-gray-600 mt-2">
                            {mlPrediction.label === 'Strong'   ? 'Excellent grasp — you\'re ready to move forward!' :
                             mlPrediction.label === 'Moderate' ? 'Decent understanding — a quick review will solidify it.' :
                             mlPrediction.label === 'Weak'     ? 'Needs improvement — focus on the weak topics below.' :
                                                                 'Critical gaps found — revisit the fundamentals before continuing.'}
                          </p>
                        </div>
                      )}

                      {weakTopics.length > 0 && (
                        <div className="mt-4 mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800">
                          <h4 className="font-bold mb-2">⚠️ Skill Gaps Detected</h4>
                          <p className="text-sm mb-2">You struggled with the following subtopics. We recommend reviewing them:</p>
                          <ul className="list-disc list-inside bg-yellow-100 p-2 rounded text-sm font-semibold">
                            {weakTopics.map(topic => (
                              <li key={topic}>{topic}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* ── Resource Recommendation Cards (added safely) ── */}
                      {weakTopics.length > 0 && (
                        <div className="mt-2 mb-6">
                          <h4 className="font-bold text-lg text-blue-800 mb-3">📚 Recommended Learning Resources</h4>
                          <p className="text-sm text-gray-600 mb-4">Click on any link below to learn and improve your weak areas:</p>
                          
                          {weakTopics.map(topic => {
                            // Generate Google search URLs scoped to trusted educational sites
                            const sites = [
                              { name: 'GeeksForGeeks', domain: 'geeksforgeeks.org', icon: '📗', color: 'bg-green-50 border-green-200 hover:bg-green-100' },
                              { name: 'Programiz', domain: 'programiz.com', icon: '📘', color: 'bg-blue-50 border-blue-200 hover:bg-blue-100' },
                              { name: 'TutorialsPoint', domain: 'tutorialspoint.com', icon: '📙', color: 'bg-orange-50 border-orange-200 hover:bg-orange-100' },
                              { name: 'W3Schools', domain: 'w3schools.com', icon: '📕', color: 'bg-red-50 border-red-200 hover:bg-red-100' },
                              { name: 'Google Search', domain: '', icon: '🔍', color: 'bg-purple-50 border-purple-200 hover:bg-purple-100' },
                            ];

                            return (
                              <div key={topic} className="mb-5 bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                                <h5 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                                  <span className="bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded text-xs font-bold">WEAK</span>
                                  {topic}
                                </h5>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                  {sites.map(site => {
                                    const url = site.domain
                                      ? `https://www.google.com/search?q=${encodeURIComponent(topic + ' tutorial site:' + site.domain)}`
                                      : `https://www.google.com/search?q=${encodeURIComponent(topic + ' tutorial learn')}`;
                                    return (
                                      <a
                                        key={site.name}
                                        href={url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={`flex items-center gap-2 p-3 rounded-lg border text-sm font-medium transition-all duration-200 ${site.color}`}
                                      >
                                        <span className="text-lg">{site.icon}</span>
                                        <span className="text-gray-700">{topic} — {site.name}</span>
                                        <span className="ml-auto text-blue-500 text-xs">→</span>
                                      </a>
                                    );
                                  })}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      <div className="flex flex-col sm:flex-row gap-4 mt-6">
                        {roadmapData.findIndex(n => n.id === selectedNode.id) < roadmapData.length - 1 && (
                          <button
                            onClick={() => {
                              const nextIdx = roadmapData.findIndex(n => n.id === selectedNode.id) + 1;
                              handleSelectNode(roadmapData[nextIdx]);
                            }}
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition text-center"
                          >
                            Next Topic: {roadmapData[roadmapData.findIndex(n => n.id === selectedNode.id) + 1].title} →
                          </button>
                        )}
                        <button
                          onClick={() => router.push(domainSelectionUrl)}
                          className="flex-1 bg-gray-800 hover:bg-gray-900 text-white font-semibold py-3 px-4 rounded-lg transition text-center"
                        >
                          Explore Pathways
                        </button>
                        <button
                          onClick={() => {
                            const currentIdx = roadmapData.findIndex(n => n.id === selectedNode.id) + 1;
                            router.push(`/jobs?pathway=${pathway || 'full-stack'}&progress=${currentIdx}&total=${roadmapData.length}`);
                          }}
                          className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold py-3 px-4 rounded-lg transition text-center"
                        >
                          🎯 View Job Recommendations
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            // VIDEOS VIEW
            <>
              <h2 className="text-3xl font-bold mb-2">
                {selectedNode.title}
              </h2>
              <p className="text-gray-600 mb-8">
                {selectedNode.description}
              </p>

              <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
                <p className="text-sm text-gray-600">
                  {loadingVideos && videos.length === 0
                    ? "Loading recommendations..."
                    : `${videos.length} recommendations loaded`}
                </p>
                <button
                  onClick={() => fetchVideos(selectedNode.title, { refresh: true })}
                  disabled={loadingVideos}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white text-sm font-semibold py-2 px-4 rounded-lg transition"
                >
                  {loadingVideos ? "Refreshing..." : "Refresh Recommendations"}
                </button>
              </div>

              {videosError && (
                <p className="text-sm text-red-600 mb-4">{videosError}</p>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {videos.map((video, idx) => {
                  const embedUrl = `https://www.youtube.com/embed/${video.videoId}`;
                  const isLocked = activeVideoToWatch && activeVideoToWatch.videoId !== video.videoId;
                  const isActive = activeVideoToWatch && activeVideoToWatch.videoId === video.videoId;

                  return (
                  <div
                    key={idx}
                    className={`rounded-xl border bg-gray-50 p-4 transition flex flex-col ${
                      isLocked ? "opacity-50 pointer-events-none" : "hover:shadow-md"
                    }`}
                  >
                    <p className="font-semibold mb-3 text-gray-800">
                      {video.title}
                    </p>
                    {!isActive ? (
                      <iframe
                        src={embedUrl}
                        className="w-full h-48 rounded-lg mb-4 flex-1"
                        allowFullScreen
                      />
                    ) : (
                      <YouTube
                        videoId={video.videoId}
                        opts={{ height: '100%', width: '100%', playerVars: { autoplay: 1 } }}
                        onEnd={() => handleGenerateQuiz({ title: video.title, url: embedUrl })}
                        className="w-full h-48 rounded-lg mb-4 flex-1"
                        iframeClassName="w-full h-full rounded-lg"
                      />
                    )}
                    {!activeVideoToWatch ? (
                      <button
                        onClick={() => setActiveVideoToWatch(video)}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg text-sm transition"
                      >
                        📺 Select & Watch
                      </button>
                    ) : isActive && loadingQuiz && selectedVideo?.url === embedUrl ? (
                      <div className="w-full bg-gray-200 text-gray-600 font-semibold py-2 px-4 rounded-lg text-sm text-center">
                        ⏳ Generating Quiz...
                      </div>
                    ) : isActive ? (
                      <div className="w-full bg-green-100 text-green-700 font-semibold py-2 px-4 rounded-lg text-sm text-center">
                        ▶️ Playing... Quiz will auto-generate when video finishes
                      </div>
                    ) : null}
                  </div>
                  );
                })}
              </div>

              {videos.length === 0 && !loadingVideos && !videosError && (
                <p className="text-gray-500 mt-6 text-sm">
                  No videos available for this topic yet.
                </p>
              )}

              {nextPageToken && (
                <button
                  onClick={() =>
                    fetchVideos(selectedNode.title, {
                      append: true,
                      pageToken: nextPageToken,
                    })
                  }
                  disabled={loadingVideos}
                  className="w-full mt-6 bg-gray-900 hover:bg-black disabled:bg-gray-400 text-white font-semibold py-3 px-4 rounded-lg transition"
                >
                  {loadingVideos ? "Loading more..." : "Load More Videos"}
                </button>
              )}
            </>
          )}
        </div>
      </div>
      ) : (
        <div className="max-w-7xl mx-auto pb-12">
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-gray-100">
            <h2 className="text-3xl font-bold text-gray-800 mb-3">Professional Industry Certifications</h2>
            <p className="text-gray-600 mb-8 text-lg">Take your career to the next level with these fully guided, professional certification programs from top tech companies. These programs are perfect to complete alongside or after your interactive learning roadmap.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(pathwayCertifications[pathway || 'full-stack'] || pathwayCertifications['full-stack']).map((cert, idx) => (
                <a 
                  key={idx}
                  href={cert.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex flex-col bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-2xl transition-all duration-300 hover:border-[#1e6188] transform hover:-translate-y-2 relative"
                >
                  {/* Badges */}
                  <div className="absolute top-4 right-4 flex gap-2 z-10">
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider ${cert.price === 'Free' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                      {cert.price}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider bg-purple-100 text-purple-700">
                      {cert.type}
                    </span>
                  </div>

                  <div className="p-6 flex-1 flex flex-col pt-12">
                    <div className="flex items-start gap-4 mb-4">
                      {cert.image && (
                        <div className="w-14 h-14 flex-shrink-0 bg-white rounded-xl p-2 border shadow-sm flex items-center justify-center">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={cert.image} alt={cert.provider} className="max-w-full max-h-full object-contain" />
                        </div>
                      )}
                      <div>
                        <p className="text-xs font-bold tracking-wider text-[#1e6188] uppercase mb-1">{cert.provider}</p>
                        <h3 className="font-bold text-gray-900 group-hover:text-[#1e6188] transition leading-snug text-lg">{cert.title}</h3>
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-6 flex-1 leading-relaxed">{cert.description}</p>
                    
                    <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500">
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                          {cert.duration}
                        </div>
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500">
                           <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                           {cert.difficulty}
                        </div>
                      </div>
                      <span className="text-sm font-bold text-[#1e6188] group-hover:translate-x-1 transition-transform inline-flex items-center gap-1 bg-[#1e6188]/5 px-3 py-1.5 rounded-lg group-hover:bg-[#1e6188]/10">
                        View Program <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                      </span>
                    </div>
                  </div>
                </a>
              ))}
            </div>
            
            {!(pathwayCertifications[pathway || 'full-stack'] || pathwayCertifications['full-stack'])?.length && (
              <div className="text-center py-10 bg-gray-50 rounded-xl border border-gray-200 mt-6">
                <p className="text-gray-500 font-medium">More certifications coming soon for this pathway!</p>
              </div>
            )}
          </div>

          {/* Explore More section */}
          <div className="bg-gradient-to-br from-[#1e6188] to-[#154663] rounded-2xl shadow-xl p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6">
             <div>
               <h3 className="text-2xl font-bold mb-2">Want to explore more options?</h3>
               <p className="text-blue-100 max-w-xl">
                 While we curated the best programs above, you can always search for specific {pathway ? pathway.replace('-', ' ') : 'full stack'} courses on the world&apos;s top learning platforms.
               </p>
             </div>
             <div className="flex flex-wrap gap-3 shrink-0">
               <a 
                 href={`https://www.coursera.org/search?query=${pathway ? pathway.replace('-', '%20') : 'full%20stack'}`}
                 target="_blank"
                 rel="noopener noreferrer"
                 className="bg-white text-[#1e6188] font-bold py-2.5 px-5 rounded-lg hover:bg-blue-50 transition shadow-sm flex items-center gap-2"
               >
                 Search Coursera
               </a>
               <a 
                 href={`https://www.udemy.com/courses/search/?q=${pathway ? pathway.replace('-', '+') : 'full+stack'}`}
                 target="_blank"
                 rel="noopener noreferrer"
                 className="bg-transparent border border-white/30 text-white font-bold py-2.5 px-5 rounded-lg hover:bg-white/10 transition flex items-center gap-2"
               >
                 Search Udemy
               </a>
             </div>
          </div>

        </div>
      )}
    </div>
  );
}

export default function RoadmapPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-xl font-semibold text-gray-600 animate-pulse">Loading Roadmap...</p>
      </div>
    }>
      <RoadmapContent />
    </Suspense>
  );
}