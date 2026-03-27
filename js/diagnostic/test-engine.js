/**
 * TEF Diagnostic Test Engine v2.0
 * Unified test engine for A1-B2 diagnostic tests.
 * Loads question banks defined as global arrays (QUESTIONS_A1, QUESTIONS_A2, etc.)
 * and drives the full test lifecycle: render, navigate, flag, submit, results.
 */

var TEFDiagnostic = {

  // --- Core Properties ---
  level: null,
  questions: [],
  answers: [],
  flagged: null,
  currentQ: 0,
  startTime: null,
  timerInterval: null,
  resultData: null,

  // --- Section badge colors ---
  sectionColors: {
    grammar:    { bg: '#eff6ff', border: '#3b82f6', text: '#1d4ed8', label: 'Grammar' },
    vocabulary: { bg: '#f0fdf4', border: '#22c55e', text: '#15803d', label: 'Vocabulary' },
    reading:    { bg: '#fef9e7', border: '#f59e0b', text: '#b45309', label: 'Reading' },
    listening:  { bg: '#fdf2f8', border: '#ec4899', text: '#be185d', label: 'Listening' }
  },

  // =========================================================================
  //  init(level)
  // =========================================================================
  init: function (level) {
    this.level = level.toLowerCase();

    // Track diagnostic started
    if (typeof TEFAnalytics !== 'undefined') TEFAnalytics.diagnosticStarted(this.level);

    var bankName = 'QUESTIONS_' + this.level.toUpperCase();
    var bank = window[bankName];
    if (!bank || !bank.length) {
      console.error('Question bank not found: ' + bankName);
      alert('Error: question bank "' + bankName + '" is missing. Make sure the script is loaded.');
      return;
    }

    this.questions = bank;
    this.answers = new Array(this.questions.length).fill(-1);
    this.flagged = new Set();
    this.currentQ = 0;
    this.resultData = null;

    // Inject styles once
    this.injectStyles();

    // Toggle visibility
    var selEl = document.getElementById('testSelection');
    if (selEl) selEl.style.display = 'none';
    var startEl = document.getElementById('startScreen');
    if (startEl) startEl.style.display = 'none';

    var testArea = document.getElementById('testArea');
    if (testArea) testArea.style.display = 'block';

    this.startTimer();
    this.renderQuestion();
  },

  // =========================================================================
  //  renderQuestion()
  // =========================================================================
  renderQuestion: function () {
    var q = this.questions[this.currentQ];
    var idx = this.currentQ;
    var sec = (q.section || '').toLowerCase();
    var meta = this.sectionColors[sec] || { bg: '#f3f4f6', border: '#6b7280', text: '#374151', label: q.section };
    var answered = this.answers[idx] !== -1;

    var frag = document.createDocumentFragment();
    var card = document.createElement('div');
    card.className = 'card';

    // --- Section badge row ---
    var badgeRow = document.createElement('div');
    badgeRow.style.cssText = 'display:flex;align-items:center;gap:0.5rem;flex-wrap:wrap;margin-bottom:0.75rem;';

    var secBadge = document.createElement('span');
    secBadge.style.cssText = 'display:inline-block;padding:0.25rem 0.75rem;border-radius:20px;font-size:0.75rem;font-weight:600;background:' + meta.bg + ';color:' + meta.text + ';border:1px solid ' + meta.border + ';';
    secBadge.textContent = meta.label;
    badgeRow.appendChild(secBadge);

    if (q.level) {
      var lvlBadge = document.createElement('span');
      lvlBadge.style.cssText = 'display:inline-block;padding:0.25rem 0.5rem;border-radius:20px;font-size:0.7rem;font-weight:600;background:#f3f4f6;color:#6b7280;';
      lvlBadge.textContent = q.level.toUpperCase();
      badgeRow.appendChild(lvlBadge);
    }

    if (q.topic) {
      var topicSpan = document.createElement('span');
      topicSpan.style.cssText = 'font-size:0.75rem;color:#9ca3af;';
      topicSpan.textContent = q.topic.replace(/_/g, ' ');
      badgeRow.appendChild(topicSpan);
    }

    card.appendChild(badgeRow);

    // --- Context box ---
    if (q.context) {
      var ctxBox = document.createElement('div');
      ctxBox.className = 'context-box';
      ctxBox.textContent = q.context;
      card.appendChild(ctxBox);
    }

    // --- Audio hint + TTS button for listening ---
    if (q.audioHint || sec === 'listening') {
      var audioBox = document.createElement('div');
      audioBox.className = 'audio-hint';

      // Always show Listen button — TTS availability checked on click
      var listenBtn = document.createElement('button');
      listenBtn.className = 'tts-btn';
      listenBtn.textContent = '\uD83D\uDD0A Listen';
      var ttsText = q.audioHint || q.question;
      listenBtn.addEventListener('click', function () {
        if (typeof FrenchTTS === 'undefined' || !FrenchTTS.isAvailable()) {
          alert('Text-to-speech is not available in your browser. Please use Chrome, Safari, or Edge for audio.');
          return;
        }
        if (FrenchTTS.isSpeaking()) {
          FrenchTTS.stop();
          listenBtn.textContent = '\uD83D\uDD0A Listen';
          listenBtn.classList.remove('tts-playing');
        } else {
          listenBtn.textContent = '\u23F8 Playing...';
          listenBtn.classList.add('tts-playing');
          FrenchTTS.speak(ttsText, {
            speed: 'normal',
            onEnd: function () { listenBtn.textContent = '\uD83D\uDD0A Listen Again'; listenBtn.classList.remove('tts-playing'); },
            onError: function () { listenBtn.textContent = '\uD83D\uDD0A Listen'; listenBtn.classList.remove('tts-playing'); }
          });
        }
      });
      audioBox.appendChild(listenBtn);

      var hintText = document.createElement('span');
      hintText.textContent = ' Click to hear this in French';
      hintText.style.cssText = 'font-size:0.8125rem;color:var(--text-light);margin-left:0.5rem;';
      audioBox.appendChild(hintText);

      card.appendChild(audioBox);
    }

    // --- Question text ---
    var qText = document.createElement('div');
    qText.className = 'q-text';
    qText.textContent = q.question;
    card.appendChild(qText);

    // --- Options ---
    var optionsDiv = document.createElement('div');
    optionsDiv.className = 'options';

    for (var i = 0; i < q.options.length; i++) {
      var letter = String.fromCharCode(65 + i);
      var optEl = document.createElement('div');
      optEl.className = 'opt';
      optEl.id = 'opt' + i;
      optEl.textContent = letter + ') ' + q.options[i];

      if (answered) {
        optEl.classList.add('disabled');
        if (i === q.correct) optEl.classList.add('correct');
        if (i === this.answers[idx] && i !== q.correct) optEl.classList.add('wrong');
        if (i === this.answers[idx]) optEl.classList.add('selected');
      } else {
        (function (engine, optIndex) {
          optEl.addEventListener('click', function () {
            engine.selectAnswer(optIndex);
          });
        })(this, i);
      }

      optionsDiv.appendChild(optEl);
    }
    card.appendChild(optionsDiv);

    // --- Explanation ---
    var explDiv = document.createElement('div');
    explDiv.className = 'expl' + (answered ? ' show' : '');
    explDiv.id = 'expl';
    explDiv.textContent = q.explanation;
    card.appendChild(explDiv);

    frag.appendChild(card);

    var container = document.getElementById('qContainer');
    if (container) {
      container.textContent = '';
      container.appendChild(frag);
    }

    // --- Navigation buttons ---
    this._renderNavButtons();

    // --- Navigator + progress ---
    this.renderNavigator();
    this.updateProgress();
  },

  // =========================================================================
  //  _renderNavButtons() -- prev / flag / next / submit row
  // =========================================================================
  _renderNavButtons: function () {
    var idx = this.currentQ;
    var total = this.questions.length;
    var isFlagged = this.flagged.has(idx);
    var isLast = idx === total - 1;
    var self = this;

    // Remove any legacy static nav-button containers
    var oldNav = document.querySelector('.test-nav-btns');
    if (oldNav) oldNav.remove();

    var wrap = document.getElementById('navButtons');
    if (!wrap) {
      wrap = document.createElement('div');
      wrap.id = 'navButtons';
      wrap.style.cssText = 'display:flex;gap:0.5rem;justify-content:center;flex-wrap:wrap;margin:0.75rem 0 0.5rem;';
      var qc = document.getElementById('qContainer');
      if (qc && qc.parentNode) qc.parentNode.insertBefore(wrap, qc.nextSibling);
    }

    wrap.textContent = '';

    // Previous
    if (idx > 0) {
      var prevBtn = document.createElement('button');
      prevBtn.className = 'btn btn-outline';
      prevBtn.style.minWidth = '120px';
      prevBtn.textContent = '\u2190 Previous';
      prevBtn.addEventListener('click', function () { self.previousQuestion(); });
      wrap.appendChild(prevBtn);
    }

    // Flag
    var flagBtn = document.createElement('button');
    flagBtn.className = 'btn';
    flagBtn.style.cssText = 'min-width:90px;background:' + (isFlagged ? '#f59e0b' : '#f3f4f6') + ';color:' + (isFlagged ? '#fff' : '#6b7280') + ';border:none;cursor:pointer;';
    flagBtn.textContent = isFlagged ? '\u2691 Flagged' : '\u2690 Flag';
    flagBtn.addEventListener('click', function () { self.flagQuestion(); });
    wrap.appendChild(flagBtn);

    // Next or Submit
    if (isLast) {
      var submitBtn = document.createElement('button');
      submitBtn.className = 'btn btn-primary';
      submitBtn.style.minWidth = '140px';
      submitBtn.textContent = 'Submit Test \u2192';
      submitBtn.addEventListener('click', function () { self.showSubmitPrompt(); });
      wrap.appendChild(submitBtn);
    } else {
      var nextBtn = document.createElement('button');
      nextBtn.className = 'btn btn-primary';
      nextBtn.id = 'nextBtn';
      nextBtn.style.minWidth = '140px';
      nextBtn.textContent = 'Next \u2192';
      nextBtn.addEventListener('click', function () { self.nextQuestion(); });
      wrap.appendChild(nextBtn);
    }
  },

  // =========================================================================
  //  renderNavigator()
  // =========================================================================
  renderNavigator: function () {
    var nav = document.getElementById('qNavigator');
    if (!nav) {
      nav = document.createElement('div');
      nav.id = 'qNavigator';
      var qc = document.getElementById('qContainer');
      if (qc && qc.parentNode) qc.parentNode.insertBefore(nav, qc);
    }

    nav.textContent = '';
    var grid = document.createElement('div');
    grid.className = 'q-nav-grid';

    // Group questions by section
    var sections = [];
    var currentSection = null;
    var sectionQuestions = [];
    for (var i = 0; i < this.questions.length; i++) {
      var sec = (this.questions[i].section || '').toLowerCase();
      if (sec !== currentSection) {
        if (currentSection !== null) sections.push({ sec: currentSection, qs: sectionQuestions });
        currentSection = sec;
        sectionQuestions = [];
      }
      sectionQuestions.push(i);
    }
    if (currentSection !== null) sections.push({ sec: currentSection, qs: sectionQuestions });

    var self = this;
    for (var s = 0; s < sections.length; s++) {
      var block = document.createElement('div');
      block.className = 'q-nav-section';
      var meta = this.sectionColors[sections[s].sec] || { label: sections[s].sec, text: '#374151' };
      var secLabel = document.createElement('div');
      secLabel.className = 'q-nav-label';
      secLabel.style.color = meta.text;
      secLabel.textContent = meta.label;
      block.appendChild(secLabel);

      var dotsWrap = document.createElement('div');
      dotsWrap.className = 'q-nav-dots';
      var qs = sections[s].qs;
      for (var j = 0; j < qs.length; j++) {
        var idx = qs[j];
        var dot = document.createElement('div');
        dot.className = 'q-dot';
        dot.title = 'Q' + (idx + 1);
        dot.textContent = String(idx + 1);
        if (idx === this.currentQ) dot.classList.add('current');
        else if (this.flagged.has(idx)) dot.classList.add('flagged');
        else if (this.answers[idx] !== -1) dot.classList.add('answered');
        else dot.classList.add('unanswered');
        (function (engine, index) {
          dot.addEventListener('click', function () { engine.jumpToQuestion(index); });
        })(this, idx);
        dotsWrap.appendChild(dot);
      }
      block.appendChild(dotsWrap);
      grid.appendChild(block);
    }

    nav.appendChild(grid);
  },

  // =========================================================================
  //  updateProgress()
  // =========================================================================
  updateProgress: function () {
    var total = this.questions.length;
    var answeredCount = 0;
    for (var i = 0; i < this.answers.length; i++) {
      if (this.answers[i] !== -1) answeredCount++;
    }
    var pct = Math.round((answeredCount / total) * 100);

    var fill = document.getElementById('testProgressFill');
    if (fill) fill.style.width = pct + '%';

    var txt = document.getElementById('testProgressText');
    if (txt) {
      var q = this.questions[this.currentQ];
      var secLabel = q.section ? q.section.charAt(0).toUpperCase() + q.section.slice(1) : '';
      txt.textContent = 'Question ' + (this.currentQ + 1) + ' / ' + total + ' \u2014 ' + secLabel + ' (' + answeredCount + ' answered)';
    }
  },

  // =========================================================================
  //  selectAnswer(idx)
  // =========================================================================
  selectAnswer: function (idx) {
    if (this.answers[this.currentQ] !== -1) return;

    this.answers[this.currentQ] = idx;
    var q = this.questions[this.currentQ];

    var opts = document.querySelectorAll('#qContainer .opt');
    for (var i = 0; i < opts.length; i++) {
      opts[i].classList.add('disabled');
      // Remove click handler by replacing node
      var clone = opts[i].cloneNode(true);
      opts[i].parentNode.replaceChild(clone, opts[i]);
      if (i === q.correct) clone.classList.add('correct');
      if (i === idx && idx !== q.correct) clone.classList.add('wrong');
      if (i === idx) clone.classList.add('selected');
    }

    var expl = document.getElementById('expl');
    if (expl) expl.classList.add('show');

    this.renderNavigator();
    this._renderNavButtons();
    this.updateProgress();
  },

  // =========================================================================
  //  nextQuestion() / previousQuestion()
  // =========================================================================
  nextQuestion: function () {
    if (this.currentQ < this.questions.length - 1) {
      this.currentQ++;
      this.renderQuestion();
      this._scrollToTest();
    } else {
      this.showSubmitPrompt();
    }
  },

  previousQuestion: function () {
    if (this.currentQ > 0) {
      this.currentQ--;
      this.renderQuestion();
      this._scrollToTest();
    }
  },

  // =========================================================================
  //  flagQuestion()
  // =========================================================================
  flagQuestion: function () {
    if (this.flagged.has(this.currentQ)) {
      this.flagged.delete(this.currentQ);
    } else {
      this.flagged.add(this.currentQ);
    }
    this.renderNavigator();
    this._renderNavButtons();
  },

  // =========================================================================
  //  jumpToQuestion(idx)
  // =========================================================================
  jumpToQuestion: function (idx) {
    if (idx >= 0 && idx < this.questions.length) {
      this.currentQ = idx;
      this.renderQuestion();
      this._scrollToTest();
    }
  },

  // Smooth scroll to the question card (not page top or testArea header)
  _scrollToTest: function () {
    var qContainer = document.getElementById('qContainer');
    if (qContainer) {
      qContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  },

  // =========================================================================
  //  Timer
  // =========================================================================
  startTimer: function () {
    this.startTime = Date.now();
    var self = this;
    this.updateTimer();
    this.timerInterval = setInterval(function () {
      self.updateTimer();
    }, 1000);
  },

  updateTimer: function () {
    var el = document.getElementById('timer');
    if (!el) {
      var timerBar = document.querySelector('.test-timer');
      if (!timerBar) {
        timerBar = document.createElement('div');
        timerBar.className = 'test-timer';
        var testArea = document.getElementById('testArea');
        if (testArea) testArea.insertBefore(timerBar, testArea.firstChild);
      }
      el = timerBar.querySelector('#timer');
      if (!el) {
        el = document.createElement('span');
        el.id = 'timer';
        el.style.cssText = 'font-weight:600;font-size:0.9375rem;color:#1e293b;';
        timerBar.appendChild(el);
      }
    }

    var secs = this.getElapsedSeconds();
    var m = Math.floor(secs / 60);
    var s = secs % 60;
    el.textContent = '\u23F1 ' + (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s;
  },

  getElapsedSeconds: function () {
    if (!this.startTime) return 0;
    return Math.floor((Date.now() - this.startTime) / 1000);
  },

  // =========================================================================
  //  canSubmit()
  // =========================================================================
  canSubmit: function () {
    for (var i = 0; i < this.answers.length; i++) {
      if (this.answers[i] === -1) return false;
    }
    return true;
  },

  // =========================================================================
  //  showSubmitPrompt()
  // =========================================================================
  showSubmitPrompt: function () {
    var unanswered = 0;
    for (var i = 0; i < this.answers.length; i++) {
      if (this.answers[i] === -1) unanswered++;
    }
    var flaggedCount = this.flagged.size;
    var self = this;

    var promptEl = document.getElementById('submitPrompt');
    if (!promptEl) {
      promptEl = document.createElement('div');
      promptEl.id = 'submitPrompt';
      var navBtns = document.getElementById('navButtons');
      if (navBtns && navBtns.parentNode) {
        navBtns.parentNode.insertBefore(promptEl, navBtns.nextSibling);
      } else {
        var qc = document.getElementById('qContainer');
        if (qc && qc.parentNode) qc.parentNode.appendChild(promptEl);
      }
    }

    promptEl.textContent = '';

    var card = document.createElement('div');
    card.className = 'card';
    card.style.cssText = 'text-align:center;margin-top:1.5rem;';

    var title = document.createElement('h3');
    title.style.cssText = 'color:var(--primary,#1a1a2e);margin-bottom:0.75rem;';
    title.textContent = 'Ready to Submit?';
    card.appendChild(title);

    if (unanswered > 0) {
      var warn = document.createElement('div');
      warn.style.cssText = 'background:#fef2f2;border:1px solid #fca5a5;border-radius:10px;padding:0.75rem 1rem;margin-bottom:0.75rem;color:#991b1b;font-size:0.9375rem;';
      warn.textContent = '\u26A0 You have ' + unanswered + ' unanswered question' + (unanswered > 1 ? 's' : '') + '.';
      card.appendChild(warn);
    }

    if (flaggedCount > 0) {
      var flagWarn = document.createElement('div');
      flagWarn.style.cssText = 'background:#fefce8;border:1px solid #fde68a;border-radius:10px;padding:0.75rem 1rem;margin-bottom:0.75rem;color:#92400e;font-size:0.9375rem;';
      flagWarn.textContent = '\u2691 You have ' + flaggedCount + ' flagged question' + (flaggedCount > 1 ? 's' : '') + ' to review.';
      card.appendChild(flagWarn);
    }

    if (unanswered === 0 && flaggedCount === 0) {
      var ready = document.createElement('p');
      ready.style.cssText = 'color:#22c55e;font-weight:600;margin-bottom:0.75rem;';
      ready.textContent = 'All questions answered. Ready to submit!';
      card.appendChild(ready);
    }

    var btnRow = document.createElement('div');
    btnRow.style.cssText = 'display:flex;gap:0.75rem;justify-content:center;flex-wrap:wrap;margin-top:1rem;';

    if (unanswered > 0 || flaggedCount > 0) {
      var reviewBtn = document.createElement('button');
      reviewBtn.className = 'btn btn-outline';
      reviewBtn.style.minWidth = '160px';
      reviewBtn.textContent = 'Review Questions';
      reviewBtn.addEventListener('click', function () { self.reviewUnanswered(); });
      btnRow.appendChild(reviewBtn);
    }

    var submitBtn = document.createElement('button');
    submitBtn.className = 'btn btn-primary';
    submitBtn.style.minWidth = '160px';
    submitBtn.textContent = 'Submit Test';
    submitBtn.addEventListener('click', function () { self.submitTest(); });
    btnRow.appendChild(submitBtn);

    card.appendChild(btnRow);
    promptEl.appendChild(card);
  },

  /**
   * Jump to first unanswered or flagged question for review.
   */
  reviewUnanswered: function () {
    var prompt = document.getElementById('submitPrompt');
    if (prompt) prompt.textContent = '';

    for (var i = 0; i < this.answers.length; i++) {
      if (this.answers[i] === -1) {
        this.jumpToQuestion(i);
        return;
      }
    }
    // If all answered, jump to first flagged
    var self = this;
    var jumped = false;
    this.flagged.forEach(function (fi) {
      if (!jumped) {
        self.jumpToQuestion(fi);
        jumped = true;
      }
    });
  },

  // =========================================================================
  //  submitTest()
  // =========================================================================
  submitTest: async function () {
    clearInterval(this.timerInterval);

    var testArea = document.getElementById('testArea');
    if (testArea) testArea.style.display = 'none';

    var loadingScreen = document.getElementById('loadingScreen');
    if (loadingScreen) {
      loadingScreen.style.display = 'flex';
      this._animateLoading();
    }

    var email = localStorage.getItem('tef_verified_email') || localStorage.getItem('tef_lead_email') || null;
    var isPremium = !!localStorage.getItem('tef_verified_email');

    var self = this;

    var payload = {
      email: email,
      test_level: this.level,
      answers: this.questions.map(function (q, i) {
        return {
          questionId: q.id,
          section: q.section,
          topic: q.topic,
          userAnswer: self.answers[i],
          correct: q.correct,
          isCorrect: self.answers[i] === q.correct,
          question: q.question,
          options: q.options,
          explanation: q.explanation
        };
      }),
      elapsed_seconds: this.getElapsedSeconds(),
      is_premium: isPremium
    };

    try {
      var res = await fetch('/.netlify/functions/generate-results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      var data = await res.json();
      this.resultData = data;

      // Track diagnostic completed
      if (typeof TEFAnalytics !== 'undefined') TEFAnalytics.diagnosticCompleted(self.level, data.score_pct, data.cefr_result);

      this._stopLoading();
      setTimeout(function() { if (loadingScreen) loadingScreen.style.display = 'none'; }, 500);

      if (!email && !isPremium) {
        this.showEmailGate(data);
      } else {
        if (typeof TEFResults !== 'undefined' && TEFResults.render) {
          TEFResults.render(
            document.getElementById('resultsArea'),
            data,
            this.questions,
            this.answers,
            this.level
          );
        } else {
          this._renderResultsInline(data);
        }
        var resultsArea = document.getElementById('resultsArea');
        if (resultsArea) resultsArea.style.display = 'block';
      }
    } catch (err) {
      console.error('Submit failed:', err);
      this._stopLoading();
      if (loadingScreen) loadingScreen.style.display = 'none';
      this.renderFallbackResults();
    }
  },

  // =========================================================================
  //  showEmailGate(data)
  // =========================================================================
  showEmailGate: function (data) {
    var self = this;

    var totalCorrect = 0;
    for (var i = 0; i < this.questions.length; i++) {
      if (this.answers[i] === this.questions[i].correct) totalCorrect++;
    }
    var pct = Math.round((totalCorrect / this.questions.length) * 100);
    var cefrLevel = this._estimateCEFR(pct);
    var dotColor = pct >= 70 ? '#22c55e' : pct >= 50 ? '#f59e0b' : '#ef4444';

    // AI summary teaser
    var summaryTeaser = '';
    if (data && data.ai_analysis && data.ai_analysis.summary) {
      var fullSummary = data.ai_analysis.summary;
      var firstSentence = fullSummary.split(/[.!?]/)[0];
      if (firstSentence) summaryTeaser = firstSentence + '...';
    }

    var overlay = document.getElementById('emailGate');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'emailGate';
      document.body.appendChild(overlay);
    }
    overlay.textContent = '';

    // Build overlay DOM
    var overlayInner = document.createElement('div');
    overlayInner.className = 'email-overlay';
    overlayInner.id = 'emailOverlayInner';
    overlayInner.style.display = 'flex';

    var modal = document.createElement('div');
    modal.className = 'email-modal';

    var heading = document.createElement('h2');
    heading.textContent = 'Your results are ready!';
    modal.appendChild(heading);

    var preview = document.createElement('div');
    preview.className = 'em-score-preview';
    var dot = document.createElement('span');
    dot.style.cssText = 'width:12px;height:12px;border-radius:50%;display:inline-block;background:' + dotColor + ';';
    preview.appendChild(dot);
    var previewText = document.createElement('span');
    previewText.textContent = pct + '% \u2014 ' + cefrLevel;
    preview.appendChild(previewText);
    modal.appendChild(preview);

    if (summaryTeaser) {
      var teaserP = document.createElement('p');
      teaserP.style.cssText = 'color:rgba(255,255,255,0.7);font-size:0.875rem;margin-bottom:1rem;font-style:italic;';
      teaserP.textContent = '"' + summaryTeaser + '"';
      modal.appendChild(teaserP);
    }

    var subP = document.createElement('p');
    subP.className = 'em-sub';
    subP.textContent = 'Enter your email to unlock your full TEF score, AI-powered analysis, and personalized study plan.';
    modal.appendChild(subP);

    var emailInput = document.createElement('input');
    emailInput.type = 'email';
    emailInput.id = 'gateEmailInput';
    emailInput.placeholder = 'your@email.com';
    emailInput.autocomplete = 'email';
    emailInput.style.cssText = 'width:100%;padding:0.875rem 1rem;border:2px solid rgba(255,255,255,0.12);border-radius:10px;background:rgba(255,255,255,0.06);color:#fff;font-size:1rem;outline:none;box-sizing:border-box;';
    modal.appendChild(emailInput);

    var errDiv = document.createElement('div');
    errDiv.id = 'gateEmailError';
    errDiv.style.cssText = 'color:#ef4444;font-size:0.8125rem;margin-top:0.5rem;display:none;';
    errDiv.textContent = 'Please enter a valid email address.';
    modal.appendChild(errDiv);

    var submitEmailBtn = document.createElement('button');
    submitEmailBtn.className = 'em-btn';
    submitEmailBtn.id = 'gateEmailBtn';
    submitEmailBtn.textContent = 'Get My Full Results';
    modal.appendChild(submitEmailBtn);

    var fineprint = document.createElement('p');
    fineprint.style.cssText = 'color:rgba(255,255,255,0.4);font-size:0.75rem;margin-top:0.875rem;line-height:1.4;';
    fineprint.textContent = "We'll also send you free TEF prep tips. No spam, unsubscribe anytime.";
    modal.appendChild(fineprint);

    var skipLink = document.createElement('a');
    skipLink.href = '#';
    skipLink.id = 'gateSkipLink';
    skipLink.style.cssText = 'display:inline-block;margin-top:0.75rem;color:rgba(255,255,255,0.45);font-size:0.8125rem;text-decoration:underline;cursor:pointer;';
    skipLink.textContent = 'Skip \u2014 show results without email';
    modal.appendChild(skipLink);

    overlayInner.appendChild(modal);
    overlay.appendChild(overlayInner);

    // Animate in
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        overlayInner.classList.add('visible');
      });
    });

    setTimeout(function () { emailInput.focus(); }, 450);

    // Events
    submitEmailBtn.addEventListener('click', function () {
      self._handleEmailGateSubmit(data);
    });

    emailInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') self._handleEmailGateSubmit(data);
    });

    skipLink.addEventListener('click', function (e) {
      e.preventDefault();
      self._closeEmailGate();
      self._showFullResults(data);
    });
  },

  _handleEmailGateSubmit: function (data) {
    var input = document.getElementById('gateEmailInput');
    var errEl = document.getElementById('gateEmailError');
    var btn = document.getElementById('gateEmailBtn');
    var email = (input ? input.value : '').trim();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      if (errEl) errEl.style.display = 'block';
      if (input) input.focus();
      return;
    }
    if (errEl) errEl.style.display = 'none';
    if (btn) {
      btn.disabled = true;
      btn.textContent = 'Loading results...';
    }

    localStorage.setItem('tef_lead_email', email);

    // Track email capture
    if (typeof TEFAnalytics !== 'undefined') TEFAnalytics.emailCaptured('diagnostic');

    // Fire-and-forget: capture lead
    fetch('/.netlify/functions/capture-lead', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email, source: 'diagnostic_v2', test_level: this.level })
    }).catch(function () { });

    // Fire-and-forget: re-submit with email to trigger email report
    var self = this;
    var payload = {
      email: email,
      test_level: this.level,
      answers: this.questions.map(function (q, i) {
        return {
          questionId: q.id,
          section: q.section,
          topic: q.topic,
          userAnswer: self.answers[i],
          correct: q.correct,
          isCorrect: self.answers[i] === q.correct,
          question: q.question,
          options: q.options,
          explanation: q.explanation
        };
      }),
      elapsed_seconds: this.getElapsedSeconds(),
      is_premium: false,
      send_email: true
    };

    fetch('/.netlify/functions/generate-results', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).catch(function () { });

    this._closeEmailGate();
    this._showFullResults(data);
  },

  _closeEmailGate: function () {
    var overlay = document.getElementById('emailGate');
    if (overlay) {
      var inner = document.getElementById('emailOverlayInner');
      if (inner) inner.classList.remove('visible');
      setTimeout(function () {
        if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
      }, 400);
    }
  },

  _showFullResults: function (data) {
    if (typeof TEFResults !== 'undefined' && TEFResults.render) {
      TEFResults.render(
        document.getElementById('resultsArea'),
        data,
        this.questions,
        this.answers,
        this.level
      );
    } else {
      this._renderResultsInline(data);
    }
    var resultsArea = document.getElementById('resultsArea');
    if (resultsArea) resultsArea.style.display = 'block';
  },

  // =========================================================================
  //  renderFallbackResults() -- client-side fallback if server fails
  // =========================================================================
  renderFallbackResults: function () {
    var scores = { grammar: { c: 0, t: 0 }, vocabulary: { c: 0, t: 0 }, reading: { c: 0, t: 0 }, listening: { c: 0, t: 0 } };
    var totalCorrect = 0;

    for (var i = 0; i < this.questions.length; i++) {
      var q = this.questions[i];
      var sec = (q.section || '').toLowerCase();
      if (!scores[sec]) scores[sec] = { c: 0, t: 0 };
      scores[sec].t++;
      if (this.answers[i] === q.correct) {
        scores[sec].c++;
        totalCorrect++;
      }
    }

    var pct = Math.round((totalCorrect / this.questions.length) * 100);
    var cefrLevel = this._estimateCEFR(pct);

    var data = {
      score_pct: pct,
      total_score: totalCorrect,
      total_questions: this.questions.length,
      cefr_result: cefrLevel,
      section_scores: {},
      ai_analysis: null
    };

    for (var sec in scores) {
      if (scores.hasOwnProperty(sec)) {
        data.section_scores[sec] = {
          correct: scores[sec].c,
          total: scores[sec].t,
          pct: scores[sec].t > 0 ? Math.round((scores[sec].c / scores[sec].t) * 100) : 0
        };
      }
    }

    this.resultData = data;
    this._renderResultsInline(data);
    var resultsArea = document.getElementById('resultsArea');
    if (resultsArea) resultsArea.style.display = 'block';
  },

  // =========================================================================
  //  _animateLoading() -- progress bar + step animation during AI generation
  // =========================================================================
  _animateLoading: function () {
    var bar = document.getElementById('loadingBarFill');
    var stepsEl = document.getElementById('loadingSteps');
    if (!bar || !stepsEl) return;

    var steps = stepsEl.querySelectorAll('.step');
    var stepIndex = 0;
    var progress = 0;

    // Animate progress bar smoothly
    var barInterval = setInterval(function () {
      progress += 1;
      if (progress > 95) progress = 95; // Never reach 100 until done
      bar.style.width = progress + '%';
    }, 150);

    // Advance steps every 3 seconds
    var stepInterval = setInterval(function () {
      if (stepIndex < steps.length) {
        if (stepIndex > 0) steps[stepIndex - 1].classList.add('done');
        steps[stepIndex].classList.add('active');
        stepIndex++;
      }
      if (stepIndex >= steps.length) clearInterval(stepInterval);
    }, 3000);

    // Store intervals so they can be cleared when results arrive
    this._loadingIntervals = [barInterval, stepInterval];
    this._loadingBar = bar;
    this._loadingSteps = steps;
  },

  _stopLoading: function () {
    if (this._loadingIntervals) {
      this._loadingIntervals.forEach(function (id) { clearInterval(id); });
    }
    // Complete the bar
    if (this._loadingBar) this._loadingBar.style.width = '100%';
    if (this._loadingSteps) {
      var steps = this._loadingSteps;
      for (var i = 0; i < steps.length; i++) {
        steps[i].classList.add('done');
        steps[i].classList.remove('active');
      }
    }
  },

  // =========================================================================
  //  _renderResultsInline(data) -- basic results renderer (fallback)
  // =========================================================================
  _renderResultsInline: function (data) {
    var el = document.getElementById('resultsArea');
    if (!el) {
      el = document.createElement('div');
      el.id = 'resultsArea';
      var container = document.querySelector('.container-narrow') || document.querySelector('.container');
      if (container) container.appendChild(el);
    }

    var pct = data.score_pct || 0;
    var total = data.total_questions || this.questions.length;
    var correct = data.total_score || 0;
    var cefr = data.cefr_result || this._estimateCEFR(pct);
    var ringColor = pct >= 70 ? 'linear-gradient(135deg,#22c55e,#2ecc71)' :
                    pct >= 50 ? 'linear-gradient(135deg,#f59e0b,#f1c40f)' :
                                'linear-gradient(135deg,#ef4444,#c0392b)';

    el.textContent = '';
    var frag = document.createDocumentFragment();

    // --- Score card ---
    var scoreCard = document.createElement('div');
    scoreCard.className = 'card';
    scoreCard.style.textAlign = 'center';

    var h2 = document.createElement('h2');
    h2.style.cssText = 'color:var(--primary,#1a1a2e);margin-bottom:1rem;';
    h2.textContent = 'Your ' + this.level.toUpperCase() + ' Diagnostic Results';
    scoreCard.appendChild(h2);

    var ring = document.createElement('div');
    ring.className = 'score-ring';
    ring.style.background = ringColor;
    ring.textContent = pct + '%';
    scoreCard.appendChild(ring);

    var scoreLine = document.createElement('p');
    scoreLine.style.cssText = 'font-size:0.9375rem;margin:0.5rem 0;';
    scoreLine.textContent = correct + '/' + total + ' correct';
    scoreCard.appendChild(scoreLine);

    var levelLine = document.createElement('p');
    levelLine.style.cssText = 'font-size:1.125rem;margin:0.75rem 0;';
    levelLine.textContent = 'Estimated Level: ';
    var badge = document.createElement('span');
    badge.className = 'level-badge';
    badge.style.background = pct >= 70 ? '#22c55e' : pct >= 50 ? '#f59e0b' : '#ef4444';
    badge.textContent = cefr;
    levelLine.appendChild(badge);
    scoreCard.appendChild(levelLine);

    // AI analysis
    if (data.ai_analysis && data.ai_analysis.summary) {
      var aiBox = document.createElement('div');
      aiBox.style.cssText = 'text-align:left;background:var(--bg,#f9fafb);padding:1rem;border-radius:10px;margin-top:1rem;font-size:0.9375rem;line-height:1.6;';
      var aiLabel = document.createElement('strong');
      aiLabel.textContent = 'AI Analysis: ';
      aiBox.appendChild(aiLabel);
      aiBox.appendChild(document.createTextNode(data.ai_analysis.summary));
      scoreCard.appendChild(aiBox);
    }
    frag.appendChild(scoreCard);

    // --- Section scores ---
    var secHeading = document.createElement('h3');
    secHeading.style.cssText = 'color:var(--primary,#1a1a2e);margin:1.25rem 0 0.75rem;';
    secHeading.textContent = 'Section Scores';
    frag.appendChild(secHeading);

    var sgrid = document.createElement('div');
    sgrid.className = 'sgrid';

    var sectionMeta = {
      grammar:    { icon: '\uD83D\uDCDD', label: 'Grammar' },
      vocabulary: { icon: '\uD83D\uDCDA', label: 'Vocabulary' },
      reading:    { icon: '\uD83D\uDCD6', label: 'Reading' },
      listening:  { icon: '\uD83C\uDFA7', label: 'Listening' }
    };

    var sectionScores = data.section_scores || {};
    for (var sec in sectionScores) {
      if (sectionScores.hasOwnProperty(sec)) {
        var s = sectionScores[sec];
        var sp = s.pct || 0;
        var cls = sp >= 70 ? 'strong' : sp >= 50 ? 'medium' : 'weak';
        var sm = sectionMeta[sec.toLowerCase()] || { icon: '', label: sec };

        var sitem = document.createElement('div');
        sitem.className = 'sitem ' + cls;

        var slabel = document.createElement('div');
        slabel.className = 'slabel';
        slabel.textContent = sm.icon + ' ' + sm.label;
        sitem.appendChild(slabel);

        var sval = document.createElement('div');
        sval.className = 'sval';
        sval.textContent = (s.correct || 0) + '/' + (s.total || 0);
        sitem.appendChild(sval);

        var spctEl = document.createElement('div');
        spctEl.className = 'spct';
        spctEl.textContent = sp + '%';
        sitem.appendChild(spctEl);

        sgrid.appendChild(sitem);
      }
    }
    frag.appendChild(sgrid);

    // --- Recommendations ---
    var recCard = document.createElement('div');
    recCard.className = 'card';

    var recH3 = document.createElement('h3');
    recH3.style.cssText = 'color:var(--primary,#1a1a2e);margin-bottom:1rem;';
    recH3.textContent = 'Study Recommendations';
    recCard.appendChild(recH3);

    var sorted = [];
    for (var sec in sectionScores) {
      if (sectionScores.hasOwnProperty(sec)) sorted.push([sec, sectionScores[sec]]);
    }
    sorted.sort(function (a, b) { return (a[1].pct || 0) - (b[1].pct || 0); });

    for (var j = 0; j < sorted.length; j++) {
      var pair = sorted[j];
      var secName = pair[0];
      var secData = pair[1];
      var sp = secData.pct || 0;
      var sm = sectionMeta[secName.toLowerCase()] || { label: secName };
      var recCls, recTitle, recAdvice;

      if (sp >= 70) {
        recCls = 'rec-strong';
        recTitle = sm.label + ' \u2014 Strong';
        recAdvice = 'Great performance! Keep expanding your knowledge with regular practice and advanced materials.';
      } else if (sp >= 50) {
        recCls = 'rec-medium';
        recTitle = sm.label + ' \u2014 Developing';
        recAdvice = 'Good foundation. Increase daily practice and focus on weak patterns to reach the next level.';
      } else {
        recCls = 'rec-weak';
        recTitle = sm.label + ' \u2014 Needs Work';
        recAdvice = 'This section needs focused attention. Study the fundamentals daily and review your incorrect answers.';
      }

      var recItem = document.createElement('div');
      recItem.className = 'rec-item ' + recCls;

      var recH4 = document.createElement('h4');
      recH4.textContent = recTitle;
      recItem.appendChild(recH4);

      var recP = document.createElement('p');
      recP.textContent = recAdvice;
      recItem.appendChild(recP);

      recCard.appendChild(recItem);
    }
    frag.appendChild(recCard);

    // --- Question review ---
    var reviewCard = document.createElement('div');
    reviewCard.className = 'card review-section';

    var reviewH3 = document.createElement('h3');
    reviewH3.style.cssText = 'color:var(--primary,#1a1a2e);margin-bottom:0.5rem;';
    reviewH3.textContent = 'Question Review';
    reviewCard.appendChild(reviewH3);

    var wrongCount = 0;
    for (var i = 0; i < this.questions.length; i++) {
      if (this.answers[i] !== this.questions[i].correct) wrongCount++;
    }

    // Tabs
    var tabsDiv = document.createElement('div');
    tabsDiv.className = 'tabs';
    tabsDiv.id = 'reviewTabs';

    var self = this;
    var tabDefs = [
      { label: 'All (' + this.questions.length + ')', filter: 'all' },
      { label: 'Wrong (' + wrongCount + ')', filter: 'wrong' },
      { label: 'Correct (' + (this.questions.length - wrongCount) + ')', filter: 'correct' }
    ];

    for (var t = 0; t < tabDefs.length; t++) {
      var tabEl = document.createElement('div');
      tabEl.className = 'tab' + (t === 0 ? ' active' : '');
      tabEl.textContent = tabDefs[t].label;
      (function (filterVal) {
        tabEl.addEventListener('click', function () {
          self.filterReview(filterVal, this);
        });
      })(tabDefs[t].filter);
      tabsDiv.appendChild(tabEl);
    }
    reviewCard.appendChild(tabsDiv);

    // Review list
    var reviewList = document.createElement('div');
    reviewList.id = 'reviewList';

    for (var i = 0; i < this.questions.length; i++) {
      var q = this.questions[i];
      var isCorrect = this.answers[i] === q.correct;
      var userAnsText = this.answers[i] >= 0
        ? String.fromCharCode(65 + this.answers[i]) + ') ' + q.options[this.answers[i]]
        : 'Not answered';

      var rq = document.createElement('div');
      rq.className = 'review-q ' + (isCorrect ? 'q-correct' : 'q-wrong');
      rq.dataset.section = q.section;
      rq.dataset.result = isCorrect ? 'correct' : 'wrong';

      var rqHead = document.createElement('div');
      rqHead.className = 'rq-head';
      var rqNum = document.createElement('span');
      rqNum.className = 'rq-num';
      rqNum.textContent = 'Q' + (i + 1);
      rqHead.appendChild(rqNum);
      var rqBadge = document.createElement('span');
      rqBadge.className = 'rq-badge ' + (isCorrect ? 'rq-ok' : 'rq-no');
      rqBadge.textContent = isCorrect ? '\u2713' : '\u2717';
      rqHead.appendChild(rqBadge);
      rq.appendChild(rqHead);

      var rqText = document.createElement('div');
      rqText.className = 'rq-text';
      rqText.textContent = q.question;
      rq.appendChild(rqText);

      var rqAns = document.createElement('div');
      rqAns.className = 'rq-ans';
      if (isCorrect) {
        var rightSpan = document.createElement('span');
        rightSpan.className = 'rq-right';
        rightSpan.textContent = 'Your answer: ' + userAnsText + ' \u2713';
        rqAns.appendChild(rightSpan);
      } else {
        var yourSpan = document.createElement('span');
        yourSpan.className = 'rq-your';
        yourSpan.textContent = 'Your answer: ' + userAnsText;
        rqAns.appendChild(yourSpan);
        rqAns.appendChild(document.createElement('br'));
        var correctSpan = document.createElement('span');
        correctSpan.className = 'rq-right';
        correctSpan.textContent = 'Correct: ' + String.fromCharCode(65 + q.correct) + ') ' + q.options[q.correct];
        rqAns.appendChild(correctSpan);
      }
      rq.appendChild(rqAns);

      var rqExpl = document.createElement('div');
      rqExpl.className = 'rq-expl';
      rqExpl.textContent = q.explanation;
      rq.appendChild(rqExpl);

      reviewList.appendChild(rq);
    }
    reviewCard.appendChild(reviewList);
    frag.appendChild(reviewCard);

    // --- Action buttons ---
    var btnGroup = document.createElement('div');
    btnGroup.className = 'btn-group';

    var retakeBtn = document.createElement('button');
    retakeBtn.className = 'btn btn-primary';
    retakeBtn.textContent = 'Retake Test';
    retakeBtn.addEventListener('click', function () { location.reload(); });
    btnGroup.appendChild(retakeBtn);

    var printBtn = document.createElement('button');
    printBtn.className = 'btn btn-outline';
    printBtn.textContent = 'Print Results';
    printBtn.addEventListener('click', function () { window.print(); });
    btnGroup.appendChild(printBtn);

    frag.appendChild(btnGroup);
    el.appendChild(frag);

    // Save to progress tracker if available
    if (typeof TEFProgress !== 'undefined' && TEFProgress.saveDiagnostic) {
      var scoresForTracker = {};
      for (var sec in sectionScores) {
        if (sectionScores.hasOwnProperty(sec)) {
          var s = sectionScores[sec];
          var label = sec.charAt(0).toUpperCase() + sec.slice(1);
          scoresForTracker[label] = { c: s.correct || 0, t: s.total || 0 };
        }
      }
      TEFProgress.saveDiagnostic(scoresForTracker, cefr);
    }
  },

  // =========================================================================
  //  filterReview(filter, el)
  // =========================================================================
  filterReview: function (filter, el) {
    var tabs = document.querySelectorAll('.tab');
    for (var i = 0; i < tabs.length; i++) tabs[i].classList.remove('active');
    if (el) el.classList.add('active');

    var items = document.querySelectorAll('.review-q');
    for (var i = 0; i < items.length; i++) {
      var q = items[i];
      if (filter === 'all') {
        q.style.display = 'block';
      } else if (filter === 'wrong') {
        q.style.display = q.dataset.result === 'wrong' ? 'block' : 'none';
      } else if (filter === 'correct') {
        q.style.display = q.dataset.result === 'correct' ? 'block' : 'none';
      } else {
        q.style.display = q.dataset.section === filter ? 'block' : 'none';
      }
    }
  },

  // =========================================================================
  //  _estimateCEFR(pct) -- helper
  // =========================================================================
  _estimateCEFR: function (pct) {
    if (pct >= 85) return 'B2';
    if (pct >= 70) return 'B1+';
    if (pct >= 55) return 'B1';
    if (pct >= 40) return 'A2+';
    if (pct >= 25) return 'A2';
    return 'A1+';
  },

  // =========================================================================
  //  injectStyles() -- injects necessary CSS into document head
  // =========================================================================
  injectStyles: function () {
    if (document.getElementById('tef-diagnostic-styles')) return;

    var style = document.createElement('style');
    style.id = 'tef-diagnostic-styles';
    style.textContent = [
      '/* TEF Diagnostic Test Engine Styles */',
      '',
      '/* Navigator dots */',
      '.q-nav { display: flex; flex-wrap: wrap; gap: 6px; margin: 1rem 0; align-items: flex-start; }',
      '.q-dot { width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 0.75rem; font-weight: 600; cursor: pointer; border: 2px solid; transition: all 0.2s; }',
      '.q-dot:hover { transform: scale(1.1); }',
      '.q-dot.unanswered { border-color: #d1d5db; color: #9ca3af; background: #f9fafb; }',
      '.q-dot.current { border-color: #2563eb; color: #2563eb; background: #eff6ff; box-shadow: 0 0 0 3px rgba(37,99,235,0.2); }',
      '.q-dot.answered { border-color: #22c55e; color: #22c55e; background: #f0fdf4; }',
      '.q-dot.flagged { border-color: #f59e0b; color: #f59e0b; background: #fefce8; }',
      '',
      '/* Timer bar */',
      '.test-timer { position: sticky; top: 0; z-index: 10; background: rgba(255,255,255,0.95); backdrop-filter: blur(8px); padding: 0.5rem 1rem; border-bottom: 1px solid #e5e7eb; display: flex; justify-content: space-between; align-items: center; border-radius: 8px; margin-bottom: 0.75rem; }',
      '',
      '/* Loading screen */',
      '#loadingScreen { position: fixed; inset: 0; background: linear-gradient(135deg, #1a1a2e, #16213e); z-index: 9999; display: none; flex-direction: column; align-items: center; justify-content: center; color: white; }',
      '#loadingScreen .loader-spinner { width: 48px; height: 48px; border: 4px solid rgba(255,255,255,0.15); border-top-color: #3b82f6; border-radius: 50%; animation: tef-spin 0.8s linear infinite; margin-bottom: 1.5rem; }',
      '@keyframes tef-spin { to { transform: rotate(360deg); } }',
      '#loadingScreen p { font-size: 1.125rem; opacity: 0.85; }',
      '',
      '/* Email gate overlay */',
      '.email-overlay { position: fixed; inset: 0; z-index: 9999; display: none; align-items: center; justify-content: center; background: rgba(10, 10, 30, 0.85); backdrop-filter: blur(6px); opacity: 0; transition: opacity 0.4s ease; }',
      '.email-overlay.visible { opacity: 1; }',
      '.email-modal { background: linear-gradient(145deg, #1a1a2e, #16213e); border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; padding: 2.5rem 2rem; max-width: 440px; width: 90%; text-align: center; transform: translateY(20px) scale(0.97); transition: transform 0.4s ease; box-shadow: 0 24px 64px rgba(0,0,0,0.5); }',
      '.email-overlay.visible .email-modal { transform: translateY(0) scale(1); }',
      '.email-modal h2 { color: #fff; font-size: 1.5rem; margin-bottom: 0.5rem; line-height: 1.3; }',
      '.em-sub { color: rgba(255,255,255,0.65); font-size: 0.9375rem; margin-bottom: 1.5rem; line-height: 1.5; }',
      '.em-score-preview { display: inline-flex; align-items: center; gap: 0.5rem; background: rgba(255,255,255,0.08); border-radius: 10px; padding: 0.625rem 1.25rem; margin-bottom: 1.25rem; color: #fff; font-size: 1rem; font-weight: 600; }',
      '.em-btn { width: 100%; padding: 0.875rem; margin-top: 0.75rem; border: none; border-radius: 10px; background: linear-gradient(135deg, #3b82f6, #0f3460); color: #fff; font-size: 1.0625rem; font-weight: 600; cursor: pointer; transition: transform 0.15s, box-shadow 0.15s; }',
      '.em-btn:hover { transform: translateY(-1px); box-shadow: 0 4px 20px rgba(59,130,246,0.4); }',
      '.em-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; box-shadow: none; }',
      '',
      '/* Submit prompt animation */',
      '#submitPrompt .card { animation: tef-fadeIn 0.3s ease; }',
      '@keyframes tef-fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }',
      '',
      '/* Mobile adjustments */',
      '@media (max-width: 600px) {',
      '  .q-dot { width: 28px; height: 28px; font-size: 0.65rem; }',
      '  .test-timer { padding: 0.375rem 0.75rem; font-size: 0.8125rem; }',
      '  .email-modal { padding: 2rem 1.25rem; }',
      '  .email-modal h2 { font-size: 1.25rem; }',
      '}',
      '',
      '/* TTS Button */',
      '.tts-btn { display: inline-flex; align-items: center; gap: 0.375rem; padding: 0.5rem 1rem; background: linear-gradient(135deg, #3b82f6, #2563eb); color: #fff; border: none; border-radius: 8px; font-size: 0.875rem; font-weight: 600; cursor: pointer; transition: all 0.2s; }',
      '.tts-btn:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(59,130,246,0.3); }',
      '.tts-btn.tts-playing { background: linear-gradient(135deg, #ef4444, #dc2626); animation: tts-pulse 1.5s ease-in-out infinite; }',
      '@keyframes tts-pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.8; } }'
    ].join('\n');

    document.head.appendChild(style);
  }
};
