import { GoogleGenAI, Type } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.warn("WARNING: GEMINI_API_KEY environment variable is not set. Gemini integration will fall back to smart local simulations.");
}

// Initialize GoogleGenAI client (Server-Side Only)
const ai = apiKey
  ? new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

// Fallback generators for development safety if no API key is set
function getMockResumeAnalysis(rawText: string): any {
  return {
    candidateName: "Alex Mercer",
    technicalSkills: ["TypeScript", "React", "Node.js", "Express", "Tailwind CSS", "MongoDB", "SQL"],
    softSkills: ["Communication", "Problem Solving", "Teamwork", "Adaptability", "Time Management"],
    strengths: ["Excellent Full Stack web foundations", "Solid React component optimization", "Eager to learn"],
    weakAreas: ["System Design", "Cloud Infrastructure (AWS/GCP)", "CI/CD Pipelines", "Docker"],
    missingSkills: ["Kubernetes", "Redis", "Kafka", "Unit Testing (Jest/Cypress)"],
    recommendedTopics: ["Node.js Performance Optimization", "Database Indexing & Queries", "Advanced State Management"],
    experienceSummary: "Full Stack Engineer with 2+ years of experience building modern web applications.",
    educationSummary: "B.S. in Computer Science",
  };
}

function getMockQuestions(jobRole: string, experienceLevel: string): any[] {
  return [
    {
      id: "q-1",
      question: `As a ${experienceLevel} ${jobRole}, how do you optimize the loading and rendering performance of a heavy, content-rich web application?`,
      category: "Technical",
      hint: "Talk about code splitting, lazy loading, asset optimization, caching strategies, and virtualization.",
    },
    {
      id: "q-2",
      question: "Tell me about a time you had to deal with a major technical bug or system outage right before a critical launch. How did you resolve it?",
      category: "Behavioral",
      hint: "Use the STAR method: Situation, Task, Action, Result. Focus on composure and structured debugging.",
    },
    {
      id: "q-3",
      question: "Why do you want to join our company as a developer, and what values do you bring to a cross-functional squad?",
      category: "HR",
      hint: "Connect your career goals with modern full-stack workflows and express excitement for collaborative product engineering.",
    },
    {
      id: "q-4",
      question: "Describe the most complex project you have engineered. What architecture choices did you make, and what would you do differently today?",
      category: "Project-Based",
      hint: "Clearly structure the service diagram, highlight trade-offs (e.g., SQL vs NoSQL, serverless vs containers), and show hindsight reflection.",
    },
    {
      id: "q-5",
      question: "Write or describe an optimal algorithm to find the longest substring without repeating characters in a given string. What is its time complexity?",
      category: "Coding",
      hint: "Explain the sliding window technique with left/right pointers and a hash map. Aim for O(n) runtime complexity.",
    },
  ];
}

function getMockEvaluation(question: string, answer: string): any {
  const words = answer.trim().split(/\s+/).length;
  const score = Math.min(60 + Math.floor(words * 0.4), 95);
  return {
    overallScore: score,
    technicalScore: Math.min(score + 2, 98),
    communicationScore: Math.min(score - 3, 94),
    confidenceScore: Math.min(score + 1, 96),
    strengths: ["Clear terminology usage", "Direct answer to the prompt", "Expresses practical engineering experiences"],
    weaknesses: ["Could explain specific algorithmic or architectural trade-offs in deeper detail", "Slight lack of structural pacing"],
    correctAnswer: "The ideal response should outline a clear structured methodology (e.g., STAR framework for behavioral or system-level analysis for technical) with concrete metrics of success.",
    improvementSuggestions: ["Incorporate solid industry standards (e.g., specific React hooks or node cluster modes)", "Structure behavioral replies strictly into Situation, Action, and Quantitative Result."],
  };
}

function getMockRecommendations(weakAreas: string[]): any {
  return {
    weakAreas: weakAreas.length > 0 ? weakAreas : ["System Design", "Cloud Infrastructure", "Advanced Coding Patterns"],
    courses: [
      {
        title: "Pragmatic System Design & Microservices",
        provider: "ByteByteGo",
        url: "https://bytebytego.com",
        description: "Master real-world high-scalability software architectures, database sharding, caching, and rate limiters.",
      },
      {
        title: "Full Stack Open: Cloud Ingress & Containerization",
        provider: "University of Helsinki",
        url: "https://fullstackopen.com",
        description: "Deep dive into Docker, Kubernetes, CI/CD pipelines, and robust production-ready web servers.",
      },
    ],
    practiceProblems: [
      {
        title: "Sliding Window Maximum & Longest Path",
        platform: "LeetCode",
        url: "https://leetcode.com",
        difficulty: "Hard",
      },
      {
        title: "Design a Distributed Message Queue",
        platform: "System Design Fight Club",
        url: "https://youtube.com",
        difficulty: "Medium",
      },
    ],
    books: [
      {
        title: "Designing Data-Intensive Applications",
        author: "Martin Kleppmann",
        description: "The definitive guide to system design, covering database indexing, consensus algorithms, replication, and storage engines.",
      },
    ],
    tips: [
      "Dedicate 15 minutes daily to solving algorithm challenges using the sliding window or two-pointer techniques.",
      "Conduct mock behavioral mock interviews in front of a mirror or record yourself to analyze posture, filler words, and speed.",
      "In corporate evaluations, always frame architectural trade-offs as business decisions (e.g., developer productivity vs server cost).",
    ],
  };
}

