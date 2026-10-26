CREATE TABLE IF NOT EXISTS entries (
  id SERIAL PRIMARY KEY,
  date DATE NOT NULL UNIQUE,
  calories INTEGER DEFAULT 0,
  protein INTEGER DEFAULT 0,
  carbs INTEGER DEFAULT 0,
  fat INTEGER DEFAULT 0,
  weight DECIMAL(5,2),
  active_calories INTEGER,
  meal_log TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE entries ADD COLUMN IF NOT EXISTS fiber INTEGER DEFAULT 0;

-- Single-row table (id is always 1) holding goals, targets and dietary preferences.
CREATE TABLE IF NOT EXISTS profile (
  id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  onboarded BOOLEAN DEFAULT FALSE,
  start_weight DECIMAL(5,2),
  start_date DATE,
  goal_weight DECIMAL(5,2),
  goal_date DATE,
  weigh_in_mode TEXT DEFAULT 'weekly',
  weigh_in_day INTEGER,
  calorie_target INTEGER DEFAULT 1600,
  protein_target INTEGER DEFAULT 110,
  fiber_target INTEGER DEFAULT 25,
  carb_target INTEGER DEFAULT 170,
  fat_target INTEGER DEFAULT 53,
  diet_prefs TEXT DEFAULT '',
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Added for goal-based onboarding suggestions.
ALTER TABLE profile ADD COLUMN IF NOT EXISTS fitness_goal TEXT;
ALTER TABLE profile ADD COLUMN IF NOT EXISTS age INTEGER;
ALTER TABLE profile ADD COLUMN IF NOT EXISTS height_in DECIMAL(4,1);
ALTER TABLE profile ADD COLUMN IF NOT EXISTS sex TEXT;
ALTER TABLE profile ADD COLUMN IF NOT EXISTS activity TEXT;

-- Finished interval-timer workouts. Each one also adds its calories to entries.active_calories (pages/api/workout.js).
CREATE TABLE IF NOT EXISTS workouts (
  id SERIAL PRIMARY KEY,
  date DATE NOT NULL,
  name TEXT NOT NULL DEFAULT 'Workout',
  seconds INTEGER NOT NULL,
  est_calories INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);
