const mongoose = require('mongoose');

const CourseSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  topic: { type: String, required: true },
  isCourseCompleted: { type: Boolean, default: false },
  badgeEarned: { type: String, default: null },
  finalQuiz: {
    generated: { type: Boolean, default: false },
    questions: [{
      questionText: String,
      options: [String],
      correctAnswerIndex: Number
    }]
  },
  createdAt: { type: Date, default: Date.now },
  
  modules: [{
    moduleName: { type: String, required: true },
    chapters: [{
      chapterName: { type: String, required: true },
      content: { type: String, default: "" }, // Stores the generated Markdown text
      isCompleted: { type: Boolean, default: false },
      quiz: {
        generated: { type: Boolean, default: false },
        questions: [{
          questionText: String,
          options: [String],
          correctAnswerIndex: Number,
          userSelectedAnswer: { type: Number, default: null }
        }]
      }
    }]
  }]
});

module.exports = mongoose.model('Course', CourseSchema);
