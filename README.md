# AI Course Builder

A powerful full-stack application that leverages Google's Gemini AI to dynamically generate structured courses, stream interactive chapters, create quizzes, and provide an AI Tutor.

## Features
- **Dynamic Course Generation**: Instantly architect full syllabuses based on any topic.
- **AI Chapter Streaming**: Generate educational content on the fly.
- **Interactive Quizzes**: Auto-generate quizzes to test your knowledge.
- **AI Tutor**: Ask questions about the current chapter and get precise, contextual answers.
- **Secure Authentication**: JWT-based user authentication.
- **Modern UI**: Built with React, Tailwind CSS, and Framer Motion for a sleek, dark-themed experience.

## Tech Stack
- **Frontend**: React, Vite, Tailwind CSS, Framer Motion
- **Backend**: Node.js, Express, MongoDB
- **AI Integration**: Google GenAI SDK (`gemini-2.5-flash` and advanced models)

## Setup Instructions

1. **Clone the repository:**
   ```bash
   git clone <your-repo-url>
   ```

2. **Backend Setup:**
   ```bash
   cd backend
   npm install
   ```
   Create a `.env` file in the backend directory:
   ```env
   PORT=5000
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   GEMINI_API_KEY=your_gemini_api_key
   ```
   Start the backend:
   ```bash
   npm run dev
   ```

3. **Frontend Setup:**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

## License
MIT
