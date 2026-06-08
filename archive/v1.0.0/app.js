/* Sight Reading Coach - static, localStorage-powered MVP */
const APP_VERSION = '1.0.0';
const VERSION_HISTORY_FALLBACK = [
  { version: '1.0.0', status: 'current', date: '2026-06-08', path: './index.html', notes: 'Polished MVP with adaptive note, interval, rhythm, mini sight-reading, local progress, and version switcher.' },
  { version: '0.0.1', status: 'previous', date: '2026-06-08', path: './archive/v0.0.1/index.html', notes: 'Archived repository starter page.' },
  { version: '1.1.0', status: 'future', date: 'Planned', path: '', notes: 'Planned: richer MIDI support, grand staff phrases, and audio ear-training prompts.' }
];

const STORAGE_KEY = 'sightReadingCoach.v1';
const NOTE_NAMES = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
const LEVELS = [
  { level: 1, focus: 'Landmarks', description: 'Middle C, Treble G, Bass F', noteTags: ['middle-c', 'treble-g', 'bass-f'] },
  { level: 2, focus: 'Near landmarks', description: 'One step above and below landmarks', noteTags: ['middle-c', 'treble-g', 'bass-f', 'near'] },
  { level: 3, focus: 'High and low C', description: 'Add High C and Low C landmarks', noteTags: ['middle-c', 'treble-g', 'bass-f', 'near', 'high-c', 'low-c'] },
  { level: 4, focus: 'Within a fifth', description: 'Notes within a fifth of landmarks', noteTags: ['middle-c', 'treble-g', 'bass-f', 'near', 'high-c', 'low-c', 'fifth'] },
  { level: 5, focus: 'Interval reading', description: 'Steps and skips up to thirds', noteTags: ['middle-c', 'treble-g', 'bass-f', 'near', 'high-c', 'low-c', 'fifth'], intervals: ['same', 'step-up', 'step-down', 'skip-up', 'skip-down'] },
  { level: 6, focus: 'Rhythm reading', description: 'Quarter, half, whole, and eighth notes', noteTags: ['all'], rhythms: true },
  { level: 7, focus: 'One-clef phrases', description: 'Short generated phrases in one clef', noteTags: ['all'], phrases: true },
  { level: 8, focus: 'Both clefs', description: 'Treble and bass practice together', noteTags: ['all'], bothClefs: true },
  { level: 9, focus: 'Ledger lines', description: 'Wider ledger-line range', noteTags: ['all'], ledger: true },
  { level: 10, focus: 'Mixed fluency', description: 'Mixed sight-reading fluency', noteTags: ['all'], mixed: true }
];

