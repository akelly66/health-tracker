import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import Head from 'next/head';
import dynamic from 'next/dynamic';
import { mealsToMealLogText } from '../lib/mealLog';
import miseGlyphs from '../lib/mise-glyphs.json';

const WeightChart = dynamic(() => import('../components/HistoryCharts').then((m) => m.WeightChart), { ssr: false });
const CaloriesChart = dynamic(() => import('../components/HistoryCharts').then((m) => m.CaloriesChart), { ssr: false });

const DEFAULT_PROFILE = {
  onboarded: false,
  start_weight: null,
  start_date: null,
  goal_weight: null,
  goal_date: null,
  weigh_in_mode: 'weekly',
  weigh_in_day: 1,
  calorie_target: 1600,
  protein_target: 110,
  fiber_target: 25,
  carb_target: 170,
  fat_target: 53,
  diet_prefs: '',
  fitness_goal: '',
  age: null,
  height_in: null,
  sex: 'unspecified',
  activity: 'light',
};
const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const ZERO_TOTALS = { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 };

// Each meal gets a stable id so React can tell rows apart (the list used to key on position,
// which left a deleted row's collapsed styles stuck on whichever meal moved up).
let mealIdCounter = 0;
const newMealId = () => `m${Date.now().toString(36)}${(mealIdCounter++).toString(36)}`;

// A day only counts as "logged" when food was logged (weigh-in-only days have 0 calories).
const hasFood = (row) => Boolean(row) && (Number(row.calories) || 0) > 0;

