import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, ChevronRight, Trophy, BookOpen } from 'lucide-react';
import confetti from 'canvas-confetti';

const QuizPlayer = ({ quiz, onComplete }) => {
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswerChecked, setIsAnswerChecked] = useState(false);
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);

  const currentQuestion = quiz.questions[currentQuestionIdx];

  const handleSelectOption = (idx) => {
    if (isAnswerChecked) return;
    setSelectedOption(idx);
  };

  const handleCheckAnswer = () => {
    if (selectedOption === null) return;
    setIsAnswerChecked(true);
    if (selectedOption === currentQuestion.correctAnswerIndex) {
      setScore(score + 1);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIdx < quiz.questions.length - 1) {
      setCurrentQuestionIdx(currentQuestionIdx + 1);
      setSelectedOption(null);
      setIsAnswerChecked(false);
    } else {
      setQuizFinished(true);
      if (score + (selectedOption === currentQuestion.correctAnswerIndex ? 1 : 0) === quiz.questions.length) {
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#ffffff', '#cccccc', '#999999', '#666666']
        });
      }
    }
  };

  if (quizFinished) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-[#111] border border-slate-800 p-8 rounded-3xl text-center shadow-2xl"
      >
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-white rounded-2xl shadow-lg border border-slate-200">
            <Trophy className="w-12 h-12 text-black" />
          </div>
        </div>
        <h3 className="text-3xl font-black text-white mb-2">Quiz Completed!</h3>
        <p className="text-slate-400 text-lg mb-8 font-medium">
          You scored <span className="text-white font-bold">{score}</span> out of <span className="text-white">{quiz.questions.length}</span>
        </p>
        <button 
          onClick={onComplete}
          className="bg-white hover:bg-slate-200 text-black font-bold py-3 px-8 rounded-xl transition-colors shadow-lg"
        >
          Continue
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#111] border border-slate-800 p-6 md:p-8 rounded-3xl shadow-2xl"
    >
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-2 text-white font-bold uppercase tracking-wider text-sm">
          <BookOpen className="w-5 h-5" /> Knowledge Check
        </div>
        <div className="text-slate-400 font-bold uppercase text-xs tracking-wider">
          Question {currentQuestionIdx + 1} of {quiz.questions.length}
        </div>
      </div>

      <h3 className="text-2xl font-bold text-white mb-8 leading-relaxed">
        {currentQuestion.questionText}
      </h3>

      <div className="space-y-4 mb-8">
        {currentQuestion.options.map((option, idx) => {
          let stateClass = "bg-[#0A0A0A] border-slate-800 text-slate-300 hover:border-slate-500 hover:bg-[#111]";
          let icon = null;

          if (isAnswerChecked) {
            if (idx === currentQuestion.correctAnswerIndex) {
              stateClass = "bg-white border-white text-black";
              icon = <CheckCircle2 className="w-5 h-5 text-black" />;
            } else if (idx === selectedOption) {
              stateClass = "bg-[#0A0A0A] border-slate-700 text-slate-500";
              icon = <XCircle className="w-5 h-5 text-slate-500" />;
            } else {
              stateClass = "bg-[#0A0A0A] border-slate-900 text-slate-600 opacity-50";
            }
          } else if (selectedOption === idx) {
            stateClass = "bg-white border-white text-black";
          }

          return (
            <button
              key={idx}
              onClick={() => handleSelectOption(idx)}
              disabled={isAnswerChecked}
              className={`w-full text-left p-5 rounded-2xl border-2 transition-all flex justify-between items-center ${stateClass}`}
            >
              <span className="font-medium text-lg">{option}</span>
              {icon}
            </button>
          );
        })}
      </div>

      <div className="flex justify-end">
        {!isAnswerChecked ? (
          <button 
            onClick={handleCheckAnswer}
            disabled={selectedOption === null}
            className="bg-white text-black font-black py-3 px-8 rounded-xl disabled:opacity-50 transition-all hover:bg-slate-200 active:scale-95"
          >
            Check Answer
          </button>
        ) : (
          <button 
            onClick={handleNextQuestion}
            className="flex items-center gap-2 bg-[#111] border border-slate-700 hover:bg-slate-800 text-white font-bold py-3 px-8 rounded-xl transition-all active:scale-95"
          >
            {currentQuestionIdx < quiz.questions.length - 1 ? 'Next Question' : 'Finish Quiz'}
            <ChevronRight className="w-5 h-5" />
          </button>
        )}
      </div>
    </motion.div>
  );
};

export default QuizPlayer;