const NOTES = [
  { id: 'treble-c4', name: 'C', clef: 'treble', octave: 4, staff: -1, tags: ['middle-c'], label: 'Middle C', base: 1, explanation: 'This is Middle C, the landmark just below the treble staff.' },
  { id: 'bass-c4', name: 'C', clef: 'bass', octave: 4, staff: 6, tags: ['middle-c'], label: 'Middle C', base: 1, explanation: 'This is Middle C, the landmark just above the bass staff.' },
  { id: 'treble-g4', name: 'G', clef: 'treble', octave: 4, staff: 2, tags: ['treble-g'], label: 'Treble G', base: 1, explanation: 'Treble G sits on the second line of the treble staff, where the treble clef curls.' },
  { id: 'bass-f3', name: 'F', clef: 'bass', octave: 3, staff: 2, tags: ['bass-f'], label: 'Bass F', base: 1, explanation: 'Bass F sits on the fourth line of the bass staff, between the two clef dots.' },
  { id: 'treble-b3', name: 'B', clef: 'treble', octave: 3, staff: -0.5, tags: ['near'], label: 'Step below Middle C', base: 1.2, explanation: 'This is one step below Middle C, so it is B.' },
  { id: 'treble-d4', name: 'D', clef: 'treble', octave: 4, staff: -0.5, tags: ['near'], label: 'Step above Middle C', base: 1.2, explanation: 'This is one step above Middle C, so it is D.' },
  { id: 'bass-b3', name: 'B', clef: 'bass', octave: 3, staff: 5.5, tags: ['near'], label: 'Step below Middle C', base: 1.2, explanation: 'This is one step below Middle C, so it is B.' },
  { id: 'bass-d4', name: 'D', clef: 'bass', octave: 4, staff: 6.5, tags: ['near'], label: 'Step above Middle C', base: 1.2, explanation: 'This is one step above Middle C, so it is D.' },
  { id: 'treble-f4', name: 'F', clef: 'treble', octave: 4, staff: 1.5, tags: ['near'], label: 'Step below Treble G', base: 1.3, explanation: 'This is one step below Treble G, so it is F.' },
  { id: 'treble-a4', name: 'A', clef: 'treble', octave: 4, staff: 2.5, tags: ['near'], label: 'Step above Treble G', base: 1.3, explanation: 'This is one step above Treble G, so it is A.' },
  { id: 'bass-e3', name: 'E', clef: 'bass', octave: 3, staff: 1.5, tags: ['near'], label: 'Step below Bass F', base: 1.3, explanation: 'This is one step below Bass F, so it is E.' },
  { id: 'bass-g3', name: 'G', clef: 'bass', octave: 3, staff: 2.5, tags: ['near'], label: 'Step above Bass F', base: 1.3, explanation: 'This is one step above Bass F, so it is G.' },
  { id: 'treble-c5', name: 'C', clef: 'treble', octave: 5, staff: 4, tags: ['high-c', 'fifth'], label: 'High C', base: 1.5, explanation: 'This is High C, one octave above Middle C and a fourth above Treble G.' },
  { id: 'bass-c3', name: 'C', clef: 'bass', octave: 3, staff: 0, tags: ['low-c', 'fifth'], label: 'Low C', base: 1.5, explanation: 'This is Low C, a fifth below Bass F.' },
  { id: 'treble-e4', name: 'E', clef: 'treble', octave: 4, staff: 1, tags: ['fifth'], label: 'Third above Middle C', base: 1.4, explanation: 'This is a third above Middle C: C to D to E.' },
  { id: 'treble-b4', name: 'B', clef: 'treble', octave: 4, staff: 3.5, tags: ['fifth'], label: 'Third above Treble G', base: 1.6, explanation: 'This is a third above Treble G: G to A to B.' },
  { id: 'bass-a3', name: 'A', clef: 'bass', octave: 3, staff: 3, tags: ['fifth'], label: 'Third above Bass F', base: 1.6, explanation: 'This is a third above Bass F: F to G to A.' },
  { id: 'bass-d3', name: 'D', clef: 'bass', octave: 3, staff: .5, tags: ['fifth'], label: 'Third below Bass F', base: 1.6, explanation: 'This is a third below Bass F: F down to E, then D.' },
  { id: 'treble-c6', name: 'C', clef: 'treble', octave: 6, staff: 7.5, tags: ['all'], label: 'Ledger C', base: 2.4, explanation: 'This ledger-line C is high above the treble staff. Relate it back to High C and count upward.' },
  { id: 'bass-c2', name: 'C', clef: 'bass', octave: 2, staff: -3.5, tags: ['all'], label: 'Low ledger C', base: 2.4, explanation: 'This ledger-line C is below the bass staff. Relate it to Low C and count downward.' }
];

let state = loadState();
let currentMode = 'note';
let currentExercise = null;
let exerciseStartedAt = 0;
let answered = false;
let session = null;
let rhythmTimer = null;
let rhythmStart = 0;
let rhythmTaps = [];

const el = id => document.getElementById(id);
const today = () => new Date().toISOString().slice(0, 10);
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const avg = arr => arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;

function defaultState() {
  return {
    settings: { theme: 'light', sound: true, manualLevel: 1 },
    currentLevel: 1,
    history: [],
    noteStats: {},
    clefStats: {},
    intervalStats: {},
    rhythmStats: { attempts: 0, good: 0, avgScore: 0 },
    daily: {},
    streak: 0,
    lastPracticeDate: null,
    totalCompleted: 0
  };
}

function loadState() {
  try { return { ...defaultState(), ...(JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}) }; }
  catch { return defaultState(); }
}

function saveState() { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }

function statBucket(map, key) {
  if (!map[key]) map[key] = { attempts: 0, correct: 0, totalTime: 0, recent: [] };
  return map[key];
}

function pushRecent(bucket, correct, time, extra = {}) {
  bucket.attempts += 1;
  if (correct) bucket.correct += 1;
  bucket.totalTime += time || 0;
  bucket.recent.push({ correct, time, date: Date.now(), ...extra });
  bucket.recent = bucket.recent.slice(-40);
}

function accuracy(bucket) { return bucket?.attempts ? bucket.correct / bucket.attempts : 0; }
function averageTime(bucket) { return bucket?.attempts ? bucket.totalTime / bucket.attempts : 0; }
function recentAccuracy(items) { return items.length ? items.filter(x => x.correct).length / items.length : 0; }

function currentLevelInfo() { return LEVELS.find(l => l.level === Number(state.settings.manualLevel || state.currentLevel)) || LEVELS[0]; }
function allowedNotes() {
  const level = currentLevelInfo();
  if (level.noteTags.includes('all')) return NOTES;
  return NOTES.filter(n => n.tags.some(t => level.noteTags.includes(t)));
}

