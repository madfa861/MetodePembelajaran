document.addEventListener('DOMContentLoaded', () => {
  const tabs = document.querySelectorAll('.tab-button');
  tabs.forEach((tab) => {
    tab.addEventListener('click', () => switchTab(tab.dataset.tab));
  });

  const quizForm = document.getElementById('quiz-form');
  if (quizForm) {
    quizForm.addEventListener('submit', handleQuizSubmit);
  }

  initScrollReveal();
  initPageTransition();
  document.body.classList.add('page-loaded');
});

function initScrollReveal() {
  const revealElements = document.querySelectorAll('section, .course-card, .card, .info-box, .site-header, .site-footer');
  const observerOptions = {
    threshold: 0.18,
    rootMargin: '0px 0px -10% 0px'
  };

  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('reveal-visible');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  revealElements.forEach((element) => {
    element.classList.add('reveal-element');
    revealObserver.observe(element);
  });
}

function initPageTransition() {
  const links = document.querySelectorAll('a[href$=".html"]:not([target="_blank"]):not([download])');
  links.forEach((link) => {
    link.addEventListener('click', (event) => {
      const isModified = event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0;
      if (isModified) return;
      const href = link.getAttribute('href');
      if (!href || href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('#')) return;
      event.preventDefault();
      document.body.classList.add('page-exiting');
      window.setTimeout(() => {
        window.location.href = href;
      }, 220);
    });
  });
}

function switchTab(tabName) {
  const buttons = document.querySelectorAll('.tab-button');
  const panels = document.querySelectorAll('.course-panel');
  buttons.forEach((button) => button.classList.toggle('active', button.dataset.tab === tabName));
  panels.forEach((panel) => panel.classList.toggle('active', panel.id === tabName));
}

function checkHafalan() {
  const answer = document.getElementById('hafalan-answer').value;
  const normalized = answer.replace(/[^\w\u0600-\u06FF]+/g, '').toLowerCase();
  const target = 'اللَّهُالصَّمَدُ';
  const result = document.getElementById('hafalan-result');
  const score = document.getElementById('hafalan-score');

  if (normalized === target.toLowerCase()) {
    result.textContent = 'Bagus! Jawaban benar, kamu berhasil melengkapi ayat dengan tepat.';
    result.style.color = '#16a34a';
    score.textContent = '100';
  } else {
    result.textContent = 'Jawaban belum tepat. Coba periksa tulisan ayat dan pastikan hurufnya benar.';
    result.style.color = '#dc2626';
    score.textContent = '0';
  }
}

function playAudioExample() {
  const audio = document.getElementById('tajwid-audio');
  if (audio) {
    audio.volume = 1;
    audio.muted = false;
    audio.play().catch((err) => {
      console.warn('Audio play failed:', err);
      if ('speechSynthesis' in window) {
        const text = 'مِنْ نِعْمَتِهِ';
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'ar-SA';
        utterance.rate = 0.8;
        utterance.pitch = 1.1;
        utterance.volume = 1;
        speechSynthesis.speak(utterance);
      } else {
        alert('Audio tidak bisa diputar. Pastikan browser mendukung pemutaran audio dan volume tidak dimatikan.');
      }
    });
    return;
  }

  if ('speechSynthesis' in window) {
    const text = 'مِنْ نِعْمَتِهِ';
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ar-SA';
    utterance.rate = 0.8;
    utterance.pitch = 1.1;
    utterance.volume = 1;
    speechSynthesis.speak(utterance);
    return;
  }

  alert('Browser Anda tidak mendukung fitur audio otomatis.');
}

function playTajwidExample(type) {
  const map = {
    izhar: { id: 'audio-izhar', text: 'مِنْ هَٰذَا' },
    idgham: { id: 'audio-idgham', text: 'مِنْ يَوْمٍ' },
    ikhfa: { id: 'audio-ikhfa', text: 'مِنْ شَرِّ' },
    iqlab: { id: 'audio-iqlab', text: 'مِنۢ بَعْدِهِ' }
  };

  const item = map[type];
  if (!item) return;

  const audioEl = document.getElementById(item.id);
  if (audioEl) {
    audioEl.currentTime = 0;
    audioEl.volume = 1;
    audioEl.play().catch((err) => {
      console.warn('Audio play failed:', err);
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(item.text);
        utterance.lang = 'ar-SA';
        utterance.rate = 0.9;
        speechSynthesis.speak(utterance);
      } else {
        alert('Gagal memutar audio. Pastikan file audio tersedia atau gunakan browser yang mendukung.');
      }
    });
    return;
  }

  if ('speechSynthesis' in window) {
    const utterance = new SpeechSynthesisUtterance(item.text);
    utterance.lang = 'ar-SA';
    utterance.rate = 0.9;
    speechSynthesis.speak(utterance);
    return;
  }

  alert('Browser Anda tidak mendukung pemutaran audio atau speechSynthesis.');
}

