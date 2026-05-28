const { GoogleGenAI, Type } = require('@google/genai');
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function test() {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-lite',
      contents: "Generate a 3-question multiple choice quiz about C++. Generate exactly 3 questions. Each question must have 4 options and 1 correctAnswerIndex (0-3).",
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
    console.log("Success:", response.text);
    const cleanText = response.text.replace(/```json/gi, '').replace(/```/g, '').trim();
    const quizData = JSON.parse(cleanText);
    console.log("Parsed JSON successfully!", quizData.questions.length);
  } catch (error) {
    console.error("Caught error:", error.message, error.status);
  }
}
test();
