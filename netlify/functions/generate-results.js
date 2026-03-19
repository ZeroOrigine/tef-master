const Anthropic = require('@anthropic-ai/sdk');
const { Resend } = require('resend');

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
const SUPABASE_URL = 'https://stntjppzeuplngyfhgtp.supabase.co';
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json',
};

const LEVEL_NAMES = {
  a1: 'A1 — Beginner',
  a2: 'A2 — Elementary',
  b1: 'B1 — Intermediate',
  b2: 'B2 — Upper Intermediate',
  c1: 'C1 — Advanced',
  c2: 'C2 — Mastery',
};

const SECTION_LABELS = {
  grammar: 'Grammar & Structure',
  vocabulary: 'Vocabulary',
  reading: 'Reading Comprehension',
  listening: 'Listening Comprehension',
};

// ---------------------------------------------------------------------------
// Helper: JSON response
// ---------------------------------------------------------------------------
function respond(statusCode, body) {
  return { statusCode, headers: CORS_HEADERS, body: JSON.stringify(body) };
}

// ---------------------------------------------------------------------------
// 1. Score the test
// ---------------------------------------------------------------------------
function scoreTest(answers) {
  const sections = {};
  const wrongAnswers = [];

  for (const a of answers) {
    const sec = a.section || 'other';
    if (!sections[sec]) sections[sec] = { score: 0, total: 0 };
    sections[sec].total += 1;
    if (a.isCorrect) {
      sections[sec].score += 1;
    } else {
      wrongAnswers.push({
        questionId: a.questionId,
        section: sec,
        topic: a.topic || '',
        question: a.question || '',
        userAnswer:
          typeof a.userAnswer === 'number' && a.options
            ? a.options[a.userAnswer] || String(a.userAnswer)
            : String(a.userAnswer),
        correctAnswer:
          typeof a.correct === 'number' && a.options
            ? a.options[a.correct] || String(a.correct)
            : String(a.correct),
        explanation: a.explanation || '',
      });
    }
  }

  // Calculate percentages
  const sectionScores = {};
  let totalScore = 0;
  let totalQuestions = 0;
  for (const [sec, data] of Object.entries(sections)) {
    const pct = data.total > 0 ? Math.round((data.score / data.total) * 100) : 0;
    sectionScores[sec] = { score: data.score, total: data.total, pct };
    totalScore += data.score;
    totalQuestions += data.total;
  }

  const scorePct = totalQuestions > 0 ? Math.round((totalScore / totalQuestions) * 100) : 0;

  return { sectionScores, totalScore, totalQuestions, scorePct, wrongAnswers };
}

// ---------------------------------------------------------------------------
// 2. Determine CEFR & CLB
// ---------------------------------------------------------------------------
function determineCefrAndClb(testLevel, scorePct) {
  const levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
  const baseIndex = levels.indexOf(testLevel.toUpperCase());
  const base = baseIndex >= 0 ? baseIndex : 2; // default B1

  let cefrIndex;
  if (scorePct >= 85) cefrIndex = Math.min(base + 1, 5);
  else if (scorePct >= 60) cefrIndex = base;
  else if (scorePct >= 40) cefrIndex = Math.max(base - 1, 0);
  else cefrIndex = Math.max(base - 2, 0);

  const cefr = levels[cefrIndex];

  // CLB mapping
  const clbMap = { A1: 2, A2: 4, B1: 6, B2: 8, C1: 10, C2: 12 };
  let clb = clbMap[cefr] || 6;
  // Fine-tune CLB within range
  if (scorePct >= 80) clb = Math.min(clb + 1, 12);
  else if (scorePct < 50) clb = Math.max(clb - 1, 1);

  return { cefr, clb };
}

