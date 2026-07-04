import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import crypto from 'crypto';
import {
  readDb,
  writeDb,
  hashPassword,
  verifyPassword,
  signToken,
  verifyToken,
} from './db.js';
import {
  analyzeResume,
  generateInterviewQuestions,
  evaluateAnswer,
  generateLearningRecommendations,
} from './gemini.js';

export const router = Router();

// Configure Multer for secure memory storage (avoids local disk footprint)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB Limit
});

// Extend Express Request type for authenticated routes
interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    email: string;
  };
}

// Authentication Middleware
function authenticateToken(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(403).json({ error: 'Invalid or expired session token' });
  }

  req.user = decoded;
  next();
}

// ==========================================
// AUTHENTICATION ENDPOINTS
// ==========================================

router.post('/auth/signup', async (req: Request, res: Response) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required' });
  }

  try {
    const db = await readDb();
    const existing = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const newUser = {
      id: crypto.randomUUID(),
      name,
      email: email.toLowerCase(),
      passwordHash: hashPassword(password),
      createdAt: new Date().toISOString(),
    };

    db.users.push(newUser);
    await writeDb(db);

    const token = signToken({ userId: newUser.id, email: newUser.email });

    res.status(201).json({
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
      },
    });
  } catch (err) {
    console.error('Signup failed:', err);
    res.status(500).json({ error: 'Internal server error during signup' });
  }
});

router.post('/auth/login', async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const db = await readDb();
    const user = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());

    if (!user || !verifyPassword(password, user.passwordHash)) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = signToken({ userId: user.id, email: user.email });

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (err) {
    console.error('Login failed:', err);
    res.status(500).json({ error: 'Internal server error during login' });
  }
});

router.get('/auth/me', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const db = await readDb();
    const user = db.users.find((u) => u.id === req.user?.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
    });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ==========================================
// RESUME ENDPOINTS (DIRECT PDF PROCESSING!)
// ==========================================

router.post('/resume/analyze', authenticateToken, upload.single('resume'), async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.userId!;
  const resumeText = req.body.resumeText; // fallback manual text input

  try {
    let rawDataB64 = '';
    let isPdf = false;
    let fileName = 'pasted_resume.txt';

    if (req.file) {
      fileName = req.file.originalname;
      rawDataB64 = req.file.buffer.toString('base64');
      isPdf = req.file.mimetype === 'application/pdf';
    } else if (resumeText) {
      rawDataB64 = resumeText;
    } else {
      return res.status(400).json({ error: 'Please upload a PDF resume or paste its content' });
    }

    console.log(`Analyzing resume: ${fileName} (isPdf: ${isPdf}) for user: ${userId}`);

    // Call Gemini to do executive resume parsing & structural assessment
    const analysis = await analyzeResume(rawDataB64, isPdf);

    const db = await readDb();
    const newResume = {
      id: crypto.randomUUID(),
      userId,
      fileName,
      extractedText: isPdf ? '[Binary PDF Document Ingested]' : resumeText.substring(0, 5000),
      analysis,
      createdAt: new Date().toISOString(),
    };

    // Keep only the latest resume for simplicity or support list
    db.resumes = db.resumes.filter((r) => r.userId !== userId);
    db.resumes.push(newResume);
    await writeDb(db);

    res.status(201).json(newResume);
  } catch (err) {
    console.error('Resume analysis failed:', err);
    res.status(500).json({ error: 'Failed to analyze resume. Please try again.' });
  }
});

