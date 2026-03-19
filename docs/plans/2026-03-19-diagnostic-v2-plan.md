# TEF Master Diagnostic 2.0 — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Transform the diagnostic into a 4-level (A1-B2) AI-powered assessment platform with Claude AI personalized recommendations, premium HTML email reports (lead magnet), user profile with sign-out, and test history in progress tab.

**Architecture:** Four separate question banks (JS files) feed a unified test engine. After submission, a Netlify function scores server-side, calls Claude Haiku API for personalized analysis, stores results in Supabase, and sends a premium HTML email via Resend. Premium users see full results + get auto-emailed. Free users enter email to unlock results (lead capture). User profile icon in nav with sign-out. Progress tab shows test history for premium users.

**Tech Stack:** Vanilla JS (browser), Netlify Functions (Node.js), Claude API (Haiku via @anthropic-ai/sdk), Resend (email), Supabase REST API (PostgreSQL)

---

## Phase 1: Database + Infrastructure

### Task 1: Create `diagnostic_results` Table in Supabase

**Step 1: Run DDL migration**

Use Supabase MCP `apply_migration` tool with project_id `stntjppzeuplngyfhgtp`:

```sql
CREATE TABLE IF NOT EXISTS public.diagnostic_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  test_level TEXT NOT NULL CHECK (test_level IN ('a1', 'a2', 'b1', 'b2')),
  total_score INT NOT NULL,
  total_questions INT NOT NULL,
  score_pct INT NOT NULL,
  section_scores JSONB NOT NULL DEFAULT '{}',
  answers JSONB NOT NULL DEFAULT '[]',
  ai_analysis JSONB,
  cefr_result TEXT,
  clb_estimate INT,
  elapsed_seconds INT,
  email_sent BOOLEAN NOT NULL DEFAULT false,
  is_premium BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_diag_email_date ON public.diagnostic_results(email, created_at DESC);
CREATE INDEX idx_diag_level ON public.diagnostic_results(test_level);
ALTER TABLE public.diagnostic_results ENABLE ROW LEVEL SECURITY;
```

**Step 2: Verify table exists**

```bash
curl -s "https://stntjppzeuplngyfhgtp.supabase.co/rest/v1/diagnostic_results?select=id&limit=1" \
  -H "apikey: $SUPABASE_SERVICE_KEY" \
  -H "Authorization: Bearer $SUPABASE_SERVICE_KEY"
# Expected: []
```

**Step 3: Commit**

```bash
git add docs/plans/
git commit -m "docs: add diagnostic v2 implementation plan"
```

---

### Task 2: Install npm Dependencies for Netlify Functions

**Files:**
- Modify: `package.json` (create if not exists at project root)

**Step 1: Initialize package.json and install deps**

```bash
cd /Users/ai2all/Documents/Tech_Projects/French/tef-website
npm init -y 2>/dev/null || true
npm install @anthropic-ai/sdk resend
```

**Step 2: Set environment variables in Netlify**

```bash
npx netlify env:set ANTHROPIC_API_KEY "<user's Anthropic API key>"
npx netlify env:set RESEND_API_KEY "<user's Resend API key>"
```

Note: User must provide these keys. Pause and ask if not available.

**Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: add @anthropic-ai/sdk and resend dependencies"
```

---

## Phase 2: Question Banks

### Task 3: Create Question Bank Files

Create 4 question bank files. Each exports an array of question objects.

**Files:**
- Create: `js/diagnostic/questions-a1.js` (30 questions)
- Create: `js/diagnostic/questions-a2.js` (35 questions)
- Create: `js/diagnostic/questions-b1.js` (40 questions — based on existing 44-question test)
- Create: `js/diagnostic/questions-b2.js` (45 questions)

**Question object format (same across all files):**

```javascript
{
  id: 'a1_grammar_01',       // unique ID: level_section_number
  section: 'grammar',         // grammar | vocabulary | reading | listening
  level: 'a1',               // a1 | a2 | b1 | b2
  topic: 'present_tense',    // specific skill being tested
  question: 'Complétez : Je ___ français.',
  context: null,              // reading passage (null if none)
  audioHint: null,            // listening scenario description (null if none)
  options: ['parle', 'parles', 'parlons', 'parlez'],
  correct: 0,                 // index of correct answer
  explanation: "'Parler' avec 'je' au présent → 'parle'. Les verbes en -er: je parle, tu parles, il/elle parle."
}
```

**Question distribution per test:**

A1 Starter (30 questions):
- Grammar: 8 (present tense, articles, être/avoir, negation, gender, adjective agreement, basic prepositions, imperative)
- Vocabulary: 8 (greetings, numbers, family, food, colors, time, body parts, weather)
- Reading: 7 (signs, menus, simple notes, short messages, basic instructions)
- Listening: 7 (introductions, directions, shopping, simple announcements)

A2 Elementary (35 questions):
- Grammar: 10 (passé composé, imparfait intro, pronouns, comparatives, futur proche, reflexive verbs)
- Vocabulary: 8 (daily life, professions, health, transport, housing, shopping)
- Reading: 8 (advertisements, emails, articles, instructions, forms)
- Listening: 9 (appointments, phone calls, announcements, directions, weather)

B1 Intermediate (40 questions):
- Grammar: 12 (subjonctif, conditionnel, plus-que-parfait, relative pronouns, passive voice, reported speech)
- Vocabulary: 10 (professional, academic, abstract concepts, formal register)
- Reading: 9 (articles, reports, opinion pieces, formal letters)
- Listening: 9 (debates, interviews, radio, workplace conversations)

B2 Advanced (45 questions):
- Grammar: 13 (complex subjunctive, literary tenses, nuanced connectors, double pronouns, advanced passive, concession)
- Vocabulary: 10 (specialized, idiomatic, nuanced synonyms, formal academic, register switching)
- Reading: 11 (academic texts, complex arguments, editorial analysis, legal/admin documents)
- Listening: 11 (conferences, complex debates, academic lectures, nuanced arguments)

**Step 1:** Create `js/diagnostic/` directory and all 4 question files with complete question content.

For B1, redistribute the existing 44 questions (removing A2-level ones, keeping B1/B2) and add new ones to reach 40.

For each question, ensure:
- The correct answer is UNAMBIGUOUSLY correct
- Distractors are plausible but clearly wrong at that level
- Explanation teaches the underlying rule, not just states the answer
- Topic tag is precise for AI analysis
- Reading questions include context passages
- Listening questions include audioHint descriptions

**Step 2: Verify all question files load without errors**

```bash
for f in js/diagnostic/questions-*.js; do node -c "$f" && echo "$f: OK"; done
```

**Step 3: Commit**

```bash
git add js/diagnostic/
git commit -m "feat: add 4-level question banks (A1-B2, 150 questions total)"
```

---

## Phase 3: Test Engine + Selection UI

### Task 4: Create Unified Test Engine

**Files:**
- Create: `js/diagnostic/test-engine.js`

This file provides:
- `TEFDiagnostic.init(level)` — loads question bank, initializes UI
- `TEFDiagnostic.renderQuestion()` — renders current question with navigator
- `TEFDiagnostic.selectAnswer(idx)` — records answer, shows explanation
- `TEFDiagnostic.nextQuestion()` / `previousQuestion()` — navigation
- `TEFDiagnostic.flagQuestion()` — mark for review
- `TEFDiagnostic.submitTest()` — sends answers to server for scoring + AI
- Timer display (elapsed, not countdown)
- Question navigator (sidebar dots)

**Key behaviors:**
- Questions are shown one at a time (like current test)
- After selecting an answer, correct/wrong is shown immediately with explanation
- User can navigate forward/back freely
- "Flag for review" marks questions in the navigator
- Submit button appears after all questions answered (or user can force-submit)
- On submit: POST to `/.netlify/functions/generate-results`
- Show loading animation: "Generating your personalized AI analysis..."
- On response: render results OR show email gate (free users)

```javascript
// js/diagnostic/test-engine.js
const TEFDiagnostic = {
  level: null,
  questions: [],
  answers: [],
  flagged: [],
  currentQ: 0,
  startTime: null,
  timerInterval: null,

  async init(level) { /* ... */ },
  renderQuestion() { /* ... */ },
  renderNavigator() { /* ... */ },
  selectAnswer(idx) { /* ... */ },
  nextQuestion() { /* ... */ },
  previousQuestion() { /* ... */ },
  flagQuestion() { /* ... */ },
  jumpToQuestion(idx) { /* ... */ },
  startTimer() { /* ... */ },
  updateTimer() { /* ... */ },
  getElapsedSeconds() { /* ... */ },
  canSubmit() { /* ... */ },
  async submitTest() { /* ... */ },
  showLoading() { /* ... */ },
  showEmailGate(resultData) { /* ... */ },
  renderResults(resultData) { /* ... */ }
};
```

**Step 1:** Write `test-engine.js` with all methods. The submit function should:

```javascript
async submitTest() {
  this.stopTimer();
  this.showLoading();

  const email = localStorage.getItem('tef_verified_email')
             || localStorage.getItem('tef_lead_email')
             || null;
  const isPremium = !!localStorage.getItem('tef_verified_email');

  const payload = {
    email,
    test_level: this.level,
    answers: this.questions.map((q, i) => ({
      questionId: q.id,
      section: q.section,
      topic: q.topic,
      userAnswer: this.answers[i],
      correct: q.correct,
      isCorrect: this.answers[i] === q.correct,
      question: q.question,
      options: q.options,
      explanation: q.explanation
    })),
    elapsed_seconds: this.getElapsedSeconds(),
    is_premium: isPremium
  };

  try {
    const res = await fetch('/.netlify/functions/generate-results', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();

    if (!email || !isPremium) {
      this.showEmailGate(data);
    } else {
      this.renderResults(data);
    }
  } catch (err) {
    // Fallback: render client-side results without AI
    this.renderFallbackResults();
  }
}
```

**Step 2: Verify syntax**

```bash
node -c js/diagnostic/test-engine.js
```

**Step 3: Commit**

```bash
git add js/diagnostic/test-engine.js
git commit -m "feat: add unified test engine with timer, navigator, and AI submit"
```

---

### Task 5: Redesign diagnostic.html as Test Selection Page

**Files:**
- Modify: `pages/diagnostic.html` (complete rewrite)

**Step 1:** Rewrite `diagnostic.html` to show:
1. Hero section: "TEF Canada Diagnostic Tests"
2. Four level cards (A1/A2/B1/B2) with description, question count, time, and "Start Test" button
3. Optional quick placement quiz (5 questions inline)
4. When a test is started: hide selection, show test engine UI
5. Script tags load the selected question bank + test-engine.js

The page should include:
- `<div id="testSelection">` — the 4 cards
- `<div id="testArea" style="display:none">` — the test engine container
- `<div id="loadingScreen" style="display:none">` — AI loading animation
- `<div id="emailGate" style="display:none">` — email capture for free users
- `<div id="resultsArea" style="display:none">` — full results display

**Card design for each level:**

```html
<div class="level-card" data-level="a1">
  <div class="level-header a1">
    <span class="level-tag">A1</span>
    <h3>Starter</h3>
  </div>
  <p class="level-desc">"Just starting my French journey"</p>
  <div class="level-meta">
    <span>30 questions</span>
    <span>~15 min</span>
  </div>
  <ul class="level-topics">
    <li>Basic grammar & conjugation</li>
    <li>Everyday vocabulary</li>
    <li>Simple reading comprehension</li>
    <li>Basic listening skills</li>
  </ul>
  <button class="btn btn-primary" onclick="startLevel('a1')">Commencer le test →</button>
</div>
```

**Step 2: Verify page loads**

```bash
node -c pages/diagnostic.html  # won't work for HTML, just visually verify
```

**Step 3: Commit**

```bash
git add pages/diagnostic.html
git commit -m "feat: redesign diagnostic as 4-level test selection page"
```

---

## Phase 4: Server-Side Scoring + Claude AI

### Task 6: Create `generate-results` Netlify Function

**Files:**
- Create: `netlify/functions/generate-results.js`

This is the core function that:
1. Receives test answers
2. Scores them server-side
3. Calls Claude Haiku for personalized AI analysis
4. Stores results in `diagnostic_results` table
5. Sends HTML email via Resend
6. Returns full result data to client

```javascript
// netlify/functions/generate-results.js
const Anthropic = require('@anthropic-ai/sdk');
const { Resend } = require('resend');

const SUPABASE_URL = 'https://stntjppzeuplngyfhgtp.supabase.co';

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' };
  if (event.httpMethod !== 'POST') return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };

  const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  const resendKey = process.env.RESEND_API_KEY;

  if (!supabaseKey || !anthropicKey) {
    console.error('[results] Missing env vars');
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Server misconfigured' }) };
  }

  let body;
  try { body = JSON.parse(event.body); }
  catch { return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid JSON' }) }; }

  const { email, test_level, answers, elapsed_seconds, is_premium } = body;

  if (!test_level || !answers || !Array.isArray(answers)) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Missing required fields' }) };
  }

  // --- 1. Score the test ---
  const sectionScores = { grammar: { c: 0, t: 0 }, vocabulary: { c: 0, t: 0 }, reading: { c: 0, t: 0 }, listening: { c: 0, t: 0 } };
  let totalCorrect = 0;
  const wrongAnswers = [];

  answers.forEach(a => {
    const sec = a.section;
    if (sectionScores[sec]) {
      sectionScores[sec].t++;
      if (a.isCorrect) {
        sectionScores[sec].c++;
        totalCorrect++;
      } else {
        wrongAnswers.push({
          questionId: a.questionId,
          section: a.section,
          topic: a.topic,
          question: a.question,
          userAnswer: a.userAnswer >= 0 ? a.options[a.userAnswer] : 'Not answered',
          correctAnswer: a.options[a.correct],
          explanation: a.explanation
        });
      }
    }
  });

  const totalQuestions = answers.length;
  const scorePct = Math.round((totalCorrect / totalQuestions) * 100);

  // Calculate section percentages
  const sectionPcts = {};
  for (const [sec, data] of Object.entries(sectionScores)) {
    sectionPcts[sec] = { score: data.c, total: data.t, pct: data.t > 0 ? Math.round((data.c / data.t) * 100) : 0 };
  }

  // --- 2. Call Claude API for AI analysis ---
  let aiAnalysis = null;
  try {
    const anthropic = new Anthropic({ apiKey: anthropicKey });

    const wrongSummary = wrongAnswers.map(w =>
      `- ${w.questionId} (${w.section}, ${w.topic}): "${w.question}" — chose "${w.userAnswer}" instead of "${w.correctAnswer}". ${w.explanation}`
    ).join('\n');

    const prompt = `You are a TEF Canada exam preparation expert and French language teacher with 20 years of experience.

Analyze this student's diagnostic test results and provide deeply personalized study recommendations.

Test level: ${test_level.toUpperCase()} (${
  test_level === 'a1' ? 'Starter' : test_level === 'a2' ? 'Elementary' : test_level === 'b1' ? 'Intermediate' : 'Advanced'
})
Total score: ${totalCorrect}/${totalQuestions} (${scorePct}%)

Section scores:
- Grammar: ${sectionPcts.grammar.score}/${sectionPcts.grammar.total} (${sectionPcts.grammar.pct}%)
- Vocabulary: ${sectionPcts.vocabulary.score}/${sectionPcts.vocabulary.total} (${sectionPcts.vocabulary.pct}%)
- Reading: ${sectionPcts.reading.score}/${sectionPcts.reading.total} (${sectionPcts.reading.pct}%)
- Listening: ${sectionPcts.listening.score}/${sectionPcts.listening.total} (${sectionPcts.listening.pct}%)

Time taken: ${elapsed_seconds ? Math.round(elapsed_seconds / 60) + ' minutes' : 'unknown'}

Wrong answers (analyze patterns):
${wrongSummary || 'Perfect score — no wrong answers!'}

Provide your analysis in this exact JSON format (no markdown, just raw JSON):
{
  "overall_analysis": "2-3 sentence personalized summary that references specific error patterns you noticed",
  "cefr_assessment": "Precise CEFR sub-level (e.g. A2+, B1-, B1, B1+) with 1-sentence justification",
  "clb_estimate": <number 1-12>,
  "strengths": ["specific strength 1 with evidence", "strength 2", "strength 3"],
  "weaknesses": ["specific weakness 1 with evidence from wrong answers", "weakness 2", "weakness 3"],
  "section_analysis": {
    "grammar": "2-3 sentences analyzing grammar performance, referencing specific topics and error patterns",
    "vocabulary": "2-3 sentences...",
    "reading": "2-3 sentences...",
    "listening": "2-3 sentences..."
  },
  "study_plan": {
    "week1": "Specific focus areas with concrete daily activities for week 1",
    "week2": "Specific focus areas with concrete daily activities for week 2",
    "daily_practice": "Recommended 30-minute daily routine"
  },
  "next_steps": "Which test level to take next and when (be specific)",
  "motivational_note": "Encouraging, personalized 2-sentence message that references their specific results"
}`;

    const response = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1500,
      messages: [{ role: 'user', content: prompt }]
    });

    const aiText = response.content[0].text;
    // Parse JSON — Claude sometimes wraps in ```json
    const jsonStr = aiText.replace(/^```json\s*/, '').replace(/\s*```$/, '').trim();
    aiAnalysis = JSON.parse(jsonStr);
    console.log('[results] AI analysis generated for:', email || 'anonymous');
  } catch (err) {
    console.error('[results] Claude API error:', err.message);
    // Fallback: generate template-based analysis
    aiAnalysis = {
      overall_analysis: `You scored ${scorePct}% on the ${test_level.toUpperCase()} diagnostic test.`,
      cefr_assessment: scorePct >= 85 ? test_level.toUpperCase() + '+' : scorePct >= 60 ? test_level.toUpperCase() : (test_level === 'a1' ? 'A1' : test_level === 'a2' ? 'A1+' : test_level === 'b1' ? 'A2+' : 'B1+'),
      clb_estimate: scorePct >= 85 ? 7 : scorePct >= 70 ? 6 : scorePct >= 50 ? 5 : 4,
      strengths: ['Keep practicing to build on your foundation.'],
      weaknesses: ['Review the topics where you lost points.'],
      section_analysis: { grammar: 'Review grammar fundamentals.', vocabulary: 'Expand vocabulary.', reading: 'Practice reading.', listening: 'Practice listening.' },
      study_plan: { week1: 'Focus on weak sections.', week2: 'Practice full mock tests.', daily_practice: '30 minutes of focused study.' },
      next_steps: 'Retake this test after 2 weeks of study.',
      motivational_note: 'Every step forward counts. Keep going!'
    };
  }

  const cefrResult = aiAnalysis.cefr_assessment;
  const clbEstimate = aiAnalysis.clb_estimate;

  // --- 3. Store in Supabase ---
  let resultId = null;
  if (email) {
    try {
      const insertBody = {
        email: email.toLowerCase().trim(),
        test_level,
        total_score: totalCorrect,
        total_questions: totalQuestions,
        score_pct: scorePct,
        section_scores: sectionPcts,
        answers: answers.map(a => ({ questionId: a.questionId, userAnswer: a.userAnswer, correct: a.correct, isCorrect: a.isCorrect })),
        ai_analysis: aiAnalysis,
        cefr_result: typeof cefrResult === 'string' ? cefrResult : String(cefrResult),
        clb_estimate: typeof clbEstimate === 'number' ? clbEstimate : parseInt(clbEstimate) || 0,
        elapsed_seconds: elapsed_seconds || null,
        is_premium: !!is_premium
      };

      const res = await fetch(`${SUPABASE_URL}/rest/v1/diagnostic_results`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Prefer': 'return=representation'
        },
        body: JSON.stringify(insertBody)
      });

      if (res.ok) {
        const rows = await res.json();
        resultId = rows[0]?.id;
        console.log('[results] Stored result:', resultId);
      } else {
        console.error('[results] Supabase insert error:', res.status, await res.text());
      }
    } catch (err) {
      console.error('[results] Supabase error:', err.message);
    }
  }

  // --- 4. Send HTML email via Resend ---
  let emailSent = false;
  if (email && resendKey) {
    try {
      const resend = new Resend(resendKey);
      const levelNames = { a1: 'A1 Starter', a2: 'A2 Elementary', b1: 'B1 Intermediate', b2: 'B2 Advanced' };

      const htmlEmail = buildEmailHTML({
        email,
        testLevel: levelNames[test_level] || test_level,
        scorePct,
        totalCorrect,
        totalQuestions,
        cefrResult,
        clbEstimate,
        sectionPcts,
        aiAnalysis,
        wrongAnswers,
        isPremium: !!is_premium,
        elapsed_seconds
      });

      await resend.emails.send({
        from: 'TEF Master <results@tef-master.com>',
        to: email,
        subject: `Your TEF Diagnostic Results — ${cefrResult} | ${scorePct}%`,
        html: htmlEmail
      });

      emailSent = true;
      console.log('[results] Email sent to:', email);

      // Update email_sent flag in Supabase
      if (resultId) {
        await fetch(`${SUPABASE_URL}/rest/v1/diagnostic_results?id=eq.${resultId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
            'Prefer': 'return=minimal'
          },
          body: JSON.stringify({ email_sent: true })
        });
      }
    } catch (err) {
      console.error('[results] Email error:', err.message);
    }
  }

  // --- 5. Return result to client ---
  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({
      result_id: resultId,
      scores: sectionPcts,
      total_score: totalCorrect,
      total_questions: totalQuestions,
      score_pct: scorePct,
      ai_analysis: aiAnalysis,
      cefr_result: cefrResult,
      clb_estimate: clbEstimate,
      email_sent: emailSent,
      wrong_answers: wrongAnswers,
      elapsed_seconds
    })
  };
};

// --- HTML Email Builder ---
function buildEmailHTML({ email, testLevel, scorePct, totalCorrect, totalQuestions, cefrResult, clbEstimate, sectionPcts, aiAnalysis, wrongAnswers, isPremium, elapsed_seconds }) {
  const scoreColor = scorePct >= 70 ? '#22c55e' : scorePct >= 50 ? '#f59e0b' : '#ef4444';
  const minutes = elapsed_seconds ? Math.round(elapsed_seconds / 60) : '?';

  const sectionBars = Object.entries(sectionPcts).map(([sec, data]) => {
    const barColor = data.pct >= 70 ? '#22c55e' : data.pct >= 50 ? '#f59e0b' : '#ef4444';
    const secName = sec.charAt(0).toUpperCase() + sec.slice(1);
    return `
      <tr>
        <td style="padding:8px 0;font-size:14px;color:#374151;">${secName}</td>
        <td style="padding:8px 0;width:50%;">
          <div style="background:#e5e7eb;border-radius:8px;height:12px;overflow:hidden;">
            <div style="background:${barColor};height:100%;width:${data.pct}%;border-radius:8px;"></div>
          </div>
        </td>
        <td style="padding:8px 0;text-align:right;font-weight:600;color:${barColor};font-size:14px;">${data.score}/${data.total} (${data.pct}%)</td>
      </tr>`;
  }).join('');

  const strengthsList = (aiAnalysis.strengths || []).map(s => `<li style="padding:4px 0;color:#166534;">✅ ${s}</li>`).join('');
  const weaknessesList = (aiAnalysis.weaknesses || []).map(w => `<li style="padding:4px 0;color:#9a3412;">⚠️ ${w}</li>`).join('');

  const wrongReview = wrongAnswers.slice(0, 15).map(w => `
    <div style="background:#fef2f2;border-left:4px solid #ef4444;padding:12px;border-radius:0 8px 8px 0;margin-bottom:8px;">
      <div style="font-weight:600;color:#1f2937;font-size:14px;margin-bottom:4px;">${w.question}</div>
      <div style="font-size:13px;color:#dc2626;">Your answer: ${w.userAnswer}</div>
      <div style="font-size:13px;color:#16a34a;font-weight:600;">Correct: ${w.correctAnswer}</div>
      <div style="font-size:12px;color:#6b7280;margin-top:4px;">💡 ${w.explanation}</div>
    </div>
  `).join('');

  const ctaUrl = isPremium ? 'https://tef-master.com/pages/progress.html' : 'https://buy.stripe.com/cNi14o6WQ2vO3AxbDg6sw01';
  const ctaText = isPremium ? 'View Your Progress Dashboard →' : 'Get Full TEF Master Access — $9.90';
  const ctaColor = isPremium ? '#2563eb' : '#16a34a';

  return `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
<div style="max-width:600px;margin:0 auto;background:#ffffff;">

  <!-- Header -->
  <div style="background:linear-gradient(135deg,#1a1a2e,#16213e,#0f3460);padding:32px 24px;text-align:center;">
    <div style="font-size:24px;color:#ffffff;font-weight:700;margin-bottom:4px;">🇫🇷 TEF Master</div>
    <div style="color:rgba(255,255,255,0.7);font-size:14px;">Your Diagnostic Test Results</div>
  </div>

  <!-- Score Hero -->
  <div style="padding:32px 24px;text-align:center;border-bottom:1px solid #e5e7eb;">
    <div style="font-size:14px;color:#6b7280;margin-bottom:8px;">${testLevel} Diagnostic</div>
    <div style="width:120px;height:120px;border-radius:50%;background:linear-gradient(135deg,${scoreColor},${scoreColor}dd);margin:0 auto 16px;display:flex;align-items:center;justify-content:center;">
      <span style="font-size:36px;font-weight:800;color:#ffffff;">${scorePct}%</span>
    </div>
    <div style="font-size:14px;color:#6b7280;">${totalCorrect}/${totalQuestions} correct · ${minutes} minutes</div>
    <div style="margin-top:12px;">
      <span style="display:inline-block;padding:6px 20px;border-radius:20px;background:${scoreColor};color:#ffffff;font-weight:700;font-size:18px;">${cefrResult}</span>
    </div>
    <div style="font-size:13px;color:#6b7280;margin-top:8px;">Estimated CLB: ${clbEstimate}</div>
  </div>

  <!-- AI Analysis -->
  <div style="padding:24px;border-bottom:1px solid #e5e7eb;">
    <div style="font-size:12px;color:#6b7280;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;">✨ AI-Powered Analysis</div>
    <p style="font-size:15px;line-height:1.6;color:#1f2937;margin:0;">${aiAnalysis.overall_analysis || ''}</p>
  </div>

  <!-- Strengths & Weaknesses -->
  <div style="padding:24px;border-bottom:1px solid #e5e7eb;">
    <div style="display:flex;gap:24px;">
      <div style="flex:1;">
        <div style="font-weight:600;color:#166534;margin-bottom:8px;">Strengths</div>
        <ul style="list-style:none;padding:0;margin:0;font-size:13px;line-height:1.8;">${strengthsList}</ul>
      </div>
      <div style="flex:1;">
        <div style="font-weight:600;color:#9a3412;margin-bottom:8px;">Areas to Improve</div>
        <ul style="list-style:none;padding:0;margin:0;font-size:13px;line-height:1.8;">${weaknessesList}</ul>
      </div>
    </div>
  </div>

  <!-- Section Breakdown -->
  <div style="padding:24px;border-bottom:1px solid #e5e7eb;">
    <div style="font-weight:600;color:#1f2937;margin-bottom:12px;">Section Breakdown</div>
    <table style="width:100%;border-collapse:collapse;">${sectionBars}</table>
  </div>

  <!-- Section-by-Section AI Analysis -->
  <div style="padding:24px;border-bottom:1px solid #e5e7eb;">
    <div style="font-weight:600;color:#1f2937;margin-bottom:12px;">Detailed Section Analysis</div>
    ${Object.entries(aiAnalysis.section_analysis || {}).map(([sec, text]) => `
      <div style="margin-bottom:12px;">
        <div style="font-weight:600;font-size:14px;color:#374151;text-transform:capitalize;">${sec}</div>
        <p style="font-size:13px;color:#6b7280;line-height:1.6;margin:4px 0 0;">${text}</p>
      </div>
    `).join('')}
  </div>

  <!-- Study Plan -->
  <div style="padding:24px;border-bottom:1px solid #e5e7eb;">
    <div style="font-weight:600;color:#1f2937;margin-bottom:12px;">📅 Your 2-Week Study Plan</div>
    <div style="background:#eff6ff;border-radius:8px;padding:16px;margin-bottom:8px;">
      <div style="font-weight:600;font-size:13px;color:#1e40af;">Week 1</div>
      <p style="font-size:13px;color:#374151;margin:4px 0 0;line-height:1.5;">${aiAnalysis.study_plan?.week1 || ''}</p>
    </div>
    <div style="background:#f0fdf4;border-radius:8px;padding:16px;margin-bottom:8px;">
      <div style="font-weight:600;font-size:13px;color:#166534;">Week 2</div>
      <p style="font-size:13px;color:#374151;margin:4px 0 0;line-height:1.5;">${aiAnalysis.study_plan?.week2 || ''}</p>
    </div>
    <div style="background:#fefce8;border-radius:8px;padding:16px;">
      <div style="font-weight:600;font-size:13px;color:#854d0e;">Daily Practice</div>
      <p style="font-size:13px;color:#374151;margin:4px 0 0;line-height:1.5;">${aiAnalysis.study_plan?.daily_practice || ''}</p>
    </div>
  </div>

  <!-- Wrong Answers Review -->
  ${wrongAnswers.length > 0 ? `
  <div style="padding:24px;border-bottom:1px solid #e5e7eb;">
    <div style="font-weight:600;color:#1f2937;margin-bottom:12px;">📝 Questions to Review (${wrongAnswers.length})</div>
    ${wrongReview}
  </div>` : ''}

  <!-- Motivational Note -->
  <div style="padding:24px;text-align:center;border-bottom:1px solid #e5e7eb;">
    <div style="font-size:24px;margin-bottom:8px;">💪</div>
    <p style="font-size:14px;color:#374151;line-height:1.6;font-style:italic;margin:0;">${aiAnalysis.motivational_note || ''}</p>
  </div>

  <!-- CTA -->
  <div style="padding:32px 24px;text-align:center;">
    <a href="${ctaUrl}" style="display:inline-block;padding:14px 32px;background:${ctaColor};color:#ffffff;text-decoration:none;border-radius:8px;font-weight:600;font-size:16px;">${ctaText}</a>
    <p style="font-size:12px;color:#9ca3af;margin-top:16px;">Next: ${aiAnalysis.next_steps || 'Keep practicing!'}</p>
  </div>

  <!-- Footer -->
  <div style="background:#f9fafb;padding:20px 24px;text-align:center;border-top:1px solid #e5e7eb;">
    <div style="font-size:12px;color:#9ca3af;">© 2026 TEF Master · <a href="https://tef-master.com" style="color:#6b7280;">tef-master.com</a></div>
    <div style="font-size:11px;color:#d1d5db;margin-top:4px;">You received this because you took a diagnostic test on TEF Master.</div>
  </div>

</div>
</body></html>`;
}
```

**Step 2: Verify syntax**

```bash
node -c netlify/functions/generate-results.js
```

**Step 3: Commit**

```bash
git add netlify/functions/generate-results.js
git commit -m "feat: add generate-results function with Claude AI + Resend email"
```

---

### Task 7: Create `get-result` Netlify Function (for cached results)

**Files:**
- Create: `netlify/functions/get-result.js`

```javascript
const SUPABASE_URL = 'https://stntjppzeuplngyfhgtp.supabase.co';

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' };
  if (event.httpMethod !== 'GET') return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };

  const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
  if (!supabaseKey) return { statusCode: 500, headers, body: JSON.stringify({ error: 'Server misconfigured' }) };

  const id = event.queryStringParameters?.id;
  const email = (event.queryStringParameters?.email || '').toLowerCase().trim();

  if (!id || !email) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'id and email required' }) };
  }

  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/diagnostic_results?id=eq.${id}&email=eq.${encodeURIComponent(email)}&select=*&limit=1`,
    { headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` } }
  );

  if (!res.ok) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Database error' }) };
  }

  const rows = await res.json();
  if (rows.length === 0) {
    return { statusCode: 404, headers, body: JSON.stringify({ error: 'Result not found' }) };
  }

  return { statusCode: 200, headers, body: JSON.stringify(rows[0]) };
};
```

**Step 2: Commit**

```bash
git add netlify/functions/get-result.js
git commit -m "feat: add get-result function for cached diagnostic results"
```

---

## Phase 5: Results Page UI

### Task 8: Build Premium Results Renderer

**Files:**
- Create: `js/diagnostic/results-engine.js`

This renders the results page with:
1. Hero score section (animated ring)
2. AI analysis card with sparkle badge
3. Section breakdown cards
4. Study plan cards
5. Question-by-question review with filters
6. Next steps + retake buttons
7. CTA for free users

The `renderResults(data)` function in test-engine.js delegates to this file.

**Step 1:** Write `results-engine.js` with the `TEFResults.render(container, data)` method.

**Step 2: Commit**

```bash
git add js/diagnostic/results-engine.js
git commit -m "feat: add premium results renderer with AI analysis display"
```

---

## Phase 6: User Profile + Sign Out

### Task 9: Add Profile Icon to Nav Bar

**Files:**
- Modify: `js/nav.js`

**Step 1:** Add a profile section to the nav bar rendering:

After the nav-links div, add:

```javascript
// In renderNav(), after the nav-links div
const email = localStorage.getItem('tef_verified_email');
const leadEmail = localStorage.getItem('tef_lead_email');
const currentEmail = email || leadEmail;
const isPremium = !!email;

let profileHTML = '';
if (currentEmail) {
  const initial = currentEmail.charAt(0).toUpperCase();
  profileHTML = `
    <div class="nav-profile">
      <button class="profile-btn" onclick="toggleProfileMenu()">${initial}</button>
      <div class="profile-menu" id="profileMenu">
        <div class="pm-email">${currentEmail}</div>
        <div class="pm-type">${isPremium ? '⭐ Premium Member' : 'Free Account'}</div>
        <div class="pm-divider"></div>
        ${isPremium ? '<a href="' + siteRoot + 'pages/progress.html" class="pm-link">📊 My Progress</a>' : ''}
        ${!isPremium ? '<a href="https://buy.stripe.com/cNi14o6WQ2vO3AxbDg6sw01" class="pm-link pm-upgrade">⭐ Upgrade to Premium</a>' : ''}
        <button class="pm-link pm-signout" onclick="signOut()">🔓 Sign Out</button>
      </div>
    </div>
  `;
} else {
  profileHTML = `<a href="${siteRoot}pages/diagnostic.html" class="nav-signin">Sign In</a>`;
}
```

Add CSS for the profile dropdown and sign out function.

**Step 2:** Add `signOut()` function:

```javascript
function signOut() {
  localStorage.removeItem('tef_verified_email');
  localStorage.removeItem('tef_lead_email');
  // Keep progress in localStorage — can reclaim on re-login via cloud sync
  window.location.href = '/';
}

function toggleProfileMenu() {
  document.getElementById('profileMenu')?.classList.toggle('open');
}
```

**Step 3: Commit**

```bash
git add js/nav.js
git commit -m "feat: add user profile icon + sign out to nav bar"
```

---

## Phase 7: Progress Tab Enhancements

### Task 10: Add Test History to Progress Page

**Files:**
- Modify: `pages/progress.html`

**Step 1:** Add a "Diagnostic Test History" section after existing progress cards.

For premium users:
- Fetch test history from `/.netlify/functions/get-results-history?email=...`
- Display chronological list of tests
- Each shows: test level, date, score, CEFR result, "View Details" link
- "View Details" navigates to `diagnostic.html?result=<id>` which loads cached results

For free users:
- Show locked section: "Upgrade to track your diagnostic history"

**Step 2:** Create `netlify/functions/get-results-history.js`:

```javascript
const SUPABASE_URL = 'https://stntjppzeuplngyfhgtp.supabase.co';

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' };
  if (event.httpMethod !== 'GET') return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };

  const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
  const email = (event.queryStringParameters?.email || '').toLowerCase().trim();

  if (!email) return { statusCode: 400, headers, body: JSON.stringify({ error: 'Email required' }) };

  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/diagnostic_results?email=eq.${encodeURIComponent(email)}&select=id,test_level,total_score,total_questions,score_pct,cefr_result,clb_estimate,elapsed_seconds,created_at&order=created_at.desc&limit=50`,
    { headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` } }
  );

  if (!res.ok) return { statusCode: 500, headers, body: JSON.stringify({ error: 'Database error' }) };

  return { statusCode: 200, headers, body: JSON.stringify(await res.json()) };
};
```

**Step 3: Commit**

```bash
git add pages/progress.html netlify/functions/get-results-history.js
git commit -m "feat: add diagnostic test history to progress page"
```

---

## Phase 8: Deploy + Test

### Task 11: Deploy and End-to-End Testing

**Step 1: Push and deploy**

```bash
git push origin main
npx netlify deploy --prod --dir=.
```

**Step 2: Test each diagnostic level**

For each level (A1, A2, B1, B2):
1. Open `https://tef-master.com/pages/diagnostic.html`
2. Select the test level
3. Answer all questions (verify each correct answer is actually correct)
4. Submit and verify:
   - Loading screen appears
   - AI analysis generates (check Netlify function logs)
   - Results display with personalized analysis
   - Email is sent (check inbox)
   - Result is stored in Supabase `diagnostic_results` table

**Step 3: Test free user flow**

1. Open in incognito (no localStorage)
2. Take A1 test
3. After submit, verify email gate appears
4. Enter test email
5. Verify results unlock + email sent + lead captured

**Step 4: Test premium user flow**

1. Log in with verified email
2. Take any test
3. Verify results show immediately (no gate)
4. Verify email auto-sent
5. Check progress tab — test should appear in history

**Step 5: Test profile + sign out**

1. Verify profile icon shows in nav
2. Click — verify dropdown with email + account type
3. Click "Sign Out" — verify redirect to home
4. Verify progress page shows locked test history for non-logged-in users

**Step 6: Verify all question accuracy**

For each test level, review ALL questions to ensure:
- Every correct answer is truly correct
- No ambiguous questions
- Explanations are accurate and educational
- Difficulty matches the stated CEFR level
- Topics are tagged correctly

**Step 7: Final commit**

```bash
git add -A
git commit -m "chore: final deployment verification"
git push origin main
```