// 1. Analyze Resume (Direct PDF support!)
export async function analyzeResume(resumeTextOrPdfBase64: string, isPdf: boolean): Promise<any> {
  if (!ai) {
    return getMockResumeAnalysis(resumeTextOrPdfBase64);
  }

  try {
    const prompt = `You are an expert technical recruiter and executive hiring coach.
Analyze the provided resume and return a highly detailed, professional analysis.
Be objective and constructive. Extract all key attributes, technical and soft skills, strengths, weak areas, missing skills (skills expected for their role but not visible on resume), and highly targeted interview prep topics.`;

    const contents = isPdf
      ? {
          parts: [
            {
              inlineData: {
                mimeType: "application/pdf",
                data: resumeTextOrPdfBase64,
              },
            },
            { text: prompt },
          ],
        }
      : [
          { text: prompt },
          { text: `Resume Content:\n\n${resumeTextOrPdfBase64}` },
        ];

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: contents,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            candidateName: { type: Type.STRING, description: "Extract full name of candidate" },
            technicalSkills: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of core coding languages, tools, frameworks" },
            softSkills: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of behavioral, communication, or leadership traits" },
            strengths: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Core technical/professional advantages found" },
            weakAreas: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Development opportunities or structural weaknesses" },
            missingSkills: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Critical skills typical for this candidate's path that are missing on this resume" },
            recommendedTopics: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Specific technical or business topics to review for mock interviews" },
            experienceSummary: { type: Type.STRING, description: "A highly professional, scannable summary of their career experience" },
            educationSummary: { type: Type.STRING, description: "Scannable summary of diplomas, certificates, and academic pedigree" },
          },
          required: [
            "candidateName",
            "technicalSkills",
            "softSkills",
            "strengths",
            "weakAreas",
            "missingSkills",
            "recommendedTopics",
          ],
        },
      },
    });

    const text = response.text;
    if (!text) throw new Error("Empty response from Gemini");
    return JSON.parse(text);
  } catch (err) {
    console.error("Gemini Analyze Resume failed, returning mock:", err);
    return getMockResumeAnalysis(resumeTextOrPdfBase64);
  }
}

