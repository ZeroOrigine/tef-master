# TEF Master Diagnostic 2.0 — Design Document

**Date:** 2026-03-19
**Status:** Approved
**Philosophy:** Lead Magnet — premium experience for ALL users, zero compromise on quality

---

## Problem

Current diagnostic is a single 44-question test mixing difficulty levels. No test history, no AI analysis, no email reports, no user profile, no sign-out. Free users get the same static recommendations as everyone else. There's no compelling reason for free users to convert to paid.

## Solution

Four CEFR-leveled diagnostic tests (A1/A2/B1/B2), each with Claude AI-powered personalized analysis. Beautiful HTML email reports act as a lead magnet for free users. Full test history and progress tracking for premium users. User profile with sign-out in the nav bar.

---

## 1. Four-Level Diagnostic Tests

### Test Structure

| Test | CEFR | Questions | Sections | Time | Vibe |
|------|------|-----------|----------|------|------|
| Starter | A1 | 30 | Grammar(8), Vocab(8), Reading(7), Listening(7) | ~15 min | Welcoming, encouraging |
| Elementary | A2 | 35 | Grammar(10), Vocab(8), Reading(8), Listening(9) | ~20 min | Confidence-building |
| Intermediate | B1 | 40 | Grammar(12), Vocab(10), Reading(9), Listening(9) | ~25 min | Challenging but fair |
| Advanced | B2 | 45 | Grammar(13), Vocab(10), Reading(11), Listening(11) | ~30 min | TEF-exam realistic |

### Question Format

Every question has:
- `id`: Unique identifier (e.g., `a1_grammar_01`)
- `section`: grammar | vocabulary | reading | listening
- `level`: a1 | a2 | b1 | b2
- `question`: The question text (may include a passage for reading)
- `options`: Array of 4 choices
- `correct`: Index of correct answer (0-3)
- `explanation`: Why the correct answer is correct (shown in review)
- `topic`: Specific grammar/vocab topic (e.g., "present_tense", "articles", "passé_composé")

### Test Selection Page (diagnostic.html)

Redesigned as a beautiful selection screen with 4 cards:

```
+------------------+  +------------------+  +------------------+  +------------------+
|    STARTER       |  |   ELEMENTARY     |  |  INTERMEDIATE    |  |    ADVANCED      |
|       A1         |  |       A2         |  |       B1         |  |       B2         |
|                  |  |                  |  |                  |  |                  |
|  "Just starting  |  |  "I can handle   |  |  "I'm ready for  |  |  "Challenge me   |
|   my journey"    |  |   everyday       |  |   complex French" |  |   with the best" |
|                  |  |   conversations" |  |                  |  |                  |
|  30 questions    |  |  35 questions    |  |  40 questions    |  |  45 questions    |
|  ~15 minutes     |  |  ~20 minutes     |  |  ~25 minutes     |  |  ~30 minutes     |
|                  |  |                  |  |                  |  |                  |
|  [Start Test]    |  |  [Start Test]    |  |  [Start Test]    |  |  [Start Test]    |
+------------------+  +------------------+  +------------------+  +------------------+

               "Not sure which level? Take our 5-question placement quiz"
```

### Quick Placement Quiz (Optional)

5 progressive questions (one per CEFR jump). Based on answers, recommend a test level. This is inline on the diagnostic page — not a separate page.

### Test UI

- Clean, distraction-free test interface
- Progress bar showing question X of Y
- Timer (elapsed time, shown subtly — not a countdown)
- Question navigator sidebar (dots showing answered/unanswered/flagged)
- "Flag for review" button on each question
- Previous/Next navigation
- Section headers ("Grammar — Question 3 of 12")
- Submit button with "Review flagged questions before submitting?" prompt

---

## 2. Claude AI-Powered Analysis

### When It Runs

After test submission, answers are sent to a Netlify function that:
1. Scores the test (server-side, tamper-proof)
2. Calls Claude API (Haiku) with the full context
3. Returns structured AI analysis

### Claude API Prompt Structure