function weightedPick(items, weightFn) {
  const weights = items.map(item => Math.max(.05, weightFn(item)));
  const total = weights.reduce((a, b) => a + b, 0);
  let roll = Math.random() * total;
  for (let i = 0; i < items.length; i++) { roll -= weights[i]; if (roll <= 0) return items[i]; }
  return items[items.length - 1];
}

function noteWeight(note) {
  const stats = state.noteStats[note.id];
  const recent = stats?.recent || [];
  const err = recent.length ? 1 - recentAccuracy(recent.slice(-12)) : .45;
  const time = recent.length ? avg(recent.slice(-12).map(r => r.time || 1800)) : 2200;
  const attempts = stats?.attempts || 0;
  const mastered = attempts >= 8 && accuracy(stats) > .9 && averageTime(stats) < 1200;
  const struggle = attempts >= 3 && (accuracy(stats) < .75 || averageTime(stats) > 2500);
  const recencyBoost = recent.length ? clamp((Date.now() - recent[recent.length - 1].date) / 3600000, 0, 2) * .15 : .5;
  return note.base + err * 3 + clamp((time - 1200) / 800, 0, 2.5) + recencyBoost + (attempts < 3 ? .9 : 0) + (struggle ? 1.2 : 0) - (mastered ? 1.15 : 0);
}

function startMode(mode, asSession = false) {
  currentMode = mode;
  answered = false;
  showView('practice');
  el('sessionPill').textContent = asSession ? '5-minute adaptive session' : 'Free practice';
  renderExercise();
}

function startSession(weakOnly = false) {
  session = { started: Date.now(), ends: Date.now() + 5 * 60 * 1000, attempts: [], weakOnly };
  startMode(chooseSessionMode(), true);
}

function chooseSessionMode() {
  if (session?.weakOnly) return 'note';
  const rhythmWeak = state.rhythmStats.attempts > 2 && state.rhythmStats.avgScore < .7;
  const intervalBuckets = Object.values(state.intervalStats);
  const intervalWeak = intervalBuckets.some(b => b.attempts > 2 && accuracy(b) < .75);
  const roll = Math.random();
  if (rhythmWeak && roll < .18) return 'rhythm';
  if (intervalWeak && roll < .45) return 'interval';
  if (roll < .50) return 'note';
  if (roll < .75) return 'interval';
  if (roll < .90) return 'sight';
  return 'rhythm';
}

function renderExercise() {
  clearInterval(rhythmTimer);
  answered = false;
  exerciseStartedAt = performance.now();
  el('feedback').className = 'feedback neutral';
  el('feedback').textContent = 'Take a breath, look for a landmark, then answer.';
  el('phraseProgress').classList.add('hidden');
  el('nextBtn').textContent = session ? 'Skip' : 'Next';
  if (currentMode === 'note') renderNoteExercise();
  if (currentMode === 'interval') renderIntervalExercise();
  if (currentMode === 'rhythm') renderRhythmExercise();
  if (currentMode === 'sight') renderSightExercise();
}

function renderNoteExercise() {
  const candidates = session?.weakOnly ? allowedNotes().filter(n => isWeakNote(n)).concat(allowedNotes()).slice(0, allowedNotes().length) : allowedNotes();
  const note = weightedPick(candidates, noteWeight);
  currentExercise = { type: 'note', note, answer: note.name };
  el('modeLabel').textContent = 'Note Trainer';
  el('promptText').textContent = 'Name the note';
  renderStaff(note.clef, [note]);
  renderAnswerButtons(NOTE_NAMES, handleAnswer);
  el('coachTip').textContent = 'Find the nearest landmark first, then count steps or skips from there.';
}

function isWeakNote(note) {
  const b = state.noteStats[note.id];
  return !b || b.attempts < 3 || accuracy(b) < .75 || averageTime(b) > 2500;
}

