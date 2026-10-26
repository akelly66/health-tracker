// Set ANTHROPIC_MODEL in .env.local (or Vercel env vars) to change the model without editing code.
export const MODEL = process.env.ANTHROPIC_MODEL || 'claude-sonnet-5-5';

// The 5.x models think before answering by default, which spends output tokens (and can eat the
// whole max_tokens budget, leaving no text). Meal estimates and chat don't need it, so turn it off.
// Other models are left alone, since this value isn't valid everywhere.
export const MODEL_PARAMS = /^claude-(sonnet|opus|fable)-5/.test(MODEL)
  ? { thinking: { type: 'between_tools' } }
  : {};