```
System: You are a TEF Canada exam preparation expert and French language teacher.
Analyze this student's diagnostic test results and provide personalized study recommendations.

User:
Test level: B1 (Intermediate)
Total score: 28/40 (70%)

Section scores:
- Grammar: 8/12 (67%)
- Vocabulary: 8/10 (80%)
- Reading: 6/9 (67%)
- Listening: 6/9 (67%)

Wrong answers:
- Q3 (grammar, passé_composé): chose "a mangé" instead of "avait mangé" (plus-que-parfait)
- Q7 (grammar, subjunctive): chose "est" instead of "soit"
- Q11 (grammar, conditional): chose "serait" instead of "aurait été"
- Q14 (grammar, articles): chose "du" instead of "de la"
- Q18 (vocabulary, formal_register): chose "maison" instead of "domicile"
- Q22 (vocabulary, synonyms): chose "content" instead of "ravi"
- Q25 (reading, inference): chose B instead of D
- Q28 (reading, main_idea): chose A instead of C
- Q31 (reading, detail): chose C instead of A
- Q35 (listening, tone): chose "neutral" instead of "persuasive"
- Q38 (listening, number): chose "3" instead of "4"
- Q40 (listening, inference): chose A instead of B

Provide your analysis in this exact JSON format:
{
  "overall_analysis": "2-3 sentence personalized summary",
  "cefr_assessment": "Precise CEFR sub-level with justification",
  "clb_estimate": "Estimated CLB score (1-12)",
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "weaknesses": ["weakness 1", "weakness 2", "weakness 3"],
  "section_analysis": {
    "grammar": "Detailed analysis of grammar performance with specific patterns noticed",
    "vocabulary": "Detailed analysis...",
    "reading": "Detailed analysis...",
    "listening": "Detailed analysis..."
  },
  "study_plan": {
    "week1": "Specific focus areas and activities for week 1",
    "week2": "Specific focus areas and activities for week 2",
    "daily_practice": "Recommended daily routine"
  },
  "next_steps": "What test to take next and when",
  "motivational_note": "Encouraging, personalized message"
}
```

### Cost Control

- Use Claude Haiku (~$0.01-0.02 per analysis)
- Cache results in Supabase — never regenerate for same test attempt
- Rate limit: max 3 AI analyses per email per day

---

## 3. Results Page (Premium Experience for ALL)

### Results Flow

```
Test completed
  → "Generating your personalized AI analysis..." (loading animation)
  → Results page appears (same page, no navigation away)
```

### Results Page Sections (Top to Bottom)

**1. Hero Score Section**
- Large animated score ring (e.g., 70%)
- CEFR level badge (color-coded, prominent)
- CLB estimate
- Test level taken + date
- Elapsed time

**2. AI-Powered Analysis Card** (the star feature)
- Distinct card with subtle AI sparkle icon
- Overall personalized summary
- Strengths (green checks) and Weaknesses (orange flags)
- "Powered by AI" subtle badge

**3. Section Breakdown**
- 4 cards (Grammar, Vocab, Reading, Listening)
- Each shows: score/total, percentage bar, AI analysis for that section
- Color coded: green (>75%), yellow (50-75%), red (<50%)

**4. AI Study Plan**
- Week 1 focus areas
- Week 2 focus areas
- Daily practice routine
- Direct links to relevant TEF Master sections

**5. Question-by-Question Review**
- Expandable accordion
- Filter: All | Wrong | Correct | By Section
- Each question shows: question text, user answer, correct answer, explanation
- Wrong answers highlighted in red, correct in green

**6. Next Steps Card**
- AI recommendation on which test to take next
- "Retake This Test" button
- "Try [recommended level]" button
- Motivational note from AI

