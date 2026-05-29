import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import { Loader2, BookOpen, ChevronRight, CheckCircle2, PlayCircle, Trophy, MessageSquare, Send } from 'lucide-react';
import QuizPlayer from './QuizPlayer';
import BadgeShowcase from './BadgeShowcase';

const CourseViewer = () => {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [activeChapterId, setActiveChapterId] = useState(null);
  const [contentStream, setContentStream] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Gamification States
  const [showQuiz, setShowQuiz] = useState(false);
  const [currentQuizData, setCurrentQuizData] = useState(null);
  const [isFinalQuiz, setIsFinalQuiz] = useState(false);
  const [earnedBadge, setEarnedBadge] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Ask AI Tutor States
  const [doubtText, setDoubtText] = useState('');
  const [doubts, setDoubts] = useState([]);
  const [askingDoubt, setAskingDoubt] = useState(false);

  const contentRef = useRef(null);
  const doubtScrollRef = useRef(null);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const response = await axios.get(`/api/courses/${id}`);
        setCourse(response.data);
        if (response.data.modules.length > 0 && response.data.modules[0].chapters.length > 0) {
          handleChapterSelect(response.data.modules[0].chapters[0]._id, response.data);
        }
      } catch (error) {
        console.error(error);
        alert('Failed to load course');
      } finally {
        setLoading(false);
      }
    };
    fetchCourse();
  }, [id]);

  useEffect(() => {
    if (contentRef.current && isGenerating) {
      contentRef.current.scrollTop = contentRef.current.scrollHeight;
    }
  }, [contentStream, isGenerating]);

  useEffect(() => {
    if (doubtScrollRef.current) {
      doubtScrollRef.current.scrollTop = doubtScrollRef.current.scrollHeight;
    }
  }, [doubts]);

  const handleChapterSelect = (chapterId, currentCourse = course) => {
    if (isGenerating) return;
    setActiveChapterId(chapterId);
    setShowQuiz(false);
    setCurrentQuizData(null);
    setIsFinalQuiz(false);
    setDoubts([]);
    
    let foundChapter = null;
    currentCourse.modules.forEach(m => {
      const ch = m.chapters.find(c => c._id === chapterId);
      if (ch) foundChapter = ch;
    });

    if (foundChapter && foundChapter.content) {
      setContentStream(foundChapter.content);
    } else {
      generateContent(chapterId);
    }
  };

  const generateContent = (chapterId) => {
    setContentStream('');
    setIsGenerating(true);

    const token = localStorage.getItem('token');
    const eventSource = new EventSource(`/api/courses/${id}/chapter/${chapterId}/stream?token=${token}`);
    let accumulatedContent = '';

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.error) {
        eventSource.close();
        setIsGenerating(false);
        setContentStream('**Error generating content. Please try again.**');
        return;
      }
      if (data.done) {
        eventSource.close();
        setIsGenerating(false);
        axios.get(`/api/courses/${id}`).then(res => setCourse(res.data));
      } else {
        accumulatedContent += data.text;
        setContentStream(accumulatedContent);
      }
    };

    eventSource.onerror = () => {
      eventSource.close();
      setIsGenerating(false);
    };
  };

  const markChapterComplete = async () => {
    setActionLoading(true);
    try {
      await axios.put(`/api/courses/${id}/chapter/${activeChapterId}/complete`);
      const response = await axios.post(`/api/courses/${id}/chapter/${activeChapterId}/quiz`);
      setCurrentQuizData(response.data);
      setShowQuiz(true);
      const courseRes = await axios.get(`/api/courses/${id}`);
      setCourse(courseRes.data);
    } catch (err) {
      console.error(err);
      alert('Failed to mark complete: ' + (err.response?.data?.error || err.message));
    } finally {
      setActionLoading(false);
    }
  };

  const startFinalQuiz = async () => {
    setActionLoading(true);
    try {
      const response = await axios.post(`/api/courses/${id}/final-quiz`);
      setCurrentQuizData(response.data);
      setIsFinalQuiz(true);
      setShowQuiz(true);
    } catch (err) {
      console.error(err);
      alert('Failed to generate final quiz');
    } finally {
      setActionLoading(false);
    }
  };

  const handleQuizComplete = async () => {
    setShowQuiz(false);
    if (isFinalQuiz) {
      setActionLoading(true);
      try {
        const response = await axios.post(`/api/courses/${id}/award-badge`);
        setEarnedBadge(response.data.badge);
      } catch (err) {
        console.error(err);
        alert('Failed to award badge');
      } finally {
        setActionLoading(false);
      }
    }
  };

  const handleAskDoubt = async (e) => {
    e.preventDefault();
    if (!doubtText.trim() || askingDoubt) return;

    const userQuestion = doubtText;
    setDoubtText('');
    setDoubts(prev => [...prev, { role: 'user', text: userQuestion }]);
    setAskingDoubt(true);

    try {
      const response = await axios.post(`/api/courses/${id}/chapter/${activeChapterId}/doubt`, {
        question: userQuestion
      });
      setDoubts(prev => [...prev, { role: 'ai', text: response.data.answer }]);
    } catch (err) {
      console.error(err);
      setDoubts(prev => [...prev, { role: 'ai', text: "Failed to connect to the AI Tutor. Please try again." }]);
    } finally {
      setAskingDoubt(false);
    }
  };

  if (loading || !course) return (
    <div className="flex flex-col items-center justify-center min-h-[70vh]">
      <Loader2 className="w-12 h-12 animate-spin text-white mb-4" />
      <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">Loading Course Workspace...</p>
    </div>
  );

  let totalChapters = 0;
  let completedChapters = 0;
  course.modules.forEach(m => {
    m.chapters.forEach(c => {
      totalChapters++;
      if (c.isCompleted) completedChapters++;
    });
  });
  const allCompleted = totalChapters > 0 && totalChapters === completedChapters;

  let activeChapter = null;
  course.modules.forEach(m => {
    const ch = m.chapters.find(c => c._id === activeChapterId);
    if (ch) activeChapter = ch;
  });

  return (
    <div className="flex flex-col lg:flex-row gap-6 max-w-[90rem] mx-auto h-[85vh]">
      {earnedBadge && <BadgeShowcase badgeName={earnedBadge} />}
      
      {/* Sidebar */}
      <div className="w-full lg:w-[22rem] bg-[#111] border border-slate-800 rounded-3xl p-6 flex flex-col h-full shadow-xl shrink-0">
        <div className="mb-6">
          <h2 className="text-2xl font-black text-white leading-tight mb-4">{course.title}</h2>
          <div className="w-full bg-[#0A0A0A] border border-slate-800 rounded-full h-1.5 mb-2 overflow-hidden">
            <div 
              className="bg-white h-full rounded-full transition-all duration-500" 
              style={{ width: `${(completedChapters/totalChapters)*100}%` }}
            ></div>
          </div>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">{completedChapters} of {totalChapters} chapters completed</p>
        </div>

        <div className="flex-1 overflow-y-auto pr-2 space-y-6 scrollbar-thin">
          {course.modules.map((module, mIdx) => (
            <div key={mIdx}>
              <h3 className="font-bold text-slate-400 mb-3 text-xs uppercase tracking-widest flex items-center gap-2">
                <BookOpen className="w-3.5 h-3.5 text-slate-500" /> {module.moduleName}
              </h3>
              <div className="space-y-1.5">
                {module.chapters.map((chapter, cIdx) => {
                  const isActive = chapter._id === activeChapterId;
                  const isCompleted = chapter.isCompleted;
                  return (
                    <button
                      key={cIdx}
                      onClick={() => handleChapterSelect(chapter._id)}
                      disabled={isGenerating}
                      className={`w-full text-left p-3 rounded-xl transition-all flex items-center justify-between border ${
                        isActive 
                          ? 'bg-white text-black border-white' 
                          : isCompleted
                            ? 'bg-transparent border-transparent text-slate-400 hover:bg-[#0A0A0A]'
                            : 'bg-transparent border-transparent text-slate-500 hover:text-slate-300 hover:bg-[#0A0A0A]'
                      }`}
                    >
                      <span className="font-semibold text-sm truncate pr-2">
                        {cIdx + 1}. {chapter.chapterName}
                      </span>
                      {isCompleted && <CheckCircle2 className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-black' : 'text-slate-400'}`} />}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {allCompleted && (
            <div className="pt-6 border-t border-slate-800 mt-6">
              <button
                onClick={startFinalQuiz}
                disabled={actionLoading}
                className="w-full bg-white text-black hover:bg-slate-200 font-black py-4 rounded-xl shadow-lg transition-all transform active:scale-95 flex items-center justify-center gap-2"
              >
                {actionLoading && isFinalQuiz ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trophy className="w-5 h-5" />}
                Take Final Exam
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 bg-[#111] border border-slate-800 rounded-3xl overflow-hidden flex flex-col shadow-2xl relative min-w-0">
        {showQuiz && currentQuizData ? (
          <div className="flex-1 overflow-y-auto p-6 md:p-12">
            <QuizPlayer quiz={currentQuizData} onComplete={handleQuizComplete} />
          </div>
        ) : (
          <div className="flex-1 flex flex-col h-full overflow-hidden">
            {/* Reading View */}
            <div 
              ref={contentRef}
              className="flex-1 overflow-y-auto p-8 md:p-14 lg:px-20 prose prose-invert max-w-none scroll-smooth"
            >
              {isGenerating ? (
                <>
                  <ReactMarkdown>{contentStream}</ReactMarkdown>
                  <div className="flex items-center gap-3 text-white mt-8 font-bold animate-pulse">
                    <Loader2 className="w-5 h-5 animate-spin" /> Synthesizing chapter content...
                  </div>
                </>
              ) : (
                <ReactMarkdown>{contentStream}</ReactMarkdown>
              )}
            </div>

            {/* AI Tutor Chat & Completion Bar */}
            {!isGenerating && activeChapter && (
              <div className="border-t border-slate-800 bg-[#0A0A0A] flex flex-col">
                {/* AI Tutor Chat */}
                <div className="border-b border-slate-800">
                  {doubts.length > 0 && (
                    <div ref={doubtScrollRef} className="max-h-60 overflow-y-auto p-6 space-y-4">
                      {doubts.map((msg, i) => (
                        <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[80%] p-4 rounded-2xl ${msg.role === 'user' ? 'bg-white text-black rounded-br-none font-medium' : 'bg-[#111] text-slate-200 border border-slate-700 rounded-bl-none'}`}>
                            {msg.role === 'ai' ? <ReactMarkdown className="prose prose-invert prose-sm max-w-none">{msg.text}</ReactMarkdown> : <p className="text-sm">{msg.text}</p>}
                          </div>
                        </div>
                      ))}
                      {askingDoubt && (
                        <div className="flex justify-start">
                          <div className="bg-[#111] border border-slate-700 p-4 rounded-2xl rounded-bl-none text-white flex items-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin" /> Thinking...
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  
                  <form onSubmit={handleAskDoubt} className="p-4 flex gap-3 items-center max-w-4xl mx-auto w-full">
                    <div className="relative flex-1">
                      <MessageSquare className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                      <input 
                        type="text" 
                        value={doubtText}
                        onChange={(e) => setDoubtText(e.target.value)}
                        placeholder="Ask AI Tutor a doubt about this chapter..."
                        className="w-full pl-12 pr-4 py-3.5 bg-[#111] border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-all text-sm font-medium"
                      />
                    </div>
                    <button 
                      type="submit"
                      disabled={!doubtText.trim() || askingDoubt}
                      className="bg-white hover:bg-slate-200 text-black p-3.5 rounded-xl transition-colors disabled:opacity-50"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </form>
                </div>

                {/* Bottom Action Bar */}
                <div className="p-4 px-6 flex justify-between items-center bg-[#0A0A0A]">
                  <div className="text-slate-500 text-sm font-semibold">
                    {activeChapter.isCompleted ? (
                      <span className="flex items-center gap-2 text-white"><CheckCircle2 className="w-5 h-5"/> Chapter Completed</span>
                    ) : (
                      "Ready for the knowledge check?"
                    )}
                  </div>
                  {!activeChapter.isCompleted && (
                    <button
                      onClick={markChapterComplete}
                      disabled={actionLoading}
                      className="bg-white hover:bg-slate-200 text-black font-bold py-3 px-6 rounded-xl flex items-center gap-2 transition-all shadow-lg text-sm"
                    >
                      {actionLoading && !isFinalQuiz ? <Loader2 className="w-4 h-4 animate-spin" /> : <PlayCircle className="w-4 h-4" />}
                      Mark Complete & Take Quiz
                    </button>
                  )}
                  {activeChapter.isCompleted && activeChapter.quiz?.generated && (
                    <button
                      onClick={() => {
                        setCurrentQuizData(activeChapter.quiz);
                        setIsFinalQuiz(false);
                        setShowQuiz(true);
                      }}
                      className="bg-[#111] hover:bg-slate-800 border border-slate-700 text-white font-bold py-3 px-6 rounded-xl flex items-center gap-2 transition-all text-sm"
                    >
                      Retake Quiz <ChevronRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseViewer;