function startSpeechTest() {
  const status = document.getElementById('speech-status');
  const feedback = document.getElementById('speech-feedback');
  feedback.textContent = '';

  // helper: compute Levenshtein distance
  function levenshtein(a, b) {
    if (a === b) return 0;
    const al = a.length;
    const bl = b.length;
    if (al === 0) return bl;
    if (bl === 0) return al;
    const v0 = new Array(bl + 1);
    const v1 = new Array(bl + 1);
    for (let j = 0; j <= bl; j++) v0[j] = j;
    for (let i = 0; i < al; i++) {
      v1[0] = i + 1;
      for (let j = 0; j < bl; j++) {
        const cost = a[i] === b[j] ? 0 : 1;
        v1[j + 1] = Math.min(v1[j] + 1, v0[j + 1] + 1, v0[j] + cost);
      }
      for (let j = 0; j <= bl; j++) v0[j] = v1[j];
    }
    return v1[bl];
  }

  // helper: normalize text (remove punctuation/diacritics/whitespace, lowercase)
  function normalizeText(s) {
    if (!s) return '';
    // remove common punctuation and whitespace
    return s.replace(/[\u064B-\u0652\u0610-\u061A\u06D6-\u06ED\s\p{P}\p{S}]+/gu, '').toLowerCase();
  }

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    status.textContent = 'Browser tidak mendukung tes suara otomatis. Gunakan Chrome/Edge desktop untuk dukungan terbaik.';
    return;
  }

  // Request microphone permission first — gives clearer feedback if user blocks mic
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    status.textContent = 'API mikrofon tidak tersedia di browser ini.';
    status.style.color = '#dc2626';
    return;
  }

  navigator.mediaDevices.getUserMedia({ audio: true }).then(() => {
    const recognition = new SpeechRecognition();
    recognition.lang = 'ar-SA';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.continuous = false;
    status.textContent = 'Sedang mendengarkan... baca teks contoh dengan jelas.';
    status.style.color = '';

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript || '';
      feedback.innerHTML = '<strong>Hasil pengenalan suara:</strong> ' + transcript;

      // get expected text from page if available
      const expectedEl = document.getElementById('tajwid-text');
      const expectedRaw = expectedEl ? expectedEl.textContent || expectedEl.innerText || '' : '';

      const normActual = normalizeText(transcript);
      const normExpected = normalizeText(expectedRaw);

      // compute accuracy percentage using Levenshtein distance
      let accuracy = 0;
      if (normExpected.length === 0 && normActual.length === 0) {
        accuracy = 100;
      } else if (normExpected.length === 0) {
        accuracy = 0;
      } else {
        const dist = levenshtein(normExpected, normActual);
        const maxLen = Math.max(normExpected.length, normActual.length);
        accuracy = Math.max(0, Math.round((1 - dist / Math.max(1, maxLen)) * 100));
      }

      // display accuracy
      const scoreEl = document.getElementById('speech-score');
      if (scoreEl) {
        scoreEl.textContent = accuracy + '%';
      } else {
        const el = document.createElement('div');
        el.id = 'speech-score';
        el.style.fontWeight = '700';
        el.style.marginTop = '0.5rem';
        el.textContent = 'Akurasi: ' + accuracy + '%';
        feedback.parentNode.insertBefore(el, feedback.nextSibling);
      }

      if (accuracy >= 80) {
        status.textContent = 'Pelafalan sangat baik — mendekati contoh.';
        status.style.color = '#16a34a';
      } else if (accuracy >= 50) {
        status.textContent = 'Pelafalan cukup — ada beberapa kesalahan kecil.';
        status.style.color = '#f59e0b';
      } else {
        status.textContent = 'Pelafalan belum sesuai. Coba ulangi dengan lebih jelas.';
        status.style.color = '#dc2626';
      }
    };

    recognition.onerror = (event) => {
      console.warn('SpeechRecognition error:', event);
      const err = (event && event.error) ? event.error : 'unknown_error';
      if (err === 'not-allowed' || err === 'service-not-allowed') {
        status.textContent = 'Izin mikrofon diblokir. Periksa pengaturan browser dan izinkan akses mikrofon.';
      } else if (err === 'no-speech') {
        status.textContent = 'Tidak ada suara terdeteksi. Pastikan mikrofon menyala dan coba lagi.';
      } else {
        status.textContent = 'Pengenalan suara gagal: ' + err + '. Coba lagi atau gunakan mode manual.';
      }
      status.style.color = '#dc2626';
    };

    recognition.onend = () => {
      if (status.textContent && status.textContent.startsWith('Sedang')) {
        status.textContent = 'Tes suara selesai.';
      }
    };

    try {
      recognition.start();
    } catch (err) {
      console.warn('recognition.start() failed:', err);
      status.textContent = 'Gagal memulai pengenalan suara. Coba lagi.';
      status.style.color = '#dc2626';
    }
  }).catch((err) => {
    console.warn('getUserMedia error:', err);
    status.textContent = 'Izin mikrofon ditolak atau tidak tersedia. Izinkan mikrofon lalu coba lagi.';
    status.style.color = '#dc2626';
  });
}