router.get('/resume/latest', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.userId!;
  try {
    const db = await readDb();
    const resume = db.resumes.find((r) => r.userId === userId);
    if (!resume) {
      return res.status(404).json({ error: 'No resume analyzed yet' });
    }
    res.json(resume);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ==========================================
// INTERVIEW ENDPOINTS
// ==========================================

router.post('/interview/generate', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.userId!;
  const { jobRole, experienceLevel, difficultyLevel } = req.body;

  if (!jobRole || !experienceLevel || !difficultyLevel) {
    return res.status(400).json({ error: 'Job role, experience, and difficulty level are required' });
  }

  try {
    const db = await readDb();
    const resume = db.resumes.find((r) => r.userId === userId);
    if (!resume) {
      return res.status(400).json({ error: 'Please upload and analyze your resume first' });
    }

    console.log(`Generating interview: ${jobRole} for user: ${userId}`);

    // Call Gemini to generate questions specific to resume
    const questions = await generateInterviewQuestions(
      resume.analysis,
      jobRole,
      experienceLevel,
      difficultyLevel
    );

    const newInterview = {
      id: crypto.randomUUID(),
      userId,
      jobRole,
      experienceLevel,
      difficultyLevel,
      questions,
      isCompleted: false,
      createdAt: new Date().toISOString(),
    };

    db.interviews.push(newInterview);
    await writeDb(db);

    res.status(201).json(newInterview);
  } catch (err) {
    console.error('Interview generation failed:', err);
    res.status(500).json({ error: 'Failed to generate interview questions' });
  }
});

router.post('/interview/evaluate', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.userId!;
  const { interviewId, questionId, questionText, answerText } = req.body;

  if (!interviewId || !questionId || !questionText || !answerText) {
    return res.status(400).json({ error: 'Required fields missing for evaluation' });
  }

  try {
    const db = await readDb();
    const resume = db.resumes.find((r) => r.userId === userId);

    console.log(`Evaluating answer for question ${questionId} in interview ${interviewId}`);

    // Call Gemini to evaluate the answer in context of the resume
    const evaluation = await evaluateAnswer(
      questionText,
      'Technical', // defaults or is dynamically passed
      answerText,
      resume?.analysis
    );

    const newEvaluation = {
      id: crypto.randomUUID(),
      interviewId,
      userId,
      questionId,
      questionText,
      answerText,
      evaluation,
      createdAt: new Date().toISOString(),
    };

    db.evaluations.push(newEvaluation);

    // If this is the final question of the interview, we can mark the interview as completed
    const interview = db.interviews.find((i) => i.id === interviewId);
    if (interview) {
      // Find evaluations for this interview
      const evals = db.evaluations.filter((e) => e.interviewId === interviewId);
      if (evals.length >= interview.questions.length) {
        interview.isCompleted = true;
      }
    }

    await writeDb(db);
    res.status(201).json(newEvaluation);
  } catch (err) {
    console.error('Answer evaluation failed:', err);
    res.status(500).json({ error: 'Failed to evaluate answer' });
  }
});