// ---------------------------------------------------------------------------
// 3. Claude AI analysis
// ---------------------------------------------------------------------------
async function getAiAnalysis(testLevel, sectionScores, totalScore, totalQuestions, scorePct, wrongAnswers, elapsedSeconds, cefr, clb, isPremium) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.log('[results] No ANTHROPIC_API_KEY — using fallback analysis');
    return buildFallbackAnalysis(testLevel, sectionScores, scorePct, wrongAnswers, cefr, clb);
  }

  const client = new Anthropic({ apiKey });

  const wrongBySection = {};
  for (const w of wrongAnswers) {
    if (!wrongBySection[w.section]) wrongBySection[w.section] = [];
    wrongBySection[w.section].push(w);
  }

  const wrongSummary = Object.entries(wrongBySection)
    .map(([sec, items]) => {
      const details = items
        .map((w) => `  - Topic: ${w.topic} | Question: "${w.question}" | Chose: "${w.userAnswer}" | Correct: "${w.correctAnswer}"`)
        .join('\n');
      return `${SECTION_LABELS[sec] || sec} (${items.length} errors):\n${details}`;
    })
    .join('\n\n');

  const sectionSummary = Object.entries(sectionScores)
    .map(([sec, d]) => `- ${SECTION_LABELS[sec] || sec}: ${d.score}/${d.total} (${d.pct}%)`)
    .join('\n');

  const minutes = Math.floor(elapsedSeconds / 60);
  const seconds = elapsedSeconds % 60;

  const prompt = `You are an expert TEF Canada exam tutor and French language assessment specialist.

A student just completed a TEF diagnostic test. Analyze their results and provide actionable feedback.

## Test Information
- Test Level: ${testLevel.toUpperCase()} (${LEVEL_NAMES[testLevel] || testLevel})
- Total Score: ${totalScore}/${totalQuestions} (${scorePct}%)
- Time Taken: ${minutes}m ${seconds}s
- CEFR Assessment: ${cefr}
- CLB Estimate: ${clb}

## Section Scores
${sectionSummary}

## Wrong Answers Detail
${wrongSummary || 'No wrong answers — perfect score!'}

## Instructions
Return a JSON object with EXACTLY this structure (no markdown, no code fences, just raw JSON):
{
  "overall_analysis": "2-3 sentences summarizing performance, mentioning specific strengths and the most critical area to improve.",
  "cefr_assessment": "1-2 sentences explaining what their CEFR level means for TEF Canada and how close they are to the next level.",
  "clb_estimate": ${clb},
  "strengths": ["strength 1 with specific detail", "strength 2", "strength 3"],
  "weaknesses": ["weakness 1 with specific grammar/vocab topic", "weakness 2", "weakness 3"],
  "section_analysis": {
    "grammar": "2-3 sentences analyzing grammar performance with specific topics to review (subjonctif, conditionals, etc.)",
    "vocabulary": "2-3 sentences analyzing vocabulary with specific thematic areas",
    "reading": "2-3 sentences analyzing reading comprehension strategies",
    "listening": "2-3 sentences analyzing listening comprehension patterns"
  },
  "study_plan": {
    "week1": "Specific focus and exercises for week 1",
    "week2": "Specific focus and exercises for week 2",
    "daily_practice": "Daily routine recommendation (15-30 min)"
  },
  "next_steps": "2-3 sentences on concrete next steps to improve their TEF score.",
  "motivational_note": "1-2 encouraging sentences personalized to their level and performance."
}

Be specific. Reference actual topics from their wrong answers. Tailor advice to TEF Canada exam format. Write in English.`;

  // Use Haiku for all users — fast enough for Netlify's 10s free-tier timeout
  // Still produces excellent, personalized analysis at ~$0.002/test
  // Upgrade to Sonnet when on Netlify Pro (26s timeout)
  const aiModel = 'claude-haiku-4-5-20251001';
  console.log('[results] Using AI model:', aiModel, isPremium ? '(premium)' : '(free)');

  try {
    const message = await client.messages.create({
      model: aiModel,
      max_tokens: 2000,
      messages: [{ role: 'user', content: prompt }],
    });

    const text = message.content[0]?.text || '';
    console.log('[results] Claude response length:', text.length);

    // Try to parse JSON — handle possible markdown fencing
    let cleaned = text.trim();
    if (cleaned.startsWith('```')) {
      cleaned = cleaned.replace(/^```(?:json)?\s*/, '').replace(/\s*```$/, '');
    }

    try {
      const parsed = JSON.parse(cleaned);
      return parsed;
    } catch (parseErr) {
      console.error('[results] Failed to parse Claude JSON:', parseErr.message);
      console.error('[results] Raw text:', cleaned.substring(0, 500));
      return buildFallbackAnalysis(testLevel, sectionScores, scorePct, wrongAnswers, cefr, clb);
    }
  } catch (apiErr) {
    console.error('[results] Claude API error:', apiErr.message);
    return buildFallbackAnalysis(testLevel, sectionScores, scorePct, wrongAnswers, cefr, clb);
  }
}

