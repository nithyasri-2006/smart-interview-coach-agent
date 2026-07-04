# 🧠 Smart Interview Coach Agent

An AI-powered interview preparation platform that helps users improve their technical, behavioral, and HR interview skills using Google Gemini AI. Users can upload their resume, receive personalized interview questions, get AI-generated feedback, track performance through an interactive dashboard, and receive customized learning recommendations.

---

## 🚀 Features

### 👤 User Authentication
- Secure Login & Signup
- Session Management
- Protected Routes

### 📄 Resume Upload
- Upload PDF or DOCX resumes
- Resume parsing and analysis
- Extract skills, education, projects, and experience

### 🤖 AI Resume Analysis
- Analyze resumes using Google Gemini API
- Identify:
  - Technical Skills
  - Soft Skills
  - Strengths
  - Weak Areas
  - Missing Skills
  - Recommended Interview Topics

### 🎯 AI Interview Generation
Generate personalized interview questions based on:
- Resume
- Job Role
- Experience Level
- Difficulty Level

Question Categories:
- HR
- Technical
- Behavioral
- Project-Based
- Coding

### 📝 AI Answer Evaluation
Evaluate answers using Gemini AI.

Assessment includes:
- Technical Accuracy
- Communication Skills
- Confidence
- Problem Solving
- Grammar
- Completeness

Provides:
- Overall Score
- Strengths
- Weaknesses
- Correct Answer
- Improvement Suggestions

### 📊 Interactive Dashboard
Visualize interview performance using:
- Overall Score
- Technical Score
- Communication Score
- Confidence Score
- Interview History
- Weak Skills
- Learning Recommendations

Charts:
- Pie Chart
- Bar Chart
- Radar Chart
- Line Chart

### 📑 Interview Reports
Generate downloadable reports containing:
- Resume Summary
- Interview Questions
- User Answers
- AI Feedback
- Performance Charts
- Recommendations

### 📚 Personalized Learning
Receive AI-powered recommendations including:
- Courses
- Practice Problems
- Books
- Interview Tips
- Learning Roadmap

---

# 🛠️ Tech Stack

## Frontend

- React
- TypeScript
- HTML5
- CSS3
- Bootstrap
- Chart.js

## Backend

- Node.js
- Express
- TypeScript

## Artificial Intelligence

- Google Gemini API
- Prompt Engineering

## Deployment

- Docker
- Render
- Railway
- Google Cloud Run

---

# 📂 Project Structure

```
smart-interview-coach-agent/

├── assets/
├── server/
├── src/
├── index.html
├── server.ts
├── package.json
├── package-lock.json
├── tsconfig.json
├── vite.config.ts
├── metadata.json
├── .env.example
├── .gitignore
└── README.md
```

---

# ⚙️ Installation

## Clone Repository

```bash
git clone https://github.com/your-username/smart-interview-coach-agent.git
```

```bash
cd smart-interview-coach-agent
```

---

## Install Dependencies

```bash
npm install
```

---

## Configure Environment Variables

Create a `.env` file.

Example:

```env
GEMINI_API_KEY=YOUR_GEMINI_API_KEY
```

Replace `YOUR_GEMINI_API_KEY` with your Google Gemini API key.

---

## Run Development Server

```bash
npm run dev
```

---

## Build Project

```bash
npm run build
```

---

## Start Production Server

```bash
npm start
```

---

# 📌 Workflow

1. User logs in.
2. Uploads resume.
3. Resume is analyzed using Gemini AI.
4. User selects:
   - Job Role
   - Experience Level
   - Difficulty
5. AI generates interview questions.
6. User answers questions.
7. Gemini evaluates each answer.
8. Dashboard updates performance.
9. Download interview report.
10. Receive personalized learning recommendations.

---

# 📈 Dashboard Metrics

- Overall Interview Score
- Technical Score
- Communication Score
- Confidence Score
- Interview History
- Weak Areas
- Strong Areas
- Progress Analytics

---

# 🤖 Prompt Engineering

The application uses optimized prompts for:

- Resume Analysis
- Question Generation
- Technical Evaluation
- HR Evaluation
- Behavioral Evaluation
- Coding Evaluation
- Learning Recommendation

Responses are returned in structured JSON format for seamless integration.

---

# 🔒 Security

- Environment Variables
- Secure API Communication
- Input Validation
- Error Handling
- Session Management

---

# 🚀 Deployment

The project can be deployed using:

- Render
- Railway
- Docker
- Google Cloud Run

---

# 🎯 Future Enhancements

- Voice-based Interviews
- Speech-to-Text Integration
- Video Interview Analysis
- AI Interview Avatar
- Real-Time Coding Environment
- Multi-language Support
- ATS Resume Scoring
- Mock Company-Specific Interviews

---

# 👨‍💻 Developed By

**Nithya Sri**

Smart Interview Coach Agent is a portfolio project showcasing expertise in:

- Python / TypeScript Development
- Prompt Engineering
- Google Gemini API Integration
- AI-powered Applications
- Full Stack Development
- Dashboard Design
- REST API Development
- Cloud Deployment

---

# 📄 License

This project is developed for educational and portfolio purposes.