**7. Email Report CTA (for free users who haven't entered email)**
- "Get this report emailed to you + unlock study recommendations"
- Email input + Submit
- For premium users: "Report sent to your email!" (auto-sent)

**8. Upgrade CTA (free users only)**
- "Unlock full TEF Master — all grammar, vocabulary, reading & listening modules"
- Styled as value proposition, not hard sell

---

## 4. Email Report (Lead Magnet)

### Technology: Resend

- Free tier: 100 emails/day, 3000/month
- API: simple POST with HTML body
- Env var: `RESEND_API_KEY`
- From address: `results@tef-master.com` (or `noreply@tef-master.com`)
- Requires DNS verification (add to domain settings)

### Email Template

Premium HTML email, mobile-responsive, branded:

```
Subject: Your TEF Diagnostic Results — [CEFR Level] | [Score]%

FROM: TEF Master <results@tef-master.com>

BODY:
┌────────────────────────────────────────────┐
│  TEF MASTER logo                           │
│                                            │
│  Your [A2 Elementary] Diagnostic Results   │
│  Taken on March 19, 2026                   │
│                                            │
│  ┌─────────────────────────────────────┐   │
│  │  Overall Score: 28/35 (80%)        │   │
│  │  CEFR Level: A2+                   │   │
│  │  Estimated CLB: 4                  │   │
│  │  Time: 18 minutes                  │   │
│  └─────────────────────────────────────┘   │
│                                            │
│  --- AI Analysis ---                       │
│  [Full personalized analysis]              │
│                                            │
│  --- Your Strengths ---                    │
│  ✅ Strong everyday vocabulary             │
│  ✅ Good basic grammar foundation          │
│  ✅ Solid reading comprehension            │
│                                            │
│  --- Areas to Improve ---                  │
│  ⚠️ Past tense conjugation patterns       │
│  ⚠️ Listening comprehension speed          │
│  ⚠️ Formal vs informal register           │
│                                            │
│  --- Section Breakdown ---                 │
│  Grammar:    ████████░░ 8/10 (80%)        │
│  Vocabulary: █████████░ 9/10 (90%)        │
│  Reading:    ██████░░░░ 6/8  (75%)        │
│  Listening:  █████░░░░░ 5/7  (71%)        │
│                                            │
│  --- Your 2-Week Study Plan ---            │
│  Week 1: [AI-generated plan]               │
│  Week 2: [AI-generated plan]               │
│  Daily: [AI-generated routine]             │
│                                            │
│  --- Question Review ---                   │
│  [Each wrong answer with explanation]      │
│                                            │
│  ┌─────────────────────────────────────┐   │
│  │  Ready to master TEF?               │   │
│  │  [Get Full Access — $9.90]          │   │
│  │  Grammar • Vocabulary • Reading     │   │
│  │  Listening • Conversations • More   │   │
│  └─────────────────────────────────────┘   │
│                                            │
│  © 2026 TEF Master | tef-master.com        │
└────────────────────────────────────────────┘
```

### Lead Magnet Flow (Free Users)

1. User completes test
2. AI analysis generates in background
3. Results page shows WITH a translucent overlay on the bottom half:
   - Score + CEFR level visible (teaser)
   - AI summary first 2 lines visible
   - Rest blurred with email gate:
     "Enter your email to see your full AI analysis, study plan, and get this report emailed to you"
4. User enters email → immediately:
   - Full results page unlocks (no reload, smooth animation)
   - Email sent with complete report
   - Lead captured in Supabase (`leads` table + `capture-lead` function)
5. Even free results are BEAUTIFUL — this is the lead magnet

### Premium User Flow

1. User completes test
2. Full results displayed immediately (no gate)
3. Email auto-sent to their verified email
4. Results saved to Supabase progress
5. Accessible from Progress tab anytime

---

## 5. User Profile & Sign Out

### Nav Bar Profile Icon

Position: Right side of nav bar, after last nav link.

**Logged in (premium):**
```
[J] ▼
├── Jagdish
├── cajagdishlade@gmail.com
├── ⭐ Premium Member
├── ────────────────
├── 📊 My Progress
├── 🔓 Sign Out
└──
```

**Logged in (free/lead):**
```
[C] ▼
├── catchjagdish@gmail.com
├── Free Account
├── ────────────────
├── ⭐ Upgrade to Premium
├── 🔓 Sign Out
└──
```

**Not logged in:**
```
[Sign In] button
```

### Sign Out Behavior

1. Clear `tef_verified_email` from localStorage
2. Clear `tef_lead_email` from localStorage
3. Keep `tef_master_progress` in localStorage (they can reclaim on re-login via cloud sync)
4. Redirect to home page
5. Show brief toast: "Signed out. Your progress is saved in the cloud."

### Profile Data (stored in user_progress table)

Add `display_name` field (already exists in schema). First time premium user logs in, show a one-time "Welcome! What should we call you?" prompt.

---

## 6. Progress Tab Enhancements

### New "Test History" Section

Added below the existing progress cards:

```
┌──────────────────────────────────────────────────────────────┐
│  📋 Diagnostic Test History                                  │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  B1 Intermediate  │  Mar 19  │  70%  │  B1-  │ View → │  │
│  ├────────────────────────────────────────────────────────┤  │
│  │  A2 Elementary     │  Mar 15  │  85%  │  A2+  │ View → │  │
│  ├────────────────────────────────────────────────────────┤  │
│  │  A1 Starter        │  Mar 10  │  93%  │  A1+  │ View → │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│  📈 Progress Chart (line graph of scores over time)          │
│                                                              │
│  [Take Another Test →]                                       │
└──────────────────────────────────────────────────────────────┘
```

**"View" link:** Opens a modal or navigates to `/pages/diagnostic-results.html?id=<result_id>` showing the full cached results page with AI analysis.

**Free users see:** Locked section with "Upgrade to track all your test history and progress."

---

## 7. Database Schema Changes

### New Table: `diagnostic_results`

| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK, gen_random_uuid() |
| email | TEXT | NOT NULL |
| test_level | TEXT | NOT NULL (a1, a2, b1, b2) |
| total_score | INT | NOT NULL |
| total_questions | INT | NOT NULL |
| section_scores | JSONB | {grammar: {score, total}, vocab: {...}, ...} |
| answers | JSONB | [{questionId, userAnswer, correct, isCorrect}] |
| ai_analysis | JSONB | Full Claude response (cached) |
| cefr_result | TEXT | AI-assessed CEFR sub-level |
| clb_estimate | INT | 1-12 |
| elapsed_seconds | INT | How long the test took |
| email_sent | BOOLEAN | DEFAULT false |
| is_premium | BOOLEAN | Was user premium at time of test |
| created_at | TIMESTAMPTZ | DEFAULT now() |

### Modified Table: `user_progress`

No schema change needed — `progress_data.diagnostic.scores` already stores an array. We'll enrich each entry to reference the `diagnostic_results.id`.

---

## 8. New Netlify Functions

### `generate-results.js` (POST)

Input: `{ email, test_level, answers, elapsed_seconds }`

1. Score the test server-side (compare answers to correct answers)
2. Call Claude API (Haiku) with scoring data → get AI analysis
3. Store in `diagnostic_results` table
4. Send HTML email via Resend
5. If premium user: update `user_progress` via existing sync mechanism
6. If free user: capture lead via existing `capture-lead` mechanism
7. Return: `{ result_id, scores, ai_analysis, cefr_result, clb_estimate }`

### `get-result.js` (GET)

Input: `?id=<result_id>&email=<email>`

1. Verify email matches the result owner
2. Return cached result from Supabase (never re-runs AI)

---

## 9. Question Bank Architecture

### File Structure

```
js/
  diagnostic/
    questions-a1.js   — 30 questions
    questions-a2.js   — 35 questions
    questions-b1.js   — 40 questions (based on existing 44 Q)
    questions-b2.js   — 45 questions
    test-engine.js    — Test UI logic (timer, navigator, scoring)
    results-engine.js — Results page rendering
```

### Question Quality Standards

- Every question has a clear, unambiguous correct answer
- Distractors (wrong options) are plausible but clearly wrong to someone at that level
- Reading passages are authentic-feeling French text
- Listening questions note "(Audio: ...)" for context even without actual audio
- Explanations teach, not just state the answer
- Topics tagged precisely for AI analysis

---

## 10. Implementation Priority

| Phase | What | Why First |
|-------|------|-----------|
| 1 | Question banks (A1-B2) + test engine + test selection page | Foundation — nothing works without questions |
| 2 | generate-results function + Claude AI integration | Core value — the AI analysis |
| 3 | Results page (premium UI) | What users see |
| 4 | Email system (Resend) + lead magnet flow | Conversion engine |
| 5 | User profile + sign out + nav changes | Polish |
| 6 | Progress tab enhancements + test history | Retention |
| 7 | Testing + QA all 4 test levels | Quality assurance |