// Manual recording fallback using MediaRecorder
let _mediaRecorder = null;
let _recordedChunks = [];

function startManualRecording() {
  const startBtn = document.getElementById('manual-start');
  const stopBtn = document.getElementById('manual-stop');
  const status = document.getElementById('speech-status');
  const manualAudio = document.getElementById('manual-audio');
  const downloadLink = document.getElementById('download-audio');

  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    status.textContent = 'Perekaman tidak tersedia di browser ini.';
    status.style.color = '#dc2626';
    return;
  }

  navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
    _recordedChunks = [];
    _mediaRecorder = new MediaRecorder(stream);

    _mediaRecorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) _recordedChunks.push(e.data);
    };

    _mediaRecorder.onstop = () => {
      const blob = new Blob(_recordedChunks, { type: 'audio/webm' });
      const url = URL.createObjectURL(blob);
      manualAudio.src = url;
      manualAudio.style.display = 'block';
      downloadLink.href = url;
      downloadLink.style.display = 'inline-block';
      // stop all tracks to free microphone
      stream.getTracks().forEach(t => t.stop());
    };

    try {
      _mediaRecorder.start();
      startBtn.disabled = true;
      stopBtn.disabled = false;
      status.textContent = 'Merekam...';
      status.style.color = '';
    } catch (err) {
      console.warn('MediaRecorder.start error:', err);
      status.textContent = 'Tidak dapat mulai rekaman.';
      status.style.color = '#dc2626';
    }
  }).catch((err) => {
    console.warn('getUserMedia (manual) error:', err);
    status.textContent = 'Izin mikrofon ditolak atau tidak tersedia untuk perekaman manual.';
    status.style.color = '#dc2626';
  });
}

function stopManualRecording() {
  const startBtn = document.getElementById('manual-start');
  const stopBtn = document.getElementById('manual-stop');
  const status = document.getElementById('speech-status');

  if (_mediaRecorder && _mediaRecorder.state !== 'inactive') {
    _mediaRecorder.stop();
    startBtn.disabled = false;
    stopBtn.disabled = true;
    status.textContent = 'Rekaman selesai. Putar untuk mendengarkan.';
    status.style.color = '#16a34a';
  }
}

function handleQuizSubmit(event) {
  event.preventDefault();

  const quizData = {
    q1: {
      answer: 'a',
      explanation: 'Surah Al-Ikhlas dibuka dengan lafaz "قُلْ هُوَ اللَّهُ أَحَدٌ" yang menyatakan keesaan Allah.'
    },
    q2: {
      answer: 'c',
      explanation: 'Ikhfa adalah hukum nun mati/tanwin yang dibaca dengan dengung halus ketika bertemu huruf ikhfa.'
    },
    q3: {
      answer: 'a',
      explanation: 'Hadis tersebut menyebutkan Allah memberi minum dari "telaga-Ku" pada hari kiamat bagi yang memberi minum orang haus di jalan-Nya.'
    },
    q4: {
      answer: 'a',
      explanation: 'Surah Al-Falaq memohon perlindungan dari kejahatan makhluk, sihir, dan kejahatan malam.'
    },
    q5: {
      answer: 'a',
      explanation: 'Surah An-Nas meminta perlindungan dari bisikan setan yang masuk ke dalam hati manusia.'
    },
    q6: {
      answer: 'b',
      explanation: 'Ikhfa dibaca dengan dengung halus ketika nun mati bertemu huruf-huruf ikhfa, bukan dibaca jelas.'
    }
  };

  const result = document.getElementById('quiz-result');
  const score = document.getElementById('quiz-score');
  const explanations = document.getElementById('quiz-explanations');
  let correctCount = 0;
  const unanswered = [];
  const explanationHtml = [];

  Object.keys(quizData).forEach((key, index) => {
    const selected = document.querySelector(`input[name="${key}"]:checked`);
    if (!selected) {
      unanswered.push(key);
      return;
    }
    const isCorrect = selected.value === quizData[key].answer;
    if (isCorrect) {
      correctCount += 1;
    }
    const status = isCorrect ? 'Benar' : 'Kurang tepat';
    explanationHtml.push(`<div class="quiz-explanation"><strong>Soal ${index + 1}:</strong> ${status}. ${quizData[key].explanation}</div>`);
  });

  if (unanswered.length > 0) {
    result.textContent = `Jawab semua pertanyaan terlebih dahulu. Tersisa ${unanswered.length} pertanyaan.`;
    result.style.color = '#dc2626';
    score.textContent = '';
    explanations.innerHTML = '';
    return;
  }

  const totalQuestions = Object.keys(quizData).length;
  const percentage = Math.round((correctCount / totalQuestions) * 100);

  result.textContent = `Kamu menjawab ${correctCount} dari ${totalQuestions} benar.`;
  score.textContent = `Skor kamu: ${percentage}%`;
  result.style.color = percentage >= 75 ? '#16a34a' : '#dc2626';
  explanations.innerHTML = explanationHtml.join('');
}