// Mark interview as complete
router.post('/interview/:id/complete', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.userId!;
  const { id } = req.params;

  try {
    const db = await readDb();
    const interview = db.interviews.find((i) => i.id === id && i.userId === userId);
    if (!interview) {
      return res.status(404).json({ error: 'Interview session not found' });
    }

    interview.isCompleted = true;
    await writeDb(db);
    res.json({ success: true, interview });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ==========================================
// DASHBOARD & STATS ENDPOINTS
// ==========================================

router.get('/dashboard', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.userId!;

  try {
    const db = await readDb();

    const userInterviews = db.interviews.filter((i) => i.userId === userId);
    const userEvaluations = db.evaluations.filter((e) => e.userId === userId);

    // If zero evaluations, return empty state
    if (userEvaluations.length === 0) {
      return res.json({
        overallScore: 0,
        technicalScore: 0,
        communicationScore: 0,
        confidenceScore: 0,
        totalInterviews: userInterviews.length,
        totalQuestionsAnswered: 0,
        categoryPerformance: { HR: 0, Technical: 0, Behavioral: 0, 'Project-Based': 0, Coding: 0 },
        scoreHistory: [],
        weakAreas: [],
        recommendedLearning: { courses: [], tips: [] },
      });
    }

    // Compute averages
    let sumOverall = 0, sumTech = 0, sumComm = 0, sumConf = 0;
    userEvaluations.forEach((e) => {
      sumOverall += e.evaluation.overallScore || 0;
      sumTech += e.evaluation.technicalScore || 0;
      sumComm += e.evaluation.communicationScore || 0;
      sumConf += e.evaluation.confidenceScore || 0;
    });

    const totalEvals = userEvaluations.length;

    // Aggregate category performance
    const categoryTotals: any = { HR: [], Technical: [], Behavioral: [], 'Project-Based': [], Coding: [] };
    userEvaluations.forEach((e) => {
      // Look up question category from the interview
      const interview = userInterviews.find((i) => i.id === e.interviewId);
      const question = interview?.questions.find((q: any) => q.id === e.questionId);
      const category = question?.category || 'Technical';
      if (categoryTotals[category]) {
        categoryTotals[category].push(e.evaluation.overallScore);
      }
    });

    const categoryPerformance: any = {};
    Object.keys(categoryTotals).forEach((cat) => {
      const arr = categoryTotals[cat];
      categoryPerformance[cat] = arr.length > 0 ? Math.round(arr.reduce((a: any, b: any) => a + b, 0) / arr.length) : 0;
    });

    // Score history (staged by date/time of evaluation)
    const scoreHistory = userEvaluations
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
      .map((e) => ({
        date: new Date(e.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        score: e.evaluation.overallScore,
      }));

    // Aggregate unique weak areas
    const weakAreasSet = new Set<string>();
    userEvaluations.forEach((e) => {
      e.evaluation.weaknesses?.forEach((w: string) => {
        if (w.length < 50) weakAreasSet.add(w);
      });
    });
    // Fallback if none extracted
    if (weakAreasSet.size === 0) {
      const resume = db.resumes.find((r) => r.userId === userId);
      resume?.analysis?.weakAreas?.forEach((w: string) => weakAreasSet.add(w));
    }
    const weakAreas = Array.from(weakAreasSet).slice(0, 5);

    // Learning recommendations (cached or dynamic mock)
    let recommendations = db.recommendations.find((r) => r.userId === userId);
    if (!recommendations && weakAreas.length > 0) {
      // Generate them asynchronously or seed a nice starting list
      const generated = await generateLearningRecommendations(weakAreas);
      recommendations = {
        id: crypto.randomUUID(),
        userId,
        ...generated,
        createdAt: new Date().toISOString(),
      };
      db.recommendations.push(recommendations);
      await writeDb(db);
    }

    res.json({
      overallScore: Math.round(sumOverall / totalEvals),
      technicalScore: Math.round(sumTech / totalEvals),
      communicationScore: Math.round(sumComm / totalEvals),
      confidenceScore: Math.round(sumConf / totalEvals),
      totalInterviews: userInterviews.length,
      totalQuestionsAnswered: totalEvals,
      categoryPerformance,
      scoreHistory: scoreHistory.slice(-10), // Limit to last 10
      weakAreas,
      recommendedLearning: {
        courses: recommendations?.courses?.slice(0, 3) || [],
        tips: recommendations?.tips?.slice(0, 3) || [],
      },
    });
  } catch (err) {
    console.error('Dashboard fetching failed:', err);
    res.status(500).json({ error: 'Failed to retrieve dashboard stats' });
  }
});

// ==========================================
// HISTORY & RECOMMENDATION ENDPOINTS
// ==========================================

router.get('/history', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.userId!;
  try {
    const db = await readDb();
    const userInterviews = db.interviews.filter((i) => i.userId === userId);
    const userEvaluations = db.evaluations.filter((e) => e.userId === userId);

    const history = userInterviews.map((interview) => {
      const evals = userEvaluations.filter((e) => e.interviewId === interview.id);
      const avgScore = evals.length > 0
        ? Math.round(evals.reduce((sum, e) => sum + e.evaluation.overallScore, 0) / evals.length)
        : 0;

      return {
        id: interview.id,
        jobRole: interview.jobRole,
        experienceLevel: interview.experienceLevel,
        difficultyLevel: interview.difficultyLevel,
        createdAt: interview.createdAt,
        isCompleted: interview.isCompleted,
        questionsCount: interview.questions.length,
        answeredCount: evals.length,
        avgScore,
        evaluations: evals,
      };
    });

    res.json(history.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve history' });
  }
});

router.get('/recommendations', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.userId!;
  try {
    const db = await readDb();
    let recommendations = db.recommendations.find((r) => r.userId === userId);

    if (!recommendations) {
      // Fallback or generate on fly based on resume
      const resume = db.resumes.find((r) => r.userId === userId);
      const weakAreas = resume?.analysis?.weakAreas || ["Full Stack Optimization", "System Design"];
      const generated = await generateLearningRecommendations(weakAreas);
      recommendations = {
        id: crypto.randomUUID(),
        userId,
        ...generated,
        createdAt: new Date().toISOString(),
      };
      db.recommendations.push(recommendations);
      await writeDb(db);
    }

    res.json(recommendations);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve learning recommendations' });
  }
});

// ==========================================
// REPORT / EXPORT ENDPOINT (STUNNING PRINTABLE HTML)
// ==========================================

router.get('/report/download/:interviewId', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.userId!;
  const { interviewId } = req.params;

  try {
    const db = await readDb();
    const user = db.users.find((u) => u.id === userId);
    const interview = db.interviews.find((i) => i.id === interviewId && i.userId === userId);
    const resume = db.resumes.find((r) => r.userId === userId);
    const evaluations = db.evaluations.filter((e) => e.interviewId === interviewId);

    if (!interview) {
      return res.status(404).send('Interview report not found');
    }

    const avgScore = evaluations.length > 0
      ? Math.round(evaluations.reduce((sum, e) => sum + e.evaluation.overallScore, 0) / evaluations.length)
      : 0;

    // Generate extremely elegant printable standalone HTML page
    const htmlReport = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Interview Prep Report - ${interview.jobRole}</title>
  <style>
    body {
      font-family: 'Inter', system-ui, -apple-system, sans-serif;
      color: #1e293b;
      line-height: 1.6;
      margin: 0;
      padding: 40px;
      background: #f8fafc;
    }
    .container {
      max-width: 850px;
      margin: 0 auto;
      background: #ffffff;
      padding: 40px;
      border-radius: 12px;
      box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
    }
    .header {
      border-bottom: 2px solid #e2e8f0;
      padding-bottom: 24px;
      margin-bottom: 30px;
    }
    .header h1 {
      margin: 0;
      color: #0f172a;
      font-size: 28px;
      font-weight: 700;
    }
    .meta-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;
      margin-top: 20px;
    }
    .meta-item {
      font-size: 14px;
    }
    .meta-label {
      font-weight: 600;
      color: #64748b;
    }
    .score-badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      background: #f0fdf4;
      color: #166534;
      font-size: 32px;
      font-weight: 800;
      border-radius: 50%;
      width: 80px;
      height: 80px;
      border: 3px solid #bbf7d0;
    }
    .section-title {
      font-size: 20px;
      font-weight: 700;
      color: #0f172a;
      border-left: 4px solid #3b82f6;
      padding-left: 12px;
      margin-top: 40px;
      margin-bottom: 20px;
    }
    .eval-card {
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 24px;
      margin-bottom: 24px;
      background: #fafafa;
    }
    .eval-q {
      font-weight: 600;
      color: #1e293b;
      margin-bottom: 12px;
    }
    .eval-a {
      font-style: italic;
      color: #475569;
      background: #f1f5f9;
      padding: 12px;
      border-radius: 6px;
      margin-bottom: 16px;
    }
    .bullets {
      padding-left: 20px;
      margin: 8px 0;
    }
    .actions {
      margin-top: 40px;
      text-align: center;
    }
    .btn-print {
      background: #3b82f6;
      color: white;
      padding: 12px 24px;
      border-radius: 8px;
      text-decoration: none;
      font-weight: 600;
      border: none;
      cursor: pointer;
    }
    @media print {
      body {
        background: white;
        padding: 0;
      }
      .container {
        box-shadow: none;
        padding: 0;
      }
      .actions {
        display: none;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header" style="display: flex; justify-content: space-between; align-items: center;">
      <div>
        <h1>🧠 Smart Interview Coach Agent</h1>
        <p style="color: #64748b; margin: 4px 0 0 0;">Personalized Mock Evaluation Report</p>
      </div>
      <div class="score-badge">${avgScore}%</div>
    </div>

    <div class="meta-grid">
      <div class="meta-item"><span class="meta-label">Candidate Name:</span> ${user?.name || 'Full Stack Professional'}</div>
      <div class="meta-item"><span class="meta-label">Target Role:</span> ${interview.jobRole} (${interview.experienceLevel})</div>
      <div class="meta-item"><span class="meta-label">Difficulty:</span> ${interview.difficultyLevel}</div>
      <div class="meta-item"><span class="meta-label">Date Generated:</span> ${new Date(interview.createdAt).toLocaleDateString()}</div>
    </div>

    <div class="section-title">Resume Matching Insights</div>
    <div style="background: #eff6ff; padding: 20px; border-radius: 8px; border: 1px dashed #bfdbfe;">
      <p style="margin-top: 0;"><strong>Extracted Core Tech:</strong> ${resume?.analysis?.technicalSkills?.slice(0, 8).join(', ') || 'N/A'}</p>
      <p style="margin-bottom: 0;"><strong>Target Focus Topics:</strong> ${resume?.analysis?.recommendedTopics?.slice(0, 5).join(', ') || 'N/A'}</p>
    </div>

    <div class="section-title">Question by Question AI Evaluations</div>
    ${evaluations.map((e, idx) => `
      <div class="eval-card">
        <div class="eval-q">Q${idx + 1}: ${e.questionText}</div>
        <div style="font-size: 13px; color: #3b82f6; font-weight: 600; margin-bottom: 12px;">Category: Technical</div>
        <div class="eval-a">" ${e.answerText} "</div>
        
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 16px;">
          <div style="text-align: center; background: white; padding: 8px; border: 1px solid #e2e8f0; border-radius: 6px;">
            <div style="font-size: 11px; color: #64748b;">Technical Score</div>
            <div style="font-size: 18px; font-weight: 700; color: #1e293b;">${e.evaluation.technicalScore}%</div>
          </div>
          <div style="text-align: center; background: white; padding: 8px; border: 1px solid #e2e8f0; border-radius: 6px;">
            <div style="font-size: 11px; color: #64748b;">Communication</div>
            <div style="font-size: 18px; font-weight: 700; color: #1e293b;">${e.evaluation.communicationScore}%</div>
          </div>
          <div style="text-align: center; background: white; padding: 8px; border: 1px solid #e2e8f0; border-radius: 6px;">
            <div style="font-size: 11px; color: #64748b;">Confidence</div>
            <div style="font-size: 18px; font-weight: 700; color: #1e293b;">${e.evaluation.confidenceScore}%</div>
          </div>
        </div>

        <p><strong>Candidate Strengths:</strong></p>
        <ul class="bullets">
          ${e.evaluation.strengths.map((s: string) => `<li>${s}</li>`).join('')}
        </ul>

        <p><strong>Areas for Growth:</strong></p>
        <ul class="bullets">
          ${e.evaluation.weaknesses.map((w: string) => `<li>${w}</li>`).join('')}
        </ul>

        <p><strong>Improvement Suggestions:</strong></p>
        <ul class="bullets">
          ${e.evaluation.improvementSuggestions.map((s: string) => `<li>${s}</li>`).join('')}
        </ul>

        <div style="margin-top: 16px; padding: 12px; background: #f8fafc; border-radius: 6px;">
          <strong>Exemplary Answer Recommendation:</strong>
          <p style="margin: 6px 0 0 0; font-size: 13px; color: #475569;">${e.evaluation.correctAnswer}</p>
        </div>
      </div>
    `).join('')}

    <div class="actions">
      <button class="btn-print" onclick="window.print()">Print or Save to PDF</button>
    </div>
  </div>
</body>
</html>
    `;

    res.setHeader('Content-Type', 'text/html');
    res.send(htmlReport);
  } catch (err) {
    res.status(500).send('Error compiling report');
  }
});
