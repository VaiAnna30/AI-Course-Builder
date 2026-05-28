const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Course = require('../models/Course');
const { GoogleGenAI, Type } = require('@google/genai');
const auth = require('../middleware/auth');

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const FALLBACK_MODELS = ['gemini-2.5-flash', 'gemini-2.5-flash-lite', 'gemini-2.5-pro', 'gemini-3.5-flash', 'gemini-flash-latest'];

const generateContentWithRetry = async (aiConfig, maxRetries = 3) => {
  let lastError;
  for (const model of FALLBACK_MODELS) {
    aiConfig.model = model;
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await ai.models.generateContent(aiConfig);
      } catch (error) {
        lastError = error;
        // If 429 (Quota) or 404 (Not Found), immediately break retry loop and try the next fallback model
        if (error.status === 429 || error.status === 404 || (error.message && error.message.includes('429'))) {
          console.log(`[Gemini] Model ${model} failed with ${error.status || 429}. Falling back to next model...`);
          break; 
        }
        // If 503 (High Demand), retry the same model
        if (error.message && error.message.includes('503') && i < maxRetries - 1) {
          console.log(`[Gemini] 503 High Demand on ${model}. Retrying attempt ${i + 1}/${maxRetries}...`);
          await new Promise(res => setTimeout(res, 1000 * Math.pow(2, i)));
        } else {
          break; // Unknown error, try next model
        }
      }
    }
  }
  throw lastError;
};

// GET /api/courses/my-courses (Get all courses for logged-in user)
router.get('/my-courses', auth, async (req, res) => {
  try {
    const courses = await Course.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(courses);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch courses' });
  }
});

// POST /api/courses/syllabus
router.post('/syllabus', auth, async (req, res) => {
  try {
    const { topic } = req.body;
    if (!topic) {
      return res.status(400).json({ error: 'Topic is required' });
    }

    const prompt = `Create a detailed course syllabus for the topic: "${topic}". Structure it into modules and chapters.`;

    const response = await generateContentWithRetry({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            modules: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  moduleName: { type: Type.STRING },
                  chapters: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        chapterName: { type: Type.STRING }
                      }
                    }
                  }
                },
                required: ["moduleName", "chapters"]
              }
            }
          },
          required: ["modules"]
        }
      }
    });

    const cleanText = response.text.replace(/```json/gi, '').replace(/```/g, '').trim();
    const syllabusData = JSON.parse(cleanText);

    const course = new Course({
      userId: req.user.id,
      title: `${topic} Course`,
      topic,
      modules: syllabusData.modules
    });

    await course.save();
    res.json(course);
  } catch (error) {
    console.error('Error generating syllabus:', error);
    const errorMessage = error.message || error.toString() || 'Failed to generate syllabus';
    res.status(500).json({ error: errorMessage });
  }
});

// GET /api/courses/:id
router.get('/:id', auth, async (req, res) => {
  try {
    const course = await Course.findOne({ _id: req.params.id, userId: req.user.id });
    if (!course) return res.status(404).json({ error: 'Course not found' });
    res.json(course);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching course' });
  }
});

// PUT /api/courses/:id/syllabus (For interactive editor)
router.put('/:id/syllabus', auth, async (req, res) => {
  try {
    const { modules, title } = req.body;
    const course = await Course.findOne({ _id: req.params.id, userId: req.user.id });
    if (!course) return res.status(404).json({ error: 'Course not found' });

    course.modules = modules;
    if (title) course.title = title;
    await course.save();

    res.json(course);
  } catch (error) {
    res.status(500).json({ error: 'Error updating course' });
  }
});

