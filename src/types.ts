/**
 * Shared Type Definitions for Smart Interview Coach Agent
 */

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface ResumeAnalysis {
  candidateName: string;
  technicalSkills: string[];
  softSkills: string[];
  strengths: string[];
  weakAreas: string[];
  missingSkills: string[];
  recommendedTopics: string[];
  experienceSummary?: string;
  educationSummary?: string;
}

export interface Resume {
  id: string;
  userId: string;
  fileName: string;
  extractedText: string;
  analysis: ResumeAnalysis;
  createdAt: string;
}

export interface Question {
  id: string;
  question: string;
  category: 'HR' | 'Technical' | 'Behavioral' | 'Project-Based' | 'Coding';
  hint?: string;
}

export interface Interview {
  id: string;
  userId: string;
  jobRole: string;
  experienceLevel: 'Entry-Level' | 'Mid-Level' | 'Senior' | 'Lead';
  difficultyLevel: 'Easy' | 'Medium' | 'Hard';
  questions: Question[];
  isCompleted: boolean;
  createdAt: string;
}

export interface AnswerEvaluation {
  overallScore: number;
  technicalScore: number;
  communicationScore: number;
  confidenceScore: number;
  strengths: string[];
  weaknesses: string[];
  correctAnswer: string;
  improvementSuggestions: string[];
}

export interface EvaluationRecord {
  id: string;
  interviewId: string;
  userId: string;
  questionId: string;
  questionText: string;
  answerText: string;
  evaluation: AnswerEvaluation;
  createdAt: string;
}

export interface Course {
  title: string;
  provider: string;
  url: string;
  description: string;
}

export interface PracticeProblem {
  title: string;
  platform: string;
  url: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

export interface Book {
  title: string;
  author: string;
  description: string;
}

export interface LearningRecommendation {
  id: string;
  userId: string;
  weakAreas: string[];
  courses: Course[];
  practiceProblems: PracticeProblem[];
  books: Book[];
  tips: string[];
  createdAt: string;
}

export interface DashboardStats {
  overallScore: number;
  technicalScore: number;
  communicationScore: number;
  confidenceScore: number;
  totalInterviews: number;
  totalQuestionsAnswered: number;
  categoryPerformance: {
    HR: number;
    Technical: number;
    Behavioral: number;
    'Project-Based': number;
    Coding: number;
  };
  scoreHistory: {
    date: string;
    score: number;
  }[];
  weakAreas: string[];
  recommendedLearning: {
    courses: Course[];
    tips: string[];
  };
}