// ---------------------------------------------------------------------------
// Fallback analysis (no API)
// ---------------------------------------------------------------------------
function buildFallbackAnalysis(testLevel, sectionScores, scorePct, wrongAnswers, cefr, clb) {
  console.log('[results] Using template-based fallback analysis');

  const best = Object.entries(sectionScores).sort((a, b) => b[1].pct - a[1].pct);
  const strongest = best[0] ? best[0][0] : 'grammar';
  const weakest = best.length > 1 ? best[best.length - 1][0] : 'vocabulary';

  const weakTopics = [...new Set(wrongAnswers.map((w) => w.topic).filter(Boolean))].slice(0, 5);

  const sectionAnalysis = {};
  for (const sec of ['grammar', 'vocabulary', 'reading', 'listening']) {
    const d = sectionScores[sec];
    if (!d) {
      sectionAnalysis[sec] = `No ${sec} questions were included in this diagnostic.`;
      continue;
    }
    if (d.pct >= 80) {
      sectionAnalysis[sec] = `Strong performance in ${SECTION_LABELS[sec]} at ${d.pct}%. Continue reinforcing these skills with practice tests.`;
    } else if (d.pct >= 60) {
      sectionAnalysis[sec] = `Solid foundation in ${SECTION_LABELS[sec]} at ${d.pct}%. Focus on the topics where errors occurred to push above 80%.`;
    } else {
      sectionAnalysis[sec] = `${SECTION_LABELS[sec]} needs significant attention at ${d.pct}%. Dedicate extra study time to this area with targeted exercises.`;
    }
  }

  return {
    overall_analysis: `You scored ${scorePct}% on the ${testLevel.toUpperCase()} diagnostic, placing you at CEFR ${cefr} (CLB ${clb}). Your strongest area is ${SECTION_LABELS[strongest] || strongest}, while ${SECTION_LABELS[weakest] || weakest} needs the most improvement.`,
    cefr_assessment: `Your current level is ${cefr}, which corresponds to CLB ${clb} for Canadian immigration purposes. ${scorePct >= 70 ? 'You are making good progress toward the next level.' : 'With focused study, you can advance to the next CEFR level.'}`,
    clb_estimate: clb,
    strengths: [
      `${SECTION_LABELS[strongest] || strongest} — your highest-scoring section`,
      scorePct >= 60 ? 'Good foundational knowledge of French at this level' : 'Willingness to assess your current level',
      'Completing the full diagnostic shows commitment to improvement',
    ],
    weaknesses: [
      `${SECTION_LABELS[weakest] || weakest} — focus your study here`,
      weakTopics.length > 0 ? `Topics to review: ${weakTopics.join(', ')}` : 'Review all incorrect answers carefully',
      scorePct < 60 ? 'Core concepts at this level need reinforcement' : 'Fine-tuning advanced concepts will boost your score',
    ],
    section_analysis: sectionAnalysis,
    study_plan: {
      week1: `Focus on ${SECTION_LABELS[weakest] || weakest}. Review all incorrect answers and study the underlying rules. Practice with 20 targeted exercises daily.`,
      week2: `Consolidate ${SECTION_LABELS[strongest] || strongest} while continuing ${weakest} practice. Take a mini practice test mid-week to measure progress.`,
      daily_practice: 'Spend 20-30 minutes daily: 10 min reviewing vocabulary, 10 min grammar exercises, 10 min reading or listening practice.',
    },
    next_steps: `Retake this diagnostic after 2 weeks of focused study to measure your improvement. Target the specific topics listed in your weaknesses. Consider upgrading to premium for full-length practice tests with detailed explanations.`,
    motivational_note: `Every expert was once a beginner. By taking this diagnostic, you have already taken the most important step. Keep practicing consistently and you will see results!`,
  };
}

