/* ========== French Text-to-Speech Engine ========== */
var FrenchTTS = {
  _voice: null,
  _ready: false,
  _speaking: false,

  init: function () {
    if (!window.speechSynthesis) return;
    var self = this;

    // Load voices (async in some browsers)
    function loadVoices() {
      var voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        self._voice = self._pickBestVoice(voices);
        self._ready = true;
      }
    }

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
  },

  _pickBestVoice: function (voices) {
    var frenchVoices = voices.filter(function (v) {
      return v.lang.startsWith('fr');
    });
    if (frenchVoices.length === 0) return null;

    // Priority order: premium/enhanced voices first, then by name preference
    // macOS enhanced voices (best quality on Mac)
    var premium = ['Audrey (Enhanced)', 'Thomas (Enhanced)', 'Amelie (Enhanced)',
                   'Audrey (Premium)', 'Thomas (Premium)', 'Amelie (Premium)'];
    for (var i = 0; i < premium.length; i++) {
      var match = frenchVoices.find(function (v) { return v.name.includes(premium[i]); });
      if (match) return match;
    }

    // Standard good voices
    var preferred = ['Audrey', 'Thomas', 'Amelie', 'Marie', 'Google français',
                     'Microsoft Denise', 'Microsoft Paul', 'Microsoft Julie'];
    for (var j = 0; j < preferred.length; j++) {
      var match2 = frenchVoices.find(function (v) { return v.name.includes(preferred[j]); });
      if (match2) return match2;
    }

    // Prefer fr-FR over fr-CA for standard accent
    var frFR = frenchVoices.find(function (v) { return v.lang === 'fr-FR'; });
    if (frFR) return frFR;

    return frenchVoices[0];
  },

  /**
   * Speak French text aloud
   * @param {string} text - French text to speak
   * @param {object} opts - { speed: 'slow'|'normal'|'fast', onStart, onEnd, onError }
   * @returns {SpeechSynthesisUtterance|null}
   */
  speak: function (text, opts) {
    opts = opts || {};
    if (!window.speechSynthesis || !text) {
      if (opts.onError) opts.onError();
      return null;
    }

    // Cancel any ongoing speech
    this.stop();

    var utterance = new SpeechSynthesisUtterance(text);

    // Set French voice
    if (this._voice) utterance.voice = this._voice;
    utterance.lang = 'fr-FR';

    // Speed settings — slightly slower than default for clarity
    var speedMap = { slow: 0.65, normal: 0.85, fast: 1.1 };
    utterance.rate = speedMap[opts.speed] || speedMap.normal;

    // Natural pitch — slightly lower for warmth
    utterance.pitch = 0.95;

    // Volume
    utterance.volume = 1.0;

    var self = this;

    utterance.onstart = function () {
      self._speaking = true;
      if (opts.onStart) opts.onStart();
    };

    utterance.onend = function () {
      self._speaking = false;
      if (opts.onEnd) opts.onEnd();
    };

    utterance.onerror = function () {
      self._speaking = false;
      if (opts.onError) opts.onError();
    };

    // Chrome bug workaround: long texts get cut off after ~15 seconds
    // Split into sentences and chain them
    if (text.length > 200) {
      this._speakChunked(text, utterance, opts);
      return utterance;
    }

    window.speechSynthesis.speak(utterance);
    return utterance;
  },

  _speakChunked: function (text, baseUtterance, opts) {
    // Split by sentence endings
    var sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
    var self = this;
    var index = 0;
    self._speaking = true;

    if (opts.onStart) opts.onStart();

    function speakNext() {
      if (index >= sentences.length || !self._speaking) {
        self._speaking = false;
        if (opts.onEnd) opts.onEnd();
        return;
      }

      var chunk = new SpeechSynthesisUtterance(sentences[index].trim());
      if (self._voice) chunk.voice = self._voice;
      chunk.lang = 'fr-FR';
      chunk.rate = baseUtterance.rate;
      chunk.pitch = baseUtterance.pitch;
      chunk.volume = baseUtterance.volume;

      chunk.onend = function () {
        index++;
        // Small pause between sentences for natural rhythm
        setTimeout(speakNext, 250);
      };
      chunk.onerror = function () {
        self._speaking = false;
        if (opts.onError) opts.onError();
      };

      window.speechSynthesis.speak(chunk);
    }

    speakNext();
  },

  stop: function () {
    this._speaking = false;
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  },

  isSpeaking: function () {
    return this._speaking;
  },

  isAvailable: function () {
    return !!window.speechSynthesis;
  },

  getVoiceName: function () {
    return this._voice ? this._voice.name : 'Default';
  }
};

// Auto-initialize
FrenchTTS.init();