function renderIntervalExercise() {
  const intervals = currentLevelInfo().level >= 5 ? ['same', 'step-up', 'step-down', 'skip-up', 'skip-down', '4th-up', '4th-down', '5th-up', '5th-down'] : ['same', 'step-up', 'step-down', 'skip-up', 'skip-down'];
  const interval = weightedPick(intervals, key => {
    const b = state.intervalStats[key];
    return 1 + (b ? (1 - accuracy(b)) * 3 + clamp((averageTime(b) - 1500) / 900, 0, 2) : 1);
  });
  const pool = allowedNotes().filter(n => n.staff >= 0 && n.staff <= 4.5);
  const first = pool[Math.floor(Math.random() * pool.length)] || allowedNotes()[0];
  const steps = { same: 0, 'step-up': .5, 'step-down': -.5, 'skip-up': 1, 'skip-down': -1, '4th-up': 1.5, '4th-down': -1.5, '5th-up': 2, '5th-down': -2 }[interval];
  const second = { ...first, id: `${first.id}-${interval}`, staff: clamp(first.staff + steps, -1, 6), name: transposeName(first.name, steps * 2), label: interval };
  currentExercise = { type: 'interval', first, second, answer: interval };
  el('modeLabel').textContent = 'Interval Trainer';
  el('promptText').textContent = 'What is the interval direction?';
  renderStaff(first.clef, [first, second]);
  renderAnswerButtons(['same', 'step-up', 'step-down', 'skip-up', 'skip-down', '4th-up', '4th-down', '5th-up', '5th-down'].filter(x => intervals.includes(x)), handleAnswer);
  el('coachTip').textContent = 'Same line/space means same note. Neighboring line-to-space is a step; line-to-line or space-to-space is a skip.';
}

function transposeName(name, diatonicSteps) {
  const idx = NOTE_NAMES.indexOf(name);
  return NOTE_NAMES[(idx + Math.round(diatonicSteps) + 70) % 7];
}

function renderRhythmExercise() {
  const patterns = [
    { label: '♩ ♩ ♩ ♩', beats: [0, 1, 2, 3], total: 4 },
    { label: '𝅗𝅥 ♩ ♩', beats: [0, 2, 3], total: 4 },
    { label: '♫ ♫ ♩ ♩', beats: [0, .5, 1, 1.5, 2, 3], total: 4 },
    { label: '𝅝', beats: [0], total: 4 }
  ];
  const pattern = patterns[Math.floor(Math.random() * patterns.length)];
  currentExercise = { type: 'rhythm', pattern, answer: 'tap' };
  el('modeLabel').textContent = 'Rhythm Trainer';
  el('promptText').textContent = 'Tap the rhythm with the pulse';
  el('notationArea').innerHTML = `<div class="rhythm-card"><div class="rhythm-pulse" id="pulse">1</div><div class="rhythm-pattern" aria-label="Rhythm pattern">${pattern.label}</div><p class="muted">Tap the on-screen button or press Space on each note attack.</p></div>`;
  renderAnswerButtons(['Start pulse', 'Tap'], rhythmAction);
  el('coachTip').textContent = 'Count steady beats: 1, 2, 3, 4. Eighth notes divide the beat evenly in half.';
}

function rhythmAction(value) {
  if (value === 'Start pulse') startRhythmPulse();
  else recordRhythmTap();
}

function startRhythmPulse() {
  rhythmTaps = [];
  rhythmStart = performance.now() + 450;
  let beat = 0;
  clearInterval(rhythmTimer);
  rhythmTimer = setInterval(() => {
    const pulse = el('pulse');
    if (!pulse) return;
    beat = (beat % 4) + 1;
    pulse.textContent = beat;
    pulse.classList.add('on');
    setTimeout(() => pulse.classList.remove('on'), 130);
  }, 600);
  el('feedback').textContent = 'Pulse started. Tap the rhythm notes, not every beat.';
}

function recordRhythmTap() {
  if (!rhythmStart) startRhythmPulse();
  rhythmTaps.push((performance.now() - rhythmStart) / 600);
  if (rhythmTaps.length >= currentExercise.pattern.beats.length) gradeRhythm();
}

function gradeRhythm() {
  clearInterval(rhythmTimer);
  const expected = currentExercise.pattern.beats;
  const diffs = expected.map((b, i) => Math.abs((rhythmTaps[i] ?? 99) - b));
  const avgDiff = avg(diffs);
  const score = clamp(1 - avgDiff / .45, 0, 1);
  const correct = score >= .68;
  const label = score > .82 ? 'Good' : score > .55 ? 'Close' : 'Try again';
  recordResult(correct, Math.round((performance.now() - exerciseStartedAt)), { rhythmScore: score });
  showFeedback(correct, `${label}: average timing was ${avgDiff.toFixed(2)} beats from the target.`);
  answered = true;
}

