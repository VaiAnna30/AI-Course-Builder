# 🧠 AI Course Builder

![AI Course Builder Header](https://img.shields.io/badge/AI_Powered-Course_Builder-111111?style=for-the-badge&logo=google-gemini&logoColor=white)
![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-%234ea94b.svg?style=for-the-badge&logo=mongodb&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)

AI Course Builder is an advanced, full-stack web application designed to revolutionize self-directed learning. By leveraging the power of Google's Gemini AI, the platform acts as a personal curriculum architect, allowing users to instantly generate highly structured, interactive, and comprehensive educational courses on literally *any* topic.

---

## ✨ Core Features

* **🧠 Dynamic Syllabus Architecture**: Enter any topic (e.g., "Advanced C++" or "Machine Learning"), and the AI will dynamically generate a highly structured syllabus divided into logical modules and chapters.
* **⚡ Real-Time Content Streaming**: Chapter content is generated and streamed in real-time to the UI using Server-Sent Events (SSE), allowing users to start reading instantly without waiting for the entire course to finish generating.
* **🎓 AI Tutor**: Built directly into the reading experience, users can ask an AI Tutor specific doubts about the chapter they are currently reading, providing instant, highly contextualized explanations.
* **📝 Auto-Generated Quizzes**: Complete a chapter, and the system automatically reads the chapter text to build a 3-question Multiple Choice Quiz to test your knowledge retention.
* **🏆 Final Exams & Badges**: Complete all modules to unlock a comprehensive 10-question Final Exam. Passing the exam awards a verifiable "Expert" badge displayed permanently on your Dashboard.
* **🛡️ Secure Course Management**: Features a secure deletion system preventing accidental progress loss, alongside a robust JWT-based authentication system.

---

## 🛠️ Tech Stack & Architecture

This project is built using the **MERN** stack (MongoDB, Express, React, Node.js), supercharged with Google's Gemini API and modern frontend libraries.

### Frontend Technologies
* **React 18 & Vite**: 
  * *Why?* React provides a robust component-based architecture for building complex interactive UIs. Vite is used as the build tool because of its incredibly fast Hot Module Replacement (HMR) and optimized production builds, offering a vastly superior developer experience over Webpack.
* **Tailwind CSS**: 
  * *Why?* Utility-first CSS framework that allowed us to rapidly build a sleek, custom dark-mode aesthetic without writing thousands of lines of custom CSS. It ensures highly responsive design across all devices.
* **Framer Motion**: 
  * *Why?* Used for micro-animations and smooth page transitions. It elevates the user experience, making the application feel premium and fluid rather than rigid.
* **React Router v6**: 
  * *Why?* Handles client-side routing securely. Private routes ensure that unauthorized users are instantly redirected to the login page.
* **Axios**: 
  * *Why?* Simplifies HTTP requests to the backend, especially when handling global Authorization headers and JWT tokens.

### Backend Technologies
* **Node.js & Express**: 
  * *Why?* Express is a minimal, fast backend framework that pairs perfectly with React. It easily handles the REST API endpoints and complex Server-Sent Events (SSE) required for real-time AI text streaming.
* **MongoDB & Mongoose**: 
  * *Why?* A NoSQL database is perfectly suited for this project because AI-generated syllabuses have highly dynamic structures (arrays of modules, which contain arrays of chapters). Mongoose enforces a strict schema on top of MongoDB to ensure data integrity.
* **JSON Web Tokens (JWT) & bcryptjs**: 
  * *Why?* `bcryptjs` safely encrypts user passwords before they hit the database. `JWT` provides stateless, secure authentication, ensuring users can only read, edit, or delete courses that belong to their specific user ID.

### Artificial Intelligence
* **Google Gemini API (`@google/genai` SDK)**: 
  * *Why?* Gemini offers industry-leading context windows and incredible speed. We specifically engineered a **Cascade Fallback Engine** that attempts to use ultra-fast models (like `gemini-2.5-flash-lite`), and automatically falls back to heavier models (`gemini-2.5-pro` or `gemini-3.5-flash`) if Google's free-tier quota limits are exceeded, ensuring zero downtime for users.

---

## 🚀 Setup & Installation

To run this project locally on your machine:

### 1. Prerequisites
- Node.js (v18 or higher)
- MongoDB (Local installation or MongoDB Atlas Cloud URI)
- A Google Gemini API Key

### 2. Clone the Repository
```bash
git clone [https://github.com/VaiAnna30/AI-Course-Builder.git](https://github.com/VaiAnna30/AI-Course-Builder.git)
cd AI-Course-Builder