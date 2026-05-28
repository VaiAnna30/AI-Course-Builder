import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Book, Save, FileText, Loader2, Wand2, Trash2, PlusCircle } from 'lucide-react';

const SyllabusEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/courses/${id}`);
        setCourse(response.data);
      } catch (error) {
        console.error(error);
        alert('Failed to load course syllabus');
      } finally {
        setLoading(false);
      }
    };
    fetchCourse();
  }, [id]);

  const handleTitleChange = (e) => {
    setCourse({ ...course, title: e.target.value });
  };

  const handleModuleNameChange = (mIndex, value) => {
    const newModules = [...course.modules];
    newModules[mIndex].moduleName = value;
    setCourse({ ...course, modules: newModules });
  };

  const handleChapterNameChange = (mIndex, cIndex, value) => {
    const newModules = [...course.modules];
    newModules[mIndex].chapters[cIndex].chapterName = value;
    setCourse({ ...course, modules: newModules });
  };

  const handleAddModule = () => {
    setCourse({
      ...course,
      modules: [...course.modules, { moduleName: "New Module", chapters: [{ chapterName: "New Chapter", content: "", isCompleted: false }] }]
    });
  };

  const handleDeleteModule = (mIndex) => {
    const newModules = course.modules.filter((_, idx) => idx !== mIndex);
    setCourse({ ...course, modules: newModules });
  };

  const handleAddChapter = (mIndex) => {
    const newModules = [...course.modules];
    newModules[mIndex].chapters.push({ chapterName: "New Chapter", content: "", isCompleted: false });
    setCourse({ ...course, modules: newModules });
  };

  const handleDeleteChapter = (mIndex, cIndex) => {
    const newModules = [...course.modules];
    newModules[mIndex].chapters = newModules[mIndex].chapters.filter((_, idx) => idx !== cIndex);
    setCourse({ ...course, modules: newModules });
  };

  const handleSave = async () => {
    if (course.modules.length === 0) {
      alert("A course must have at least one module.");
      return;
    }
    setSaving(true);
    try {
      await axios.put(`http://localhost:5000/api/courses/${id}/syllabus`, {
        title: course.title,
        modules: course.modules
      });
      navigate(`/course/${id}`);
    } catch (error) {
      console.error(error);
      alert('Failed to save syllabus changes');
      setSaving(false);
    }
  };

  if (loading || !course) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <Loader2 className="w-12 h-12 animate-spin text-white mb-4" />
      <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">Loading Blueprint</p>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6"
      >
        <div className="flex-1 w-full">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#111] border border-slate-700 text-white font-bold text-xs mb-4 uppercase tracking-wider">
            <Wand2 className="w-4 h-4" /> Syllabus Generated
          </div>
          <input 
            type="text" 
            value={course.title}
            onChange={handleTitleChange}
            className="text-3xl md:text-4xl font-black text-white bg-transparent border-b-2 border-transparent hover:border-slate-700 focus:border-white focus:outline-none w-full transition-colors pb-2"
          />
          <p className="text-slate-400 mt-2 font-medium">Review, add, or remove modules and chapters before finalizing.</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-white hover:bg-slate-200 text-black px-8 py-4 rounded-2xl font-black shadow-lg transition-all transform active:scale-95 disabled:opacity-50 w-full md:w-auto justify-center"
        >
          {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
          Finalize & Start Course
        </button>
      </motion.div>

      <div className="space-y-8">
        {course.modules.map((module, mIndex) => (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: mIndex * 0.1 }}
            key={mIndex} 
            className="bg-[#111] rounded-3xl border border-slate-800 shadow-xl overflow-hidden group/module"
          >
            <div className="bg-[#111] p-6 border-b border-slate-800 flex items-center gap-4">
              <div className="bg-[#0A0A0A] p-3 rounded-xl border border-slate-800">
                <Book className="w-6 h-6 text-white" />
              </div>
              <input 
                type="text"
                value={module.moduleName}
                onChange={(e) => handleModuleNameChange(mIndex, e.target.value)}
                className="text-2xl font-bold text-white bg-transparent border-b-2 border-transparent hover:border-slate-600 focus:border-white focus:outline-none w-full transition-colors"
              />
              <button 
                onClick={() => handleDeleteModule(mIndex)}
                className="p-2 text-slate-500 hover:text-white hover:bg-slate-800 rounded-lg transition-colors opacity-0 group-hover/module:opacity-100"
                title="Delete Module"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 sm:p-6 space-y-3 bg-[#0A0A0A]">
              {module.chapters.map((chapter, cIndex) => (
                <div key={cIndex} className="flex items-center gap-4 bg-[#111] p-4 rounded-2xl border border-slate-800 hover:border-slate-500 transition-colors group/chapter">
                  <div className="text-slate-500 font-black text-sm w-6">
                    {cIndex + 1}.
                  </div>
                  <input 
                    type="text"
                    value={chapter.chapterName}
                    onChange={(e) => handleChapterNameChange(mIndex, cIndex, e.target.value)}
                    className="flex-grow text-slate-200 font-semibold bg-transparent border-b border-transparent group-hover/chapter:border-slate-600 focus:border-white focus:outline-none transition-colors"
                  />
                  <FileText className="w-5 h-5 text-slate-600 group-hover/chapter:hidden" />
                  <button 
                    onClick={() => handleDeleteChapter(mIndex, cIndex)}
                    className="hidden group-hover/chapter:block p-1 text-slate-500 hover:text-white transition-colors"
                    title="Delete Chapter"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
              <button 
                onClick={() => handleAddChapter(mIndex)}
                className="w-full mt-4 flex items-center justify-center gap-2 py-3 border border-dashed border-slate-700 rounded-2xl text-slate-400 hover:text-white hover:border-slate-500 hover:bg-[#111] transition-all font-semibold"
              >
                <PlusCircle className="w-5 h-5" /> Add Chapter
              </button>
            </div>
          </motion.div>
        ))}

        <button 
          onClick={handleAddModule}
          className="w-full flex items-center justify-center gap-2 py-6 border-2 border-dashed border-slate-700 rounded-3xl text-slate-400 hover:text-white hover:border-slate-500 hover:bg-[#111] transition-all font-bold text-lg"
        >
          <PlusCircle className="w-6 h-6" /> Add New Module
        </button>
      </div>
    </div>
  );
};

export default SyllabusEditor;