// ---------------------------------------------------------------------------
// 4. Store in Supabase
// ---------------------------------------------------------------------------
async function storeResult(data) {
  const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;
  if (!SUPABASE_KEY) {
    console.error('[results] Missing SUPABASE_SERVICE_KEY');
    return null;
  }

  const row = {
    email: data.email || 'anonymous',
    test_level: data.test_level,
    total_score: data.total_score,
    total_questions: data.total_questions,
    score_pct: data.score_pct,
    section_scores: data.section_scores,
    answers: data.answers,
    ai_analysis: data.ai_analysis,
    cefr_result: data.cefr_result,
    clb_estimate: data.clb_estimate,
    elapsed_seconds: data.elapsed_seconds,
    email_sent: data.email_sent || false,
    is_premium: data.is_premium || false,
  };

  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/diagnostic_results`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        Prefer: 'return=representation',
      },
      body: JSON.stringify(row),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error('[results] Supabase insert error:', res.status, errText);
      return null;
    }

    const rows = await res.json();
    const id = Array.isArray(rows) && rows[0] ? rows[0].id : null;
    console.log('[results] Stored result:', id);
    return id;
  } catch (err) {
    console.error('[results] Supabase error:', err.message);
    return null;
  }
}

// ---------------------------------------------------------------------------
// 5. Build email HTML
// ---------------------------------------------------------------------------
function buildEmailHtml({ scorePct, cefr, clb, sectionScores, aiAnalysis, wrongAnswers, testLevel, totalScore, totalQuestions, isPremium, elapsedSeconds }) {
  const levelName = LEVEL_NAMES[testLevel] || testLevel.toUpperCase();
  const minutes = Math.floor(elapsedSeconds / 60);
  const seconds = elapsedSeconds % 60;
  const timeStr = `${minutes}m ${seconds}s`;

  // Score ring CSS: using a conic-gradient trick
  const scoreColor = scorePct >= 80 ? '#10b981' : scorePct >= 60 ? '#f59e0b' : '#ef4444';
  const scoreLabel = scorePct >= 80 ? 'Excellent' : scorePct >= 60 ? 'Good' : 'Needs Work';

  const cefrColor = { A1: '#ef4444', A2: '#f97316', B1: '#f59e0b', B2: '#3b82f6', C1: '#8b5cf6', C2: '#10b981' }[cefr] || '#3b82f6';

  // Section bar helper
  function sectionBar(label, data) {
    if (!data) return '';
    const barColor = data.pct >= 80 ? '#10b981' : data.pct >= 60 ? '#f59e0b' : '#ef4444';
    return `
      <tr>
        <td style="padding: 12px 0; border-bottom: 1px solid #f1f5f9;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 14px; color: #334155; font-weight: 600; padding-bottom: 6px;">
                ${label}
              </td>
              <td align="right" style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 14px; color: #64748b; padding-bottom: 6px;">
                ${data.score}/${data.total} &mdash; ${data.pct}%
              </td>
            </tr>
            <tr>
              <td colspan="2">
                <table width="100%" cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td style="background: #f1f5f9; border-radius: 4px; height: 8px;">
                      <table width="${data.pct}%" cellpadding="0" cellspacing="0" border="0">
                        <tr>
                          <td style="background: ${barColor}; border-radius: 4px; height: 8px;"></td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </td>
      </tr>`;
  }

  // Strengths list
  const strengths = (aiAnalysis.strengths || [])
    .map(
      (s) => `
      <tr>
        <td style="padding: 6px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 14px; color: #334155;">
          <span style="display: inline-block; width: 8px; height: 8px; background: #10b981; border-radius: 50%; margin-right: 10px;"></span>
          ${escapeHtml(s)}
        </td>
      </tr>`
    )
    .join('');

  // Weaknesses list
  const weaknesses = (aiAnalysis.weaknesses || [])
    .map(
      (w) => `
      <tr>
        <td style="padding: 6px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 14px; color: #334155;">
          <span style="display: inline-block; width: 8px; height: 8px; background: #f59e0b; border-radius: 50%; margin-right: 10px;"></span>
          ${escapeHtml(w)}
        </td>
      </tr>`
    )
    .join('');

  // Section analysis
  const sectionAnalysisRows = Object.entries(aiAnalysis.section_analysis || {})
    .map(
      ([sec, text]) => `
      <tr>
        <td style="padding: 16px; background: #f8fafc; border-radius: 8px; margin-bottom: 8px;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 15px; font-weight: 700; color: #1e293b; padding-bottom: 6px;">
                ${SECTION_LABELS[sec] || sec}
              </td>
            </tr>
            <tr>
              <td style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 14px; color: #475569; line-height: 1.6;">
                ${escapeHtml(text)}
              </td>
            </tr>
          </table>
        </td>
      </tr>
      <tr><td style="height: 8px;"></td></tr>`
    )
    .join('');

  // Study plan
  const studyPlan = aiAnalysis.study_plan || {};
  function studyCard(title, icon, text) {
    return `
      <tr>
        <td style="padding: 16px; background: linear-gradient(135deg, #eff6ff, #f0fdf4); border: 1px solid #e2e8f0; border-radius: 10px;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 13px; font-weight: 700; color: #3b82f6; text-transform: uppercase; letter-spacing: 0.5px; padding-bottom: 4px;">
                ${icon} ${escapeHtml(title)}
              </td>
            </tr>
            <tr>
              <td style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 14px; color: #334155; line-height: 1.6;">
                ${escapeHtml(text || '')}
              </td>
            </tr>
          </table>
        </td>
      </tr>
      <tr><td style="height: 10px;"></td></tr>`;
  }

  // Wrong answers (up to 15)
  const wrongSlice = wrongAnswers.slice(0, 15);
  const wrongRows = wrongSlice
    .map(
      (w, i) => `
      <tr>
        <td style="padding: 14px 16px; ${i < wrongSlice.length - 1 ? 'border-bottom: 1px solid #f1f5f9;' : ''}">
          <table width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; padding-bottom: 4px;">
                ${escapeHtml((SECTION_LABELS[w.section] || w.section))}${w.topic ? ' / ' + escapeHtml(w.topic) : ''}
              </td>
            </tr>
            <tr>
              <td style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 14px; color: #1e293b; font-weight: 600; padding-bottom: 8px; line-height: 1.4;">
                ${escapeHtml(w.question)}
              </td>
            </tr>
            <tr>
              <td>
                <table cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td style="background: #fef2f2; color: #dc2626; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 13px; padding: 4px 10px; border-radius: 4px; font-weight: 600;">
                      Your answer: ${escapeHtml(w.userAnswer)}
                    </td>
                    <td style="width: 8px;"></td>
                    <td style="background: #f0fdf4; color: #16a34a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 13px; padding: 4px 10px; border-radius: 4px; font-weight: 600;">
                      Correct: ${escapeHtml(w.correctAnswer)}
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            ${
              w.explanation
                ? `<tr>
              <td style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 13px; color: #64748b; padding-top: 8px; line-height: 1.5; font-style: italic;">
                ${escapeHtml(w.explanation)}
              </td>
            </tr>`
                : ''
            }
          </table>
        </td>
      </tr>`
    )
    .join('');

  // CTA
  const ctaUrl = isPremium ? 'https://tef-master.com/dashboard' : 'https://tef-master.com/pricing';
  const ctaText = isPremium ? 'View Progress Dashboard' : 'Get Full Access — $39';
  const ctaSubtext = isPremium ? 'Track your improvement over time' : 'Unlock full practice tests, detailed explanations & progress tracking';

  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="x-apple-disable-message-reformatting">
  <title>Your TEF Diagnostic Results</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:AllowPNG/>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <style>
    body, table, td { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
    body { margin: 0; padding: 0; background-color: #f1f5f9; }
    img { border: 0; display: block; }
    @media only screen and (max-width: 600px) {
      .container { width: 100% !important; }
      .mobile-padding { padding: 20px 16px !important; }
      .score-number { font-size: 56px !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9;">
  <!-- Preheader -->
  <div style="display: none; max-height: 0; overflow: hidden; font-size: 1px; line-height: 1px; color: #f1f5f9;">
    You scored ${scorePct}% (${cefr} / CLB ${clb}) on your TEF ${testLevel.toUpperCase()} diagnostic. See your AI-powered analysis inside.
  </div>

  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f1f5f9;">
    <tr>
      <td align="center" style="padding: 24px 16px;">

        <!-- Main container -->
        <table class="container" width="600" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.06);">

          <!-- ===== HEADER ===== -->
          <tr>
            <td style="background: linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%); padding: 32px 40px; text-align: center;" class="mobile-padding">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center" style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 28px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px;">
                    TEF Master
                  </td>
                </tr>
                <tr>
                  <td align="center" style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 13px; color: rgba(255,255,255,0.7); padding-top: 4px; letter-spacing: 1.5px; text-transform: uppercase;">
                    Diagnostic Results
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ===== SCORE HERO ===== -->
          <tr>
            <td style="padding: 40px 40px 32px; text-align: center; background: linear-gradient(180deg, #f8fafc 0%, #ffffff 100%);" class="mobile-padding">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center" style="padding-bottom: 16px;">
                    <table cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="width: 140px; height: 140px; border-radius: 50%; background: conic-gradient(${scoreColor} ${scorePct * 3.6}deg, #e2e8f0 0deg); text-align: center; vertical-align: middle;">
                          <table width="120" height="120" cellpadding="0" cellspacing="0" border="0" align="center">
                            <tr>
                              <td style="background: #ffffff; border-radius: 50%; text-align: center; vertical-align: middle;">
                                <span class="score-number" style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 44px; font-weight: 800; color: ${scoreColor}; display: block; line-height: 1;">${scorePct}</span>
                                <span style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 16px; color: ${scoreColor}; font-weight: 600;">%</span>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding-bottom: 6px;">
                    <span style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 14px; font-weight: 700; color: ${scoreColor}; text-transform: uppercase; letter-spacing: 1px;">${scoreLabel}</span>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 15px; color: #64748b; padding-bottom: 20px;">
                    ${totalScore} of ${totalQuestions} correct &bull; ${timeStr} &bull; ${levelName}
                  </td>
                </tr>
                <!-- Badges row -->
                <tr>
                  <td align="center">
                    <table cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="background: ${cefrColor}; color: #ffffff; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 18px; font-weight: 800; padding: 10px 24px; border-radius: 8px; letter-spacing: 0.5px;">
                          CEFR ${cefr}
                        </td>
                        <td style="width: 12px;"></td>
                        <td style="background: #1e293b; color: #ffffff; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 18px; font-weight: 800; padding: 10px 24px; border-radius: 8px; letter-spacing: 0.5px;">
                          CLB ${clb}
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ===== AI ANALYSIS SUMMARY ===== -->
          <tr>
            <td style="padding: 0 40px 32px;" class="mobile-padding">
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background: linear-gradient(135deg, #eff6ff, #faf5ff); border-radius: 12px; border: 1px solid #e0e7ff;">
                <tr>
                  <td style="padding: 24px;">
                    <table width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 13px; font-weight: 700; color: #6366f1; text-transform: uppercase; letter-spacing: 1px; padding-bottom: 8px;">
                          AI-Powered Analysis
                        </td>
                      </tr>
                      <tr>
                        <td style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 15px; color: #334155; line-height: 1.7;">
                          ${escapeHtml(aiAnalysis.overall_analysis || '')}
                        </td>
                      </tr>
                      <tr>
                        <td style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 14px; color: #475569; line-height: 1.6; padding-top: 12px; border-top: 1px solid rgba(99,102,241,0.15); margin-top: 12px;">
                          ${escapeHtml(aiAnalysis.cefr_assessment || '')}
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ===== STRENGTHS & WEAKNESSES ===== -->
          <tr>
            <td style="padding: 0 40px 32px;" class="mobile-padding">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <!-- Strengths -->
                <tr>
                  <td style="padding-bottom: 20px;">
                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border: 1px solid #dcfce7; border-radius: 10px; overflow: hidden;">
                      <tr>
                        <td style="background: #f0fdf4; padding: 12px 16px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 14px; font-weight: 700; color: #16a34a; border-bottom: 1px solid #dcfce7;">
                          Strengths
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 12px 16px;">
                          <table width="100%" cellpadding="0" cellspacing="0" border="0">
                            ${strengths}
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <!-- Weaknesses -->
                <tr>
                  <td>
                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border: 1px solid #ffedd5; border-radius: 10px; overflow: hidden;">
                      <tr>
                        <td style="background: #fff7ed; padding: 12px 16px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 14px; font-weight: 700; color: #ea580c; border-bottom: 1px solid #ffedd5;">
                          Areas to Improve
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 12px 16px;">
                          <table width="100%" cellpadding="0" cellspacing="0" border="0">
                            ${weaknesses}
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ===== SECTION BREAKDOWN ===== -->
          <tr>
            <td style="padding: 0 40px 32px;" class="mobile-padding">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 18px; font-weight: 700; color: #1e293b; padding-bottom: 16px;">
                    Section Breakdown
                  </td>
                </tr>
                ${sectionBar(SECTION_LABELS.grammar, sectionScores.grammar)}
                ${sectionBar(SECTION_LABELS.vocabulary, sectionScores.vocabulary)}
                ${sectionBar(SECTION_LABELS.reading, sectionScores.reading)}
                ${sectionBar(SECTION_LABELS.listening, sectionScores.listening)}
              </table>
            </td>
          </tr>

          <!-- ===== DETAILED SECTION ANALYSIS ===== -->
          <tr>
            <td style="padding: 0 40px 32px;" class="mobile-padding">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 18px; font-weight: 700; color: #1e293b; padding-bottom: 16px;">
                    Detailed Analysis
                  </td>
                </tr>
                ${sectionAnalysisRows}
              </table>
            </td>
          </tr>

          <!-- ===== STUDY PLAN ===== -->
          <tr>
            <td style="padding: 0 40px 32px;" class="mobile-padding">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 18px; font-weight: 700; color: #1e293b; padding-bottom: 16px;">
                    Your 2-Week Study Plan
                  </td>
                </tr>
                ${studyCard('Week 1 — Foundation', '&#128218;', studyPlan.week1)}
                ${studyCard('Week 2 — Consolidation', '&#128640;', studyPlan.week2)}
                ${studyCard('Daily Practice', '&#9201;', studyPlan.daily_practice)}
              </table>
            </td>
          </tr>

          <!-- ===== WRONG ANSWERS REVIEW ===== -->
          ${
            wrongRows
              ? `<tr>
            <td style="padding: 0 40px 32px;" class="mobile-padding">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 18px; font-weight: 700; color: #1e293b; padding-bottom: 4px;">
                    Review Your Mistakes
                  </td>
                </tr>
                <tr>
                  <td style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 13px; color: #94a3b8; padding-bottom: 16px;">
                    ${wrongAnswers.length > 15 ? `Showing 15 of ${wrongAnswers.length} incorrect answers` : `${wrongAnswers.length} incorrect answer${wrongAnswers.length !== 1 ? 's' : ''}`}
                  </td>
                </tr>
                <tr>
                  <td>
                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border: 1px solid #e2e8f0; border-radius: 10px; overflow: hidden;">
                      ${wrongRows}
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>`
              : ''
          }

          <!-- ===== MOTIVATIONAL NOTE ===== -->
          ${
            aiAnalysis.motivational_note
              ? `<tr>
            <td style="padding: 0 40px 32px;" class="mobile-padding">
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background: linear-gradient(135deg, #fefce8, #fef9c3); border: 1px solid #fde68a; border-radius: 12px;">
                <tr>
                  <td style="padding: 20px 24px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 15px; color: #713f12; line-height: 1.6; text-align: center; font-style: italic;">
                    &#10024; ${escapeHtml(aiAnalysis.motivational_note)}
                  </td>
                </tr>
              </table>
            </td>
          </tr>`
              : ''
          }

          <!-- ===== CTA ===== -->
          <tr>
            <td style="padding: 0 40px 40px;" class="mobile-padding">
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background: linear-gradient(135deg, #1e3a5f, #2563eb); border-radius: 12px;">
                <tr>
                  <td align="center" style="padding: 32px 24px;">
                    <table cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 14px; color: rgba(255,255,255,0.8); text-align: center; padding-bottom: 16px;">
                          ${escapeHtml(ctaSubtext)}
                        </td>
                      </tr>
                      <tr>
                        <td align="center">
                          <!--[if mso]>
                          <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${ctaUrl}" style="height:48px;v-text-anchor:middle;width:280px;" arcsize="17%" strokecolor="#ffffff" fillcolor="#ffffff">
                            <w:anchorlock/>
                            <center style="color:#2563eb;font-family:sans-serif;font-size:16px;font-weight:bold;">${escapeHtml(ctaText)}</center>
                          </v:roundrect>
                          <![endif]-->
                          <!--[if !mso]><!-->
                          <a href="${ctaUrl}" style="display: inline-block; background: #ffffff; color: #2563eb; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 16px; font-weight: 700; text-decoration: none; padding: 14px 40px; border-radius: 8px; letter-spacing: 0.3px;">
                            ${escapeHtml(ctaText)}
                          </a>
                          <!--<![endif]-->
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ===== FOOTER ===== -->
          <tr>
            <td style="padding: 24px 40px; background: #f8fafc; border-top: 1px solid #e2e8f0;" class="mobile-padding">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center" style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 14px; font-weight: 700; color: #1e293b; padding-bottom: 4px;">
                    TEF Master
                  </td>
                </tr>
                <tr>
                  <td align="center" style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 12px; color: #94a3b8; line-height: 1.6;">
                    Your path to TEF Canada success<br>
                    <a href="https://tef-master.com" style="color: #3b82f6; text-decoration: none;">tef-master.com</a>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 11px; color: #cbd5e1; padding-top: 16px;">
                    This email was generated based on your TEF diagnostic test results.<br>
                    &copy; ${new Date().getFullYear()} TEF Master. All rights reserved.
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>
        <!-- End main container -->

      </td>
    </tr>
  </table>
</body>
</html>`;
}

// ---------------------------------------------------------------------------
// HTML escape helper
// ---------------------------------------------------------------------------
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// ---------------------------------------------------------------------------
// 6. Send email via Resend
// ---------------------------------------------------------------------------
async function sendResultEmail(email, emailHtml, cefr, scorePct) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.log('[results] No RESEND_API_KEY — skipping email');
    return false;
  }

  try {
    const resend = new Resend(apiKey);
    const { data, error } = await resend.emails.send({
      from: 'TEF Master <results@tef-master.com>',
      to: [email],
      subject: `Your TEF Diagnostic Results — ${cefr} | ${scorePct}%`,
      html: emailHtml,
    });

    if (error) {
      console.error('[results] Resend error:', JSON.stringify(error));
      return false;
    }

    console.log('[results] Email sent:', data?.id);
    return true;
  } catch (err) {
    console.error('[results] Email send failed:', err.message);
    return false;
  }
}

