import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Book, Clock, BookOpen, Plus, Loader2, Wand2, ChevronRight, Hash, Trash2, X, AlertTriangle } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';

const Dashboard = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/courses/my-courses');
        setCourses(response.data);
      } catch (error) {
        console.error('Error fetching courses:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState(null);
  const [deleteInput, setDeleteInput] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const openDeleteModal = (course, e) => {
    e.stopPropagation();
    setCourseToDelete(course);
    setDeleteInput('');
    setDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!courseToDelete) return;
    setIsDeleting(true);
    try {
      await axios.delete(`http://localhost:5000/api/courses/${courseToDelete._id}`);
      setCourses(courses.filter(c => c._id !== courseToDelete._id));
      setDeleteModalOpen(false);
      setCourseToDelete(null);
    } catch (error) {
      console.error('Error deleting course:', error);
      alert('Failed to delete course');
    } finally {
      setIsDeleting(false);
    }
  };

  const deleteConfirmationString = courseToDelete && user ? `${courseToDelete.title}-${user.name}` : '';
  const isDeleteEnabled = deleteInput === deleteConfirmationString;

  const handleTopCourseClick = (topic) => {
    navigate('/generate', { state: { presetTopic: topic } });
  };

  const topCourses = [
    "Learn C++",
    "Learn Python",
    "Learn Javascript",
    "Learn Java",
    "Learn HTML CSS JAVASCRIPT",
    "Learn Front End",
    "Learn Backend",
    "Learn Full Stack Development",
    "Learn AI ML Full Course"
  ];

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <Loader2 className="w-12 h-12 animate-spin text-white mb-4" />
      <p className="text-slate-400 font-bold tracking-widest uppercase text-sm">Loading Workspace</p>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto">
      {/* Professional Marquee */}
      <div className="marquee-container rounded-xl mb-12 shadow-lg">
        <div className="marquee-content gap-12 font-bold text-sm tracking-widest text-slate-400 uppercase">
          <span>Master any technology</span>
          <span>•</span>
          <span>Become an expert in whatever you wish to learn</span>
          <span>•</span>
          <span>Level up your skills</span>
          <span>•</span>
          <span>AI-powered curriculum</span>
          <span>•</span>
          <span>Master any technology</span>
          <span>•</span>
          <span>Become an expert in whatever you wish to learn</span>
          <span>•</span>
          <span>Level up your skills</span>
          <span>•</span>
          <span>AI-powered curriculum</span>
        </div>
      </div>

      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-16 gap-6">
        <div>
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">Welcome back, {user?.name?.split(' ')[0]}</h1>
          <p className="text-slate-400 mt-3 text-lg font-medium">Ready to continue your expert journey?</p>
        </div>
        <button 
          onClick={() => navigate('/generate')}
          className="flex items-center gap-2 bg-white hover:bg-slate-200 text-black px-6 py-4 rounded-xl font-bold transition-all transform active:scale-95 border border-transparent"
        >
          <Plus className="w-5 h-5" /> Create New Course
        </button>
      </div>

      {/* Badges Section */}
      {user?.badges?.length > 0 && (
        <div className="mb-16">
          <h2 className="text-xl font-bold text-white mb-6 uppercase tracking-wider flex items-center gap-2">
            <Wand2 className="w-5 h-5" /> Your Badges
          </h2>
          <div className="flex flex-wrap gap-4">
            {user.badges.map((badge, idx) => (
              <div key={idx} className="bg-[#111] border border-slate-700 px-6 py-3 rounded-xl shadow-lg flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-white"></div>
                <span className="font-bold text-white">{badge.name || badge}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Active Courses */}
      <div className="mb-20">
        <h2 className="text-xl font-bold text-white mb-8 uppercase tracking-wider flex items-center gap-2">
          <BookOpen className="w-5 h-5" /> Your Active Courses
        </h2>
        {courses.length === 0 ? (
          <div className="bg-[#111] border border-slate-800 rounded-3xl p-12 text-center">
            <Book className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-white mb-2">No Courses Yet</h3>
            <p className="text-slate-400 mb-6">You haven't generated any AI courses.</p>
            <button 
              onClick={() => navigate('/generate')}
              className="inline-flex items-center gap-2 bg-white text-black px-6 py-3 rounded-lg font-bold hover:bg-slate-200 transition-colors"
            >
              <Plus className="w-4 h-4" /> Generate First Course
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => {
              let total = 0, completed = 0;
              course.modules?.forEach(m => m.chapters?.forEach(c => {
                total++;
                if (c.isCompleted) completed++;
              }));
              const progress = total === 0 ? 0 : Math.round((completed / total) * 100);

              return (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ y: -5 }}
                  key={course._id} 
                  className="bg-[#111] rounded-2xl border border-slate-800 p-6 flex flex-col hover:border-slate-500 transition-all cursor-pointer group shadow-xl"
                  onClick={() => navigate(`/course/${course._id}`)}
                >
                    <div className="flex justify-between items-start mb-6 relative">
                      <div className="p-3 bg-slate-800 rounded-lg group-hover:bg-slate-700 transition-colors border border-slate-700">
                        <BookOpen className="w-6 h-6 text-slate-300" />
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={(e) => openDeleteModal(course, e)}
                          className="p-1.5 text-slate-500 hover:text-red-500 hover:bg-red-500/10 rounded-md transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 bg-[#0A0A0A] px-3 py-1.5 rounded-full border border-slate-800">
                          <Clock className="w-3.5 h-3.5" />
                          {new Date(course.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  
                  <h3 className="text-2xl font-black text-white mb-6 line-clamp-2 leading-tight">
                    {course.title}
                  </h3>
                  
                  <div className="mt-auto">
                    <div className="flex justify-between text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">
                      <span>Progress</span>
                      <span className="text-white">{progress}%</span>
                    </div>
                    <div className="w-full bg-[#0A0A0A] rounded-full h-1.5 border border-slate-800 overflow-hidden mb-6">
                      <div className="bg-white h-full rounded-full transition-all duration-1000" style={{ width: `${progress}%` }}></div>
                    </div>
                    
                    <div className="flex items-center justify-between text-white font-bold text-sm group-hover:pl-2 transition-all">
                      CONTINUE LEARNING <ChevronRight className="w-4 h-4 opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Recommended Top Courses Section */}
      <div>
        <h2 className="text-xl font-bold text-white mb-8 uppercase tracking-wider flex items-center gap-2">
          <Hash className="w-5 h-5" /> Recommended Top Courses
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {topCourses.map((topic, index) => (
            <motion.div
              whileHover={{ scale: 1.02 }}
              key={index}
              onClick={() => handleTopCourseClick(topic)}
              className="bg-[#111] border border-slate-800 hover:border-white p-5 rounded-xl cursor-pointer transition-colors flex items-center justify-between group"
            >
              <span className="font-bold text-slate-300 group-hover:text-white transition-colors">{topic}</span>
              <div className="bg-slate-800 p-2 rounded-md group-hover:bg-white group-hover:text-black transition-colors">
                <ChevronRight className="w-4 h-4" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Delete Course Modal */}
      <AnimatePresence>
        {deleteModalOpen && courseToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-[#111] border border-red-900/30 rounded-2xl p-8 max-w-md w-full shadow-2xl relative overflow-hidden"
            >
              <button 
                onClick={() => setDeleteModalOpen(false)}
                className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="flex justify-center mb-6">
                <div className="bg-red-500/10 p-4 rounded-full border border-red-500/20">
                  <AlertTriangle className="w-8 h-8 text-red-500" />
                </div>
              </div>
              
              <h3 className="text-xl font-bold text-white text-center mb-2">Delete Course?</h3>
              <p className="text-slate-400 text-center mb-6 text-sm">
                This action cannot be undone. This will permanently delete the <strong>{courseToDelete.title}</strong> course and revoke any associated badges.
              </p>

              <div className="bg-[#0A0A0A] p-4 rounded-xl border border-slate-800 mb-6">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  To confirm, type: <span className="text-red-400 select-all">{deleteConfirmationString}</span>
                </label>
                <input 
                  type="text" 
                  value={deleteInput}
                  onChange={(e) => setDeleteInput(e.target.value)}
                  className="w-full bg-[#111] border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-red-500 transition-colors"
                  placeholder={deleteConfirmationString}
                />
              </div>
              
              <div className="flex gap-3">
                <button 
                  onClick={() => setDeleteModalOpen(false)}
                  className="flex-1 px-4 py-3 rounded-lg font-bold text-white bg-slate-800 hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleDelete}
                  disabled={!isDeleteEnabled || isDeleting}
                  className="flex-1 px-4 py-3 rounded-lg font-bold text-white bg-red-600 hover:bg-red-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(220,38,38,0.2)]"
                >
                  {isDeleting ? 'Deleting...' : 'Delete Course'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Dashboard;