function renderSightExercise() {
  const clef = currentLevelInfo().level >= 8 && Math.random() > .5 ? 'bass' : (Math.random() > .5 ? 'treble' : 'bass');
  const pool = allowedNotes().filter(n => n.clef === clef);
  let phrase = [weightedPick(pool, noteWeight)];
  for (let i = 1; i < (currentLevelInfo().level >= 7 ? 6 : 4); i++) {
    const prev = phrase[i - 1];
    const maxMove = currentLevelInfo().level >= 5 ? 1.5 : .5;
    const nexts = pool.filter(n => Math.abs(n.staff - prev.staff) <= maxMove && n.id !== prev.id);
    phrase.push(nexts[Math.floor(Math.random() * nexts.length)] || weightedPick(pool, noteWeight));
  }
  currentExercise = { type: 'sight', phrase, index: 0, answer: phrase[0].name, started: performance.now(), correctCount: 0 };
  el('modeLabel').textContent = 'Mini Sight Reading';
  el('promptText').textContent = 'Play through the phrase by note name';
  renderStaff(clef, phrase);
  renderPhraseProgress();
  renderAnswerButtons(NOTE_NAMES, handleAnswer);
  el('coachTip').textContent = 'Read the shape: mostly stepwise motion at first, with occasional skips as you improve.';
}

function renderPhraseProgress() {
  el('phraseProgress').classList.remove('hidden');
  el('phraseProgress').innerHTML = currentExercise.phrase.map((_, i) => `<span class="phrase-dot ${i < currentExercise.index ? 'done' : i === currentExercise.index ? 'current' : ''}"></span>`).join('');
}

function renderAnswerButtons(values, handler) {
  el('answerArea').innerHTML = '';
  values.forEach(value => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'answer-btn';
    btn.textContent = value.replaceAll('-', ' ');
    btn.setAttribute('aria-label', `Answer ${btn.textContent}`);
    btn.addEventListener('click', () => handler(value, btn));
    el('answerArea').appendChild(btn);
  });
}

function handleAnswer(value, btn) {
  if (answered && currentExercise.type !== 'sight') return;
  const time = Math.round(performance.now() - exerciseStartedAt);
  const correct = value === currentExercise.answer;
  btn?.classList.add(correct ? 'correct' : 'wrong');
  if (currentExercise.type === 'sight') {
    if (correct) currentExercise.correctCount += 1;
    currentExercise.index += 1;
    if (currentExercise.index >= currentExercise.phrase.length) {
      recordResult(currentExercise.correctCount === currentExercise.phrase.length, Math.round(performance.now() - currentExercise.started), { phraseAccuracy: currentExercise.correctCount / currentExercise.phrase.length });
      showFeedback(currentExercise.correctCount === currentExercise.phrase.length, `Phrase complete: ${currentExercise.correctCount}/${currentExercise.phrase.length} notes correct.`);
      answered = true;
    } else {
      currentExercise.answer = currentExercise.phrase[currentExercise.index].name;
      renderPhraseProgress();
      showFeedback(correct, correct ? 'Correct. Keep the line moving.' : `That note was ${currentExercise.phrase[currentExercise.index - 1].name}. Continue from the next note.`);
    }
    return;
  }
  recordResult(correct, time, { userAnswer: value });
  showFeedback(correct, correct ? `Correct — ${time} ms. ${currentExercise.note?.explanation || intervalExplanation(currentExercise.answer)}` : `Not quite. Correct answer: ${currentExercise.answer.replaceAll('-', ' ')}. ${currentExercise.note?.explanation || intervalExplanation(currentExercise.answer)}`);
  answered = true;
}

function intervalExplanation(key) {
  return ({ same: 'Both notes share the same staff position.', 'step-up': 'The second note moves to the next line or space upward.', 'step-down': 'The second note moves to the next line or space downward.', 'skip-up': 'The second note skips upward from line to line or space to space.', 'skip-down': 'The second note skips downward from line to line or space to space.', '4th-up': 'Count four note names upward from the first note.', '4th-down': 'Count four note names downward from the first note.', '5th-up': 'Count five note names upward from the first note.', '5th-down': 'Count five note names downward from the first note.' }[key] || 'Use the distance between noteheads to identify the interval.');
}

function recordResult(correct, time, extra = {}) {
  const entry = { type: currentExercise.type, correct, responseTime: time, timestamp: Date.now(), ...extra };
  if (currentExercise.type === 'note') {
    Object.assign(entry, { noteId: currentExercise.note.id, note: currentExercise.note.name, clef: currentExercise.note.clef, staff: currentExercise.note.staff, correctAnswer: currentExercise.answer });
    pushRecent(statBucket(state.noteStats, currentExercise.note.id), correct, time);
    pushRecent(statBucket(state.clefStats, currentExercise.note.clef), correct, time);
  } else if (currentExercise.type === 'interval') {
    Object.assign(entry, { interval: currentExercise.answer, clef: currentExercise.first.clef });
    pushRecent(statBucket(state.intervalStats, currentExercise.answer), correct, time);
    pushRecent(statBucket(state.clefStats, currentExercise.first.clef), correct, time);
  } else if (currentExercise.type === 'rhythm') {
    state.rhythmStats.attempts += 1;
    state.rhythmStats.good += correct ? 1 : 0;
    state.rhythmStats.avgScore = ((state.rhythmStats.avgScore * (state.rhythmStats.attempts - 1)) + (extra.rhythmScore || 0)) / state.rhythmStats.attempts;
  }
  state.history.push(entry);
  state.history = state.history.slice(-1200);
  state.totalCompleted += 1;
  updateDaily(correct, time);
  maybeLevelUp();
  saveState();
  session?.attempts.push(entry);
}