// ---------------------------------------------------------------------------
// Main handler
// ---------------------------------------------------------------------------
exports.handler = async (event) => {
  // CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: CORS_HEADERS, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return respond(405, { error: 'Method not allowed' });
  }

  try {
    // Parse request
    const body = JSON.parse(event.body || '{}');
    const { email, test_level, answers, elapsed_seconds, is_premium } = body;

    if (!test_level || !Array.isArray(answers) || answers.length === 0) {
      console.log('[results] Invalid request: missing test_level or answers');
      return respond(400, { error: 'Missing required fields: test_level, answers' });
    }

    console.log(`[results] Processing ${test_level} test — ${answers.length} answers — email: ${email || 'none'}`);

    // 1. Score
    const { sectionScores, totalScore, totalQuestions, scorePct, wrongAnswers } = scoreTest(answers);
    console.log(`[results] Score: ${totalScore}/${totalQuestions} (${scorePct}%)`);

    // 2. CEFR & CLB
    const { cefr, clb } = determineCefrAndClb(test_level, scorePct);
    console.log(`[results] CEFR: ${cefr}, CLB: ${clb}`);

    // 3. AI analysis
    const aiAnalysis = await getAiAnalysis(
      test_level,
      sectionScores,
      totalScore,
      totalQuestions,
      scorePct,
      wrongAnswers,
      elapsed_seconds || 0,
      cefr,
      clb,
      is_premium || false
    );
    console.log('[results] AI analysis complete');

    // 4. Store in Supabase
    const resultId = await storeResult({
      email: email || null,
      test_level,
      total_score: totalScore,
      total_questions: totalQuestions,
      score_pct: scorePct,
      section_scores: sectionScores,
      answers,
      ai_analysis: aiAnalysis,
      cefr_result: cefr,
      clb_estimate: clb,
      elapsed_seconds: elapsed_seconds || 0,
      email_sent: false,
      is_premium: is_premium || false,
    });
    console.log('[results] Stored result ID:', resultId);

    // 5. Send email (if applicable)
    let emailSent = false;
    if (email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      const emailHtml = buildEmailHtml({
        scorePct,
        cefr,
        clb,
        sectionScores,
        aiAnalysis,
        wrongAnswers,
        testLevel: test_level,
        totalScore,
        totalQuestions,
        isPremium: is_premium || false,
        elapsedSeconds: elapsed_seconds || 0,
      });

      emailSent = await sendResultEmail(email, emailHtml, cefr, scorePct);

      // Update email_sent flag in Supabase
      if (emailSent && resultId) {
        try {
          const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;
          if (SUPABASE_KEY) {
            await fetch(`${SUPABASE_URL}/rest/v1/diagnostic_results?id=eq.${resultId}`, {
              method: 'PATCH',
              headers: {
                'Content-Type': 'application/json',
                apikey: SUPABASE_KEY,
                Authorization: `Bearer ${SUPABASE_KEY}`,
              },
              body: JSON.stringify({ email_sent: true }),
            });
          }
        } catch (updateErr) {
          console.error('[results] Failed to update email_sent flag:', updateErr.message);
        }
      }
    }

    // 6. Return response
    const response = {
      result_id: resultId,
      scores: sectionScores,
      total_score: totalScore,
      total_questions: totalQuestions,
      score_pct: scorePct,
      ai_analysis: aiAnalysis,
      cefr_result: cefr,
      clb_estimate: clb,
      email_sent: emailSent,
      wrong_answers: wrongAnswers.map((w) => ({
        questionId: w.questionId,
        section: w.section,
        topic: w.topic,
        question: w.question,
        userAnswer: w.userAnswer,
        correctAnswer: w.correctAnswer,
        explanation: w.explanation,
      })),
      elapsed_seconds: elapsed_seconds || 0,
    };

    console.log('[results] Done — returning response');
    return respond(200, response);
  } catch (err) {
    console.error('[results] Unhandled error:', err.message, err.stack);
    return respond(500, { error: 'Internal server error' });
  }
};
