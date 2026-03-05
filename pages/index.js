import { useState, useEffect, useRef } from 'react';
import Head from 'next/head';

const MAKE_WEBHOOK = 'https://hook.us2.make.com/3ppntn8yxn2jwjo2xp6rm18ku5gl5x2g';
const TDEE = 1795;
const PROTEIN_TARGET = 110;

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=IBM+Plex+Sans:wght@300;400;500&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg: #f5f4f0; --surface: #ffffff; --border: #e0ddd6;
    --text: #1a1a1a; --muted: #888; --accent: #2d5a27;
    --accent-light: #e8f0e7; --danger: #c0392b;
    --mono: 'IBM Plex Mono', monospace; --sans: 'IBM Plex Sans', sans-serif;
  }
  body { background: var(--bg); font-family: var(--sans); color: var(--text); min-height: 100vh; }
  .wrap { display: flex; flex-direction: column; align-items: center; padding: 40px 20px; }
  header { width: 100%; max-width: 560px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: flex-end; }
  .logo { font-family: var(--mono); font-size: 13px; font-weight: 500; letter-spacing: 0.08em; text-transform: uppercase; color: var(--accent); }
  .date { font-family: var(--mono); font-size: 12px; color: var(--muted); }
  .tabs { width: 100%; max-width: 560px; display: flex; gap: 1px; background: var(--border); border: 1px solid var(--border); border-radius: 4px; overflow: hidden; margin-bottom: 20px; }
  .tab { flex: 1; font-family: var(--mono); font-size: 11px; font-weight: 500; letter-spacing: 0.1em; text-transform: uppercase; padding: 10px; text-align: center; background: var(--bg); color: var(--muted); cursor: pointer; border: none; transition: all 0.15s; }
  .tab.active { background: var(--surface); color: var(--accent); }
  .panel { width: 100%; max-width: 560px; display: flex; flex-direction: column; }
  .card { background: var(--surface); border: 1px solid var(--border); border-radius: 4px; padding: 24px; width: 100%; margin-bottom: 16px; }
  .card-label { font-family: var(--mono); font-size: 10px; font-weight: 500; letter-spacing: 0.12em; text-transform: uppercase; color: var(--muted); margin-bottom: 16px; }
  .totals-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1px; background: var(--border); border: 1px solid var(--border); border-radius: 3px; overflow: hidden; margin-bottom: 16px; }
  .total-cell { background: var(--surface); padding: 14px 12px; text-align: center; }
  .total-value { font-family: var(--mono); font-size: 22px; font-weight: 500; color: var(--text); line-height: 1; }
  .total-label { font-family: var(--mono); font-size: 9px; letter-spacing: 0.1em; text-transform: uppercase; color: var(--muted); margin-top: 4px; }
  .bar-wrap { height: 3px; background: var(--border); border-radius: 2px; overflow: hidden; }
  .bar { height: 100%; border-radius: 2px; transition: width 0.4s ease; }
  .bar-label { font-family: var(--mono); font-size: 10px; color: var(--muted); margin-top: 6px; display: flex; justify-content: space-between; }
  .meal-list { display: flex; flex-direction: column; gap: 10px; margin-bottom: 4px; min-height: 40px; }
  .meal-item { display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; padding-bottom: 10px; border-bottom: 1px solid var(--border); }
  .meal-item:last-child { border-bottom: none; padding-bottom: 0; }
  .meal-name { font-size: 14px; font-weight: 400; flex: 1; line-height: 1.4; }
  .meal-macros { font-family: var(--mono); font-size: 11px; color: var(--muted); text-align: right; white-space: nowrap; line-height: 1.6; }
  .empty { font-family: var(--mono); font-size: 12px; color: var(--muted); text-align: center; padding: 20px 0; }
  .badge { display: inline-block; font-family: var(--mono); font-size: 9px; letter-spacing: 0.08em; text-transform: uppercase; padding: 2px 5px; border-radius: 2px; margin-left: 6px; vertical-align: middle; }
  .badge-high { background: var(--accent-light); color: var(--accent); }
  .badge-medium { background: #fef3e2; color: #b7770d; }
  .badge-low { background: #fdecea; color: var(--danger); }
  textarea { width: 100%; border: 1px solid var(--border); border-radius: 3px; padding: 12px; font-family: var(--sans); font-size: 14px; color: var(--text); background: var(--bg); resize: none; line-height: 1.5; outline: none; transition: border-color 0.15s; }
  textarea:focus { border-color: var(--accent); }
  textarea::placeholder { color: var(--muted); }
  .input-row { display: flex; gap: 8px; margin-top: 10px; align-items: center; }
  select { font-family: var(--mono); font-size: 11px; border: 1px solid var(--border); border-radius: 3px; padding: 8px 10px; background: var(--bg); color: var(--text); cursor: pointer; outline: none; }
  button { font-family: var(--mono); font-size: 11px; font-weight: 500; letter-spacing: 0.08em; text-transform: uppercase; padding: 8px 16px; border-radius: 3px; border: none; cursor: pointer; transition: all 0.15s; }
  .btn { background: var(--accent); color: white; margin-left: auto; white-space: nowrap; }
  .btn:hover { background: #234820; }
  .btn:disabled { background: var(--muted); cursor: not-allowed; }
  .btn-send { background: var(--accent); color: white; margin-left: 0; align-self: flex-end; white-space: nowrap; }
  .btn-send:disabled { background: var(--muted); cursor: not-allowed; }
  .inline-inputs { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
  input[type=number] { font-family: var(--mono); font-size: 13px; border: 1px solid var(--border); border-radius: 3px; padding: 8px 10px; background: var(--bg); color: var(--text); outline: none; width: 110px; transition: border-color 0.15s; }
  input[type=number]:focus { border-color: var(--accent); }
  .sync-row { display: flex; justify-content: flex-end; margin-top: 10px; }
  .status { font-family: var(--mono); font-size: 11px; margin-top: 10px; min-height: 16px; }
  .status-success { color: var(--accent); }
  .status-error { color: var(--danger); }
  .status-loading { color: var(--muted); }
  .photo-zone { border: 1.5px dashed var(--border); border-radius: 3px; padding: 14px; margin-bottom: 10px; text-align: center; cursor: pointer; transition: all 0.15s; background: var(--bg); position: relative; }
  .photo-zone:hover { border-color: var(--accent); background: var(--accent-light); }
  .photo-zone input { position: absolute; inset: 0; opacity: 0; cursor: pointer; width: 100%; height: 100%; }
  .photo-zone-label { font-family: var(--mono); font-size: 11px; color: var(--muted); letter-spacing: 0.06em; pointer-events: none; }
  .photo-zone-label span { color: var(--accent); }
  .photo-preview { position: relative; margin-bottom: 10px; border-radius: 3px; overflow: hidden; border: 1px solid var(--border); }
  .photo-preview img { width: 100%; max-height: 180px; object-fit: cover; display: block; }
  .remove-btn { position: absolute; top: 6px; right: 6px; background: rgba(0,0,0,0.55); color: white; border: none; border-radius: 2px; font-size: 10px; padding: 3px 7px; cursor: pointer; font-family: var(--mono); letter-spacing: 0.05em; text-transform: uppercase; margin-left: 0; }
  .ctx-bar { background: var(--accent-light); border: 1px solid #c5dcc3; border-radius: 3px; padding: 12px 16px; margin-bottom: 16px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px; }
  .ctx-item { text-align: center; }
  .ctx-label { font-family: var(--mono); font-size: 9px; letter-spacing: 0.1em; text-transform: uppercase; color: var(--accent); margin-bottom: 2px; }
  .ctx-value { font-family: var(--mono); font-size: 13px; color: var(--text); font-weight: 500; }
  .pills { display: flex; gap: 6px; margin-bottom: 14px; flex-wrap: wrap; }
  .pill { font-family: var(--mono); font-size: 10px; letter-spacing: 0.08em; text-transform: uppercase; padding: 6px 12px; border-radius: 20px; border: 1px solid var(--border); background: var(--bg); color: var(--muted); cursor: pointer; transition: all 0.15s; }
  .pill.active { border-color: var(--accent); background: var(--accent-light); color: var(--accent); }
  .chat { display: flex; flex-direction: column; gap: 12px; margin-bottom: 16px; max-height: 360px; overflow-y: auto; padding-right: 4px; }
  .chat::-webkit-scrollbar { width: 3px; }
  .chat::-webkit-scrollbar-thumb { background: var(--border); border-radius: 2px; }
  .msg { display: flex; flex-direction: column; gap: 4px; }
  .msg-role { font-family: var(--mono); font-size: 9px; letter-spacing: 0.1em; text-transform: uppercase; color: var(--muted); }
  .msg-user .msg-role { color: var(--accent); }
  .msg-body { font-size: 14px; line-height: 1.6; color: var(--text); background: var(--bg); border-radius: 3px; padding: 10px 14px; border: 1px solid var(--border); white-space: pre-wrap; }
  .msg-user .msg-body { background: var(--accent-light); border-color: #c5dcc3; }
  .chat-empty { font-family: var(--mono); font-size: 12px; color: var(--muted); text-align: center; padding: 24px 0; line-height: 1.8; }
  .suggestions { display: flex; flex-direction: column; gap: 6px; margin-bottom: 12px; }
  .sug-btn { font-family: var(--sans); font-size: 13px; text-align: left; padding: 8px 12px; border-radius: 3px; border: 1px solid var(--border); background: var(--bg); color: var(--text); cursor: pointer; transition: all 0.15s; letter-spacing: 0; text-transform: none; font-weight: 400; margin-left: 0; }
  .sug-btn:hover { border-color: var(--accent); background: var(--accent-light); }
  .chat-input-row { display: flex; gap: 8px; align-items: flex-end; }
  .chat-input-row textarea { flex: 1; min-height: 60px; margin: 0; }
`;

export default function Home() {
  const [tab, setTab] = useState('log');
  const [meals, setMeals] = useState([]);
  const [totals, setTotals] = useState({ calories: 0, protein: 0, carbs: 0, fat: 0 });
  const [mealInput, setMealInput] = useState('');
  const [mealType, setMealType] = useState('Breakfast');
  const [photo, setPhoto] = useState(null);
  const [mealStatus, setMealStatus] = useState({ text: '', type: '' });
  const [mealLoading, setMealLoading] = useState(false);
  const [weight, setWeight] = useState('');
  const [steps, setSteps] = useState('');
  const [activeCal, setActiveCal] = useState('');
  const [metricsStatus, setMetricsStatus] = useState({ text: '', type: '' });
  const [advisorMode, setAdvisorMode] = useState('suggest');
  const [chatHistory, setChatHistory] = useState([]);
  const [advisorInput, setAdvisorInput] = useState('');
  const [advisorLoading, setAdvisorLoading] = useState(false);
  const [advisorStatus, setAdvisorStatus] = useState({ text: '', type: '' });
  const [showSuggestions, setShowSuggestions] = useState(true);
  const chatRef = useRef(null);
  const photoInputRef = useRef(null);

  const today = new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

  useEffect(() => {
    async function loadToday() {
      setMealStatus({ text: "Loading today's data...", type: 'loading' });
      try {
        const res = await fetch('/api/today');
        const data = await res.json();
        if (!data.found) { setMealStatus({ text: '', type: '' }); return; }
        setMeals(data.meals || []);
        setTotals({ calories: data.calories, protein: data.protein, carbs: data.carbs, fat: data.fat });
        setMealStatus({ text: `✓ Restored today's data (${Math.round(data.calories)} kcal logged)`, type: 'success' });
        setTimeout(() => setMealStatus({ text: '', type: '' }), 3000);
      } catch {
        setMealStatus({ text: '', type: '' });
      }
    }
    loadToday();
  }, []);

  useEffect(() => {
    if (meals.length === 0) return;
    const t = meals.reduce((acc, m) => ({
      calories: acc.calories + m.calories, protein: acc.protein + m.protein,
      carbs: acc.carbs + m.carbs, fat: acc.fat + m.fat
    }), { calories: 0, protein: 0, carbs: 0, fat: 0 });
    setTotals(t);
  }, [meals]);

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [chatHistory]);

  function handlePhotoSelect(e) { const file = e.target.files[0]; if (!file) return; loadPhoto(file); }
  function handleDrop(e) { e.preventDefault(); const file = e.dataTransfer.files[0]; if (file && file.type.startsWith('image/')) loadPhoto(file); }
  function loadPhoto(file) {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    img.onload = () => {
      const maxSize = 800;
      let { width, height } = img;
      if (width > maxSize || height > maxSize) {
        if (width > height) { height = Math.round(height * maxSize / width); width = maxSize; }
        else { width = Math.round(width * maxSize / height); height = maxSize; }
      }
      const canvas = document.createElement('canvas');
      canvas.width = width; canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.6);
      URL.revokeObjectURL(objectUrl);
      console.log('Image size:', Math.round(dataUrl.length * 0.75 / 1024), 'KB');
      setPhoto({ base64: dataUrl.split(',')[1], mediaType: 'image/jpeg', previewUrl: dataUrl });
    };
    img.src = objectUrl;
  }

  async function logMeal() {
    if (!mealInput.trim() && !photo) return;
    setMealLoading(true);
    setMealStatus({ text: 'Estimating macros...', type: 'loading' });
    try {
      const estRes = await fetch('/api/estimate', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: mealInput.trim(), mealType, photo: photo ? { base64: photo.base64, mediaType: photo.mediaType } : null })
      });
      const macros = await estRes.json();
      if (macros.error) throw new Error(macros.error);
      const newMeals = [...meals, { ...macros, type: mealType, confidence: macros.confidence || 'Medium' }];
      setMeals(newMeals);
      const newTotals = newMeals.reduce((acc, m) => ({ calories: acc.calories + m.calories, protein: acc.protein + m.protein, carbs: acc.carbs + m.carbs, fat: acc.fat + m.fat }), { calories: 0, protein: 0, carbs: 0, fat: 0 });
      setMealStatus({ text: 'Syncing to Notion...', type: 'loading' });
      const mealLogText = newMeals.map(m => `${m.type}: ${m.name} — ${m.calories} kcal | P${m.protein}g C${m.carbs}g F${m.fat}g`).join('\n');
      await fetch(MAKE_WEBHOOK, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: new Date().toISOString().split('T')[0].replace(/-/g, '/'), calories: Math.round(newTotals.calories), protein: Math.round(newTotals.protein), carbs: Math.round(newTotals.carbs), fat: Math.round(newTotals.fat), meal_log: mealLogText })
      });
      setMealStatus({ text: `✓ Logged: ${macros.name} (${macros.calories} kcal)`, type: 'success' });
      setMealInput(''); setPhoto(null);
    } catch (err) { setMealStatus({ text: `Error: ${err.message}`, type: 'error' }); }
    setMealLoading(false);
  }

  async function syncMetrics() {
    const payload = { date: new Date().toISOString().split('T')[0].replace(/-/g, '/'), type: 'metrics' };
    if (weight) payload.weight = parseFloat(weight);
    if (steps) payload.steps = parseInt(steps);
    if (activeCal) payload.active_calories = parseInt(activeCal);
    setMetricsStatus({ text: 'Syncing...', type: 'loading' });
    try {
      await fetch(MAKE_WEBHOOK, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      setMetricsStatus({ text: '✓ Metrics synced', type: 'success' });
    } catch (err) { setMetricsStatus({ text: `Error: ${err.message}`, type: 'error' }); }
  }

  async function sendAdvisorMessage(msg) {
    const message = msg || advisorInput.trim();
    if (!message) return;
    setAdvisorLoading(true); setAdvisorInput(''); setShowSuggestions(false);
    setChatHistory(h => [...h, { role: 'user', content: message }]);
    setAdvisorStatus({ text: 'Thinking...', type: 'loading' });
    try {
      const res = await fetch('/api/advisor', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, totals, meals, advisorMode, chatHistory })
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setChatHistory(h => [...h, { role: 'assistant', content: data.reply }]);
      setAdvisorStatus({ text: '', type: '' });
    } catch (err) { setAdvisorStatus({ text: `Error: ${err.message}`, type: 'error' }); }
    setAdvisorLoading(false);
  }

  const pct = Math.min((totals.calories / TDEE) * 100, 100);
  const deficit = TDEE - Math.round(totals.calories);
  const remaining = Math.max(0, deficit);
  const proteinLeft = Math.max(0, PROTEIN_TARGET - Math.round(totals.protein));
  const modePlaceholders = { suggest: "What should I eat next?", pantry: "Tell me what ingredients you have...", checkin: "How's my day looking?", recipe: "Give me a recipe that fits my macros..." };

  return (
    <>
      <Head><title>Health Log</title><meta name="viewport" content="width=device-width, initial-scale=1" /></Head>
      <style>{styles}</style>
      <div className="wrap">
        <header>
          <div className="logo">Health Log</div>
          <div className="date">{today}</div>
        </header>
        <div className="tabs">
          <button className={`tab ${tab === 'log' ? 'active' : ''}`} onClick={() => setTab('log')}>Log</button>
          <button className={`tab ${tab === 'advisor' ? 'active' : ''}`} onClick={() => setTab('advisor')}>Advisor</button>
        </div>

        {tab === 'log' && (
          <div className="panel">
            <div className="card">
              <div className="card-label">Today</div>
              <div className="totals-grid">
                <div className="total-cell"><div className="total-value">{Math.round(totals.calories)}</div><div className="total-label">kcal</div></div>
                <div className="total-cell"><div className="total-value">{Math.round(totals.protein)}g</div><div className="total-label">protein</div></div>
                <div className="total-cell"><div className="total-value">{Math.round(totals.carbs)}g</div><div className="total-label">carbs</div></div>
                <div className="total-cell"><div className="total-value">{Math.round(totals.fat)}g</div><div className="total-label">fat</div></div>
              </div>
              <div className="bar-wrap"><div className="bar" style={{ width: pct + '%', background: totals.calories > TDEE ? '#c0392b' : '#2d5a27' }} /></div>
              <div className="bar-label"><span>{Math.round(totals.calories)} kcal eaten</span><span>{deficit >= 0 ? `${deficit} kcal remaining` : `${Math.abs(deficit)} kcal over`}</span></div>
            </div>
            <div className="card">
              <div className="card-label">Meals</div>
              <div className="meal-list">
                {meals.length === 0 ? <div className="empty">No meals logged today</div> : meals.map((m, i) => (
                  <div key={i} className="meal-item">
                    <div className="meal-name">{m.name}<span className={`badge badge-${m.confidence?.toLowerCase()}`}>{m.confidence}</span></div>
                    <div className="meal-macros"><span>{m.calories} kcal</span><span>P {m.protein}g · C {m.carbs}g · F {m.fat}g</span></div>
                  </div>
                ))}
              </div>
            </div>
            <div className="card">
              <div className="card-label">Log meal</div>
              {photo ? (
                <div className="photo-preview"><img src={photo.previewUrl} alt="meal" /><button className="remove-btn" onClick={() => setPhoto(null)}>Remove</button></div>
              ) : (
                <div className="photo-zone" onDragOver={e => e.preventDefault()} onDrop={handleDrop}>
                  <input type="file" accept="image/*" onChange={handlePhotoSelect} ref={photoInputRef} />
                  <div className="photo-zone-label">📷 <span>Attach a photo</span> or drag & drop</div>
                </div>
              )}
              <textarea value={mealInput} onChange={e => setMealInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) logMeal(); }} placeholder="Describe what you ate — or leave blank if photo is clear enough" rows={2} />
              <div className="input-row">
                <select value={mealType} onChange={e => setMealType(e.target.value)}><option>Breakfast</option><option>Lunch</option><option>Dinner</option><option>Snack</option></select>
                <button className="btn" disabled={mealLoading} onClick={logMeal}>{mealLoading ? 'Working...' : 'Estimate + Log'}</button>
              </div>
              {mealStatus.text && <div className={`status status-${mealStatus.type}`}>{mealStatus.text}</div>}
            </div>
            <div className="card">
              <div className="card-label">Daily metrics</div>
              <div className="inline-inputs">
                <input type="number" placeholder="lbs" value={weight} onChange={e => setWeight(e.target.value)} step="0.1" />
                <input type="number" placeholder="steps" value={steps} onChange={e => setSteps(e.target.value)} />
                <input type="number" placeholder="active cal" value={activeCal} onChange={e => setActiveCal(e.target.value)} />
              </div>
              <div className="sync-row"><button className="btn" onClick={syncMetrics}>Sync to Notion</button></div>
              {metricsStatus.text && <div className={`status status-${metricsStatus.type}`}>{metricsStatus.text}</div>}
            </div>
          </div>
        )}

        {tab === 'advisor' && (
          <div className="panel">
            <div className="card">
              <div className="card-label">Today so far</div>
              <div className="ctx-bar">
                <div className="ctx-item"><div className="ctx-label">Eaten</div><div className="ctx-value">{Math.round(totals.calories)} kcal</div></div>
                <div className="ctx-item"><div className="ctx-label">Remaining</div><div className="ctx-value">{remaining} kcal</div></div>
                <div className="ctx-item"><div className="ctx-label">Protein</div><div className="ctx-value">{Math.round(totals.protein)}g</div></div>
                <div className="ctx-item"><div className="ctx-label">Protein left</div><div className="ctx-value">{proteinLeft}g</div></div>
              </div>
            </div>
            <div className="card">
              <div className="card-label">Advisor</div>
              <div className="pills">
                {['suggest', 'pantry', 'checkin', 'recipe'].map(m => (
                  <div key={m} className={`pill ${advisorMode === m ? 'active' : ''}`} onClick={() => setAdvisorMode(m)}>
                    {m === 'suggest' ? 'Meal suggestions' : m === 'pantry' ? 'Pantry mode' : m === 'checkin' ? 'Check-in' : 'Recipe + macros'}
                  </div>
                ))}
              </div>
              <div className="chat" ref={chatRef}>
                {chatHistory.length === 0 && <div className="chat-empty">Ask me what to eat next, what you can make from your kitchen, or how your macros look.</div>}
                {chatHistory.map((m, i) => (
                  <div key={i} className={`msg ${m.role === 'user' ? 'msg-user' : ''}`}>
                    <div className="msg-role">{m.role === 'user' ? 'You' : 'Advisor'}</div>
                    <div className="msg-body">{m.content}</div>
                  </div>
                ))}
              </div>
              {showSuggestions && chatHistory.length === 0 && (
                <div className="suggestions">
                  {["What should I eat for dinner to stay in deficit?","I have chicken thighs, Greek yogurt, and broccoli — what can I make?","How's my protein looking? What should I prioritize?","Give me a high-protein dinner recipe under 500 calories"].map((s, i) => (
                    <button key={i} className="sug-btn" onClick={() => sendAdvisorMessage(s)}>{s}</button>
                  ))}
                </div>
              )}
              <div className="chat-input-row">
                <textarea value={advisorInput} onChange={e => setAdvisorInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) sendAdvisorMessage(); }} placeholder={modePlaceholders[advisorMode]} rows={2} />
                <button className="btn-send" disabled={advisorLoading} onClick={() => sendAdvisorMessage()}>{advisorLoading ? '...' : 'Send'}</button>
              </div>
              {advisorStatus.text && <div className={`status status-${advisorStatus.type}`}>{advisorStatus.text}</div>}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
