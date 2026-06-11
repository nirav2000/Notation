/* Sight Reading Coach - static, localStorage-powered MVP */
const APP_VERSION = '2.0.5';
const VERSION_HISTORY_FALLBACK = [
  { version: '2.0.5', status: 'current', date: '2026-06-11', path: './index.html', notes: 'Adds the coach cockpit dashboard, richer history explorer/replay, per-note phrase analytics, Google sign-in, and safer cloud conflicts.' },
  { version: '2.0.4', status: 'previous', date: '2026-06-10', path: '../v2.0.4/index.html', notes: 'Moves same-name answer hints into a separate reference staff to avoid confusing them with the question note.' },
  { version: '2.0.3', status: 'previous', date: '2026-06-09', path: '../v2.0.3/index.html', notes: 'Makes version switching use a canonical manifest, adds archive validation, and improves archive navigation safety.' },
  { version: '2.0.2', status: 'previous', date: '2026-06-08', path: '../v2.0.2/index.html', notes: 'Improves rhythm tapping, adds a dedicated settings page, fixes archive back paths, and tightens header alignment.' },
  { version: '2.0.1', status: 'previous', date: '2026-06-08', path: '../v2.0.1/index.html', notes: 'Fixes header alignment, session advancement, phrase counting, and adds detailed recent-question review.' },
  { version: '2.0.0', status: 'previous', date: '2026-06-08', path: '../v2.0.0/index.html', notes: 'Major release with user profiles, Firebase cloud sync, clean note-test page, auto-advance, same-note highlighting, and larger clefs.' },
  { version: '1.0.1', status: 'previous', date: '2026-06-08', path: '../v1.0.1/index.html', notes: 'Fixes staff placement accuracy, sight-reading highlighting, and version archive handling.' },
  { version: '1.0.0', status: 'previous', date: '2026-06-08', path: '../v1.0.0/index.html', notes: 'Initial polished MVP with adaptive note, interval, rhythm, mini sight-reading, local progress, and version switcher.' },
  { version: '0.0.1', status: 'previous', date: '2026-06-08', path: '../v0.0.1/index.html', notes: 'Archived repository starter page.' },
  { version: '2.1.0', status: 'future', date: 'Planned', path: '', notes: 'Planned: named cloud login, teacher dashboards, richer MIDI support, and grand staff phrases.' }
];

const STORAGE_KEY = 'sightReadingCoach.v2';
const LEGACY_STORAGE_KEY = 'sightReadingCoach.v1';
const FIREBASE_CONFIG = {
  apiKey: 'AIzaSyBynvYvsd_CZTSVggEsyZwpHnbtaX3RUBk',
  authDomain: 'notation-mvp.firebaseapp.com',
  projectId: 'notation-mvp',
  storageBucket: 'notation-mvp.firebasestorage.app',
  messagingSenderId: '374493733468',
  appId: '1:374493733468:web:901650018d85efc7253c99',
  measurementId: 'G-TSZJ5ZW4FC'
};
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
  { id: 'treble-g4', name: 'G', clef: 'treble', octave: 4, staff: 1, tags: ['treble-g'], label: 'Treble G', base: 1, explanation: 'Treble G sits on the second line of the treble staff, where the treble clef curls.' },
  { id: 'bass-f3', name: 'F', clef: 'bass', octave: 3, staff: 3, tags: ['bass-f'], label: 'Bass F', base: 1, explanation: 'Bass F sits on the fourth line of the bass staff, between the two clef dots.' },
  { id: 'treble-b3', name: 'B', clef: 'treble', octave: 3, staff: -1.5, tags: ['near'], label: 'Step below Middle C', base: 1.2, explanation: 'This is one step below Middle C, so it is B.' },
  { id: 'treble-d4', name: 'D', clef: 'treble', octave: 4, staff: -0.5, tags: ['near'], label: 'Step above Middle C', base: 1.2, explanation: 'This is one step above Middle C, so it is D.' },
  { id: 'bass-b3', name: 'B', clef: 'bass', octave: 3, staff: 4.5, tags: ['near'], label: 'Step below Middle C', base: 1.2, explanation: 'This is one step below Middle C, so it is B.' },
  { id: 'bass-d4', name: 'D', clef: 'bass', octave: 4, staff: 5.5, tags: ['near'], label: 'Step above Middle C', base: 1.2, explanation: 'This is one step above Middle C, so it is D.' },
  { id: 'treble-f4', name: 'F', clef: 'treble', octave: 4, staff: 0.5, tags: ['near'], label: 'Step below Treble G', base: 1.3, explanation: 'This is one step below Treble G, so it is F.' },
  { id: 'treble-a4', name: 'A', clef: 'treble', octave: 4, staff: 1.5, tags: ['near'], label: 'Step above Treble G', base: 1.3, explanation: 'This is one step above Treble G, so it is A.' },
  { id: 'bass-e3', name: 'E', clef: 'bass', octave: 3, staff: 2.5, tags: ['near'], label: 'Step below Bass F', base: 1.3, explanation: 'This is one step below Bass F, so it is E.' },
  { id: 'bass-g3', name: 'G', clef: 'bass', octave: 3, staff: 3.5, tags: ['near'], label: 'Step above Bass F', base: 1.3, explanation: 'This is one step above Bass F, so it is G.' },
  { id: 'treble-c5', name: 'C', clef: 'treble', octave: 5, staff: 2.5, tags: ['high-c', 'fifth'], label: 'High C', base: 1.5, explanation: 'This is High C, one octave above Middle C and a fourth above Treble G.' },
  { id: 'bass-c3', name: 'C', clef: 'bass', octave: 3, staff: 1.5, tags: ['low-c', 'fifth'], label: 'Low C', base: 1.5, explanation: 'This is Low C, a fifth below Bass F.' },
  { id: 'treble-e4', name: 'E', clef: 'treble', octave: 4, staff: 0, tags: ['fifth'], label: 'Third above Middle C', base: 1.4, explanation: 'This is a third above Middle C: C to D to E.' },
  { id: 'treble-b4', name: 'B', clef: 'treble', octave: 4, staff: 2, tags: ['fifth'], label: 'Third above Treble G', base: 1.6, explanation: 'This is a third above Treble G: G to A to B.' },
  { id: 'bass-a3', name: 'A', clef: 'bass', octave: 3, staff: 4, tags: ['fifth'], label: 'Third above Bass F', base: 1.6, explanation: 'This is a third above Bass F: F to G to A.' },
  { id: 'bass-d3', name: 'D', clef: 'bass', octave: 3, staff: 2, tags: ['fifth'], label: 'Third below Bass F', base: 1.6, explanation: 'This is a third below Bass F: F down to E, then D.' },
  { id: 'treble-c6', name: 'C', clef: 'treble', octave: 6, staff: 6, tags: ['all'], label: 'Ledger C', base: 2.4, explanation: 'This ledger-line C is high above the treble staff. Relate it back to High C and count upward.' },
  { id: 'bass-c2', name: 'C', clef: 'bass', octave: 2, staff: -2, tags: ['all'], label: 'Low ledger C', base: 2.4, explanation: 'This ledger-line C is below the bass staff. Relate it to Low C and count downward.' }
];

