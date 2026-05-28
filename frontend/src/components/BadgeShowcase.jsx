import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Award, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';

const BadgeShowcase = ({ badgeName }) => {
  const navigate = useNavigate();

  useEffect(() => {
    const duration = 3000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#ffffff', '#cccccc', '#999999', '#666666']
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#ffffff', '#cccccc', '#999999', '#666666']
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  }, []);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0A0A0A]/95 backdrop-blur-sm p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.8, y: 50 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="max-w-md w-full bg-[#111] border border-slate-800 p-10 rounded-3xl text-center shadow-2xl relative overflow-hidden"
      >
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1, rotate: 360 }}
          transition={{ type: "spring", damping: 15, delay: 0.2 }}
          className="w-32 h-32 mx-auto bg-white rounded-full flex items-center justify-center shadow-lg mb-8 relative z-10 border-4 border-slate-200"
        >
          <Award className="w-16 h-16 text-black" />
        </motion.div>

        <h2 className="text-4xl font-black text-white mb-2 relative z-10">Course Completed!</h2>
        <p className="text-slate-400 mb-6 font-medium relative z-10">You have earned a new expert badge.</p>
        
        <div className="bg-[#0A0A0A] rounded-xl p-4 mb-10 relative z-10 border border-slate-800">
          <p className="text-2xl font-black text-white">
            {badgeName}
          </p>
        </div>

        <button 
          onClick={() => navigate('/dashboard')}
          className="w-full flex items-center justify-center gap-2 bg-white text-black font-black py-4 rounded-xl hover:bg-slate-200 transition-colors relative z-10"
        >
          Go to Dashboard <ArrowRight className="w-5 h-5" />
        </button>
      </motion.div>
    </div>
  );
};

export default BadgeShowcase;
