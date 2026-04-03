/* eslint-disable no-console */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env.local') });

const { sql } = require('@vercel/postgres');

const NOTION_VERSION = '2022-06-28';

function titlePlainText(prop) {
  const t = prop?.title;
  if (!t?.length) return '';
  return t.map((r) => r.plain_text).join('');
}

function numberVal(prop) {
  const n = prop?.number;
  return n == null ? null : n;
}

function richTextPlain(prop) {
  const rt = prop?.rich_text;
  if (!rt?.length) return '';
  return rt.map((r) => r.plain_text).join('');
}

async function fetchAllNotionPages(databaseId, token) {
  const all = [];
  let cursor;
  do {
    const body = { page_size: 100 };
    if (cursor) body.start_cursor = cursor;
    const res = await fetch(`https://api.notion.com/v1/databases/${databaseId}/query`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Notion-Version': NOTION_VERSION,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Notion query failed: ${res.status} ${err}`);
    }
    const data = await res.json();
    all.push(...(data.results || []));
    cursor = data.has_more ? data.next_cursor : null;
  } while (cursor);
  return all;
}

async function main() {
  const NOTION_KEY = process.env.NOTION_KEY;
  const NOTION_DATABASE_ID = process.env.NOTION_DATABASE_ID;
  if (!NOTION_KEY || !NOTION_DATABASE_ID) {
    console.error('Missing NOTION_KEY or NOTION_DATABASE_ID in .env.local');
    process.exit(1);
  }
  if (!process.env.POSTGRES_URL) {
    console.error('Missing POSTGRES_URL in .env.local');
    process.exit(1);
  }

  const pages = await fetchAllNotionPages(NOTION_DATABASE_ID, NOTION_KEY);
  let ok = 0;
  let skipped = 0;

  for (const page of pages) {
    const props = page.properties || {};
    const dateStr = titlePlainText(props.Name);
    if (!dateStr) {
      skipped++;
      continue;
    }

    const calories = Math.round(numberVal(props.Calories) || 0);
    const protein = Math.round(numberVal(props.Protein) || 0);
    const carbs = Math.round(numberVal(props.Carbs) || 0);
    const fat = Math.round(numberVal(props.Fat) || 0);
    const weight = numberVal(props.Weight);
    const activeCalories = numberVal(props['Active Calories']);
    const mealLog = richTextPlain(props['Meal Log']) || '';

    const result = await sql`
      INSERT INTO entries (date, calories, protein, carbs, fat, meal_log, weight, active_calories)
      VALUES (
        ${dateStr}::date,
        ${calories},
        ${protein},
        ${carbs},
        ${fat},
        ${mealLog},
        ${weight},
        ${activeCalories}
      )
      ON CONFLICT (date) DO NOTHING
      RETURNING date
    `;

    if (result.rows.length) {
      const d = result.rows[0].date;
      const ds = d instanceof Date ? d.toISOString().slice(0, 10) : String(d).slice(0, 10);
      console.log(`Backfilled ${ds} ✓`);
      ok++;
    } else {
      skipped++;
    }
  }

  console.log(`Done. Inserted ${ok} row(s); skipped or already present: ${skipped}.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
