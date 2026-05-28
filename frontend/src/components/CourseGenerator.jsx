import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Loader2, Sparkles, BookOpen, Clock, Target, ArrowRight } from 'lucide-react';

const CourseGenerator = () => {
  const location = useLocation();
  const [topic, setTopic] = useState(location.state?.presetTopic || '');
  const [description, setDescription] = useState('');
  const [difficulty, setDifficulty] = useState('Beginner');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (location.state?.presetTopic) {
      setTopic(location.state.presetTopic);
    }
  }, [location.state]);

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!topic.trim()) return;
    setLoading(true);

    try {
      const response = await axios.post('http://localhost:5000/api/courses/syllabus', {
        topic,
        description,
        difficulty
      });
      navigate(`/course/${response.data._id}/edit`);
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.error || 'Failed to generate course');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-10">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#111] p-8 md:p-12 rounded-3xl border border-slate-800 shadow-2xl relative overflow-hidden"
      >
        <div className="text-center mb-10">
          <div className="inline-flex justify-center items-center w-16 h-16 bg-white rounded-2xl mb-6 shadow-lg">
            <Sparkles className="w-8 h-8 text-black" />
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">Design Your Course</h2>
          <p className="text-slate-400 font-medium text-lg max-w-xl mx-auto">
            Specify your topic and let our AI architect a comprehensive, professional curriculum tailored for you.
          </p>
        </div>

        <form onSubmit={handleGenerate} className="space-y-8 relative z-10">
          <div>
            <label className="flex items-center gap-2 text-sm font-bold text-white uppercase tracking-wider mb-3">
              <BookOpen className="w-4 h-4 text-slate-400" /> Core Topic
            </label>
            <input 
              type="text" 
              value={topic} 
              onChange={(e) => setTopic(e.target.value)} 
              className="w-full p-5 bg-[#0A0A0A] border border-slate-700 rounded-2xl text-white text-lg focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-all font-semibold"
              placeholder="e.g. Advanced System Design, Introduction to Rust"
              required 
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-bold text-white uppercase tracking-wider mb-3">
              <Target className="w-4 h-4 text-slate-400" /> Specific Goals or Context (Optional)
            </label>
            <textarea 
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
              className="w-full p-5 bg-[#0A0A0A] border border-slate-700 rounded-2xl text-white focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-all min-h-[120px] resize-y"
              placeholder="e.g. Focus on microservices architecture, deploying to AWS, and designing for scale."
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-bold text-white uppercase tracking-wider mb-3">
              <Clock className="w-4 h-4 text-slate-400" /> Target Audience Level
            </label>
            <div className="grid grid-cols-3 gap-4">
              {['Beginner', 'Intermediate', 'Advanced'].map(level => (
                <button
                  type="button"
                  key={level}
                  onClick={() => setDifficulty(level)}
                  className={`py-4 rounded-xl font-bold transition-all border-2 ${
                    difficulty === level 
                    ? 'bg-white text-black border-white' 
                    : 'bg-[#0A0A0A] text-slate-400 border-slate-800 hover:border-slate-600 hover:text-white'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-6">
            <button 
              type="submit" 
              disabled={loading || !topic.trim()}
              className="w-full bg-white hover:bg-slate-200 text-black font-black py-5 rounded-2xl flex justify-center items-center gap-3 transition-all transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_30px_rgba(255,255,255,0.1)] text-lg"
            >
              {loading ? (
                <><Loader2 className="w-6 h-6 animate-spin" /> Architecting Syllabus...</>
              ) : (
                <>Generate Curriculum <ArrowRight className="w-6 h-6" /></>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default CourseGenerator;
