import { useState, useEffect, useRef } from 'react';
import Head from 'next/head';

const MAKE_WEBHOOK = 'https://hook.us2.make.com/3ppntn8yxn2jwjo2xp6rm18ku5gl5x2g';
const TDEE = 1795;
const PROTEIN_TARGET = 110;

const ZapIcon = ({ size = 14, style = {} }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="currentColor" stroke="none" style={style}>
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
  </svg>
);
const SmileIcon = ({ size = 14, style = {} }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={style}>
    <circle cx="12" cy="12" r="10"/><path d="M8 13s1.5 2 4 2 4-2 4-2"/>
    <line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/>
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
const DotIcon = ({ size = 8, color = '#00a165' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill={color} stroke="none">
    <circle cx="12" cy="12" r="8"/>
  </svg>
);
const ScaleIcon = ({ size = 14 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 3v19"/><path d="M5 21h14"/>
    <path d="M3 7l4-4 5 4"/><path d="M21 7l-4-4-5 4"/>
    <path d="M3 7c0 3.3 2.7 6 6 6s6-2.7 6-6"/>
    <path d="M21 7c0 3.3-2.7 6-6 6s-6-2.7-6-6"/>
  </svg>
);
const PencilIcon = ({ size = 10 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
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
const UtensilsIcon = ({ size = 15, color = '#00a165' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/>
    <path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/>
  </svg>
);
const CupIcon = ({ size = 15, color = '#d080d0' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <path d="M8 2h8l1 10H7L8 2z"/><path d="M7 12c0 4 2 6 5 6s5-2 5-6"/><path d="M6 21h12"/>
  </svg>
);

const mealTypeColors = {
  Breakfast: { bg: '#e6f4ec', icon: '#00a165' },
  Lunch:     { bg: '#e6f4ec', icon: '#00a165' },
  Dinner:    { bg: '#fde8f1', icon: '#d080d0' },
  Snack:     { bg: '#ffe0e4', icon: '#ff0838' },
};

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Mono:wght@400;500&family=DM+Sans:wght@300;400;500&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --cream: #fbf1f5; --white: #ffffff; --green: #00a165; --pink: #ffc0ff;
    --red: #ff0838; --black: #111111; --muted: #888; --border: #d9d4c8;
    --serif: 'Playfair Display', Georgia, serif;
    --mono: 'DM Mono', monospace; --sans: 'DM Sans', sans-serif;
  }
  body { background: var(--cream); font-family: var(--sans); color: var(--black); min-height: 100vh; }
  .wrap { display: flex; flex-direction: column; align-items: center; padding: 0 0 60px; }
  .header { width: 100%; background: var(--green); padding: 18px 24px 14px; display: flex; justify-content: space-between; align-items: center; position: sticky; top: 0; z-index: 100; }
  .header-title { font-family: var(--serif); font-size: 26px; font-weight: 900; color: var(--pink); display: flex; align-items: center; gap: 8px; }
  .header-right { display: flex; align-items: center; gap: 8px; }
  .header-date { font-family: var(--mono); font-size: 10px; color: rgba(255,255,255,0.6); letter-spacing: 0.1em; text-transform: uppercase; }
  .tabs { width: 100%; max-width: 560px; display: flex; margin: 0 auto; padding: 0 20px; position: sticky; top: 57px; z-index: 99; background: var(--cream); }
  .tab { flex: 1; font-family: var(--mono); font-size: 10px; font-weight: 500; letter-spacing: 0.12em; text-transform: uppercase; padding: 10px 0; text-align: center; background: transparent; color: var(--muted); cursor: pointer; border: none; border-bottom: 2px solid var(--border); transition: all 0.15s; }
  .tab.active { color: var(--red); border-bottom: 2px solid var(--red); }
  .panel { width: 100%; max-width: 560px; padding: 20px 20px 0; display: flex; flex-direction: column; gap: 14px; }
  .today-card { background: var(--green); border-radius: 8px; padding: 20px 20px 16px; margin-bottom: 14px; }
  .today-label { font-family: var(--mono); font-size: 9px; letter-spacing: 0.14em; text-transform: uppercase; color: rgba(255,255,255,0.5); margin-bottom: 20px; }
  .macros-row { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; gap: 0; margin-bottom: 12px; align-items: flex-end; }
  .macro-cell { padding: 0 12px 0 0; }
  .macro-value { font-family: var(--serif); font-size: 30px; font-weight: 900; color: var(--white); line-height: 1; }
  .macro-value.big { font-size: 40px; }
  .macro-label { font-family: var(--mono); font-size: 9px; letter-spacing: 0.1em; text-transform: uppercase; color: rgba(255,255,255,0.5); margin-top: 3px; }
  .bar-track { height: 4px; background: rgba(255,255,255,0.15); border-radius: 4px; overflow: hidden; margin-bottom: 6px; }
  .bar-fill { height: 100%; background: var(--pink); border-radius: 4px; transition: width 0.4s ease; }
  .bar-labels { display: flex; justify-content: space-between; font-family: var(--mono); font-size: 9px; color: rgba(255,255,255,0.4); letter-spacing: 0.06em; }
  .weight-row { display: flex; align-items: center; justify-content: space-between; padding-top: 14px; border-top: 1px solid rgba(255,255,255,0.12); margin-top: 14px; }
  .weight-left { display: flex; align-items: center; gap: 10px; }
  .weight-icon { width: 28px; height: 28px; background: var(--pink); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: var(--green); }
  .weight-label { font-family: var(--mono); font-size: 9px; letter-spacing: 0.1em; text-transform: uppercase; color: rgba(255,255,255,0.5); }
  .weight-input-wrap { display: flex; align-items: center; gap: 6px; background: rgba(255,255,255,0.15); border: 1px solid rgba(255,255,255,0.4); border-radius: 20px; padding: 6px 14px; }
  .weight-input { font-family: var(--serif); font-size: 18px; font-weight: 700; color: #ffffff; background: transparent; border: none; outline: none; width: 64px; text-align: right; -moz-appearance: textfield; }
  .weight-input::-webkit-outer-spin-button, .weight-input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
  .weight-input::placeholder { color: rgba(255,255,255,0.4); }
  .weight-unit { font-family: var(--mono); font-size: 10px; color: rgba(255,255,255,0.8); letter-spacing: 0.08em; display: flex; align-items: center; gap: 4px; }
  .card { background: var(--white); border-radius: 8px; padding: 20px; margin-bottom: 14px; }
  .card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
  .card-title { font-family: var(--serif); font-size: 20px; font-weight: 700; color: var(--black); }
  .pending-pill { display: flex; align-items: center; gap: 5px; background: #f0ede8; border-radius: 20px; padding: 4px 10px; font-family: var(--mono); font-size: 9px; color: var(--green); letter-spacing: 0.08em; }
  .meal-row-wrap { position: relative; overflow: hidden; border-bottom: 1px solid var(--border); }
  .meal-row-wrap:last-child { border-bottom: none; }
  .meal-delete-bg { position: absolute; right: 0; top: 0; bottom: 0; width: 80px; background: var(--red); display: flex; align-items: center; justify-content: center; color: white; font-family: var(--mono); font-size: 10px; letter-spacing: 0.08em; text-transform: uppercase; pointer-events: none; }
  .meal-item { display: flex; gap: 12px; padding: 12px 0; align-items: flex-start; background: var(--white); position: relative; transform: translateX(0); will-change: transform; touch-action: pan-y; }
  .meal-icon { width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .meal-body { flex: 1; min-width: 0; }
  .meal-name { font-size: 14px; font-weight: 500; line-height: 1.3; margin-bottom: 3px; }
  .meal-meta { font-family: var(--mono); font-size: 10px; color: var(--muted); letter-spacing: 0.04em; }
  .meal-right { text-align: right; flex-shrink: 0; }
  .meal-kcal { font-family: var(--serif); font-size: 18px; font-weight: 700; color: var(--black); }
  .meal-kcal-label { font-family: var(--mono); font-size: 9px; color: var(--muted); letter-spacing: 0.06em; }
  .synced-check { font-size: 10px; color: var(--green); font-family: var(--mono); margin-top: 3px; display: flex; align-items: center; justify-content: flex-end; gap: 3px; }
  .pending-check { font-size: 10px; color: var(--green); font-family: var(--mono); margin-top: 3px; display: flex; align-items: center; justify-content: flex-end; gap: 3px; }
  .meal-empty { font-family: var(--mono); font-size: 12px; color: var(--muted); text-align: center; padding: 20px 0; }
  .photo-zone { border: 1.5px dashed #e8c5d4; border-radius: 8px; padding: 16px; text-align: center; background: #fbf0f5; margin-bottom: 10px; cursor: pointer; position: relative; transition: border-color 0.15s; }
  .photo-zone:hover { border-color: var(--red); }
  .photo-zone input { position: absolute; inset: 0; opacity: 0; cursor: pointer; width: 100%; height: 100%; }
  .photo-zone-text { font-family: var(--mono); font-size: 11px; color: var(--muted); letter-spacing: 0.06em; display: flex; align-items: center; justify-content: center; gap: 6px; pointer-events: none; }
  .photo-zone-text span { color: var(--red); }
  .photo-preview { position: relative; margin-bottom: 10px; border-radius: 8px; overflow: hidden; border: 1px solid var(--border); }
  .photo-preview img { width: 100%; max-height: 180px; object-fit: cover; display: block; }
  .remove-btn { position: absolute; top: 6px; right: 6px; background: rgba(0,0,0,0.55); color: white; border: none; border-radius: 20px; font-size: 10px; padding: 4px 10px; cursor: pointer; font-family: var(--mono); letter-spacing: 0.05em; text-transform: uppercase; }
  textarea { width: 100%; border: 1px solid #fbf1f5; border-radius: 8px; padding: 12px; font-family: var(--sans); font-size: 14px; color: var(--black); background: #fbf0f5; resize: none; line-height: 1.5; outline: none; }
  textarea:focus { border-color: var(--pink); }
  textarea::placeholder { color: var(--muted); }
  .input-row { display: flex; gap: 8px; margin-top: 10px; align-items: center; }
  select { font-family: var(--mono); font-size: 11px; border: 1px solid #e8c5d4; border-radius: 20px; padding: 8px 14px; background: #fbf0f5; color: var(--black); outline: none; letter-spacing: 0.06em; cursor: pointer; }
  .btn-estimate { font-family: var(--mono); font-size: 10px; font-weight: 500; letter-spacing: 0.1em; text-transform: uppercase; padding: 8px 16px; border-radius: 20px; border: 1.5px solid var(--red); background: transparent; color: var(--red); cursor: pointer; margin-left: auto; display: flex; align-items: center; gap: 5px; }
  .btn-estimate:disabled { opacity: 0.5; cursor: not-allowed; }
  .divider { height: 1px; background: var(--border); margin: 16px 0; }
  .sync-status { font-family: var(--mono); font-size: 10px; color: var(--green); letter-spacing: 0.06em; margin-bottom: 10px; display: flex; align-items: center; gap: 6px; }
  .btn-sync { width: 100%; font-family: var(--serif); font-size: 16px; font-weight: 700; padding: 14px; border-radius: 8px; border: none; background: var(--green); color: var(--pink); cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; }
  .btn-sync:hover { background: #008a55; }
  .btn-sync:disabled { opacity: 0.5; cursor: not-allowed; }
  .status { font-family: var(--mono); font-size: 11px; margin-top: 10px; min-height: 16px; }
  .status-success { color: var(--green); }
  .status-error { color: var(--red); }
  .status-loading { color: var(--muted); }
  .ctx-bar { background: #e6f4ec; border: 1px solid #b8dfc8; border-radius: 10px; padding: 14px 18px; margin-bottom: 16px; display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 8px; }
  .ctx-item { text-align: center; }
  .ctx-label { font-family: var(--mono); font-size: 9px; letter-spacing: 0.1em; text-transform: uppercase; color: var(--green); margin-bottom: 3px; }
  .ctx-value { font-family: var(--serif); font-size: 18px; font-weight: 900; color: var(--black); }
  .pills { display: flex; gap: 6px; margin-bottom: 16px; flex-wrap: wrap; }
  .pill { font-family: var(--mono); font-size: 10px; letter-spacing: 0.07em; text-transform: uppercase; padding: 7px 13px; border-radius: 20px; border: 1.5px solid var(--border); background: transparent; color: var(--muted); cursor: pointer; transition: all 0.15s; white-space: nowrap; }
  .pill.active { border-color: var(--green); background: #e6f4ec; color: var(--green); font-weight: 600; }
  .chat { display: flex; flex-direction: column; gap: 14px; margin-bottom: 16px; min-height: 120px; max-height: 400px; overflow-y: auto; padding-right: 2px; }
  .chat::-webkit-scrollbar { width: 3px; }
  .chat::-webkit-scrollbar-thumb { background: var(--border); border-radius: 2px; }
  .msg-wrap { display: flex; flex-direction: column; max-width: 88%; }
  .msg-wrap.user { align-items: flex-end; margin-left: auto; }
  .msg-wrap.assistant { align-items: flex-start; margin-right: auto; }
  .chat-bubble { padding: 13px 16px; border-radius: 18px; font-size: 14px; line-height: 1.65; }
  .chat-bubble.assistant { background: var(--white); border: 1px solid var(--border); border-bottom-left-radius: 4px; white-space: pre-wrap; color: var(--black); }
  .chat-bubble.user { background: var(--green); color: var(--white); border-bottom-right-radius: 4px; font-size: 14px; }
  .log-this-btn { display: inline-flex; width: fit-content; align-items: center; gap: 6px; margin-top: 10px; font-family: var(--mono); font-size: 10px; letter-spacing: 0.08em; text-transform: uppercase; color: var(--red); border: 1.5px solid var(--red); border-radius: 20px; padding: 7px 13px; cursor: pointer; background: transparent; transition: background 0.15s; }
  .log-this-btn:hover { background: #fff0f2; }
  .chat-empty { font-family: var(--mono); font-size: 12px; color: var(--muted); text-align: center; padding: 32px 16px; line-height: 2; }
  .suggestions { display: flex; flex-direction: column; gap: 8px; margin-bottom: 14px; }
  .sug-btn { font-family: var(--sans); font-size: 13.5px; text-align: left; padding: 12px 16px; border-radius: 12px; border: 1px solid var(--border); background: var(--white); color: var(--black); cursor: pointer; transition: all 0.15s; line-height: 1.4; }
  .sug-btn:hover { border-color: var(--green); background: #f0faf5; }
  .chat-input-area { background: #fbf0f5; border: 1.5px solid #f0dde8; border-radius: 12px; padding: 10px 12px; margin-bottom: 0; }
  .chat-input-area textarea { width: 100%; min-height: 52px; margin: 0; background: transparent; border: none; outline: none; font-family: var(--sans); font-size: 14px; color: var(--black); resize: none; padding: 0; }
  .chat-input-area textarea::placeholder { color: #b0a0aa; }
  .chat-input-bottom { display: flex; justify-content: space-between; align-items: center; margin-top: 8px; }
  .mode-select { font-family: var(--mono); font-size: 10px; letter-spacing: 0.07em; text-transform: uppercase; background: transparent; border: 1.5px solid var(--border); border-radius: 20px; padding: 6px 10px; color: var(--muted); cursor: pointer; appearance: none; -webkit-appearance: none; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%23999' stroke-width='1.5' fill='none'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 8px center; padding-right: 24px; }
  .btn-send { font-family: var(--mono); font-size: 10px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; padding: 10px 18px; border-radius: 20px; border: none; background: var(--green); color: var(--pink); cursor: pointer; display: flex; align-items: center; gap: 6px; white-space: nowrap; }
  .btn-send:hover { background: #008a55; }
  .btn-send:disabled { opacity: 0.5; cursor: not-allowed; }
`;

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
      >
        {children}
      </div>
    </div>
  );
}

export default function Home() {
  const [tab, setTab] = useState('log');
  const [meals, setMeals] = useState([]);
  const [totals, setTotals] = useState({ calories: 0, protein: 0, carbs: 0, fat: 0 });
  const [mealInput, setMealInput] = useState('');
  const [mealType, setMealType] = useState('Breakfast');
  const [photo, setPhoto] = useState(null);
  const [mealLoading, setMealLoading] = useState(false);
  const [mealStatus, setMealStatus] = useState({ text: '', type: '' });
  const [weight, setWeight] = useState('');
  const [syncLoading, setSyncLoading] = useState(false);
  const [syncStatus, setSyncStatus] = useState({ text: '', type: '' });
  const [advisorMode, setAdvisorMode] = useState('suggest');
  const [chatHistory, setChatHistory] = useState([]);
  const [advisorInput, setAdvisorInput] = useState('');
  const [advisorLoading, setAdvisorLoading] = useState(false);
  const [advisorStatus, setAdvisorStatus] = useState({ text: '', type: '' });
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [prefillMeal, setPrefillMeal] = useState(null);
  const chatRef = useRef(null);
  const photoInputRef = useRef(null);

  const today = new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  const _now = new Date();
  const localDate = `${_now.getFullYear()}-${String(_now.getMonth() + 1).padStart(2, '0')}-${String(_now.getDate()).padStart(2, '0')}`;

  useEffect(() => {
    async function loadToday() {
      setMealStatus({ text: "Loading today's data...", type: 'loading' });
      try {
        const res = await fetch(`/api/today?date=${localDate}`);
        const data = await res.json();
        if (!data.found) { setMealStatus({ text: '', type: '' }); return; }
        const restored = (data.meals || []).map(m => ({ ...m, synced: true }));
        setMeals(restored);
        setTotals({ calories: data.calories, protein: data.protein, carbs: data.carbs, fat: data.fat });
        setMealStatus({ text: `✓ Restored today's data (${Math.round(data.calories)} kcal)`, type: 'success' });
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
      img.src = ev.target.result;
    };
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
            description: mealInput.trim(), mealType,
            photo: photo ? { base64: photo.base64, mediaType: photo.mediaType } : null
          })
        });
        macros = await estRes.json();
        if (macros.error) throw new Error(macros.error);
      }
      setMeals(prev => [...prev, { ...macros, type: mealType, synced: false }]);
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

  async function syncToNotion() {
    setSyncLoading(true);
    setSyncStatus({ text: 'Syncing to Notion...', type: 'loading' });
    try {
      const mealLogText = meals.map(m =>
        `${m.type}: ${m.name} — ${m.calories} kcal | P${m.protein}g C${m.carbs}g F${m.fat}g`
      ).join('\n');
      const currentTotals = meals.reduce((acc, m) => ({
        calories: acc.calories + m.calories, protein: acc.protein + m.protein,
        carbs: acc.carbs + m.carbs, fat: acc.fat + m.fat
      }), { calories: 0, protein: 0, carbs: 0, fat: 0 });
      const payload = {
        date: localDate,
        calories: Math.round(currentTotals.calories),
        protein: Math.round(currentTotals.protein),
        carbs: Math.round(currentTotals.carbs),
        fat: Math.round(currentTotals.fat),
        meal_log: mealLogText,
      };
      if (weight) payload.weight = parseFloat(weight);
      await fetch(MAKE_WEBHOOK, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      setMeals(prev => prev.map(m => ({ ...m, synced: true })));
      setWeight('');
      setSyncStatus({ text: '✓ Synced to Notion', type: 'success' });
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
    setShowSuggestions(false);
    setChatHistory(h => [...h, { role: 'user', content: message }]);
    setAdvisorStatus({ text: 'Thinking...', type: 'loading' });
    try {
      const res = await fetch('/api/advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, totals, meals, advisorMode, chatHistory })
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      // If advisor wants to log a meal directly, add it to meals
      if (data.action === 'log_meal' && data.mealData) {
        const mealToLog = { ...data.mealData, type: mealType, synced: false };
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
  const pendingCount = meals.filter(m => !m.synced).length;

  const modePlaceholders = {
    suggest: "What should I eat next?",
    pantry: "Tell me what ingredients you have...",
    checkin: "How's my day looking?",
    recipe: "Give me a recipe that fits my macros..."
  };

  return (
    <>
      <Head>
        <title>Body Log</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <style>{styles}</style>
      <div className="wrap">
        <div className="header">
          <div className="header-title">
            <ZapIcon size={18} style={{ color: '#ff0838' }} />
            Body Log
          </div>
          <div className="header-right">
            <div className="header-date">{today}</div>
            <SmileIcon size={16} style={{ color: '#ffc0ff' }} />
          </div>
        </div>

        <div className="tabs">
          <button className={`tab ${tab === 'log' ? 'active' : ''}`} onClick={() => setTab('log')}>Log</button>
          <button className={`tab ${tab === 'advisor' ? 'active' : ''}`} onClick={() => setTab('advisor')}>Advisor</button>
        </div>

        {tab === 'log' && (
          <div className="panel">
            <div className="today-card">
              <div className="today-label">Today's intake</div>
              <div className="macros-row">
                <div className="macro-cell">
                  <div className="macro-value big">{Math.round(totals.calories).toLocaleString()}</div>
                  <div className="macro-label">kcal</div>
                </div>
                <div className="macro-cell">
                  <div className="macro-value">{Math.round(totals.protein)}g</div>
                  <div className="macro-label">protein</div>
                </div>
                <div className="macro-cell">
                  <div className="macro-value">{Math.round(totals.carbs)}g</div>
                  <div className="macro-label">carbs</div>
                </div>
                <div className="macro-cell">
                  <div className="macro-value">{Math.round(totals.fat)}g</div>
                  <div className="macro-label">fat</div>
                </div>
              </div>
              <div className="bar-track">
                <div className="bar-fill" style={{ width: pct + '%' }} />
              </div>
              <div className="bar-labels">
                <span>{Math.round(totals.calories).toLocaleString()} eaten</span>
                <span>{deficit >= 0 ? `${deficit} remaining of ${TDEE}` : `${Math.abs(deficit)} over`}</span>
              </div>
              <div className="weight-row">
                <div className="weight-left">
                  <div className="weight-icon"><ScaleIcon size={14} /></div>
                  <div className="weight-label">Today's weight</div>
                </div>
                <div className="weight-input-wrap">
                  <input
                    className="weight-input"
                    type="number"
                    placeholder="—"
                    step="0.1"
                    value={weight}
                    onChange={e => setWeight(e.target.value)}
                  />
                  <span className="weight-unit">lbs <PencilIcon size={10} /></span>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <div className="card-title">Meals</div>
                {pendingCount > 0 && (
                  <div className="pending-pill"><DotIcon size={5} />{pendingCount} unsynced</div>
                )}
              </div>
              {meals.length === 0
                ? <div className="meal-empty">No meals logged today</div>
                : meals.map((m, i) => {
                    const colors = mealTypeColors[m.type] || mealTypeColors.Lunch;
                    return (
                      <SwipeMealRow key={i} onDelete={() => setMeals(prev => prev.filter((_, j) => j !== i))}>
                        <div className="meal-icon" style={{ background: colors.bg }}>
                          {m.type === 'Snack'
                            ? <CupIcon size={15} color={colors.icon} />
                            : <UtensilsIcon size={15} color={colors.icon} />}
                        </div>
                        <div className="meal-body">
                          <div className="meal-name">{m.name}</div>
                          <div className="meal-meta">P {m.protein}g · C {m.carbs}g · F {m.fat}g · {m.type}</div>
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

            <div className="card">
              <div className="card-header">
                <div className="card-title">Add a meal</div>
              </div>
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
                    <span>Attach a photo</span> or drag & drop
                  </div>
                </div>
              )}
              <textarea
                value={mealInput}
                onChange={e => setMealInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) estimateMeal(); }}
                placeholder={prefillMeal ? `From advisor: ${prefillMeal.name}` : "Describe what you ate — or leave blank if photo is clear enough"}
                rows={2}
              />
              <div className="input-row">
                <select value={mealType} onChange={e => setMealType(e.target.value)}>
                  <option>Breakfast</option><option>Lunch</option><option>Dinner</option><option>Snack</option>
                </select>
                <button className="btn-estimate" disabled={mealLoading || (!mealInput.trim() && !photo && !prefillMeal)} onClick={estimateMeal}>
                  {mealLoading ? 'Working...' : <><span>Estimate</span><ZapIcon size={11} style={{ color: '#ff0838' }} /></>}
                </button>
              </div>
              {mealStatus.text && <div className={`status status-${mealStatus.type}`}>{mealStatus.text}</div>}
              <div className="divider" />
              {(pendingCount > 0 || weight) && (
                <div className="sync-status">
                  <DotIcon size={7} />
                  {pendingCount > 0 ? `${pendingCount} meal${pendingCount > 1 ? 's' : ''}` : ''}{pendingCount > 0 && weight ? ' + ' : ''}{weight ? 'weight' : ''} pending sync to Notion
                </div>
              )}
              <button className="btn-sync" disabled={syncLoading || (pendingCount === 0 && !weight)} onClick={syncToNotion}>
                <ArrowUpIcon size={16} />
                {syncLoading ? 'Syncing...' : 'Sync to Notion'}
              </button>
              {syncStatus.text && <div className={`status status-${syncStatus.type}`}>{syncStatus.text}</div>}
            </div>
          </div>
        )}

        {tab === 'advisor' && (
          <div className="panel">
            <div className="ctx-bar">
              <div className="ctx-item"><div className="ctx-label">Eaten</div><div className="ctx-value">{Math.round(totals.calories)} kcal</div></div>
              <div className="ctx-item"><div className="ctx-label">Remaining</div><div className="ctx-value">{remaining} kcal</div></div>
              <div className="ctx-item"><div className="ctx-label">Protein</div><div className="ctx-value">{Math.round(totals.protein)}g</div></div>
              <div className="ctx-item"><div className="ctx-label">Protein left</div><div className="ctx-value">{proteinLeft}g</div></div>
            </div>

            <div className="card">
              <div className="chat" ref={chatRef}>
                {chatHistory.length === 0 && (
                  <div className="chat-empty">
                    Hey! Ask me what to eat next, what you can{'\n'}make from your kitchen, or how your macros look.{'\n'}You have <strong>{remaining} kcal</strong> and <strong>{proteinLeft}g protein</strong> left.
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
                        <div style={{ marginTop: 10, display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--green)' }}>
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
                    <div className="chat-bubble assistant" style={{ color: '#aaa', fontStyle: 'italic' }}>Thinking...</div>
                  </div>
                )}
              </div>



              <div className="chat-input-area">
                <textarea
                  value={advisorInput}
                  onChange={e => setAdvisorInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) sendAdvisorMessage(); }}
                  placeholder={modePlaceholders[advisorMode]}
                  rows={2}
                />
                <div className="chat-input-bottom">
                  <select
                    className="mode-select"
                    value={advisorMode}
                    onChange={e => setAdvisorMode(e.target.value)}
                  >
                    <option value="suggest">Suggest a meal</option>
                    <option value="pantry">Pantry mode</option>
                    <option value="checkin">Check-in</option>
                    <option value="recipe">Recipe + macros</option>
                  </select>
                  <button className="btn-send" disabled={advisorLoading} onClick={() => sendAdvisorMessage()}>
                    Send <SendIcon size={10} />
                  </button>
                </div>
              </div>
              {advisorStatus.text && !advisorLoading && <div className={`status status-${advisorStatus.type}`}>{advisorStatus.text}</div>}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