function useEscape(handler) {
  useEffect(() => {
    if (!handler) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') handler(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [handler]);
}

function storageGet(key) {
  try { return localStorage.getItem(key); } catch { return null; }
}
function storageSet(key, value) {
  try { localStorage.setItem(key, value); } catch {}
}

function getLocalDateString(d = new Date()) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function ymdToDate(ymd) {
  const [y, m, day] = ymd.split('-').map(Number);
  return new Date(y, m - 1, day);
}

function addDaysToYMD(ymd, delta) {
  const dt = ymdToDate(ymd);
  dt.setDate(dt.getDate() + delta);
  return getLocalDateString(dt);
}

function daysBetween(fromYmd, toYmd) {
  return Math.round((ymdToDate(toYmd) - ymdToDate(fromYmd)) / 86400000);
}

function lastNDatesFrom(ymd, n) {
  const out = [];
  for (let i = n - 1; i >= 0; i--) out.push(addDaysToYMD(ymd, -i));
  return out;
}

function normalizeRowDate(d) {
  if (!d) return '';
  if (typeof d === 'string') return d.slice(0, 10);
  try {
    return d.toISOString().slice(0, 10);
  } catch {
    return String(d).slice(0, 10);
  }
}

function editDayLabel(viewDateStr, todayStr) {
  if (viewDateStr === todayStr) return 'Today';
  if (viewDateStr === addDaysToYMD(todayStr, -1)) return 'Yesterday';
  return ymdToDate(viewDateStr).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

// weighIns is ascending by date. "Due" means it has been a week since the last weigh-in.
function weighInDue(profile, todayYmd, weighIns) {
  if (profile.weigh_in_mode === 'anytime') return false;
  const latest = weighIns.length ? weighIns[weighIns.length - 1] : null;
  if (!latest) return true;
  if (latest.date === todayYmd) return false;
  const since = daysBetween(latest.date, todayYmd);
  return since >= 7;
}

// Fat is ~30% of calories and carbs fill what protein and fat leave over.
function suggestMacros(calories, protein) {
  const fat = Math.round((calories * 0.3) / 9);
  const carbs = Math.max(0, Math.round((calories - protein * 4 - fat * 9) / 4));
  return { fat, carbs };
}

function paceNote(currentWeight, goalWeight, goalDate, todayYmd) {
  const cw = parseFloat(currentWeight);
  const gw = parseFloat(goalWeight);
  if (!(cw > 0) || !(gw > 0) || !goalDate) return null;
  const days = daysBetween(todayYmd, goalDate);
  if (days < 1) return { text: 'Pick a goal date after today.', warn: true };
  const diff = gw - cw;
  if (Math.abs(diff) < 0.1) return { text: "You're already at your goal weight.", warn: false };
  const weeks = days / 7;
  const rate = Math.abs(diff) / weeks;
  const span = weeks < 2 ? `${days} days` : `${Math.round(weeks)} weeks`;
  const base = `${Math.abs(diff).toFixed(1)} lb to ${diff < 0 ? 'lose' : 'gain'} in ${span}, about ${rate.toFixed(1)} lb/week.`;
  if (rate > Math.max(1, cw * 0.01)) {
    return { text: `${base} That's faster than about 1% of body weight per week, which is hard to sustain. A later date may feel better.`, warn: true };
  }
  return { text: `${base} A steady, sustainable pace.`, warn: false };
}

const FITNESS_GOALS = [
  { key: 'lose_fat', label: 'Lose fat', hint: 'Get leaner while keeping muscle' },
  { key: 'build_muscle', label: 'Build muscle', hint: 'Get stronger and add size' },
  { key: 'maintain', label: 'Maintain', hint: 'Stay where I am and keep my habits' },
  { key: 'health', label: 'Feel healthier', hint: 'More energy and better everyday eating' },
];
const ACTIVITY_LEVELS = [
  { key: 'sedentary', label: 'Mostly sitting', hint: 'desk job, little exercise', mult: 1.2 },
  { key: 'light', label: 'Lightly active', hint: 'exercise 1-3 days a week', mult: 1.375 },
  { key: 'moderate', label: 'Moderately active', hint: 'exercise 3-5 days a week', mult: 1.55 },
  { key: 'very', label: 'Very active', hint: 'hard exercise 6-7 days a week', mult: 1.725 },
];
const PROTEIN_PER_LB = { lose_fat: 0.85, build_muscle: 0.9, maintain: 0.7, health: 0.7 };

const round10 = (n) => Math.round(n / 10) * 10;

// Estimates daily calories, protein and fiber from the goal and body stats (Mifflin-St Jeor).
// A suggestion only: the user can change every number before saving.
function suggestTargets({ goal, age, heightIn, sex, activity, weightLb, goalWeight, goalDate, todayYmd }) {
  if (!goal || !(age > 0) || !(heightIn > 0) || !(weightLb > 0)) return null;
  const kg = weightLb * 0.45359237;
  const cm = heightIn * 2.54;
  const sexTerm = sex === 'male' ? 5 : sex === 'female' ? -161 : -78;
  const bmr = 10 * kg + 6.25 * cm - 5 * age + sexTerm;
  const level = ACTIVITY_LEVELS.find((a) => a.key === activity) || ACTIVITY_LEVELS[1];
  const maintenance = bmr * level.mult;

  let target = maintenance;
  let calorieNote = `About your maintenance level of ${round10(maintenance).toLocaleString()} kcal.`;
  if (goal === 'lose_fat') {
    let deficit = maintenance * 0.2;
    const days = goalDate ? daysBetween(todayYmd, goalDate) : 0;
    const paced = days >= 1 && goalWeight > 0 && goalWeight < weightLb;
    // One pound of body fat is roughly 3,500 kcal, so each lb/week is about a 500 kcal daily deficit.
    if (paced) deficit = ((weightLb - goalWeight) / (days / 7)) * 500;
    const cap = maintenance * 0.25;
    target = maintenance - Math.min(deficit, cap);
    if (paced && deficit > cap) {
      calorieNote = `Your goal date asks for more than a comfortable deficit, so this is capped at 25% below your maintenance of ${round10(maintenance).toLocaleString()} kcal. A later date would be easier to stick to.`;
    } else if (paced) {
      calorieNote = `Your goal pace works out to a deficit of about ${Math.round(deficit)} kcal a day from your maintenance of ${round10(maintenance).toLocaleString()} kcal.`;
    } else {
      calorieNote = `A moderate 20% deficit from your maintenance of ${round10(maintenance).toLocaleString()} kcal.`;
    }
  } else if (goal === 'build_muscle') {
    target = maintenance * 1.1;
    calorieNote = `A modest 10% surplus over your maintenance of ${round10(maintenance).toLocaleString()} kcal to support muscle gain.`;
  }

  const floor = sex === 'male' ? 1500 : 1200;
  if (target < floor) {
    target = floor;
    calorieNote += ` Raised to a ${floor.toLocaleString()} kcal minimum.`;
  }
  const calories = round10(target);
  const perLb = PROTEIN_PER_LB[goal] || 0.7;
  return {
    calories,
    protein: Math.round((weightLb * perLb) / 5) * 5,
    fiber: Math.max(25, Math.round((14 * calories) / 1000)),
    calorieNote,
    proteinNote: `Protein is about ${perLb} g per lb of body weight, and fiber about 14 g per 1,000 kcal.`,
  };
}

async function postSync(body) {
  const res = await fetch('/api/sync', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || 'Save failed');
}

// The name as a vector wordmark (soft Fraunces outlines, see lib/mise-glyphs.json). Being plain shapes,
// it needs no font download, and it takes its colors from the design tokens.
function MiseWordmark({ height = 34 }) {
  const { paths, bbox } = miseGlyphs.wordmark;
  const pad = 8;
  const w = bbox.x2 - bbox.x1 + pad * 2;
  const h = bbox.y2 - bbox.y1 + pad * 2;
  return (
    <svg className="wordmark" viewBox={`${bbox.x1 - pad} ${bbox.y1 - pad} ${w} ${h}`} height={height} width={Math.round((height * w) / h)} role="img" aria-label="mise">
      {paths.map((g, i) => (
        <path key={i} d={g.d} style={{ fill: g.char === '.' ? 'var(--pink)' : 'var(--green)' }} />
      ))}
    </svg>
  );
}

const ZapIcon = ({ size = 14, style = {} }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="currentColor" stroke="none" style={style}>
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
  </svg>
);
const GearIcon = ({ size = 16 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <line x1="4" y1="7" x2="20" y2="7"/><line x1="4" y1="17" x2="20" y2="17"/>
    <circle cx="9" cy="7" r="2.5" fill="var(--card)"/><circle cx="15" cy="17" r="2.5" fill="var(--card)"/>
  </svg>
);
const CameraIcon = ({ size = 13 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
    <circle cx="12" cy="13" r="4"/>
  </svg>
);
const CheckIcon = ({ size = 10 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);
const DotIcon = ({ size = 8, color = 'var(--green)' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="currentColor" stroke="none" style={{ color }}>
    <circle cx="12" cy="12" r="8"/>
  </svg>
);
const ArrowUpIcon = ({ size = 16 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10"/>
    <polyline points="16 12 12 8 8 12"/><line x1="12" y1="16" x2="12" y2="8"/>
  </svg>
);
const PlusIcon = ({ size = 11 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <circle cx="12" cy="12" r="10"/>
    <line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/>
  </svg>
);
const SendIcon = ({ size = 10 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="22" y1="2" x2="11" y2="13"/>
    <polygon points="22 2 15 22 11 13 2 9 22 2"/>
  </svg>
);
const UtensilsIcon = ({ size = 15, color = 'var(--green)' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color }}>
    <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/>
    <path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/>
  </svg>
);
const CupIcon = ({ size = 15, color = 'var(--pink)' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color }}>
    <path d="M8 2h8l1 10H7L8 2z"/><path d="M7 12c0 4 2 6 5 6s5-2 5-6"/><path d="M6 21h12"/>
  </svg>
);

const mealTypeColors = {
  Breakfast: { bg: 'var(--green-tint)', icon: 'var(--green)' },
  Lunch:     { bg: 'var(--green-tint)', icon: 'var(--green)' },
  Dinner:    { bg: 'var(--purple-soft)', icon: 'var(--purple)' },
  Snack:     { bg: 'var(--pink-soft)', icon: 'var(--pink)' },
};

function SwipeMealRow({ children, onDelete }) {
  const wrapRef = useRef(null);
  const itemRef = useRef(null);
  const startX = useRef(0);
  const currentX = useRef(0);
  const isDragging = useRef(false);
  const THRESHOLD = 80;

  function collapse() {
    const wrap = wrapRef.current;
    if (!wrap) return;
    // Slide item fully out first
    itemRef.current.style.transition = 'transform 0.2s ease';
    itemRef.current.style.transform = 'translateX(-100%)';
    // Then collapse height to 0
    wrap.style.transition = 'max-height 0.25s ease 0.15s, opacity 0.2s ease 0.15s';
    wrap.style.overflow = 'hidden';
    wrap.style.maxHeight = wrap.offsetHeight + 'px';
    requestAnimationFrame(() => {
      wrap.style.maxHeight = '0';
      wrap.style.opacity = '0';
    });
    setTimeout(onDelete, 400);
  }

  // Keyboard users can't swipe, so Delete or Backspace on a focused row removes it too.
  function onKeyDown(e) {
    if (e.key === 'Delete' || e.key === 'Backspace') {
      e.preventDefault();
      collapse();
    }
  }

  // Touch handlers
  function onTouchStart(e) {
    startX.current = e.touches[0].clientX;
    currentX.current = 0;
    isDragging.current = true;
    itemRef.current.style.transition = 'none';
  }
  function onTouchMove(e) {
    if (!isDragging.current) return;
    const dx = Math.min(0, e.touches[0].clientX - startX.current);
    currentX.current = dx;
    itemRef.current.style.transform = `translateX(${dx}px)`;
  }
  function onTouchEnd() {
    isDragging.current = false;
    if (currentX.current <= -THRESHOLD) {
      collapse();
    } else {
      itemRef.current.style.transition = 'transform 0.2s ease';
      itemRef.current.style.transform = 'translateX(0)';
    }
    currentX.current = 0;
  }

  // Mouse handlers for desktop
  function onMouseDown(e) {
    startX.current = e.clientX;
    currentX.current = 0;
    isDragging.current = true;
    itemRef.current.style.transition = 'none';
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  }
  function onMouseMove(e) {
    if (!isDragging.current) return;
    const dx = Math.min(0, e.clientX - startX.current);
    currentX.current = dx;
    itemRef.current.style.transform = `translateX(${dx}px)`;
  }
  function onMouseUp() {
    isDragging.current = false;
    window.removeEventListener('mousemove', onMouseMove);
    window.removeEventListener('mouseup', onMouseUp);
    if (currentX.current <= -THRESHOLD) {
      collapse();
    } else {
      itemRef.current.style.transition = 'transform 0.2s ease';
      itemRef.current.style.transform = 'translateX(0)';
    }
    currentX.current = 0;
  }

  return (
    <div className="meal-row-wrap" ref={wrapRef}>
      <div className="meal-delete-bg">Delete</div>
      <div
        className="meal-item"
        ref={itemRef}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onMouseDown={onMouseDown}
        onKeyDown={onKeyDown}
        tabIndex={0}
        aria-label="Meal. Swipe left or press Delete to remove."
      >
        {children}
      </div>
    </div>
  );
}

// Used for first-run onboarding and, with `editing`, for changing goals/preferences later.
function Onboarding({ initial, latestWeight, todayYmd, editing, saving, error, onClose, onSkip, onSave }) {
  useEscape(editing ? onClose : null);
  const initialCurrent =
    latestWeight != null ? String(latestWeight) : initial.start_weight != null ? String(initial.start_weight) : '';
  const [step, setStep] = useState(0);
  const [goalKey, setGoalKey] = useState(initial.fitness_goal || '');
  const [age, setAge] = useState(initial.age != null ? String(initial.age) : '');
  const [heightFt, setHeightFt] = useState(initial.height_in != null ? String(Math.floor(initial.height_in / 12)) : '');
  const [heightRem, setHeightRem] = useState(initial.height_in != null ? String(Math.round(initial.height_in % 12)) : '');
  const [sex, setSex] = useState(initial.sex || 'unspecified');
  const [activity, setActivity] = useState(initial.activity || 'light');
  const [currentWeight, setCurrentWeight] = useState(initialCurrent);
  const [goalWeight, setGoalWeight] = useState(initial.goal_weight != null ? String(initial.goal_weight) : '');
  const [goalDate, setGoalDate] = useState(initial.goal_date || '');
  const [skipGoal, setSkipGoal] = useState(false);
  const [calories, setCalories] = useState(String(initial.calorie_target));
  const [protein, setProtein] = useState(String(initial.protein_target));
  const [fiber, setFiber] = useState(String(initial.fiber_target));
  // Once someone has edited (or already saved) targets, don't overwrite them with a fresh suggestion.
  const [targetsEdited, setTargetsEdited] = useState(Boolean(initial.onboarded));
  const [prefs, setPrefs] = useState(initial.diet_prefs || '');

  const cw = parseFloat(currentWeight);
  const ageNum = parseInt(age, 10);
  const heightTotal = (parseInt(heightFt, 10) || 0) * 12 + (parseInt(heightRem, 10) || 0);
  const note = paceNote(currentWeight, goalWeight, goalDate, todayYmd);
  const cal = parseInt(calories, 10) || 0;
  const pro = parseInt(protein, 10) || 0;
  const fib = parseInt(fiber, 10) || 0;
  const macros = suggestMacros(cal, pro);
  const aboutValid = cw > 0 && ageNum >= 13 && ageNum <= 110 && heightTotal >= 36 && heightTotal <= 96;
  const goalValid = parseFloat(goalWeight) > 0 && goalDate && daysBetween(todayYmd, goalDate) >= 1;
  const targetsValid = cal >= 800 && pro > 0 && fib > 0;
  const lastStep = 4;

  function suggestionFor(useGoal) {
    return suggestTargets({
      goal: goalKey,
      age: ageNum,
      heightIn: heightTotal,
      sex,
      activity,
      weightLb: cw,
      goalWeight: useGoal ? parseFloat(goalWeight) : null,
      goalDate: useGoal ? goalDate : null,
      todayYmd,
    });
  }
  const useGoalNow = goalValid && !skipGoal;
  const suggestion = aboutValid ? suggestionFor(useGoalNow) : null;
  const matchesSuggestion = suggestion && suggestion.calories === cal && suggestion.protein === pro && suggestion.fiber === fib;

  function applySuggestion(s) {
    if (!s) return;
    setCalories(String(s.calories));
    setProtein(String(s.protein));
    setFiber(String(s.fiber));
    setTargetsEdited(false);
  }

  function goToTargets(useGoal) {
    if (!targetsEdited) applySuggestion(suggestionFor(useGoal));
    setStep(3);
  }

  function skipGoalStep() {
    setSkipGoal(true);
    goToTargets(false);
  }

  function finish() {
    const hasCw = cw > 0;
    const keepStart = initial.onboarded && initial.start_weight != null && hasCw && cw === parseFloat(initialCurrent);
    onSave(
      {
        fitness_goal: goalKey,
        age: ageNum || null,
        height_in: heightTotal || null,
        sex,
        activity,
        start_weight: keepStart ? initial.start_weight : hasCw ? cw : null,
        start_date: keepStart ? initial.start_date : hasCw ? todayYmd : null,
        goal_weight: useGoalNow ? parseFloat(goalWeight) : null,
        goal_date: useGoalNow ? goalDate : null,
        weigh_in_mode: 'weekly',
        weigh_in_day: initial.weigh_in_day ?? 1,
        calorie_target: cal,
        protein_target: pro,
        fiber_target: fib,
        carb_target: macros.carbs,
        fat_target: macros.fat,
        diet_prefs: prefs.trim(),
      },
      hasCw && !keepStart ? cw : null
    );
  }

  const minDate = addDaysToYMD(todayYmd, 1);
  const goalLabel = (FITNESS_GOALS.find((g) => g.key === goalKey) || {}).label;

  return (
    <div className="onb-overlay" role="dialog" aria-modal="true" aria-label="Goals and preferences">
      <div className="onb-inner">
        {editing && (
          <button type="button" className="onb-close" aria-label="Close" onClick={onClose}>×</button>
        )}
        {!editing && onSkip && (
          <button type="button" className="onb-skip" onClick={onSkip}>Skip for now</button>
        )}
        <div className="onb-dots">
          {[0, 1, 2, 3, 4].map((i) => <span key={i} className={`onb-dot${i <= step ? ' on' : ''}`} />)}
        </div>

        {step === 0 && (
          <>
            <div className="onb-title">{editing ? 'Your fitness goal' : "What's your fitness goal?"}</div>
            <div className="onb-sub">Pick the one that fits best. We'll suggest daily calories and protein to match.</div>
            <div className="goal-list">
              {FITNESS_GOALS.map((g) => (
                <button key={g.key} type="button" className={`goal-card${goalKey === g.key ? ' on' : ''}`} onClick={() => setGoalKey(g.key)}>
                  <span className="goal-name">{g.label}</span>
                  <span className="goal-hint">{g.hint}</span>
                </button>
              ))}
            </div>
          </>
        )}

        {step === 1 && (
          <>
            <div className="onb-title">A bit about you</div>
            <div className="onb-sub">This is only used to estimate how many calories you burn in a day.</div>
            <div className="field-row">
              <label className="field">
                <span className="field-label">Age</span>
                <input className="field-input" type="number" inputMode="numeric" value={age} onChange={(e) => setAge(e.target.value)} />
              </label>
              <label className="field">
                <span className="field-label">Current weight (lbs)</span>
                <input className="field-input" type="number" inputMode="decimal" step="0.1" value={currentWeight} onChange={(e) => setCurrentWeight(e.target.value)} />
              </label>
            </div>
            <div className="field-row">
              <label className="field">
                <span className="field-label">Height (ft)</span>
                <input className="field-input" type="number" inputMode="numeric" value={heightFt} onChange={(e) => setHeightFt(e.target.value)} />
              </label>
              <label className="field">
                <span className="field-label">Height (in)</span>
                <input className="field-input" type="number" inputMode="numeric" value={heightRem} onChange={(e) => setHeightRem(e.target.value)} />
              </label>
            </div>
            <div className="field-label" id="sex-label">Sex (used in the calorie estimate)</div>
            <div className="seg" role="group" aria-labelledby="sex-label">
              {[['female', 'Female'], ['male', 'Male'], ['unspecified', 'Prefer not to say']].map(([k, l]) => (
                <button key={k} type="button" className={`seg-btn${sex === k ? ' on' : ''}`} onClick={() => setSex(k)}>{l}</button>
              ))}
            </div>
            <label className="field">
              <span className="field-label">Activity level</span>
              <select className="field-input" value={activity} onChange={(e) => setActivity(e.target.value)}>
                {ACTIVITY_LEVELS.map((a) => <option key={a.key} value={a.key}>{a.label} ({a.hint})</option>)}
              </select>
            </label>
          </>
        )}

        {step === 2 && (
          <>
            <div className="onb-title">{goalKey === 'lose_fat' ? 'Your target weight' : 'Target weight (optional)'}</div>
            <div className="onb-sub">Your chart will track your weigh-ins against a steady pace to this goal.</div>
            <div className="field-row">
              <label className="field">
                <span className="field-label">Goal weight (lbs)</span>
                <input className="field-input" type="number" inputMode="decimal" step="0.1" value={goalWeight} onChange={(e) => { setGoalWeight(e.target.value); setSkipGoal(false); }} />
              </label>
              <label className="field">
                <span className="field-label">Goal date</span>
                <input className="field-input" type="date" min={minDate} value={goalDate} onChange={(e) => { setGoalDate(e.target.value); setSkipGoal(false); }} />
              </label>
            </div>
            {note && <div className={`pace-note${note.warn ? ' warn' : ''}`}>{note.text}</div>}
          </>
        )}

        {step === 3 && (
          <>
            <div className="onb-title">Daily targets</div>
            <div className="onb-sub">{goalLabel ? `Suggested for "${goalLabel.toLowerCase()}". ` : ''}Change anything you like.</div>
            {suggestion && (
              <div className="pace-note suggest">
                <strong>Suggested: {suggestion.calories.toLocaleString()} kcal · {suggestion.protein}g protein · {suggestion.fiber}g fiber</strong>
                <br />
                {suggestion.calorieNote} {suggestion.proteinNote}
                {!matchesSuggestion && (
                  <>
                    <br />
                    <button type="button" className="link-btn" onClick={() => applySuggestion(suggestion)}>Use suggestion</button>
                  </>
                )}
              </div>
            )}
            <label className="field">
              <span className="field-label">Calories per day</span>
              <input className="field-input" type="number" inputMode="numeric" value={calories} onChange={(e) => { setCalories(e.target.value); setTargetsEdited(true); }} />
            </label>
            <div className="field-row">
              <label className="field">
                <span className="field-label">Protein (g)</span>
                <input className="field-input" type="number" inputMode="numeric" value={protein} onChange={(e) => { setProtein(e.target.value); setTargetsEdited(true); }} />
              </label>
              <label className="field">
                <span className="field-label">Fiber (g)</span>
                <input className="field-input" type="number" inputMode="numeric" value={fiber} onChange={(e) => { setFiber(e.target.value); setTargetsEdited(true); }} />
              </label>
            </div>
            <div className="pace-note">
              {cal >= 800
                ? `That leaves about ${macros.carbs}g carbs and ${macros.fat}g fat.`
                : 'Calories need to be at least 800.'}
            </div>
          </>
        )}

        {step === 4 && (
          <>
            <div className="onb-title">Food preferences</div>
            <div className="onb-sub">Optional. The advisor uses this when it suggests meals. Write it however you like.</div>
            <textarea
              className="prefs-input"
              rows={9}
              maxLength={4000}
              value={prefs}
              onChange={(e) => setPrefs(e.target.value)}
              placeholder={'Likes: salmon, Greek yogurt, spicy food\nDislikes: cilantro, mushrooms\nAllergies: shellfish\nPantry staples: eggs, rice, frozen veggies, canned beans\nUsually buy: chicken sausage, oats, bagged salad'}
            />
          </>
        )}

        {error && <div className="status status-error">{error}</div>}

        <div className="onb-actions">
          {step > 0 && (
            <button type="button" className="btn-ghost" onClick={() => setStep(step - 1)}>Back</button>
          )}
          {step === 0 && (
            <button type="button" className="btn-primary" disabled={!goalKey} onClick={() => setStep(1)}>Next</button>
          )}
          {step === 1 && (
            <button type="button" className="btn-primary" disabled={!aboutValid} onClick={() => setStep(2)}>Next</button>
          )}
          {step === 2 && (
            <>
              <button type="button" className="btn-ghost" onClick={skipGoalStep}>No target</button>
              <button type="button" className="btn-primary" disabled={!goalValid} onClick={() => { setSkipGoal(false); goToTargets(true); }}>Next</button>
            </>
          )}
          {step === 3 && (
            <button type="button" className="btn-primary" disabled={!targetsValid} onClick={() => setStep(4)}>Next</button>
          )}
          {step === lastStep && (
            <button type="button" className="btn-primary" disabled={saving} onClick={finish}>
              {saving ? 'Saving…' : editing ? 'Save' : 'Finish'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

const BarcodeIcon = ({ size = 14 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M3 5v14M7 5v14M11 5v14M15 5v14M18 5v14M21 5v14" />
  </svg>
);

const scaleMacros = (m, f) => ({
  calories: m.calories * f,
  protein: m.protein * f,
  carbs: m.carbs * f,
  fat: m.fat * f,
  fiber: m.fiber * f,
});

// Keeps the saved meal-log line parseable (it splits on " — " and newlines).
const cleanMealName = (s) => s.replace(/\s+—\s+/g, ' - ').replace(/\s+/g, ' ').trim().slice(0, 70);

function BarcodeScanner({ onDetect, onClose }) {
  useEscape(onClose);
  const videoRef = useRef(null);
  const [error, setError] = useState('');
  const [manual, setManual] = useState('');

  useEffect(() => {
    let controls = null;
    let done = false;
    (async () => {
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          setError(window.isSecureContext ? "This browser can't use the camera. Type the barcode below." : 'The camera needs a secure (https) connection. Type the barcode below.');
          return;
        }
        // Loaded on demand so the scanner code isn't part of the normal page load.
        const [{ BrowserMultiFormatReader }, { DecodeHintType, BarcodeFormat }] = await Promise.all([
          import('@zxing/browser'),
          import('@zxing/library'),
        ]);
        const hints = new Map();
        hints.set(DecodeHintType.POSSIBLE_FORMATS, [BarcodeFormat.EAN_13, BarcodeFormat.EAN_8, BarcodeFormat.UPC_A, BarcodeFormat.UPC_E]);
        hints.set(DecodeHintType.TRY_HARDER, true);
        const reader = new BrowserMultiFormatReader(hints, { delayBetweenScanAttempts: 150 });
        controls = await reader.decodeFromConstraints(
          { video: { facingMode: { ideal: 'environment' } } },
          videoRef.current,
          (result) => {
            if (result && !done) {
              done = true;
              onDetect(result.getText());
            }
          }
        );
        if (done) controls.stop();
      } catch (e) {
        if (e && e.name === 'NotAllowedError') setError('Camera access was blocked. Allow it in your browser settings, or type the barcode below.');
        else if (e && e.name === 'NotFoundError') setError('No camera found. Type the barcode below.');
        else setError(`Couldn't start the camera. Type the barcode below.`);
      }
    })();
    return () => {
      done = true;
      try { if (controls) controls.stop(); } catch {}
    };
    // The detection callback only needs the latest onDetect once, at mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const digits = manual.replace(/\D/g, '');
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-sheet scan-sheet" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        <div className="modal-title">Scan a barcode</div>
        <div className="modal-sub">Hold the barcode inside the frame.</div>
        {!error && (
          <div className="scan-view">
            <video ref={videoRef} className="scan-video" playsInline muted />
            <div className="scan-frame" />
          </div>
        )}
        {error && <div className="pace-note warn">{error}</div>}
        <div className="field-label">Or type the barcode number</div>
        <div className="modal-input-row">
          <input
            className="modal-input sm"
            aria-label="Barcode number"
            type="text"
            inputMode="numeric"
            placeholder="e.g. 009800895007"
            value={manual}
            onChange={(e) => setManual(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && digits.length >= 8) onDetect(digits); }}
          />
          <button type="button" className="btn-primary small" disabled={digits.length < 8} onClick={() => onDetect(digits)}>Look up</button>
        </div>
        <div className="modal-actions">
          <button type="button" className="btn-ghost" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

function BarcodeResult({ state, onAdd, onClose, onScanAgain }) {
  useEscape(onClose);
  const { status, data, message, code } = state;
  const hasServing = status === 'found' && data.servingGrams > 0;
  const [mode, setMode] = useState(hasServing ? 'servings' : 'grams');
  const [amount, setAmount] = useState(hasServing ? '1' : '100');

  let body = null;
  if (status === 'loading') {
    body = <div className="modal-sub">Looking up {code}…</div>;
  } else if (status === 'notfound') {
    body = (
      <>
        <div className="pace-note warn">USDA doesn't have this barcode ({code}). Close this, describe the food in the box, and tap Estimate instead.</div>
        <div className="modal-actions">
          <button type="button" className="btn-ghost" onClick={onClose}>Close</button>
          <button type="button" className="btn-primary" onClick={onScanAgain}>Scan another</button>
        </div>
      </>
    );
  } else if (status === 'error') {
    body = (
      <>
        <div className="pace-note warn">{message}</div>
        <div className="modal-actions">
          <button type="button" className="btn-ghost" onClick={onClose}>Close</button>
        </div>
      </>
    );
  } else {
    const n = parseFloat(amount);
    const valid = n > 0;
    const grams = mode === 'servings' ? n * data.servingGrams : n;
    const base = mode === 'servings' && data.perServing ? data.perServing : data.per100g;
    const factor = mode === 'servings' && data.perServing ? n : grams / 100;
    const m = valid ? scaleMacros(base, factor) : { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 };
    const rounded = {
      calories: Math.round(m.calories),
      protein: Math.round(m.protein),
      carbs: Math.round(m.carbs),
      fat: Math.round(m.fat),
      fiber: Math.round(m.fiber),
    };
    const lowerName = data.name.toLowerCase();
    const baseName = data.brand && !lowerName.includes(data.brand.toLowerCase()) ? `${data.brand} ${data.name}` : data.name;
    const amountLabel = mode === 'servings'
      ? `${n} serving${n === 1 ? '' : 's'}`
      : `${Math.round(grams)} g`;
    body = (
      <>
        <div className="result-name">{data.name}</div>
        {data.brand && <div className="result-brand">{data.brand}</div>}
        {hasServing && (
          <div className="seg">
            <button type="button" className={`seg-btn${mode === 'servings' ? ' on' : ''}`} onClick={() => { setMode('servings'); setAmount('1'); }}>Servings</button>
            <button type="button" className={`seg-btn${mode === 'grams' ? ' on' : ''}`} onClick={() => { setMode('grams'); setAmount(String(Math.round(data.servingGrams))); }}>Grams</button>
          </div>
        )}
        <div className="modal-input-row">
          <input className="modal-input" aria-label="Amount" type="number" inputMode="decimal" step={mode === 'servings' ? '0.5' : '1'} value={amount} onChange={(e) => setAmount(e.target.value)} />
          <span className="modal-unit">{mode === 'servings' ? 'servings' : 'g'}</span>
        </div>
        <div className="result-serving">
          {mode === 'servings'
            ? `1 serving = ${data.servingLabel || data.servingGrams + ' g'}${valid ? ` · about ${Math.round(grams)} g` : ''}`
            : data.servingLabel ? `One serving is ${data.servingLabel}` : 'Nutrition per 100 g, scaled to your amount'}
        </div>
        <div className="macro-preview">
          <div className="mp"><div className="mp-val">{rounded.calories}</div><div className="mp-label">kcal</div></div>
          <div className="mp"><div className="mp-val">{rounded.protein}g</div><div className="mp-label">protein</div></div>
          <div className="mp"><div className="mp-val">{rounded.carbs}g</div><div className="mp-label">carbs</div></div>
          <div className="mp"><div className="mp-val">{rounded.fat}g</div><div className="mp-label">fat</div></div>
          <div className="mp"><div className="mp-val">{rounded.fiber}g</div><div className="mp-label">fiber</div></div>
        </div>
        <div className="modal-actions">
          <button type="button" className="btn-ghost" onClick={onClose}>Cancel</button>
          <button
            type="button"
            className="btn-primary"
            disabled={!valid}
            onClick={() => onAdd({ ...rounded, name: cleanMealName(`${baseName} (${amountLabel})`), confidence: 'High' })}
          >
            Add to meals
          </button>
        </div>
      </>
    );
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-sheet scan-sheet" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        <div className="modal-title">{status === 'found' ? 'Found it' : 'Barcode lookup'}</div>
        {body}
      </div>
    </div>
  );
}

function QuickLog({ title, sub, unit, step, initial, busy, error, onSave, onClose }) {
  useEscape(onClose);
  const [val, setVal] = useState(initial || '');
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-sheet" role="dialog" aria-modal="true" aria-label={title} onClick={(e) => e.stopPropagation()}>
        <div className="modal-title">{title}</div>
        <div className="modal-sub">{sub}</div>
        <div className="modal-input-row">
          <input
            className="modal-input"
            aria-label={title}
            autoFocus
            type="number"
            inputMode="decimal"
            step={step}
            value={val}
            onChange={(e) => setVal(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && val) onSave(val); }}
          />
          <span className="modal-unit">{unit}</span>
        </div>
        {error && <div className="status status-error">{error}</div>}
        <div className="modal-actions">
          <button type="button" className="btn-ghost" onClick={onClose}>Cancel</button>
          <button type="button" className="btn-primary" disabled={busy || !val} onClick={() => onSave(val)}>
            {busy ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const [tab, setTab] = useState('log');
  const [meals, setMeals] = useState([]);
  const [mealsDirty, setMealsDirty] = useState(false);
  const [dayTotals, setDayTotals] = useState(ZERO_TOTALS); // stored totals for days whose meals can't be itemized
  const [dayError, setDayError] = useState(false);
  const loadSeq = useRef(0);
  const [mealInput, setMealInput] = useState('');
  const [photo, setPhoto] = useState(null);
  const [mealLoading, setMealLoading] = useState(false);
  const [mealStatus, setMealStatus] = useState({ text: '', type: '' });
  const [weight, setWeight] = useState('');
  const [activeCalories, setActiveCalories] = useState('');
  const [syncLoading, setSyncLoading] = useState(false);
  const [syncStatus, setSyncStatus] = useState({ text: '', type: '' });
  const [chatHistory, setChatHistory] = useState([]);
  const [advisorInput, setAdvisorInput] = useState('');
  const [advisorLoading, setAdvisorLoading] = useState(false);
  const [advisorStatus, setAdvisorStatus] = useState({ text: '', type: '' });
  const [prefillMeal, setPrefillMeal] = useState(null);
  const chatRef = useRef(null);
  const photoInputRef = useRef(null);

  const [displayDate, setDisplayDate] = useState('');
  const [viewDate, setViewDate] = useState(() => getLocalDateString());
  const todayDate = getLocalDateString();

  const [historyEntries, setHistoryEntries] = useState([]);

  const [profile, setProfile] = useState(DEFAULT_PROFILE);
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [skipChecked, setSkipChecked] = useState(false);
  const [onboardingSkipped, setOnboardingSkipped] = useState(false);
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileError, setProfileError] = useState('');

  const [checkin, setCheckin] = useState(null);
  const [checkinWeight, setCheckinWeight] = useState('');
  const [checkinBurn, setCheckinBurn] = useState('');
  const [checkinBusy, setCheckinBusy] = useState(false);
  const greetCheckedRef = useRef(false);

  const [scanner, setScanner] = useState(null);
  const [quick, setQuick] = useState(null);
  const [quickBusy, setQuickBusy] = useState(false);
  const [quickError, setQuickError] = useState('');

  const TDEE = profile.calorie_target;
  const PROTEIN_TARGET = profile.protein_target;
  const FIBER_TARGET = profile.fiber_target;

  const totals = useMemo(() => {
    if (meals.length === 0) return mealsDirty ? ZERO_TOTALS : dayTotals;
    return meals.reduce(
      (acc, m) => ({
        calories: acc.calories + (Number(m.calories) || 0),
        protein: acc.protein + (Number(m.protein) || 0),
        carbs: acc.carbs + (Number(m.carbs) || 0),
        fat: acc.fat + (Number(m.fat) || 0),
        fiber: acc.fiber + (Number(m.fiber) || 0),
      }),
      ZERO_TOTALS
    );
  }, [meals, mealsDirty, dayTotals]);

  useEffect(() => {
    setDisplayDate(
      new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
    );
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch('/api/profile');
        const j = await r.json();
        if (!r.ok) throw new Error(j.error);
        setProfile({ ...DEFAULT_PROFILE, ...j });
      } catch {
        // Don't trap the app behind onboarding if the profile can't be read.
        setProfile({ ...DEFAULT_PROFILE, onboarded: true });
      }
      setProfileLoaded(true);
    })();
  }, []);

  useEffect(() => {
    setOnboardingSkipped(storageGet('onboarding_skipped') === '1');
    setSkipChecked(true);
  }, []);

  // Returns false when the user chose to stay (they have meals that aren't saved yet).
  function changeDay(next) {
    if (next === viewDate) return true;
    if ((pendingCount > 0 || mealsDirty) && !window.confirm('You have meals that are not saved yet. Switch days and discard them?')) return false;
    setViewDate(next);
    return true;
  }

  function skipOnboarding() {
    storageSet('onboarding_skipped', '1');
    // No point asking for a weigh-in the moment someone declined setup.
    storageSet('last_greeted', getLocalDateString());
    setOnboardingSkipped(true);
  }

  const loadDay = useCallback(async (dateStr) => {
    // Only the newest request may update the screen, so a slow earlier response can't overwrite it.
    const seq = ++loadSeq.current;
    setDayError(false);
    setMealStatus({ text: 'Loading day…', type: 'loading' });
    try {
      const res = await fetch(`/api/today?date=${dateStr}`, {
        headers: { 'Cache-Control': 'no-cache', Pragma: 'no-cache' },
      });
      const data = await res.json().catch(() => ({}));
      if (seq !== loadSeq.current) return;
      if (!res.ok) throw new Error(data.error || 'Could not load this day');
      setMealsDirty(false);
      if (!data.found) {
        setMeals([]);
        setDayTotals(ZERO_TOTALS);
        setWeight('');
        setActiveCalories('');
        setMealStatus({ text: '', type: '' });
        return;
      }
      setMeals((data.meals || []).map((m) => ({ ...m, id: newMealId(), synced: true })));
      setDayTotals({
        calories: data.calories || 0,
        protein: data.protein || 0,
        carbs: data.carbs || 0,
        fat: data.fat || 0,
        fiber: data.fiber || 0,
      });
      setWeight(data.weight != null ? String(data.weight) : '');
      setActiveCalories(data.active_calories != null ? String(data.active_calories) : '');
      setMealStatus({
        text: `✓ Loaded (${Math.round(data.calories)} kcal)`,
        type: 'success',
      });
      setTimeout(() => setMealStatus({ text: '', type: '' }), 2500);
    } catch {
      if (seq !== loadSeq.current) return;
      // Don't show an empty day that isn't real: saving from it would overwrite what's stored.
      setMeals([]);
      setDayTotals(ZERO_TOTALS);
      setWeight('');
      setActiveCalories('');
      setMealsDirty(false);
      setDayError(true);
      setMealStatus({ text: '', type: '' });
    }
  }, []);

  useEffect(() => {
    loadDay(viewDate);

  }, [viewDate, loadDay]);

  const refreshHistory = useCallback(async () => {
    try {
      const r = await fetch('/api/history?days=400');
      const j = await r.json();
      setHistoryEntries(j.entries || []);
    } catch {
      setHistoryEntries([]);
    }
  }, []);

  useEffect(() => {
    refreshHistory();
  }, [refreshHistory]);

  useEffect(() => {
    if (tab === 'history') refreshHistory();
  }, [tab, refreshHistory]);

  // Daily check-in: first open each day, only asks for what's actually missing.
  useEffect(() => {
    if (!profileLoaded || !skipChecked || !(profile.onboarded || onboardingSkipped) || greetCheckedRef.current) return;
    greetCheckedRef.current = true;
    const t = getLocalDateString();
    if (storageGet('last_greeted') === t) return;
    (async () => {
      try {
        const y = addDaysToYMD(t, -1);
        const [tr, yr, hr] = await Promise.all([
          fetch(`/api/today?date=${t}`),
          fetch(`/api/today?date=${y}`),
          fetch('/api/history?days=400'),
        ]);
        const todayData = await tr.json();
        const yestData = await yr.json();
        const hist = await hr.json();
        const weighIns = (hist.entries || [])
          .filter((e) => e.weight != null)
          .map((e) => ({ date: normalizeRowDate(e.date), weight: Number(e.weight) }));
        const needWeight = !(todayData.found && todayData.weight != null) && weighInDue(profile, t, weighIns);
        const needBurn = Boolean(yestData.found && yestData.active_calories == null);
        if (!needWeight && !needBurn) {
          storageSet('last_greeted', t);
          return;
        }
        setCheckin({ needWeight, needBurn });
      } catch (e) {
        console.error(e);
      }
    })();
  }, [profileLoaded, skipChecked, onboardingSkipped, profile]);

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [chatHistory]);

  useEffect(() => {
    if (prefillMeal) {
      setTab('log');
      setMealInput(prefillMeal.name);
    }
  }, [prefillMeal]);

  function handlePhotoSelect(e) {
    const file = e.target.files[0];
    if (!file) return;
    loadPhoto(file);
  }

  function handleDrop(e) {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) loadPhoto(file);
  }

  function loadPhoto(file) {
    const canvas = document.createElement('canvas');
    const img = new Image();
    const reader = new FileReader();
    reader.onload = (ev) => {
      img.onload = () => {
        const MAX = 800;
        let { width, height } = img;
        if (width > MAX || height > MAX) {
          if (width > height) { height = Math.round(height * MAX / width); width = MAX; }
          else { width = Math.round(width * MAX / height); height = MAX; }
        }
        canvas.width = width; canvas.height = height;
        canvas.getContext('2d').drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.6);
        setPhoto({ base64: dataUrl.split(',')[1], mediaType: 'image/jpeg', previewUrl: dataUrl });
      };
      img.onerror = () => setMealStatus({ text: "Couldn't read that photo. Try another one.", type: 'error' });
      img.src = ev.target.result;
    };
    reader.onerror = () => setMealStatus({ text: "Couldn't read that photo. Try another one.", type: 'error' });
    reader.readAsDataURL(file);
  }

  async function estimateMeal() {
    if (!mealInput.trim() && !photo && !prefillMeal) return;
    setMealLoading(true);
    setMealStatus({ text: 'Estimating macros...', type: 'loading' });
    try {
      let macros;
      if (prefillMeal) {
        macros = { ...prefillMeal, confidence: prefillMeal.confidence || 'Medium' };
      } else {
        const estRes = await fetch('/api/estimate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            description: mealInput.trim(),
            photo: photo ? { base64: photo.base64, mediaType: photo.mediaType } : null
          })
        });
        macros = await estRes.json().catch(() => ({ error: 'The photo may be too large. Try a smaller one.' }));
        if (macros.error) throw new Error(macros.error);
      }
      setMeals(prev => [...prev, { ...macros, id: newMealId(), fiber: Math.round(Number(macros.fiber) || 0), type: 'Meal', synced: false }]);
      setMealStatus({ text: `✓ Added: ${macros.name} (${macros.calories} kcal)`, type: 'success' });
      setMealInput('');
      setPhoto(null);
      setPrefillMeal(null);
      setTimeout(() => setMealStatus({ text: '', type: '' }), 3000);
    } catch (err) {
      setMealStatus({ text: `Error: ${err.message}`, type: 'error' });
    }
    setMealLoading(false);
  }

  async function completeCheckin() {
    const t = getLocalDateString();
    setCheckinBusy(true);
    try {
      if (checkin.needWeight && checkinWeight) {
        await postSync({ date: t, weight: parseFloat(checkinWeight) });
      }
      if (checkin.needBurn && checkinBurn) {
        await postSync({ date: addDaysToYMD(t, -1), active_calories: parseInt(checkinBurn, 10) });
      }
      storageSet('last_greeted', t);
      setCheckin(null);
      setCheckinWeight('');
      setCheckinBurn('');
      await Promise.all([loadDay(viewDate), refreshHistory()]);
    } catch (e) {
      console.error(e);
    }
    setCheckinBusy(false);
  }

  function skipCheckin() {
    storageSet('last_greeted', getLocalDateString());
    setCheckin(null);
  }

  async function lookupBarcode(code) {
    setScanner({ stage: 'result', code, status: 'loading' });
    try {
      const res = await fetch(`/api/barcode?code=${encodeURIComponent(code)}`);
      const j = await res.json();
      if (!res.ok) setScanner({ stage: 'result', code, status: 'error', message: j.error || 'Lookup failed' });
      else if (!j.found) setScanner({ stage: 'result', code, status: 'notfound' });
      else setScanner({ stage: 'result', code, status: 'found', data: j });
    } catch {
      setScanner({ stage: 'result', code, status: 'error', message: "Couldn't reach the lookup service. Check your connection and try again." });
    }
  }

  function addScannedMeal(meal) {
    setMeals((prev) => [...prev, { ...meal, id: newMealId(), type: 'Meal', synced: false }]);
    setMealStatus({ text: `✓ Added: ${meal.name} (${meal.calories} kcal)`, type: 'success' });
    setTimeout(() => setMealStatus({ text: '', type: '' }), 3000);
    setScanner(null);
  }

  async function saveQuick(kind, value) {
    if (!(Number(value) > 0)) {
      setQuickError('Enter a number above 0');
      return;
    }
    setQuickBusy(true);
    setQuickError('');
    try {
      if (kind === 'weight') {
        await postSync({ date: viewDate, weight: parseFloat(value) });
        setWeight(String(parseFloat(value)));
        refreshHistory();
      } else {
        await postSync({ date: viewDate, active_calories: parseInt(value, 10) });
        setActiveCalories(String(parseInt(value, 10)));
        refreshHistory();
      }
      setQuick(null);
    } catch (e) {
      setQuickError(e.message);
    }
    setQuickBusy(false);
  }

  async function saveProfile(payload, weightToLog) {
    setProfileSaving(true);
    setProfileError('');
    try {
      const res = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || 'Could not save');
      if (weightToLog) {
        await postSync({ date: todayDate, weight: weightToLog });
        if (viewDate === todayDate) setWeight(String(weightToLog));
      }
      // Onboarding already asked for today's weight, so skip the check-in for today.
      if (!profile.onboarded) storageSet('last_greeted', todayDate);
      setProfile({ ...DEFAULT_PROFILE, ...payload, onboarded: true });
      setEditingProfile(false);
      refreshHistory();
    } catch (e) {
      setProfileError(e.message);
    }
    setProfileSaving(false);
  }

  async function syncToServer() {
    if (dayError) return;
    if (pendingCount === 0 && !mealsDirty) {
      setSyncStatus({ text: 'Nothing to save', type: 'error' });
      setTimeout(() => setSyncStatus({ text: '', type: '' }), 2000);
      return;
    }
    setSyncLoading(true);
    setSyncStatus({ text: 'Saving…', type: 'loading' });
    try {
      const mealLogText = mealsToMealLogText(meals);
      const currentTotals = meals.reduce(
        (acc, m) => ({
          calories: acc.calories + m.calories,
          protein: acc.protein + m.protein,
          carbs: acc.carbs + m.carbs,
          fat: acc.fat + m.fat,
          fiber: acc.fiber + (Number(m.fiber) || 0),
        }),
        ZERO_TOTALS
      );
      await postSync({
        date: viewDate,
        calories: Math.round(currentTotals.calories),
        protein: Math.round(currentTotals.protein),
        carbs: Math.round(currentTotals.carbs),
        fat: Math.round(currentTotals.fat),
        fiber: Math.round(currentTotals.fiber),
        meal_log: mealLogText,
      });
      setMeals((prev) => prev.map((m) => ({ ...m, synced: true })));
      setMealsDirty(false);
      refreshHistory();
      setSyncStatus({ text: '✓ Saved', type: 'success' });
      setTimeout(() => setSyncStatus({ text: '', type: '' }), 3000);
    } catch (err) {
      setSyncStatus({ text: `Error: ${err.message}`, type: 'error' });
    }
    setSyncLoading(false);
  }

  async function sendAdvisorMessage(msg) {
    const message = msg || advisorInput.trim();
    if (!message) return;
    setAdvisorLoading(true);
    setAdvisorInput('');
    setChatHistory(h => [...h, { role: 'user', content: message }]);
    setAdvisorStatus({ text: 'Thinking...', type: 'loading' });
    try {
      const res = await fetch('/api/advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, totals, meals, chatHistory })
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      // If advisor wants to log a meal directly, add it to meals
      if (data.action === 'log_meal' && data.mealData) {
        const mealToLog = { ...data.mealData, id: newMealId(), fiber: Math.round(Number(data.mealData.fiber) || 0), type: 'Meal', synced: false };
        setMeals(prev => [...prev, mealToLog]);
      }

      setChatHistory(h => [...h, {
        role: 'assistant',
        content: data.reply,
        mealData: data.mealData || null,
        mealOptions: data.mealOptions || null,
        action: data.action || null
      }]);
      setAdvisorStatus({ text: '', type: '' });
    } catch (err) {
      setAdvisorStatus({ text: `Error: ${err.message}`, type: 'error' });
    }
    setAdvisorLoading(false);
  }

  const pct = Math.min((totals.calories / TDEE) * 100, 100);
  const deficit = TDEE - Math.round(totals.calories);
  const remaining = Math.max(0, deficit);
  const proteinLeft = Math.max(0, PROTEIN_TARGET - Math.round(totals.protein));
  const fiberLeft = Math.max(0, FIBER_TARGET - Math.round(totals.fiber));
  const pendingCount = meals.filter(m => !m.synced).length;
  const macroBars = [
    { key: 'carbs', label: 'Carbs', value: totals.carbs, target: profile.carb_target },
    { key: 'protein', label: 'Protein', value: totals.protein, target: PROTEIN_TARGET },
    { key: 'fat', label: 'Fat', value: totals.fat, target: profile.fat_target },
    { key: 'fiber', label: 'Fiber', value: totals.fiber, target: FIBER_TARGET },
  ];

  const calorieEntries = useMemo(() => historyEntries.map((e) => ({ ...e, date: normalizeRowDate(e.date) })), [historyEntries]);
  const weighIns = useMemo(
    () => calorieEntries.filter((e) => e.weight != null && e.weight !== '').map((e) => ({ date: e.date, weight: Number(e.weight) })),
    [calorieEntries]
  );
  const foodEntries = useMemo(() => calorieEntries.filter((e) => hasFood(e)), [calorieEntries]);
  const historyByDate = useMemo(() => Object.fromEntries(calorieEntries.map((e) => [e.date, e])), [calorieEntries]);
  const weighDue = weighInDue(profile, todayDate, weighIns);
  const showOnboarding = profileLoaded && skipChecked && !profile.onboarded && !onboardingSkipped;

  const last7 = lastNDatesFrom(todayDate, 7);
  const weekSlots = last7.map((d) => ({ date: d, row: historyByDate[d] || null }));
  const withData = weekSlots.filter((s) => hasFood(s.row));
  const avg = (key) =>
    withData.length > 0 ? Math.round(withData.reduce((a, s) => a + (Number(s.row[key]) || 0), 0) / withData.length) : 0;
  const avgWeekCal = avg('calories');
  const avgWeekProt = avg('protein');
  const avgWeekFiber = avg('fiber');
  const avgWeekCarbs = avg('carbs');
  const avgWeekFat = avg('fat');
  const daysProteinHit = withData.filter((s) => (Number(s.row.protein) || 0) >= PROTEIN_TARGET).length;
  const daysFiberHit = withData.filter((s) => (Number(s.row.fiber) || 0) >= FIBER_TARGET).length;
  const weekRange = `${ymdToDate(last7[0]).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${ymdToDate(last7[6]).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;

  return (
    <>
      <Head>
        <title>mise</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      </Head>

      {(showOnboarding || editingProfile) && (
        <Onboarding
          key={editingProfile ? 'edit' : 'first'}
          initial={profile}
          latestWeight={weighIns.length ? weighIns[weighIns.length - 1].weight : null}
          todayYmd={todayDate}
          editing={editingProfile}
          saving={profileSaving}
          error={profileError}
          onClose={() => { setEditingProfile(false); setProfileError(''); }}
          onSkip={showOnboarding && !editingProfile ? skipOnboarding : undefined}
          onSave={saveProfile}
        />
      )}

      {checkin && (
        <div className="greeting-overlay" role="dialog" aria-modal="true" aria-label="Daily check-in">
          <div className="greeting-text">Daily check-in</div>
          {checkin.needWeight && (
            <div className="greeting-field">
              <div className="greeting-label">Weigh-in (lbs)</div>
              <input
                className="greeting-input"
                type="number"
                inputMode="decimal"
                step="0.1"
                placeholder="—"
                value={checkinWeight}
                onChange={(e) => setCheckinWeight(e.target.value)}
              />
            </div>
          )}
          {checkin.needBurn && (
            <div className="greeting-field">
              <div className="greeting-label">Yesterday&apos;s calories burned</div>
              <input
                className="greeting-input"
                type="number"
                inputMode="numeric"
                step="1"
                placeholder="kcal"
                value={checkinBurn}
                onChange={(e) => setCheckinBurn(e.target.value)}
              />
            </div>
          )}
          <button type="button" className="greeting-go" disabled={checkinBusy} onClick={completeCheckin}>
            {checkinBusy ? 'Saving…' : 'Save'}
          </button>
          <button type="button" className="greeting-skip" disabled={checkinBusy} onClick={skipCheckin}>Skip for now</button>
        </div>
      )}

      {scanner && scanner.stage === 'camera' && (
        <BarcodeScanner onDetect={lookupBarcode} onClose={() => setScanner(null)} />
      )}
      {scanner && scanner.stage === 'result' && (
        <BarcodeResult
          key={`${scanner.code}-${scanner.status}`}
          state={scanner}
          onAdd={addScannedMeal}
          onClose={() => setScanner(null)}
          onScanAgain={() => setScanner({ stage: 'camera' })}
        />
      )}
      {quick === 'weight' && (
        <QuickLog
          title="Log weight"
          sub={`${editDayLabel(viewDate, todayDate)}${weight ? ' · currently ' + weight + ' lbs' : ''}`}
          unit="lbs"
          step="0.1"
          initial={weight}
          busy={quickBusy}
          error={quickError}
          onSave={(v) => saveQuick('weight', v)}
          onClose={() => { setQuick(null); setQuickError(''); }}
        />
      )}
      {quick === 'burn' && (
        <QuickLog
          title="Log calories burned"
          sub={`${editDayLabel(viewDate, todayDate)}${activeCalories ? ' · currently ' + activeCalories + ' kcal' : ''}`}
          unit="kcal"
          step="1"
          initial={activeCalories}
          busy={quickBusy}
          error={quickError}
          onSave={(v) => saveQuick('burn', v)}
          onClose={() => { setQuick(null); setQuickError(''); }}
        />
      )}

      <div className="wrap">
        <div className="sticky-top">
          <div className="header">
            <div className="header-title">
              <MiseWordmark height={34} />
            </div>
            <div className="header-right">
              <div className="header-date">{displayDate}</div>
              <button type="button" className="icon-btn" aria-label="Goals and preferences" onClick={() => setEditingProfile(true)}>
                <GearIcon size={16} />
              </button>
            </div>
          </div>
          <div className="tabs" role="tablist" aria-label="Sections">
            <button role="tab" aria-selected={tab === 'log'} className={`tab ${tab === 'log' ? 'active' : ''}`} onClick={() => setTab('log')}>Track</button>
            <button role="tab" aria-selected={tab === 'advisor'} className={`tab ${tab === 'advisor' ? 'active' : ''}`} onClick={() => setTab('advisor')}>Meal Plan</button>
            <button role="tab" aria-selected={tab === 'history'} className={`tab ${tab === 'history' ? 'active' : ''}`} onClick={() => setTab('history')}>Progress</button>
          </div>
        </div>

        {tab === 'log' && (
          <div className="panel">
            {viewDate !== todayDate && (
              <div className="edit-banner">
                Editing {new Date(viewDate + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })} — not today
              </div>
            )}
            {dayError && (
              <div className="load-error" role="alert">
                <span>Couldn't load this day, so saving is paused to protect what's already saved.</span>
                <button type="button" onClick={() => loadDay(viewDate)}>Try again</button>
              </div>
            )}
            <div className="date-nav">
              <button
                type="button"
                className="date-nav-btn"
                aria-label="Previous day"
                onClick={() => changeDay(addDaysToYMD(viewDate, -1))}
              >
                ‹
              </button>
              <span className="date-nav-label">{editDayLabel(viewDate, todayDate)}</span>
              <button
                type="button"
                className="date-nav-btn"
                aria-label="Next day"
                disabled={viewDate >= todayDate}
                onClick={() => changeDay(addDaysToYMD(viewDate, 1))}
              >
                ›
              </button>
            </div>
            <div className="today-card">
              <div className="intake-head">
                <div className="intake-title">{viewDate === todayDate ? 'Daily intake' : "This day's intake"}</div>
                <div className="intake-kcal">
                  {Math.round(totals.calories).toLocaleString()} / {TDEE.toLocaleString()} kcal
                  {deficit < 0 && <span className="intake-over">{Math.abs(deficit).toLocaleString()} over</span>}
                </div>
              </div>
              <div className="bar-track">
                <div className="bar-fill" style={{ width: pct + '%' }} />
              </div>
              <div className="macro-grid">
                {macroBars.map((m) => (
                  <div key={m.key} className={`macro-col ${m.key}`}>
                    <div className="macro-name">{m.label}</div>
                    <div className="macro-bar">
                      <div className="macro-fill" style={{ width: Math.min((m.value / m.target) * 100, 100) + '%' }} />
                    </div>
                    <div className="macro-amt">{Math.round(m.value)} / {m.target} g</div>
                  </div>
                ))}
              </div>
              <div className="track-row">
                <button
                  type="button"
                  className={`track-btn${weight ? ' done' : weighDue && viewDate === todayDate ? ' due' : ''}`}
                  onClick={() => setQuick('weight')}
                  aria-label={weight ? 'Weight logged. Tap to edit.' : 'Log weight'}
                >
                  {weight ? <><CheckIcon size={12} /> Weight logged</> : <><PlusIcon size={13} /> Log weight</>}
                </button>
                <button
                  type="button"
                  className={`track-btn${activeCalories ? ' done' : ''}`}
                  onClick={() => setQuick('burn')}
                  aria-label={activeCalories ? `${activeCalories} calories burned logged. Tap to edit.` : 'Log calories burned'}
                >
                  {activeCalories ? <><CheckIcon size={12} /> {activeCalories} kcal burned</> : <><PlusIcon size={13} /> Log calories burned</>}
                </button>
              </div>
            </div>
            <div className="card">
              <div className="card-header">
                <div className="card-title">Add a meal</div>
              </div>
              <div className="attach-row">
                {photo ? (
                  <div className="photo-preview">
                    <img src={photo.previewUrl} alt="meal" />
                    <button className="remove-btn" onClick={() => setPhoto(null)}>Remove</button>
                  </div>
                ) : (
                  <div className="photo-zone" onDragOver={e => e.preventDefault()} onDrop={handleDrop}>
                    <input type="file" accept="image/*" onChange={handlePhotoSelect} ref={photoInputRef} />
                    <div className="photo-zone-text">
                      <CameraIcon size={13} />
                      <span>Attach a photo</span><small className="drag-hint"> or drag &amp; drop</small>
                    </div>
                  </div>
                )}
                <button type="button" className="btn-scan-tile" onClick={() => setScanner({ stage: 'camera' })} aria-label="Scan a barcode">
                  <BarcodeIcon size={20} />
                  <span>Scan</span>
                </button>
              </div>
              <textarea
                value={mealInput}
                onChange={e => { setMealInput(e.target.value); if (prefillMeal && e.target.value !== prefillMeal.name) setPrefillMeal(null); }}
                onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) estimateMeal(); }}
                placeholder={prefillMeal ? `From advisor: ${prefillMeal.name}` : "Describe what you ate — or leave blank if photo is clear enough"}
                rows={2}
              />
              <div className="input-row">
                <button className="btn-estimate" disabled={mealLoading || (!mealInput.trim() && !photo && !prefillMeal)} onClick={estimateMeal}>
                  {mealLoading ? 'Working...' : <><span>Estimate</span><ZapIcon size={11} style={{ color: 'var(--accent)' }} /></>}
                </button>
              </div>
              {mealStatus.text && <div className={`status status-${mealStatus.type}`}>{mealStatus.text}</div>}
              <div className="divider" />
              {(pendingCount > 0 || mealsDirty) && (
                <div className="sync-status">
                  <DotIcon size={7} />
                  {pendingCount > 0 ? `${pendingCount} meal${pendingCount > 1 ? 's' : ''} pending save` : 'Changes pending save'}
                </div>
              )}
              <button className="btn-sync" disabled={syncLoading || dayError || (pendingCount === 0 && !mealsDirty)} onClick={syncToServer}>
                <ArrowUpIcon size={16} />
                {syncLoading ? 'Saving…' : 'Save'}
              </button>
              {syncStatus.text && <div className={`status status-${syncStatus.type}`}>{syncStatus.text}</div>}
            </div>

            <div className="card">
              <div className="card-header">
                <div className="card-title">Meals</div>
                {pendingCount > 0 && (
                  <div className="pending-pill"><DotIcon size={5} />{pendingCount} unsynced</div>
                )}
              </div>
              {meals.length === 0
                ? <div className="meal-empty">{dayError ? 'Nothing to show' : `No meals logged ${viewDate === todayDate ? 'today' : 'this day'}`}</div>
                : meals.map((m) => {
                    const colors = mealTypeColors[m.type] || mealTypeColors.Lunch;
                    return (
                      <SwipeMealRow key={m.id} onDelete={() => {
                        const wasSynced = m.synced;
                        setMealsDirty(true);
                        setMeals(prev => {
                          const updated = prev.filter((x) => x.id !== m.id);
                          if (wasSynced) return updated.map(m => ({ ...m, synced: false }));
                          return updated;
                        });
                      }}>
                        <div className="meal-icon" style={{ background: colors.bg }}>
                          {m.type === 'Snack'
                            ? <CupIcon size={15} color={colors.icon} />
                            : <UtensilsIcon size={15} color={colors.icon} />}
                        </div>
                        <div className="meal-body">
                          <div className="meal-name">{m.name}</div>
                          <div className="meal-meta">P {m.protein}g · C {m.carbs}g · F {m.fat}g · Fiber {Math.round(Number(m.fiber) || 0)}g{m.type && m.type !== 'Meal' ? ` · ${m.type}` : ''}</div>
                        </div>
                        <div className="meal-right">
                          <div className="meal-kcal">{m.calories}</div>
                          <div className="meal-kcal-label">kcal</div>
                          {m.synced
                            ? <div className="synced-check"><CheckIcon size={10} /> synced</div>
                            : <div className="pending-check"><DotIcon size={7} /> pending</div>}
                        </div>
                      </SwipeMealRow>
                    );
                  })
              }
            </div>
          </div>
        )}

        {tab === 'advisor' && (
          <div className="panel">
            <div className="ctx-bar">
              <div className="ctx-item"><div className="ctx-label">Eaten</div><div className="ctx-value">{Math.round(totals.calories)} kcal</div></div>
              <div className="ctx-item"><div className="ctx-label">Remaining</div><div className="ctx-value">{remaining} kcal</div></div>
              <div className="ctx-item"><div className="ctx-label">Protein left</div><div className="ctx-value">{proteinLeft}g</div></div>
              <div className="ctx-item"><div className="ctx-label">Fiber left</div><div className="ctx-value">{fiberLeft}g</div></div>
            </div>

            <div className="card">
              <div className="chat" ref={chatRef}>
                {chatHistory.length === 0 && (
                  <div className="chat-empty">
                    Hey! Just talk to me: what to eat next, what you can make from your kitchen,{'\n'}how your day is going, or a recipe that fits your macros.{'\n'}You have <strong>{remaining} kcal</strong>, <strong>{proteinLeft}g protein</strong> and <strong>{fiberLeft}g fiber</strong> left.
                  </div>
                )}
                {chatHistory.map((m, i) => (
                  <div key={i} className={`msg-wrap ${m.role === 'user' ? 'user' : 'assistant'}`}>
                    <div className={`chat-bubble ${m.role === 'user' ? 'user' : 'assistant'}`}>
                      {m.role === 'user' ? m.content : (
                        <span dangerouslySetInnerHTML={{ __html:
                          m.content
                            .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
                            .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
                            .replace(/\n/g, '<br/>')
                        }} />
                      )}
                      {m.role === 'assistant' && m.action === 'log_meal' && (
                        <div style={{ marginTop: 10, display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: 'var(--sans)', fontSize: 12, fontWeight: 600, color: 'var(--accent)' }}>
                          <CheckIcon size={10} /> Logged to your list
                        </div>
                      )}
                      {m.role === 'assistant' && m.mealData && m.action !== 'log_meal' && (
                        <div>
                          <button className="log-this-btn" onClick={() => { setPrefillMeal(m.mealData); setTab('log'); }}>
                            <PlusIcon size={11} /> Log this meal
                          </button>
                        </div>
                      )}
                      {m.role === 'assistant' && m.mealOptions && m.mealOptions.map((opt, oi) => (
                        <div key={oi}>
                          <button className="log-this-btn" onClick={() => { setPrefillMeal(opt); setTab('log'); }}>
                            <PlusIcon size={11} /> Log: {opt.name}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                {advisorLoading && (
                  <div className="msg-wrap assistant">
                    <div className="chat-bubble assistant" style={{ color: 'var(--muted)', fontStyle: 'italic' }}>Thinking...</div>
                  </div>
                )}
              </div>

              <div className="chat-input-area">
                <textarea
                  value={advisorInput}
                  onChange={e => setAdvisorInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) sendAdvisorMessage(); }}
                  placeholder="Ask anything: what to eat, what's in your fridge, how your day looks…"
                  rows={2}
                />
                <div className="chat-input-bottom">
                  <button className="btn-send" disabled={advisorLoading} onClick={() => sendAdvisorMessage()}>
                    Send <SendIcon size={10} />
                  </button>
                </div>
              </div>
              {advisorStatus.text && !advisorLoading && <div className={`status status-${advisorStatus.type}`}>{advisorStatus.text}</div>}
            </div>
          </div>
        )}

        {tab === 'history' && (
          <div className="panel">
            <WeightChart weighIns={weighIns} profile={profile} />

            <div className="card">
              <div className="card-header">
                <div className="card-title">This week</div>
                <div className="week-range">{weekRange}</div>
              </div>
              <div className="week-strip">
                {weekSlots.map(({ date: d, row }) => {
                  const logged = hasFood(row);
                  const cal = logged ? Number(row.calories) || 0 : 0;
                  const proteinHit = logged && (Number(row.protein) || 0) >= PROTEIN_TARGET;
                  const fiberHit = logged && (Number(row.fiber) || 0) >= FIBER_TARGET;
                  return (
                    <button
                      key={d}
                      type="button"
                      className={`week-day${logged ? '' : ' empty'}${d === todayDate ? ' today' : ''}`}
                      aria-label={`${editDayLabel(d, todayDate)}: ${logged ? cal + ' kcal' : 'nothing logged'}`}
                      onClick={() => { if (changeDay(d)) setTab('log'); }}
                    >
                      <span className="week-dow">{ymdToDate(d).toLocaleDateString('en-US', { weekday: 'short' })}</span>
                      <span className="week-bar">
                        <span className="week-fill" style={{ height: Math.min(cal / TDEE, 1) * 100 + '%' }} />
                      </span>
                      <span className="week-cal">{logged ? cal.toLocaleString() : '–'}</span>
                      <span className="week-badges">
                        <span className={`week-prot${proteinHit ? ' hit' : ''}`} title={proteinHit ? 'Protein goal hit' : 'Protein goal not hit'}>P</span>
                        <span className={`week-fib${fiberHit ? ' hit' : ''}`} title={fiberHit ? 'Fiber goal hit' : 'Fiber goal not hit'}>F</span>
                      </span>
                    </button>
                  );
                })}
              </div>
              {withData.length > 0 && (
                <div className="week-goals">
                  Protein goal on {daysProteinHit} of {withData.length} logged days · fiber goal on {daysFiberHit} of {withData.length}
                </div>
              )}
              <div className="week-sub">Daily averages</div>
              <div className="stat-grid">
                <div className="stat stat-cal"><div className="stat-val">{avgWeekCal ? avgWeekCal.toLocaleString() : '—'}</div><div className="stat-label">Calories</div></div>
                <div className="stat stat-protein"><div className="stat-val">{avgWeekProt ? avgWeekProt + 'g' : '—'}</div><div className="stat-label">Protein</div></div>
                <div className="stat stat-carbs"><div className="stat-val">{avgWeekCarbs ? avgWeekCarbs + 'g' : '—'}</div><div className="stat-label">Carbs</div></div>
                <div className="stat stat-fat"><div className="stat-val">{avgWeekFat ? avgWeekFat + 'g' : '—'}</div><div className="stat-label">Fat</div></div>
                <div className="stat stat-fiber"><div className="stat-val">{avgWeekFiber ? avgWeekFiber + 'g' : '—'}</div><div className="stat-label">Fiber</div></div>
              </div>
              <div className="week-hint">Tap a day to open it on the Track tab.</div>
            </div>

            <CaloriesChart calorieEntries={foodEntries} tdee={TDEE} />
          </div>
        )}
      </div>
    </>
  );
}