// GET /api/courses/:id/chapter/:chapterId/stream
router.get('/:id/chapter/:chapterId/stream', async (req, res) => {
  // Note: Since SSE doesn't easily send Auth headers without workarounds, 
  // we will parse the token from a query parameter for this endpoint.
  const token = req.query.token;
  if (!token) return res.status(401).json({ error: 'No token provided' });

  let userId;
  try {
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    userId = decoded.user.id;
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }

  try {
    const course = await Course.findOne({ _id: req.params.id, userId });
    if (!course) return res.status(404).json({ error: 'Course not found' });

    let targetChapter = null;
    let targetModule = null;
    for (const mod of course.modules) {
      const ch = mod.chapters.id(req.params.chapterId);
      if (ch) {
        targetChapter = ch;
        targetModule = mod;
        break;
      }
    }

    if (!targetChapter) return res.status(404).json({ error: 'Chapter not found' });

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    if (targetChapter.content && targetChapter.content.length > 0) {
       res.write(`data: ${JSON.stringify({ text: targetChapter.content, done: true })}\n\n`);
       return res.end();
    }

    const prompt = `You are generating content for a course on "${course.topic}".
Module: ${targetModule.moduleName}
Chapter: ${targetChapter.chapterName}

Instructions:
1. Write a very short, concise summary for this chapter (max 2-3 paragraphs).
2. Format the text beautifully in Markdown.
3. At the end, under a "## Recommended Videos" heading, provide 2-3 YouTube search links for this specific topic using this format:
- [Watch: Topic Name](https://www.youtube.com/results?search_query=topic+name)

Do NOT write a long, exhaustive tutorial. Keep it brief.`;

    let responseStream;
    for (const model of FALLBACK_MODELS) {
      try {
        responseStream = await ai.models.generateContentStream({
          model: model,
          contents: prompt,
        });
        break; // Successfully started stream
      } catch (err) {
        console.log(`[Gemini Stream] Model ${model} failed. Falling back...`);
        if (model === FALLBACK_MODELS[FALLBACK_MODELS.length - 1]) throw err;
      }
    }

    let fullText = "";

    for await (const chunk of responseStream) {
      if (chunk.text) {
        fullText += chunk.text;
        res.write(`data: ${JSON.stringify({ text: chunk.text })}\n\n`);
      }
    }

    targetChapter.content = fullText;
    await course.save();

    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
  } catch (error) {
    console.error('Error streaming chapter:', error);
    res.write(`data: ${JSON.stringify({ error: 'Error generating content' })}\n\n`);
    res.end();
  }
});

// PUT /api/courses/:id/chapter/:chapterId/complete
router.put('/:id/chapter/:chapterId/complete', auth, async (req, res) => {
  try {
    const course = await Course.findOne({ _id: req.params.id, userId: req.user.id });
    if (!course) return res.status(404).json({ error: 'Course not found' });

    let targetChapter = null;
    for (const mod of course.modules) {
      const ch = mod.chapters.id(req.params.chapterId);
      if (ch) { targetChapter = ch; break; }
    }
    if (!targetChapter) return res.status(404).json({ error: 'Chapter not found' });

    targetChapter.isCompleted = true;
    await course.save();
    res.json(course);
  } catch (error) {
    res.status(500).json({ error: 'Error completing chapter' });
  }
});

// POST /api/courses/:id/chapter/:chapterId/quiz
router.post('/:id/chapter/:chapterId/quiz', auth, async (req, res) => {
  try {
    const course = await Course.findOne({ _id: req.params.id, userId: req.user.id });
    if (!course) return res.status(404).json({ error: 'Course not found' });

    let targetChapter = null;
    for (const mod of course.modules) {
      const ch = mod.chapters.id(req.params.chapterId);
      if (ch) { targetChapter = ch; break; }
    }
    if (!targetChapter) return res.status(404).json({ error: 'Chapter not found' });

    if (targetChapter.quiz && targetChapter.quiz.generated) {
      return res.json(targetChapter.quiz);
    }

    const prompt = `Based on the following chapter text, generate a 3-question multiple choice quiz.
Chapter Text:
${targetChapter.content.substring(0, 3000)}

Generate exactly 3 questions. Each question must have 4 options and 1 correctAnswerIndex (0-3).`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            questions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  questionText: { type: Type.STRING },
                  options: { type: Type.ARRAY, items: { type: Type.STRING } },
                  correctAnswerIndex: { type: Type.INTEGER }
                },
                required: ["questionText", "options", "correctAnswerIndex"]
              }
            }
          },
          required: ["questions"]
        }
      }
    });

    const cleanText = response.text.replace(/```json/gi, '').replace(/```/g, '').trim();
    const quizData = JSON.parse(cleanText);
    targetChapter.quiz = { generated: true, questions: quizData.questions };
    await course.save();

    res.json(targetChapter.quiz);
  } catch (error) {
    console.error('Error generating quiz:', error);
    res.status(500).json({ error: error.message || 'Error generating quiz' });
  }
});