let appData = loadAppData();
let state = activeProfile().data;
let currentMode = 'note';
let currentExercise = null;
let exerciseStartedAt = 0;
let answered = false;
let session = null;
let rhythmTimer = null;
let rhythmStart = 0;
let rhythmTaps = [];
let autoAdvanceTimer = null;
let saveDebounce = null;
let firebaseSync = { ready: false, status: 'Connecting to Firebase…', uid: null, provider: 'local', db: null, doc: null, setDoc: null, getDoc: null, serverTimestamp: null, auth: null, authSdk: null, googleProvider: null };

const el = id => document.getElementById(id);
const today = () => new Date().toISOString().slice(0, 10);
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const avg = arr => arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;

function defaultState() {
  return {
    settings: { theme: 'light', sound: true, manualLevel: 1 },
    currentLevel: 1,
    history: [],
    historyNotes: [],
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

function createProfile(name = 'Student') {
  const id = `profile-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  return { id, name, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), data: defaultState() };
}

function normalizeProfile(profile) {
  return { ...profile, data: { ...defaultState(), ...(profile.data || {}) } };
}

function loadAppData() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (stored?.profiles) {
      stored.profiles = Object.fromEntries(Object.entries(stored.profiles).map(([id, profile]) => [id, normalizeProfile(profile)]));
      return stored;
    }
  } catch { /* ignore corrupt v2 data */ }
  const firstProfile = createProfile('Student');
  try {
    const legacy = JSON.parse(localStorage.getItem(LEGACY_STORAGE_KEY));
    if (legacy) firstProfile.data = { ...defaultState(), ...legacy };
  } catch { /* ignore corrupt v1 data */ }
  return { schemaVersion: 2, activeProfileId: firstProfile.id, profiles: { [firstProfile.id]: firstProfile }, cloud: { lastSync: null } };
}

function activeProfile() {
  if (!appData.profiles[appData.activeProfileId]) {
    const fallback = createProfile('Student');
    appData.activeProfileId = fallback.id;
    appData.profiles[fallback.id] = fallback;
  }
  appData.profiles[appData.activeProfileId] = normalizeProfile(appData.profiles[appData.activeProfileId]);
  return appData.profiles[appData.activeProfileId];
}

function saveState({ sync = true } = {}) {
  const profile = activeProfile();
  profile.data = state;
  profile.updatedAt = new Date().toISOString();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(appData));
  populateProfiles();
  if (sync) scheduleCloudSave();
}


function populateProfiles() {
  const select = el('profileSelect');
  if (!select) return;
  const currentValue = select.value;
  select.innerHTML = Object.values(appData.profiles)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
    .map(profile => `<option value="${profile.id}">${profile.name}</option>`).join('');
  select.value = appData.profiles[appData.activeProfileId] ? appData.activeProfileId : currentValue;
}

function switchProfile(profileId) {
  if (!appData.profiles[profileId]) return;
  activeProfile().data = state;
  appData.activeProfileId = profileId;
  state = activeProfile().data;
  saveState({ sync: false });
  applyTheme();
  applySound();
  populateLevels();
  showView('dashboard');
  loadCloudProfile();
}

function addProfile() {
  const name = prompt('Name for the new profile?', `Student ${Object.keys(appData.profiles).length + 1}`)?.trim();
  if (!name) return;
  const profile = createProfile(name.slice(0, 40));
  appData.profiles[profile.id] = profile;
  appData.activeProfileId = profile.id;
  state = profile.data;
  saveState();
  populateProfiles();
  showView('dashboard');
}

function updateFirebaseStatus(text = firebaseSync.status) {
  firebaseSync.status = text;
  const status = el('firebaseStatus');
  if (status) status.textContent = `Firebase: ${text}`;
  const signedIn = !!firebaseSync.auth?.currentUser && !firebaseSync.auth.currentUser.isAnonymous;
  if (el('googleSignInBtn')) el('googleSignInBtn').textContent = signedIn ? 'Google connected' : 'Sign in with Google';
}

function authProviderLabel(user = firebaseSync.auth?.currentUser) {
  if (!user) return 'local only';
  if (user.isAnonymous) return `anonymous user ${user.uid.slice(0, 8)}…`;
  return user.displayName || user.email || `Google user ${user.uid.slice(0, 8)}…`;
}

async function initFirebase() {
  try {
    const [{ initializeApp }, { getAnalytics }, authSdk, firestoreSdk] = await Promise.all([
      import('https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js'),
      import('https://www.gstatic.com/firebasejs/12.14.0/firebase-analytics.js'),
      import('https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js'),
      import('https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js')
    ]);
    const app = initializeApp(FIREBASE_CONFIG);
    try { getAnalytics(app); } catch { /* analytics is unavailable on file:// and some local hosts */ }
    const auth = authSdk.getAuth(app);
    firebaseSync.auth = auth;
    firebaseSync.authSdk = authSdk;
    firebaseSync.googleProvider = new authSdk.GoogleAuthProvider();
    firebaseSync.db = firestoreSdk.getFirestore(app);
    firebaseSync.doc = firestoreSdk.doc;
    firebaseSync.setDoc = firestoreSdk.setDoc;
    firebaseSync.getDoc = firestoreSdk.getDoc;
    firebaseSync.serverTimestamp = firestoreSdk.serverTimestamp;
    authSdk.onAuthStateChanged(auth, user => {
      if (!user) {
        firebaseSync.ready = false;
        firebaseSync.uid = null;
        updateFirebaseStatus('signed out; local browser storage only');
        return;
      }
      firebaseSync.uid = user.uid;
      firebaseSync.provider = user.isAnonymous ? 'anonymous' : 'google';
      firebaseSync.ready = true;
      updateFirebaseStatus(`connected as ${authProviderLabel(user)}`);
      loadCloudProfile();
      scheduleCloudSave();
    });
    if (!auth.currentUser) await authSdk.signInAnonymously(auth);
  } catch (error) {
    updateFirebaseStatus(`offline/local only (${error.message || 'Firebase unavailable'})`);
  }
}

async function signInWithGoogle() {
  if (!firebaseSync.auth || !firebaseSync.authSdk || !firebaseSync.googleProvider) {
    updateFirebaseStatus('Google sign-in unavailable until Firebase loads');
    return;
  }
  try {
    const current = firebaseSync.auth.currentUser;
    if (current?.isAnonymous) {
      await firebaseSync.authSdk.linkWithPopup(current, firebaseSync.googleProvider);
    } else {
      await firebaseSync.authSdk.signInWithPopup(firebaseSync.auth, firebaseSync.googleProvider);
    }
    updateFirebaseStatus(`connected as ${authProviderLabel()}`);
    await loadCloudProfile();
    await saveCloudProfile();
  } catch (error) {
    if (error.code === 'auth/credential-already-in-use' || error.code === 'auth/email-already-in-use') {
      try {
        await firebaseSync.authSdk.signInWithPopup(firebaseSync.auth, firebaseSync.googleProvider);
        updateFirebaseStatus(`connected as ${authProviderLabel()}`);
        await loadCloudProfile();
        await saveCloudProfile();
        return;
      } catch (fallbackError) {
        updateFirebaseStatus(`Google sign-in failed (${fallbackError.message || 'check Firebase Auth settings'})`);
        return;
      }
    }
    updateFirebaseStatus(`Google sign-in failed (${error.message || 'check Firebase Auth settings'})`);
  }
}

async function signOutFirebase() {
  if (!firebaseSync.auth || !firebaseSync.authSdk) return;
  try {
    await firebaseSync.authSdk.signOut(firebaseSync.auth);
    firebaseSync.ready = false;
    firebaseSync.uid = null;
    updateFirebaseStatus('signed out; local browser storage only');
  } catch (error) {
    updateFirebaseStatus(`sign-out failed (${error.message || 'try again'})`);
  }
}

function cloudProfileRef() {
  if (!firebaseSync.ready || !firebaseSync.uid) return null;
  return firebaseSync.doc(firebaseSync.db, 'users', firebaseSync.uid, 'profiles', appData.activeProfileId);
}

function scheduleCloudSave() {
  clearTimeout(saveDebounce);
  saveDebounce = setTimeout(saveCloudProfile, 750);
}

async function saveCloudProfile() {
  const ref = cloudProfileRef();
  if (!ref || !firebaseSync.setDoc) {
    updateFirebaseStatus('cloud save unavailable; using local storage');
    return;
  }
  try {
    const profile = activeProfile();
    await firebaseSync.setDoc(ref, {
      profile,
      appVersion: APP_VERSION,
      schemaVersion: appData.schemaVersion || 2,
      provider: firebaseSync.provider,
      profileUpdatedAtClient: profile.updatedAt,
      updatedAtServer: firebaseSync.serverTimestamp()
    }, { merge: true });
    const syncedAt = new Date().toISOString();
    appData.cloud.lastSync = syncedAt;
    profile.lastSyncedAt = syncedAt;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(appData));
    updateFirebaseStatus(`synced ${profile.name} at ${new Date().toLocaleTimeString()}`);
  } catch (error) {
    updateFirebaseStatus(`sync failed (${error.message || 'check Firestore rules'})`);
  }
}

function shouldAcceptCloudProfile(cloudProfile, cloudMeta = {}) {
  const localProfile = activeProfile();
  const cloudUpdated = cloudMeta.profileUpdatedAtClient || cloudProfile?.updatedAt;
  const localUpdated = localProfile.updatedAt;
  if (!cloudProfile || !cloudUpdated) return false;
  if (!localUpdated || cloudUpdated > localUpdated) return true;
  const lastSync = localProfile.lastSyncedAt || appData.cloud.lastSync;
  const bothChanged = lastSync && localUpdated > lastSync && cloudUpdated > lastSync && cloudUpdated !== localUpdated;
  if (bothChanged) {
    return confirm(`Cloud progress for ${cloudProfile.name || 'this profile'} differs from this browser. Load the cloud copy? Choose Cancel to keep local data and upload it on the next sync.`);
  }
  return false;
}

async function loadCloudProfile() {
  const ref = cloudProfileRef();
  if (!ref || !firebaseSync.getDoc) return;
  try {
    const snap = await firebaseSync.getDoc(ref);
    const data = snap.exists() ? snap.data() : null;
    const cloudProfile = data?.profile;
    if (shouldAcceptCloudProfile(cloudProfile, data || {})) {
      const syncedAt = new Date().toISOString();
      appData.profiles[appData.activeProfileId] = { ...normalizeProfile(cloudProfile), lastSyncedAt: syncedAt };
      appData.cloud.lastSync = syncedAt;
      state = activeProfile().data;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(appData));
      renderDashboard();
      updateFirebaseStatus(`loaded cloud data for ${activeProfile().name}`);
    }
  } catch (error) {
    updateFirebaseStatus(`cloud load failed (${error.message || 'check Firestore rules'})`);
  }
}

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
  clearTimeout(autoAdvanceTimer);
  currentMode = mode;
  answered = false;
  showView('practice');
  document.body.classList.toggle('clean-test', mode === 'clean-note');
  if (mode === 'clean-note') currentMode = 'note';
  el('sessionPill').textContent = mode === 'clean-note' ? 'Clean note test' : (asSession ? '5-minute adaptive session' : 'Free practice');
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
  clearTimeout(autoAdvanceTimer);
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
  currentExercise = { type: 'rhythm', pattern, answer: 'tap', measures: 0 };
  rhythmStart = 0;
  rhythmTaps = [];
  el('modeLabel').textContent = 'Rhythm Trainer';
  el('promptText').textContent = 'Tap the rhythm with the pulse';
  el('notationArea').innerHTML = `<div class="rhythm-card"><button class="rhythm-pulse" id="pulse" type="button" aria-label="Tap rhythm circle">Tap<br><small>circle</small></button><div class="rhythm-pattern" aria-label="Rhythm pattern">${pattern.label}</div><p class="muted rhythm-hint">Press Start, listen for the pulse, then tap this circle or press Space on each note attack. The pulse keeps looping so you can improve over several measures before grading.</p></div>`;
  el('pulse').addEventListener('click', recordRhythmTap);
  renderAnswerButtons(['Start pulse', 'Grade rhythm', 'Reset taps'], rhythmAction);
  el('coachTip').textContent = 'Let one measure go by first, then tap the rhythm. You can keep trying over multiple measures and grade your best loop.';
}

function rhythmAction(value) {
  if (value === 'Start pulse') startRhythmPulse();
  else if (value === 'Reset taps') { rhythmTaps = []; el('feedback').textContent = 'Taps cleared. Keep the pulse going and try again.'; }
  else gradeRhythm();
}

function startRhythmPulse() {
  rhythmTaps = [];
  rhythmStart = performance.now();
  let beat = 0;
  let ticks = 0;
  clearInterval(rhythmTimer);
  rhythmTimer = setInterval(() => {
    const pulse = el('pulse');
    if (!pulse) return;
    beat = (beat % 4) + 1;
    ticks += 1;
    currentExercise.measures = Math.floor((ticks - 1) / 4) + 1;
    pulse.innerHTML = `${beat}<br><small>tap</small>`;
    pulse.classList.add('on');
    setTimeout(() => pulse.classList.remove('on'), 130);
    if (ticks >= 32) {
      clearInterval(rhythmTimer);
      pulse.innerHTML = 'Grade<br><small>now</small>';
      el('feedback').textContent = 'Pulse paused after 8 measures. Grade your best attempt or start again.';
    }
  }, 600);
  el('feedback').className = 'feedback neutral';
  el('feedback').textContent = 'Pulse started. Tap the circle on each note attack; you have up to 8 measures to improve.';
}

function recordRhythmTap() {
  if (answered) return;
  if (!rhythmStart) startRhythmPulse();
  const pulse = el('pulse');
  pulse?.classList.add('tap-flash');
  setTimeout(() => pulse?.classList.remove('tap-flash'), 100);
  rhythmTaps.push((performance.now() - rhythmStart) / 600);
  el('feedback').className = 'feedback neutral';
  el('feedback').textContent = `${rhythmTaps.length} tap${rhythmTaps.length === 1 ? '' : 's'} captured. Keep going, then choose “Grade rhythm.”`;
}

function gradeRhythm() {
  const expected = currentExercise.pattern.beats;
  if (rhythmTaps.length < expected.length) {
    el('feedback').className = 'feedback bad';
    el('feedback').textContent = `Need at least ${expected.length} tap${expected.length === 1 ? '' : 's'} for this pattern. Tap the circle with the pulse, then grade again.`;
    return;
  }
  clearInterval(rhythmTimer);
  const measureScores = [];
  for (let measure = 0; measure < 8; measure++) {
    const measureStart = measure * currentExercise.pattern.total;
    const taps = rhythmTaps.filter(t => t >= measureStart - .25 && t < measureStart + currentExercise.pattern.total + .25).map(t => t - measureStart);
    if (taps.length < expected.length) continue;
    const diffs = expected.map((b, i) => Math.abs((taps[i] ?? 99) - b));
    measureScores.push({ measure: measure + 1, avgDiff: avg(diffs) });
  }
  const best = measureScores.sort((a, b) => a.avgDiff - b.avgDiff)[0] || { measure: 1, avgDiff: 9 };
  const score = clamp(1 - best.avgDiff / .45, 0, 1);
  const correct = score >= .68;
  const label = score > .82 ? 'Good' : score > .55 ? 'Close' : 'Try again';
  recordResult(correct, Math.round((performance.now() - exerciseStartedAt)), { rhythmScore: score, rhythmTaps: rhythmTaps.length, bestMeasure: best.measure });
  showFeedback(correct, `${label}: best loop was measure ${best.measure}, averaging ${best.avgDiff.toFixed(2)} beats from the target.`);
  answered = true;
  markExerciseComplete(correct);
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
  currentExercise = { type: 'sight', clef, phrase, index: 0, answer: phrase[0].name, started: performance.now(), correctCount: 0, answers: [], noteStartedAt: performance.now() };
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
  if (answered) return;
  const time = Math.round(performance.now() - exerciseStartedAt);
  const correct = value === currentExercise.answer;
  btn?.classList.add(correct ? 'correct' : 'wrong');
  if (currentExercise.type === 'sight') {
    const attemptedNote = currentExercise.phrase[currentExercise.index];
    const noteTime = Math.round(performance.now() - (currentExercise.noteStartedAt || exerciseStartedAt));
    currentExercise.answers.push({
      noteId: attemptedNote.id,
      note: attemptedNote.name,
      clef: attemptedNote.clef,
      staff: attemptedNote.staff,
      label: attemptedNote.label,
      correctAnswer: attemptedNote.name,
      userAnswer: value,
      correct,
      responseTime: noteTime,
      timestamp: Date.now()
    });
    pushRecent(statBucket(state.noteStats, attemptedNote.id), correct, noteTime, { source: 'phrase', userAnswer: value });
    pushRecent(statBucket(state.clefStats, attemptedNote.clef), correct, noteTime, { source: 'phrase' });
    if (correct) currentExercise.correctCount += 1;
    currentExercise.index += 1;
    if (currentExercise.index >= currentExercise.phrase.length) {
      const phraseTotal = currentExercise.phrase.length;
      const phraseCorrect = currentExercise.correctCount;
      const phrasePerfect = phraseCorrect === phraseTotal;
      recordResult(phrasePerfect, Math.round(performance.now() - currentExercise.started), {
        phraseAccuracy: phraseCorrect / phraseTotal,
        phraseCorrect,
        phraseTotal,
        phraseNotes: currentExercise.phrase.map(note => ({ id: note.id, name: note.name, clef: note.clef, staff: note.staff, label: note.label })),
        phraseAnswers: currentExercise.answers
      });
      state.historyNotes.push(...currentExercise.answers.map(answer => ({ ...answer, parentType: 'sight', parentTimestamp: Date.now() })));
      state.historyNotes = state.historyNotes.slice(-2000);
      showFeedback(phrasePerfect, `Phrase complete: ${phraseCorrect}/${phraseTotal} notes correct.`);
      answered = true;
      markExerciseComplete(phrasePerfect);
    } else {
      currentExercise.answer = currentExercise.phrase[currentExercise.index].name;
      currentExercise.noteStartedAt = performance.now();
      renderPhraseProgress();
      renderStaff(currentExercise.clef, currentExercise.phrase);
      showFeedback(correct, correct ? 'Correct. Keep the line moving.' : `That note was ${attemptedNote.name}. Continue from the next note.`);
    }
    return;
  }
  if (currentExercise.type === 'note') renderStaff(currentExercise.note.clef, [currentExercise.note], { selectedName: value, isCorrect: correct });
  recordResult(correct, time, { userAnswer: value });
  showFeedback(correct, correct ? `Correct — ${time} ms. ${currentExercise.note?.explanation || intervalExplanation(currentExercise.answer)}` : `Not quite. Correct answer: ${currentExercise.answer.replaceAll('-', ' ')}. ${currentExercise.note?.explanation || intervalExplanation(currentExercise.answer)} The small reference strip shows notes named ${value}; the large staff remains the question.`);
  answered = true;
  markExerciseComplete(correct);
}

function markExerciseComplete(correct) {
  el('nextBtn').textContent = session ? 'Next exercise' : 'Next';
  if (correct && (session || currentExercise?.type === 'note')) scheduleAutoAdvance();
}

function scheduleAutoAdvance() {
  clearTimeout(autoAdvanceTimer);
  autoAdvanceTimer = setTimeout(() => {
    if (!answered) return;
    if (session && Date.now() > session.ends) endSession();
    else startMode(session ? chooseSessionMode() : (document.body.classList.contains('clean-test') ? 'clean-note' : currentMode), !!session);
  }, 1150);
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
    Object.assign(entry, { interval: currentExercise.answer, clef: currentExercise.first.clef, firstNote: { id: currentExercise.first.id, name: currentExercise.first.name, clef: currentExercise.first.clef, staff: currentExercise.first.staff, label: currentExercise.first.label }, secondNote: { id: currentExercise.second.id, name: currentExercise.second.name, clef: currentExercise.second.clef, staff: currentExercise.second.staff, label: currentExercise.second.label } });
    pushRecent(statBucket(state.intervalStats, currentExercise.answer), correct, time);
    pushRecent(statBucket(state.clefStats, currentExercise.first.clef), correct, time);
  } else if (currentExercise.type === 'rhythm') {
    Object.assign(entry, { pattern: currentExercise.pattern });
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

function renderStaff(clef, notes, options = {}) {
  const width = 760, height = 250, left = 112, top = 70, gap = 18;
  const yFor = staff => top + (4 - staff) * gap;
  const ledgerLines = (x, staff) => {
    let ledger = '';
    for (let s = Math.ceil(staff); s <= -1; s++) ledger += `<line x1="${x - 24}" x2="${x + 24}" y1="${yFor(s)}" y2="${yFor(s)}" class="staff-line ledger"/>`;
    for (let s = 5; s <= Math.floor(staff); s++) ledger += `<line x1="${x - 24}" x2="${x + 24}" y1="${yFor(s)}" y2="${yFor(s)}" class="staff-line ledger"/>`;
    return ledger;
  };
  const noteSvg = notes.map((note, i) => {
    const x = left + 130 + i * 86;
    const y = yFor(note.staff);
    const active = currentExercise?.type === 'sight' && i === currentExercise.index ? ' active-note' : '';
    const question = currentExercise?.type === 'note' && currentExercise.note?.id === note.id ? ' question-note' : '';
    return `${ledgerLines(x, note.staff)}<ellipse class="notehead${active}${question}" cx="${x}" cy="${y}" rx="17" ry="12" transform="rotate(-18 ${x} ${y})"><title>${note.label || note.name}</title></ellipse><text x="${x}" y="${height - 24}" text-anchor="middle" class="note-label">${i + 1}</text>`;
  }).join('');
  const clefClass = clef === 'treble' ? 'treble-clef' : 'bass-clef';
  const clefY = clef === 'treble' ? top + 78 : top + 58;
  const mainStaff = `<svg viewBox="0 0 ${width} ${height}" aria-label="${clef} staff"><style>.staff-line{stroke:currentColor;stroke-width:2}.ledger{stroke-width:2.4}.notehead{fill:#243042}.active-note,.question-note{fill:#6c5ce7}.clef{font-family:Georgia,'Times New Roman',serif;font-weight:700}.treble-clef{font-size:94px}.bass-clef{font-size:72px}.note-label{fill:var(--muted);font:700 12px system-ui}body.dark .notehead{fill:#f8fafc}body.dark .active-note,body.dark .question-note{fill:#a78bfa}</style><g color="var(--text)">${[0,1,2,3,4].map(i => `<line x1="${left}" x2="${width - 56}" y1="${top + i * gap}" y2="${top + i * gap}" class="staff-line"/>`).join('')}<text x="32" y="${clefY}" class="clef ${clefClass}">${clef === 'treble' ? '𝄞' : '𝄢'}</text>${noteSvg}</g></svg>`;
  el('notationArea').innerHTML = `<div class="staff-stack">${mainStaff}${renderSameNameReference(clef, notes, options)}</div>`;
}

function renderSameNameReference(clef, notes, options = {}) {
  if (!options.selectedName) return '';
  const matchingNotes = NOTES
    .filter(note => note.clef === clef && note.name === options.selectedName)
    .slice(0, 6);
  if (!matchingNotes.length) return '';
  const width = 520, height = 118, left = 56, top = 34, gap = 10;
  const yFor = staff => top + (4 - staff) * gap;
  const ledgerLines = (x, staff) => {
    let ledger = '';
    for (let s = Math.ceil(staff); s <= -1; s++) ledger += `<line x1="${x - 16}" x2="${x + 16}" y1="${yFor(s)}" y2="${yFor(s)}" class="reference-line ledger"/>`;
    for (let s = 5; s <= Math.floor(staff); s++) ledger += `<line x1="${x - 16}" x2="${x + 16}" y1="${yFor(s)}" y2="${yFor(s)}" class="reference-line ledger"/>`;
    return ledger;
  };
  const noteShapes = matchingNotes.map((note, i) => {
    const x = left + 92 + i * 58;
    const y = yFor(note.staff);
    const isQuestion = notes.some(current => current.id === note.id);
    return `${ledgerLines(x, note.staff)}<ellipse class="reference-note ${isQuestion ? 'reference-question' : ''}" cx="${x}" cy="${y}" rx="12" ry="8" transform="rotate(-18 ${x} ${y})"><title>${note.label}</title></ellipse><text x="${x}" y="${height - 16}" text-anchor="middle" class="reference-label">${note.label}</text>`;
  }).join('');
  const label = options.isCorrect ? `Same-name examples for ${options.selectedName}` : `Reference: notes named ${options.selectedName} (your answer)`;
  return `<div class="same-name-reference" aria-label="${label}"><div><strong>${label}</strong><span>Separate reference — the large staff above remains the question.</span></div><svg viewBox="0 0 ${width} ${height}" role="img" aria-label="${label} on ${clef} staff"><style>.reference-line{stroke:currentColor;stroke-width:1.5}.ledger{stroke-width:1.8}.reference-note{fill:#f59e0b;stroke:#92400e;stroke-width:2}.reference-question{fill:#6c5ce7;stroke:#4c1d95}.reference-label{fill:var(--muted);font:700 9px system-ui}.reference-clef{font-family:Georgia,'Times New Roman',serif;font-weight:700;font-size:${clef === 'treble' ? '44px' : '36px'}}body.dark .reference-question{fill:#a78bfa}</style><g color="var(--text)">${[0,1,2,3,4].map(i => `<line x1="${left}" x2="${width - 30}" y1="${top + i * gap}" y2="${top + i * gap}" class="reference-line"/>`).join('')}<text x="12" y="${clef === 'treble' ? top + 43 : top + 34}" class="reference-clef">${clef === 'treble' ? '𝄞' : '𝄢'}</text>${noteShapes}</g></svg></div>`;
}

function showView(id) {
  if (id !== 'practice') document.body.classList.remove('clean-test');
  ['dashboard', 'practice', 'progressView', 'settingsView', 'summaryView'].forEach(v => el(v).classList.toggle('active', v === id));
  if (id === 'dashboard') renderDashboard();
  if (id === 'progressView') renderProgress();
  if (id === 'settingsView') updateFirebaseStatus();
}

function recentEntries(type = null, limit = 40) {
  const items = type ? state.history.filter(entry => entry.type === type) : state.history;
  return items.slice(-limit);
}

function getTodaySummary() {
  const day = state.daily[today()] || { attempts: 0, correct: 0, totalTime: 0 };
  return {
    attempts: day.attempts,
    accuracy: day.attempts ? day.correct / day.attempts : 0,
    avgTime: day.attempts ? day.totalTime / day.attempts : 0
  };
}

function getAreaMasterySummary() {
  const noteRecent = recentEntries('note', 30);
  const intervalRecent = recentEntries('interval', 30);
  const rhythmRecent = recentEntries('rhythm', 20);
  const sightRecent = recentEntries('sight', 20);
  const score = entries => entries.length ? recentAccuracy(entries) : null;
  return [
    { key: 'note', label: 'Notes', score: score(noteRecent), attempts: noteRecent.length },
    { key: 'interval', label: 'Intervals', score: score(intervalRecent), attempts: intervalRecent.length },
    { key: 'rhythm', label: 'Rhythm', score: rhythmRecent.length ? avg(rhythmRecent.map(e => e.rhythmScore || 0)) : null, attempts: rhythmRecent.length },
    { key: 'sight', label: 'Phrases', score: sightRecent.length ? avg(sightRecent.map(e => e.phraseAccuracy ?? (e.correct ? 1 : 0))) : null, attempts: sightRecent.length }
  ];
}

function getLevelReadiness() {
  const recent = recentEntries(null, 30).filter(entry => ['note', 'interval', 'sight'].includes(entry.type));
  const accuracyScore = recent.length ? recentAccuracy(recent) : 0;
  const timeScore = recent.length ? avg(recent.map(entry => entry.responseTime || 2200)) : 2200;
  const weakCount = weakestNotes(6).filter(item => accuracy(item.stats) < .8 || averageTime(item.stats) > 2200).length;
  const accuracyPart = clamp(accuracyScore / .85, 0, 1) * 55;
  const timePart = clamp((2600 - timeScore) / 1000, 0, 1) * 30;
  const weakPart = clamp((6 - weakCount) / 6, 0, 1) * 15;
  const readiness = Math.round(accuracyPart + timePart + weakPart);
  const blockers = [];
  if (recent.length < 20) blockers.push(`${20 - recent.length} more mixed attempts needed`);
  if (accuracyScore < .85) blockers.push(`raise recent accuracy to 85%`);
  if (timeScore >= 1800) blockers.push(`bring average response under 1800 ms`);
  if (weakCount) blockers.push(`review ${weakCount} weak note${weakCount === 1 ? '' : 's'}`);
  return { readiness, accuracyScore, timeScore, blockers };
}

function getNextPracticeRecommendation() {
  const areas = getAreaMasterySummary().filter(area => area.score !== null);
  const weakArea = areas.sort((a, b) => a.score - b.score || b.attempts - a.attempts)[0];
  const weakNotes = weakestNotes(3).map(item => item.note.label);
  if (weakArea?.score < .75) return { title: `Focus on ${weakArea.label.toLowerCase()}`, detail: `Your recent ${weakArea.label.toLowerCase()} score is ${Math.round(weakArea.score * 100)}%. Try a targeted 5-minute session.`, mode: weakArea.key };
  if (weakNotes.length) return { title: 'Review slow or missed notes', detail: `Suggested review: ${weakNotes.join(', ')}.`, mode: 'note' };
  return { title: currentLevelInfo().description, detail: 'Keep a balanced session: notes, intervals, rhythm, and short phrases.', mode: 'session' };
}

function metricChip(label, value, detail = '') {
  return `<div class="metric-chip"><span>${label}</span><strong>${value}</strong>${detail ? `<small>${detail}</small>` : ''}</div>`;
}

function renderCoachDashboard() {
  const todaySummary = getTodaySummary();
  const readiness = getLevelReadiness();
  const recommendation = getNextPracticeRecommendation();
  const areas = getAreaMasterySummary();
  const weak = weakestNotes(4);
  const recent = state.history.slice(-20);
  const lastTen = state.history.slice(-10);
  const priorTen = state.history.slice(-20, -10);
  const trend = lastTen.length && priorTen.length ? Math.round((recentAccuracy(lastTen) - recentAccuracy(priorTen)) * 100) : 0;
  el('nextActionCard').innerHTML = `<p class="eyebrow">Coach next step</p><h3>${recommendation.title}</h3><p class="muted">${recommendation.detail}</p><div class="coach-actions"><button class="primary-btn" type="button" data-coach-start="session">Start balanced session</button><button class="secondary-btn" type="button" data-coach-start="weak">Practice weak spots</button></div>`;
  el('readinessCard').innerHTML = `<p class="eyebrow">Level readiness</p><h3>${readiness.readiness}% ready for Level ${Math.min(10, currentLevelInfo().level + 1)}</h3><div class="readiness-meter"><span style="width:${readiness.readiness}%"></span></div><p class="muted">${readiness.blockers.length ? readiness.blockers.slice(0, 2).join(' · ') : 'You meet the current progression targets.'}</p>`;
  el('weakSpotCard').innerHTML = `<p class="eyebrow">Weak spots</p><h3>${weak.length ? 'Review queue' : 'No weak spots yet'}</h3><ul class="compact-list">${weak.length ? weak.map(item => `<li>${item.note.label}: ${Math.round(accuracy(item.stats) * 100)}%, ${Math.round(averageTime(item.stats))} ms</li>`).join('') : '<li>Practice a few questions to build a review queue.</li>'}</ul>`;
  el('trendCard').innerHTML = `<p class="eyebrow">Trend</p><h3>${trend > 0 ? '+' : ''}${trend}% recent accuracy</h3><div class="metric-row">${metricChip('Today', todaySummary.attempts ? `${Math.round(todaySummary.accuracy * 100)}%` : '—', `${todaySummary.attempts} attempts`)}${metricChip('Speed', todaySummary.avgTime ? `${Math.round(todaySummary.avgTime)} ms` : '—')}${metricChip('Streak', `${state.streak || 0}d`)}</div>`;
  el('dataAccessCard').innerHTML = `<p class="eyebrow">All data access</p><h3>${state.history.length} saved attempts</h3><p class="muted">Use Progress for filters, replay buttons, JSON export, and per-note/interval/rhythm/phrase history.</p><button class="secondary-btn" type="button" data-open-progress>Open data explorer</button><div class="area-scores">${areas.map(area => `<span>${area.label}: ${area.score === null ? '—' : `${Math.round(area.score * 100)}%`}</span>`).join('')}</div>`;
  document.querySelectorAll('[data-coach-start="session"]').forEach(btn => btn.onclick = () => startSession(false));
  document.querySelectorAll('[data-coach-start="weak"]').forEach(btn => btn.onclick = () => startSession(true));
  document.querySelectorAll('[data-open-progress]').forEach(btn => btn.onclick = () => showView('progressView'));
  el('suggestionText').textContent = recommendation.detail;
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
  renderCoachDashboard();
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
  renderRecentQuestions();
  renderHistoryExplorer();
}


function miniStaffSvg(entry) {
  const note = entry.noteId ? NOTES.find(n => n.id === entry.noteId) : null;
  const phraseNotes = entry.phraseNotes || (entry.firstNote ? [entry.firstNote, entry.secondNote] : []);
  const clef = note?.clef || phraseNotes[0]?.clef || entry.clef || 'treble';
  const top = 18, gap = 8, left = 30;
  const yFor = staff => top + (4 - staff) * gap;
  const noteShapes = note ? [{ ...note, x: 84, fill: entry.correct ? '#00b894' : '#d92d20' }] : phraseNotes.slice(0, 5).map((n, i) => ({ ...n, x: 58 + i * 20, fill: entry.correct ? '#00b894' : '#d92d20' }));
  const notesSvg = noteShapes.map(n => `<ellipse cx="${n.x}" cy="${yFor(n.staff || 0)}" rx="8" ry="5.5" transform="rotate(-18 ${n.x} ${yFor(n.staff || 0)})" fill="${n.fill}"/>`).join('');
  return `<svg viewBox="0 0 150 70" aria-hidden="true"><g color="var(--text)">${[0,1,2,3,4].map(i => `<line x1="${left}" x2="140" y1="${top + i * gap}" y2="${top + i * gap}" stroke="currentColor" stroke-width="1.3"/>`).join('')}<text x="4" y="${clef === 'treble' ? 52 : 45}" font-size="${clef === 'treble' ? 42 : 34}" font-family="Georgia,serif" fill="currentColor">${clef === 'treble' ? '𝄞' : '𝄢'}</text>${notesSvg}</g></svg>`;
}

function describeHistoryEntry(entry) {
  if (entry.parentType === 'sight') {
    return { title: `${entry.label || entry.note} inside phrase`, detail: `Phrase note answer: chose ${entry.userAnswer || '—'}, correct answer ${entry.correctAnswer || entry.note}.` };
  }
  if (entry.type === 'note') {
    const note = NOTES.find(n => n.id === entry.noteId);
    return { title: `${note?.label || entry.note || 'Note'} in ${entry.clef || note?.clef || 'staff'}`, detail: `Question: name the note. Answered ${entry.userAnswer || '—'}, correct answer ${entry.correctAnswer || entry.note}.` };
  }
  if (entry.type === 'sight') return { title: `Mini sight-reading phrase`, detail: `Phrase result: ${entry.phraseCorrect ?? Math.round((entry.phraseAccuracy || 0) * (entry.phraseTotal || 0))}/${entry.phraseTotal || '?'} notes correct. ${entry.phraseAnswers?.length ? 'Tap Replay to inspect each note answer.' : ''}` };
  if (entry.type === 'interval') return { title: `Interval: ${entry.interval?.replaceAll('-', ' ') || 'interval'}`, detail: `Question: identify the interval direction in ${entry.clef || 'the staff'}${entry.firstNote ? ` from ${entry.firstNote.name} to ${entry.secondNote?.name}` : ''}.` };
  if (entry.type === 'rhythm') return { title: `Rhythm: ${entry.pattern?.label || 'tapping question'}`, detail: `Timing score: ${Math.round((entry.rhythmScore || 0) * 100)}%; best loop ${entry.bestMeasure || '—'}.` };
  return { title: 'Practice question', detail: 'Review this recent attempt.' };
}

function renderRecentQuestions() {
  const target = el('recentQuestions');
  if (!target) return;
  const recent = state.history.slice(-8).reverse();
  if (!recent.length) {
    target.innerHTML = '<p class="muted">Your latest questions will appear here with a tiny staff preview and a review link after you practice.</p>';
    return;
  }
  target.innerHTML = recent.map(entry => {
    const desc = describeHistoryEntry(entry);
    const when = new Date(entry.timestamp).toLocaleString();
    const idx = state.history.indexOf(entry);
    const review = `<button class="secondary-btn" type="button" data-review-entry="${idx}">Replay</button>`;
    return `<div class="review-item">${miniStaffSvg(entry)}<div class="review-meta"><strong>${desc.title}</strong><span>${desc.detail}<br>${entry.correct ? 'Correct' : 'Needs review'} · ${Math.round(entry.responseTime || 0)} ms · ${when}</span></div>${review}</div>`;
  }).join('');
}

function reviewNote(noteId) {
  const note = NOTES.find(n => n.id === noteId);
  if (!note) return;
  clearTimeout(autoAdvanceTimer);
  session = null;
  currentMode = 'note';
  answered = false;
  exerciseStartedAt = performance.now();
  showView('practice');
  el('sessionPill').textContent = 'Review question';
  el('modeLabel').textContent = 'Question Review';
  el('promptText').textContent = 'Try this note again';
  currentExercise = { type: 'note', note, answer: note.name };
  renderStaff(note.clef, [note]);
  renderAnswerButtons(NOTE_NAMES, handleAnswer);
  el('feedback').className = 'feedback neutral';
  el('feedback').textContent = `Reviewing ${note.label}.`;
}



function replayHistoryEntry(index) {
  const entry = state.history[Number(index)];
  if (!entry) return;
  if (entry.type === 'note') return reviewNote(entry.noteId);
  clearTimeout(autoAdvanceTimer);
  clearInterval(rhythmTimer);
  session = null;
  answered = false;
  exerciseStartedAt = performance.now();
  showView('practice');
  el('sessionPill').textContent = 'Replay history';
  el('modeLabel').textContent = 'History replay';
  const desc = describeHistoryEntry(entry);
  el('feedback').className = 'feedback neutral';
  el('feedback').textContent = `${desc.detail} Original result: ${entry.correct ? 'correct' : 'needs review'}.`;
  if (entry.type === 'interval' && entry.firstNote && entry.secondNote) {
    currentMode = 'interval';
    currentExercise = { type: 'interval', first: entry.firstNote, second: entry.secondNote, answer: entry.interval };
    el('promptText').textContent = 'Replay this interval';
    renderStaff(entry.clef || entry.firstNote.clef, [entry.firstNote, entry.secondNote]);
    renderAnswerButtons(['same', 'step-up', 'step-down', 'skip-up', 'skip-down', '4th-up', '4th-down', '5th-up', '5th-down'], handleAnswer);
    return;
  }
  if (entry.type === 'rhythm') {
    currentMode = 'rhythm';
    currentExercise = { type: 'rhythm', pattern: entry.pattern || { label: '♩ ♩ ♩ ♩', beats: [0, 1, 2, 3], total: 4 }, answer: 'tap', measures: 0 };
    rhythmStart = 0;
    rhythmTaps = [];
    el('promptText').textContent = 'Replay this rhythm';
    el('notationArea').innerHTML = `<div class="rhythm-card"><button class="rhythm-pulse" id="pulse" type="button" aria-label="Tap rhythm circle">Tap<br><small>circle</small></button><div class="rhythm-pattern" aria-label="Rhythm pattern">${currentExercise.pattern.label}</div><p class="muted rhythm-hint">Original score: ${Math.round((entry.rhythmScore || 0) * 100)}%. Tap the circle or press Space to try this pattern again.</p></div>`;
    el('pulse').addEventListener('click', recordRhythmTap);
    renderAnswerButtons(['Start pulse', 'Grade rhythm', 'Reset taps'], rhythmAction);
    return;
  }
  if (entry.type === 'sight' && entry.phraseNotes?.length) {
    currentMode = 'sight';
    currentExercise = { type: 'sight', clef: entry.clef || entry.phraseNotes[0].clef, phrase: entry.phraseNotes, index: 0, answer: entry.phraseNotes[0].name, started: performance.now(), correctCount: 0, answers: [], noteStartedAt: performance.now() };
    el('promptText').textContent = 'Replay this phrase';
    renderStaff(currentExercise.clef, currentExercise.phrase);
    renderPhraseProgress();
    renderAnswerButtons(NOTE_NAMES, handleAnswer);
  }
}

function renderHistoryExplorer() {
  const filters = el('historyFilters');
  const table = el('historyTable');
  if (!filters || !table) return;
  const types = ['all', 'note', 'interval', 'rhythm', 'sight', 'phrase-notes'];
  if (!filters.dataset.ready) {
    filters.innerHTML = `<label>Type<select id="historyTypeFilter">${types.map(t => `<option value="${t}">${t.replace('-', ' ')}</option>`).join('')}</select></label><label>Result<select id="historyResultFilter"><option value="all">All</option><option value="correct">Correct</option><option value="missed">Needs review</option></select></label><label>Search<input id="historySearchFilter" type="search" placeholder="C, bass, rhythm…" /></label>`;
    filters.dataset.ready = 'true';
    ['historyTypeFilter', 'historyResultFilter', 'historySearchFilter'].forEach(id => el(id).addEventListener('input', renderHistoryExplorer));
  }
  const type = el('historyTypeFilter')?.value || 'all';
  const result = el('historyResultFilter')?.value || 'all';
  const query = (el('historySearchFilter')?.value || '').trim().toLowerCase();
  const combined = [...state.history.map((entry, index) => ({ ...entry, index })), ...(state.historyNotes || []).map((entry, index) => ({ ...entry, type: 'phrase-notes', index: `note-${index}` }))];
  const filtered = combined.filter(entry => {
    if (type !== 'all' && entry.type !== type) return false;
    if (result === 'correct' && !entry.correct) return false;
    if (result === 'missed' && entry.correct) return false;
    const desc = describeHistoryEntry(entry);
    const haystack = `${desc.title} ${desc.detail} ${entry.note || ''} ${entry.clef || ''} ${entry.userAnswer || ''}`.toLowerCase();
    return !query || haystack.includes(query);
  }).slice(-80).reverse();
  table.innerHTML = filtered.length ? `<table><thead><tr><th>When</th><th>Question</th><th>Result</th><th>Detail</th><th></th></tr></thead><tbody>${filtered.map(entry => {
    const desc = describeHistoryEntry(entry);
    const canReplay = Number.isInteger(entry.index) && entry.type !== 'phrase-notes';
    return `<tr><td>${new Date(entry.timestamp || entry.parentTimestamp || Date.now()).toLocaleString()}</td><td>${desc.title}</td><td><span class="result-pill ${entry.correct ? 'good' : 'bad'}">${entry.correct ? 'Correct' : 'Review'}</span></td><td>${desc.detail}<br><span class="muted">${Math.round(entry.responseTime || 0)} ms</span></td><td>${canReplay ? `<button class="secondary-btn" type="button" data-review-entry="${entry.index}">Replay</button>` : '<span class="muted">per-note</span>'}</td></tr>`;
  }).join('')}</tbody></table>` : '<p class="muted">No entries match those filters yet.</p>';
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

function getAppBasePath() {
  const path = window.location.pathname;
  const archiveIndex = path.indexOf('/archive/');
  if (archiveIndex >= 0) return `${path.slice(0, archiveIndex)}/`;
  return path.slice(0, path.lastIndexOf('/') + 1) || '/';
}

function getVersionManifestUrls() {
  const base = getAppBasePath();
  const urls = [];
  if (window.location.protocol === 'http:' || window.location.protocol === 'https:') {
    urls.push(`${window.location.origin}${base}version-history.json`);
  }
  urls.push(new URL('version-history.json', window.location.href).href);
  return [...new Set(urls)];
}

function resolveVersionPath(path) {
  if (!path) return '';
  if (/^(https?:|file:)/.test(path)) return path;
  const cleaned = path.replace(/^\.\//, '').replace(/^\//, '');
  const base = getAppBasePath();
  if (window.location.protocol === 'http:' || window.location.protocol === 'https:') return `${window.location.origin}${base}${cleaned}`;
  return `${base}${cleaned}`;
}

async function canNavigateTo(url) {
  if (!url || !(window.location.protocol === 'http:' || window.location.protocol === 'https:')) return true;
  try {
    const res = await fetch(url, { method: 'HEAD' });
    return res.ok;
  } catch {
    return false;
  }
}

function injectArchiveBanner() {
  if (!window.location.pathname.includes('/archive/')) return;
  if (document.getElementById('archiveBanner')) return;
  const banner = document.createElement('a');
  banner.id = 'archiveBanner';
  banner.href = resolveVersionPath('./index.html');
  banner.textContent = '↩ Back to latest Sight Reading Coach';
  banner.style.cssText = 'position:fixed;left:16px;bottom:16px;z-index:9999;background:#6c5ce7;color:white;padding:10px 14px;border-radius:999px;text-decoration:none;font:700 14px system-ui;box-shadow:0 10px 24px rgba(0,0,0,.18)';
  document.body.appendChild(banner);
}

async function populateVersions() {
  let versions = VERSION_HISTORY_FALLBACK;
  for (const url of getVersionManifestUrls()) {
    try {
      const res = await fetch(url);
      if (res.ok) {
        versions = await res.json();
        break;
      }
    } catch { /* keep trying candidate manifests */ }
  }
  el('versionSelect').innerHTML = versions.map(v => {
    const selectable = v.path && v.status !== 'future';
    return `<option value="${v.version}" ${selectable ? '' : 'disabled'}>${v.version} — ${v.status}</option>`;
  }).join('');
  el('versionSelect').value = APP_VERSION;
  el('versionSelect').onchange = async e => {
    const picked = versions.find(v => v.version === e.target.value);
    if (!picked) return;
    if (picked.version === APP_VERSION) return;
    if (!picked.path || picked.status === 'future') {
      alert(`${picked.version} is planned, not released yet. ${picked.notes}`);
      e.target.value = APP_VERSION;
      return;
    }
    const currentMajor = APP_VERSION.split('.')[0];
    const pickedMajor = picked.version.split('.')[0];
    if (currentMajor !== pickedMajor && !confirm('This switches across major versions. Export progress first if you need a backup. Continue?')) {
      e.target.value = APP_VERSION;
      return;
    }
    const url = resolveVersionPath(picked.path);
    if (!(await canNavigateTo(url))) {
      alert(`Could not find ${picked.version} at ${url}. Please use the latest version or check the archive manifest.`);
      e.target.value = APP_VERSION;
      return;
    }
    window.location.href = url;
  };
}

function exportProgress() {
  const payload = { schemaVersion: 2, appVersion: APP_VERSION, exportedAt: new Date().toISOString(), activeProfileId: appData.activeProfileId, profile: activeProfile() };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `sight-reading-coach-${activeProfile().name.replace(/\W+/g, '-').toLowerCase()}-${today()}.json`;
  a.click();
  URL.revokeObjectURL(a.href);
}

function importProgress(file) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const parsed = JSON.parse(reader.result);
      if (parsed.profiles) {
        appData = parsed;
        state = activeProfile().data;
      } else if (parsed.profile?.data) {
        const imported = normalizeProfile(parsed.profile);
        imported.id = imported.id || `profile-${Date.now()}`;
        appData.profiles[imported.id] = imported;
        appData.activeProfileId = imported.id;
        state = imported.data;
      } else {
        state = { ...defaultState(), ...parsed };
        activeProfile().data = state;
      }
      saveState(); init(); alert('Progress imported.');
    } catch { alert('Could not import that JSON file.'); }
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
  el('backFromSettings').onclick = () => showView('dashboard');
  el('openSettingsFromProgress').onclick = () => showView('settingsView');
  el('exportBtn').onclick = exportProgress;
  el('cloudSyncBtn').onclick = saveCloudProfile;
  el('googleSignInBtn').onclick = signInWithGoogle;
  el('signOutBtn').onclick = signOutFirebase;
  el('cleanTestBtn').onclick = () => startMode('clean-note');
  el('newProfileBtn').onclick = addProfile;
  el('profileSelect').onchange = e => switchProfile(e.target.value);
  el('resetBtn').onclick = resetProgress;
  el('importInput').onchange = e => e.target.files[0] && importProgress(e.target.files[0]);
  el('explainBtn').onclick = explainCurrent;
  el('themeToggle').onclick = () => { state.settings.theme = state.settings.theme === 'dark' ? 'light' : 'dark'; saveState(); applyTheme(); };
  el('soundToggle').onclick = () => { state.settings.sound = !state.settings.sound; saveState(); applySound(); };
  el('levelOverride').onchange = e => { state.settings.manualLevel = Number(e.target.value); saveState(); renderDashboard(); };
  document.querySelectorAll('[data-mode]').forEach(btn => btn.addEventListener('click', () => btn.dataset.mode === 'progress' ? showView('progressView') : (btn.dataset.mode === 'settings' ? showView('settingsView') : startMode(btn.dataset.mode))));
  document.addEventListener('click', e => {
    const entryIndex = e.target.closest('[data-review-entry]')?.dataset.reviewEntry;
    if (entryIndex !== undefined) replayHistoryEntry(entryIndex);
    const noteId = e.target.closest('[data-review-note]')?.dataset.reviewNote;
    if (noteId) reviewNote(noteId);
  });
  document.addEventListener('keydown', e => {
    const key = e.key.toUpperCase();
    if (NOTE_NAMES.includes(key) && ['note', 'sight'].includes(currentMode)) handleAnswer(key);
    if (e.code === 'Space' && currentMode === 'rhythm') { e.preventDefault(); recordRhythmTap(); }
  });
}

function applyTheme() { document.body.classList.toggle('dark', state.settings.theme === 'dark'); el('themeToggle').textContent = state.settings.theme === 'dark' ? '☀️' : '🌙'; }
function applySound() { el('soundToggle').textContent = state.settings.sound ? '🔔' : '🔕'; }

function init() {
  populateProfiles();
  populateLevels();
  populateVersions();
  injectArchiveBanner();
  applyTheme();
  applySound();
  renderDashboard();
  updateFirebaseStatus();
}

bindEvents();
init();
initFirebase();