function updateDaily(correct, time) {
  const day = today();
  if (!state.daily[day]) state.daily[day] = { attempts: 0, correct: 0, totalTime: 0 };
  state.daily[day].attempts += 1;
  if (correct) state.daily[day].correct += 1;
  state.daily[day].totalTime += time || 0;
  if (state.lastPracticeDate !== day) {
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    state.streak = state.lastPracticeDate === yesterday ? state.streak + 1 : 1;
    state.lastPracticeDate = day;
  }
}

function maybeLevelUp() {
  const level = Number(state.settings.manualLevel || state.currentLevel);
  if (level >= 10) return;
  const relevant = state.history.filter(h => h.type === 'note' || h.type === 'interval').slice(-20);
  if (relevant.length < 20) return;
  const acc = recentAccuracy(relevant);
  const t = avg(relevant.map(r => r.responseTime || 0));
  if (acc >= .85 && t < 1800) {
    state.currentLevel = Math.max(state.currentLevel, level + 1);
    state.settings.manualLevel = state.currentLevel;
    celebrate(`Level up! You are ready for Level ${state.currentLevel}.`);
  }
}

function showFeedback(good, text) {
  el('feedback').className = `feedback ${good ? 'good' : 'bad'}`;
  el('feedback').textContent = text;
  if (state.settings.sound) beep(good ? 660 : 180, good ? .06 : .12);
  if (session && Date.now() > session.ends) endSession();
}

function renderStaff(clef, notes) {
  const width = 760, height = 250, left = 92, top = 70, gap = 18;
  const yFor = staff => top + (4 - staff) * gap;
  const noteSvg = notes.map((note, i) => {
    const x = left + 150 + i * 86;
    const y = yFor(note.staff);
    let ledger = '';
    for (let s = Math.ceil(note.staff); s <= -1; s++) ledger += `<line x1="${x - 24}" x2="${x + 24}" y1="${yFor(s)}" y2="${yFor(s)}" class="staff-line"/>`;
    for (let s = 5; s <= Math.floor(note.staff); s++) ledger += `<line x1="${x - 24}" x2="${x + 24}" y1="${yFor(s)}" y2="${yFor(s)}" class="staff-line"/>`;
    const active = currentExercise?.type === 'sight' && i === currentExercise.index ? ' active-note' : '';
    return `${ledger}<ellipse class="notehead${active}" cx="${x}" cy="${y}" rx="17" ry="12" transform="rotate(-18 ${x} ${y})"/><text x="${x}" y="${height - 24}" text-anchor="middle" class="note-label">${i + 1}</text>`;
  }).join('');
  el('notationArea').innerHTML = `<svg viewBox="0 0 ${width} ${height}" aria-label="${clef} staff"><style>.staff-line{stroke:currentColor;stroke-width:2}.notehead{fill:#243042}.active-note{fill:#6c5ce7}.clef{font:700 44px system-ui}.note-label{fill:var(--muted);font:700 12px system-ui}body.dark .notehead{fill:#f8fafc}body.dark .active-note{fill:#a78bfa}</style><g color="var(--text)">${[0,1,2,3,4].map(i => `<line x1="${left}" x2="${width - 56}" y1="${top + i * gap}" y2="${top + i * gap}" class="staff-line"/>`).join('')}<text x="34" y="${top + 68}" class="clef">${clef === 'treble' ? '𝄞' : '𝄢'}</text>${noteSvg}</g></svg>`;
}

function showView(id) {
  ['dashboard', 'practice', 'progressView', 'summaryView'].forEach(v => el(v).classList.toggle('active', v === id));
  if (id === 'dashboard') renderDashboard();
  if (id === 'progressView') renderProgress();
}

function renderDashboard() {
  const day = state.daily[today()] || { attempts: 0, correct: 0, totalTime: 0 };
  const level = currentLevelInfo();
  el('levelRing').textContent = level.level;
  el('statLevel').textContent = `${level.level}`;
  el('statFocus').textContent = level.focus;
  el('statAccuracy').textContent = day.attempts ? `${Math.round(day.correct / day.attempts * 100)}%` : '—';
  el('statResponse').textContent = day.attempts ? `${Math.round(day.totalTime / day.attempts)} ms` : '—';
  el('statStreak').textContent = `${state.streak || 0} day${state.streak === 1 ? '' : 's'}`;
  el('statCompleted').textContent = state.totalCompleted;
  const weak = weakestNotes(3).map(x => x.note.label).join(', ');
  el('suggestionText').textContent = weak ? `Suggested next session: review ${weak}.` : `Suggested next session: ${level.description}.`;
}

