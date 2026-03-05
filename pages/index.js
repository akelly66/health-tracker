import { useState, useEffect, useRef } from 'react';
import Head from 'next/head';

const MAKE_WEBHOOK = 'https://hook.us2.make.com/3ppntn8yxn2jwjo2xp6rm18ku5gl5x2g';
const TDEE = 1795;
const PROTEIN_TARGET = 130;

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
  .status { font-family: var(--mono); font-size: 11px;