// POST /api/courses/:id/final-quiz
router.post('/:id/final-quiz', auth, async (req, res) => {
  try {
    const course = await Course.findOne({ _id: req.params.id, userId: req.user.id });
    if (!course) return res.status(404).json({ error: 'Course not found' });

    if (course.finalQuiz && course.finalQuiz.generated) {
      return res.json(course.finalQuiz);
    }

    const prompt = `Generate a final 10-question multiple choice exam for a course titled "${course.title}" about "${course.topic}". Make it comprehensive. Each question must have 4 options and 1 correctAnswerIndex (0-3).`;

    const response = await generateContentWithRetry({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            questions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  questionText: { type: Type.STRING },
                  options: { type: Type.ARRAY, items: { type: Type.STRING } },
                  correctAnswerIndex: { type: Type.INTEGER }
                },
                required: ["questionText", "options", "correctAnswerIndex"]
              }
            }
          },
          required: ["questions"]
        }
      }
    });

    const cleanText = response.text.replace(/```json/gi, '').replace(/```/g, '').trim();
    const quizData = JSON.parse(cleanText);
    course.finalQuiz = { generated: true, questions: quizData.questions };
    await course.save();

    res.json(course.finalQuiz);
  } catch (error) {
    console.error('Error generating final quiz:', error);
    res.status(500).json({ error: error.message || 'Error generating final quiz' });
  }
});

// POST /api/courses/:id/award-badge
router.post('/:id/award-badge', auth, async (req, res) => {
  try {
    const course = await Course.findOne({ _id: req.params.id, userId: req.user.id });
    if (!course) return res.status(404).json({ error: 'Course not found' });

    if (course.badgeEarned) {
      return res.json({ badge: course.badgeEarned });
    }

    const User = require('../models/User');
    const user = await User.findById(req.user.id);
    
    const badgeName = `${course.topic} Expert`;
    course.isCourseCompleted = true;
    course.badgeEarned = badgeName;
    await course.save();

    user.badges.push({ name: badgeName, topic: course.topic });
    await user.save();

    res.json({ badge: badgeName, userBadges: user.badges });
  } catch (error) {
    res.status(500).json({ error: 'Error awarding badge' });
  }
});

// POST /api/courses/:id/chapter/:chapterId/doubt
router.post('/:id/chapter/:chapterId/doubt', auth, async (req, res) => {
  try {
    const { question } = req.body;
    if (!question) return res.status(400).json({ error: 'Question is required' });

    const course = await Course.findOne({ _id: req.params.id, userId: req.user.id });
    if (!course) return res.status(404).json({ error: 'Course not found' });

    let targetChapter = null;
    let targetModule = null;
    for (const mod of course.modules) {
      const ch = mod.chapters.id(req.params.chapterId);
      if (ch) { targetChapter = ch; targetModule = mod; break; }
    }
    if (!targetChapter) return res.status(404).json({ error: 'Chapter not found' });

    const prompt = `You are an expert, professional tutor for a course titled "${course.title}".
The student is currently reading the chapter: "${targetChapter.chapterName}" within the module "${targetModule.moduleName}".

Here is the exact content of the chapter they are reading:
---
${targetChapter.content}
---

The student has asked the following doubt:
"${question}"

Instructions:
1. If the student's doubt is directly related to the chapter content, course topic, or programming/subject matter in general, provide a clear, concise, and professional explanation to help them understand.
2. If the student's doubt is entirely irrelevant, inappropriate, or attempting to chat about unrelated topics, politely refuse to answer and remind them to stay on topic.
3. Keep your response brief and to the point. Format using Markdown if necessary.`;

    const response = await generateContentWithRetry({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    res.json({ answer: response.text });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to resolve doubt' });
  }
});

// DELETE /api/courses/:id
router.delete('/:id', auth, async (req, res) => {
  try {
    const course = await Course.findOne({ _id: req.params.id, userId: req.user.id });
    if (!course) return res.status(404).json({ error: 'Course not found' });

    if (course.badgeEarned) {
      const User = require('../models/User');
      const user = await User.findById(req.user.id);
      if (user) {
        user.badges = user.badges.filter(b => b.name !== course.badgeEarned);
        await user.save();
      }
    }

    await Course.deleteOne({ _id: req.params.id });
    res.json({ success: true, message: 'Course and associated badges deleted' });
  } catch (error) {
    console.error('Error deleting course:', error);
    res.status(500).json({ error: 'Failed to delete course' });
  }
});

module.exports = router;