function renderProgress() {
  const days = Object.keys(state.daily).sort().slice(-7);
  makeBars('accuracyChart', days.map(d => ({ label: d.slice(5), value: state.daily[d].correct / state.daily[d].attempts, max: 1 })));
  makeBars('timeChart', days.map(d => ({ label: d.slice(5), value: Math.max(300, state.daily[d].totalTime / state.daily[d].attempts), max: 3500, invert: true })));
  fillList('strongNotes', strongestNotes(5).map(x => `${x.note.label} (${Math.round(accuracy(x.stats) * 100)}%, ${Math.round(averageTime(x.stats))} ms)`), 'Practice a few notes to discover strengths.');
  fillList('weakNotes', weakestNotes(5).map(x => `${x.note.label} (${Math.round(accuracy(x.stats) * 100)}%, ${Math.round(averageTime(x.stats))} ms)`), 'No weak spots yet — start a session.');
  const clefs = Object.entries(state.clefStats).map(([clef, stats]) => ({ clef, acc: accuracy(stats), time: averageTime(stats), attempts: stats.attempts })).filter(c => c.attempts);
  clefs.sort((a, b) => b.acc - a.acc || a.time - b.time);
  el('clefSummary').textContent = clefs.length ? `Strongest clef: ${clefs[0].clef}. Weakest clef: ${clefs[clefs.length - 1].clef}.` : 'Clef statistics will appear after practice.';
  el('projectionText').textContent = projection();
}

function makeBars(id, items) {
  el(id).innerHTML = items.length ? items.map(item => {
    const normalized = item.invert ? 1 - clamp(item.value / item.max, 0, 1) : clamp(item.value / item.max, 0, 1);
    return `<div class="bar" style="height:${Math.max(8, normalized * 130)}px" title="${item.label}: ${Math.round(item.value * (item.max === 1 ? 100 : 1))}${item.max === 1 ? '%' : ' ms'}"><span>${item.label}</span></div>`;
  }).join('') : '<p class="muted">No recent data yet.</p>';
}

function fillList(id, items, empty) { el(id).innerHTML = items.length ? items.map(i => `<li>${i}</li>`).join('') : `<li>${empty}</li>`; }
function notesWithStats() { return NOTES.map(note => ({ note, stats: state.noteStats[note.id] })).filter(x => x.stats?.attempts); }
function strongestNotes(n) { return notesWithStats().sort((a, b) => accuracy(b.stats) - accuracy(a.stats) || averageTime(a.stats) - averageTime(b.stats)).slice(0, n); }
function weakestNotes(n) { return notesWithStats().sort((a, b) => accuracy(a.stats) - accuracy(b.stats) || averageTime(b.stats) - averageTime(a.stats)).slice(0, n); }

function projection() {
  const recent = state.history.slice(-30);
  if (recent.length < 10) return 'Complete about 10 exercises and the coach will estimate your next-level readiness.';
  const acc = recentAccuracy(recent);
  const time = avg(recent.map(r => r.responseTime || 2000));
  if (acc >= .85 && time < 1800) return `You look close to Level ${Math.min(10, currentLevelInfo().level + 1)} now. Try one focused session to confirm.`;
  const sessions = clamp(Math.ceil(((.85 - acc) * 10) + ((time - 1800) / 700)), 2, 12);
  return `At your current pace, you may be ready for Level ${Math.min(10, currentLevelInfo().level + 1)} in about ${sessions}–${sessions + 3} sessions.`;
}

function endSession() {
  clearInterval(rhythmTimer);
  const attempts = session?.attempts || [];
  const acc = recentAccuracy(attempts);
  const time = avg(attempts.map(a => a.responseTime || 0));
  const weak = weakestNotes(3).map(x => x.note.label).join(', ') || 'none yet';
  el('sessionSummary').innerHTML = `<div><strong>Accuracy</strong><br>${attempts.length ? Math.round(acc * 100) : 0}%</div><div><strong>Average response</strong><br>${attempts.length ? Math.round(time) : 0} ms</div><div><strong>Exercises completed</strong><br>${attempts.length}</div><div><strong>Weak spots</strong><br>${weak}</div><div><strong>New notes introduced</strong><br>${allowedNotes().filter(n => (state.noteStats[n.id]?.attempts || 0) < 3).slice(0,3).map(n => n.label).join(', ') || 'Review mode'}</div><div><strong>Recommendation</strong><br>${projection()}</div>`;
  session = null;
  showView('summaryView');
}