// 2. Generate Interview Questions
export async function generateInterviewQuestions(
  resumeAnalysis: any,
  jobRole: string,
  experienceLevel: string,
  difficultyLevel: string
): Promise<any[]> {
  if (!ai) {
    return getMockQuestions(jobRole, experienceLevel);
  }

  try {
    const prompt = `You are a Principal Software Engineer and Technical Bar Raiser conducting an interview.
Generate exactly 5 highly personalized, rigorous mock interview questions tailored to the candidate's resume and target profile.
Target Profile:
- Role: ${jobRole}
- Experience Level: ${experienceLevel}
- Difficulty: ${difficultyLevel}

Candidate Resume Background:
- Technical Skills: ${resumeAnalysis.technicalSkills.join(", ")}
- Soft Skills: ${resumeAnalysis.softSkills.join(", ")}
- Strengths: ${resumeAnalysis.strengths.join(", ")}
- Weak areas: ${resumeAnalysis.weakAreas.join(", ")}

Generate exactly one question for each of these 5 categories:
1. 'Technical': Solid platform/infrastructure/framework question.
2. 'Behavioral': Contextual soft skill/leadership conflict scenario.
3. 'HR': Culture-fit, motivation, or standard behavioral screening.
4. 'Project-Based': Engineering design/architecture based on their visible strengths/projects.
5. 'Coding': Algorithmic/computational query focusing on modern clean code patterns.

Ensure the questions are realistic and do not reference generic placeholders. Provide a highly constructive secret 'hint' for each.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            questions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  question: { type: Type.STRING, description: "The full question text to display" },
                  category: {
                    type: Type.STRING,
                    enum: ["HR", "Technical", "Behavioral", "Project-Based", "Coding"],
                    description: "The interview section category",
                  },
                  hint: { type: Type.STRING, description: "A brief, highly practical guiding hint or checklist for answering this successfully" },
                },
                required: ["question", "category", "hint"],
              },
            },
          },
          required: ["questions"],
        },
      },
    });

    const text = response.text;
    if (!text) throw new Error("Empty response from Gemini");
    const parsed = JSON.parse(text);
    return parsed.questions.map((q: any, index: number) => ({
      ...q,
      id: `q-${index + 1}`,
    }));
  } catch (err) {
    console.error("Gemini Generate Interview Questions failed, returning mock:", err);
    return getMockQuestions(jobRole, experienceLevel);
  }
}

// 3. Evaluate Answer
export async function evaluateAnswer(
  question: string,
  category: string,
  answer: string,
  resumeAnalysis?: any
): Promise<any> {
  if (!ai) {
    return getMockEvaluation(question, answer);
  }

  try {
    const prompt = `You are an elite Technical Interviewer and Communications Coach.
Review the following interview question, its category, and the candidate's response.
Provide a thorough, data-driven evaluation. Be candid, constructive, and detailed.

Question: "${question}"
Category: "${category}"
Candidate Answer: "${answer}"
${resumeAnalysis ? `Candidate Background Context: ${JSON.stringify(resumeAnalysis)}` : ""}

Evaluate across multiple parameters:
1. Technical accuracy of assertions.
2. Structure and clarity of communication.
3. Problem-solving depth and application of proper paradigms.
4. Grammar, confidence, and terminology.

Score each attribute strictly from 0 to 100.
Provide strengths, weaknesses, an exemplary 'ideal' model response, and clear improvement suggestions.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            overallScore: { type: Type.INTEGER, description: "Overall combined performance score (0-100)" },
            technicalScore: { type: Type.INTEGER, description: "Subject matter accuracy score (0-100)" },
            communicationScore: { type: Type.INTEGER, description: "Structure, articulation, and pacing score (0-100)" },
            confidenceScore: { type: Type.INTEGER, description: "Decisiveness, directness, and lack of filler words score (0-100)" },
            strengths: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Specific items they did exceptionally well" },
            weaknesses: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Specific flaws, omissions, or structural errors" },
            correctAnswer: { type: Type.STRING, description: "An exemplar model response illustrating how a senior candidate would optimally answer" },
            improvementSuggestions: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Actionable milestones/checklists to improve next time" },
          },
          required: [
            "overallScore",
            "technicalScore",
            "communicationScore",
            "confidenceScore",
            "strengths",
            "weaknesses",
            "correctAnswer",
            "improvementSuggestions",
          ],
        },
      },
    });

    const text = response.text;
    if (!text) throw new Error("Empty response from Gemini");
    return JSON.parse(text);
  } catch (err) {
    console.error("Gemini Evaluate Answer failed, returning mock:", err);
    return getMockEvaluation(question, answer);
  }
}

// 4. Generate Learning Recommendations
export async function generateLearningRecommendations(weakAreas: string[]): Promise<any> {
  if (!ai) {
    return getMockRecommendations(weakAreas);
  }

  try {
    const prompt = `You are a Senior Career Coach and Devops Lead.
Based on the following weak areas or development gaps identified during interview cycles, recommend specific courses, practice problems (with real platforms like LeetCode, Frontend Mentor, etc.), technical books, and expert tips.
Candidate Weak Areas: ${weakAreas.join(", ")}

Focus on high-quality, reputable resources that actually exist.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            weakAreas: { type: Type.ARRAY, items: { type: Type.STRING } },
            courses: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  provider: { type: Type.STRING },
                  url: { type: Type.STRING },
                  description: { type: Type.STRING },
                },
                required: ["title", "provider", "url", "description"],
              },
            },
            practiceProblems: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  platform: { type: Type.STRING },
                  url: { type: Type.STRING },
                  difficulty: { type: Type.STRING, enum: ["Easy", "Medium", "Hard"] },
                },
                required: ["title", "platform", "url", "difficulty"],
              },
            },
            books: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  author: { type: Type.STRING },
                  description: { type: Type.STRING },
                },
                required: ["title", "author", "description"],
              },
            },
            tips: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Practical interview hacks and mental workflows" },
          },
          required: ["weakAreas", "courses", "practiceProblems", "books", "tips"],
        },
      },
    });

    const text = response.text;
    if (!text) throw new Error("Empty response from Gemini");
    return JSON.parse(text);
  } catch (err) {
    console.error("Gemini Generate Recommendations failed, returning mock:", err);
    return getMockRecommendations(weakAreas);
  }
}