function populateLevels() {
  el('levelOverride').innerHTML = LEVELS.map(l => `<option value="${l.level}">Level ${l.level}: ${l.focus}</option>`).join('');
  el('levelOverride').value = state.settings.manualLevel || state.currentLevel;
}

async function populateVersions() {
  let versions = VERSION_HISTORY_FALLBACK;
  try {
    const res = await fetch('./version-history.json');
    if (res.ok) versions = await res.json();
  } catch { /* file:// fallback */ }
  el('versionSelect').innerHTML = versions.map(v => `<option value="${v.version}">${v.version} — ${v.status}</option>`).join('');
  el('versionSelect').value = APP_VERSION;
  el('versionSelect').onchange = e => {
    const picked = versions.find(v => v.version === e.target.value);
    if (!picked) return;
    if (picked.status === 'current') return;
    if (picked.status === 'previous' && picked.path) window.location.href = picked.path;
    if (picked.status === 'future') { alert(`${picked.version} is planned, not released yet. ${picked.notes}`); e.target.value = APP_VERSION; }
  };
}

function exportProgress() {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `sight-reading-coach-progress-${today()}.json`;
  a.click();
  URL.revokeObjectURL(a.href);
}

function importProgress(file) {
  const reader = new FileReader();
  reader.onload = () => {
    try { state = { ...defaultState(), ...JSON.parse(reader.result) }; saveState(); init(); alert('Progress imported.'); }
    catch { alert('Could not import that JSON file.'); }
  };
  reader.readAsText(file);
}

function resetProgress() {
  if (confirm('Reset all Sight Reading Coach progress? This cannot be undone.')) {
    state = defaultState(); saveState(); init(); showView('dashboard');
  }
}

function beep(freq, duration) {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.value = freq; gain.gain.value = .045; osc.connect(gain); gain.connect(ctx.destination); osc.start();
    setTimeout(() => { osc.stop(); ctx.close(); }, duration * 1000);
  } catch { /* unavailable */ }
}

function celebrate(message) {
  el('feedback').className = 'feedback good';
  el('feedback').textContent = message;
}

function explainCurrent() {
  if (currentExercise?.note) showFeedback(true, currentExercise.note.explanation);
  else if (currentExercise?.type === 'interval') showFeedback(true, intervalExplanation(currentExercise.answer));
  else el('feedback').textContent = 'Look for landmarks, count steadily, and keep your eyes moving forward.';
}

function bindEvents() {
  el('startSessionBtn').onclick = () => startSession(false);
  el('weakSpotsBtn').onclick = () => startSession(true);
  el('nextBtn').onclick = () => session && Date.now() > session.ends ? endSession() : startMode(session ? chooseSessionMode() : currentMode, !!session);
  el('endSessionBtn').onclick = () => { session ? endSession() : showView('dashboard'); };
  el('summaryHomeBtn').onclick = () => showView('dashboard');
  el('backFromProgress').onclick = () => showView('dashboard');
  el('exportBtn').onclick = exportProgress;
  el('resetBtn').onclick = resetProgress;
  el('importInput').onchange = e => e.target.files[0] && importProgress(e.target.files[0]);
  el('explainBtn').onclick = explainCurrent;
  el('themeToggle').onclick = () => { state.settings.theme = state.settings.theme === 'dark' ? 'light' : 'dark'; saveState(); applyTheme(); };
  el('soundToggle').onclick = () => { state.settings.sound = !state.settings.sound; saveState(); applySound(); };
  el('levelOverride').onchange = e => { state.settings.manualLevel = Number(e.target.value); saveState(); renderDashboard(); };
  document.querySelectorAll('[data-mode]').forEach(btn => btn.addEventListener('click', () => btn.dataset.mode === 'progress' ? showView('progressView') : startMode(btn.dataset.mode)));
  document.addEventListener('keydown', e => {
    const key = e.key.toUpperCase();
    if (NOTE_NAMES.includes(key) && ['note', 'sight'].includes(currentMode)) handleAnswer(key);
    if (e.code === 'Space' && currentMode === 'rhythm') { e.preventDefault(); recordRhythmTap(); }
  });
}

function applyTheme() { document.body.classList.toggle('dark', state.settings.theme === 'dark'); el('themeToggle').textContent = state.settings.theme === 'dark' ? '☀️' : '🌙'; }
function applySound() { el('soundToggle').textContent = state.settings.sound ? '🔔' : '🔕'; }

function init() {
  populateLevels();
  populateVersions();
  applyTheme();
  applySound();
  renderDashboard();
}

bindEvents();
init();
