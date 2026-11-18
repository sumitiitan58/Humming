import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculatePlannerProgress,
  buildMockTrendData,
  extractDayFromMockLabel,
} from './plannerMetrics';

test('calculatePlannerProgress returns 0% when no days or tasks are completed', () => {
  const res = calculatePlannerProgress({
    completedDays: {},
    todos: [
      { id: 1, day: 1, title: 'Lec 1', chId: 'p_units', type: 'lecture', done: false },
      { id: 2, day: 1, title: 'Prac 1', chId: 'p_units', type: 'practice', done: false },
      { id: 3, day: 1, title: 'Rev 1', chId: 'p_units', type: 'revision', done: false },
    ],
    selectedPlanDay: 1,
  });

  assert.equal(res.overallPercentage, 0);
  assert.equal(res.completedPlannerDays, 0);
  assert.equal(res.selectedDayPercentage, 0);
  assert.equal(res.blocks.length, 6);
});

test('calculatePlannerProgress updates selected day and overall percentage when tasks are ticked', () => {
  const res = calculatePlannerProgress({
    completedDays: { 2: true, 3: true },
    todos: [
      { id: 1, day: 1, title: 'Lec 1', chId: 'p_units', type: 'lecture', done: true },
      { id: 2, day: 1, title: 'Prac 1', chId: 'p_units', type: 'practice', done: true },
      { id: 3, day: 1, title: 'Rev 1', chId: 'p_units', type: 'revision', done: false },
    ],
    selectedPlanDay: 1,
  });

  assert.equal(res.completedSelectedDayTasks, 2);
  assert.equal(res.totalSelectedDayTasks, 3);
  assert.equal(res.selectedDayPercentage, 67);
  // Day 2 and Day 3 are complete (6 tasks) + 2 tasks on Day 1 = 8 / 180 tasks = 4%
  assert.equal(res.completedAllDailyTasks, 8);
  assert.equal(res.totalAllDailyTasks, 180);
  assert.equal(res.overallPercentage, 4);
  assert.equal(res.completedPlannerDays, 2);
});

test('calculatePlannerProgress counts a day as completed when all its daily tasks are done', () => {
  const res = calculatePlannerProgress({
    completedDays: {},
    todos: [
      { id: 1, day: 1, title: 'Lec 1', chId: 'p_units', type: 'lecture', done: true },
      { id: 2, day: 1, title: 'Prac 1', chId: 'p_units', type: 'practice', done: true },
      { id: 3, day: 1, title: 'Rev 1', chId: 'p_units', type: 'revision', done: true },
    ],
    selectedPlanDay: 1,
  });

  assert.equal(res.selectedDayPercentage, 100);
  assert.equal(res.completedPlannerDays, 1);
  assert.equal(res.blocks[0].completedDays, 1);
  assert.equal(res.blocks[0].percentage, 10);
});

test('extractDayFromMockLabel extracts milestone day numbers accurately', () => {
  assert.equal(extractDayFromMockLabel('Day 10 — Test + Analysis', 0), 10);
  assert.equal(extractDayFromMockLabel('Day 60 — Final Mock + Analysis', 5), 60);
  assert.equal(extractDayFromMockLabel('Custom Full Syllabus Mock', 2), 30);
});

test('buildMockTrendData populates 60-day milestones and merges logged scores', () => {
  const points = buildMockTrendData([
    {
      id: 101,
      label: 'Day 10 — Test + Analysis',
      date: '18/11/2026',
      phy: 68,
      chem: 74,
      math: 58,
      notes: 'Good start',
    },
    {
      id: 102,
      label: 'Day 20 — Test + Analysis',
      date: '28/11/2026',
      phy: 75,
      chem: 80,
      math: 66,
    },
  ]);

  assert.equal(points.length, 6);
  assert.equal(points[0].day, 10);
  assert.equal(points[0].total, 200);
  assert.equal(points[0].hasAttempt, true);
  assert.equal(points[1].day, 20);
  assert.equal(points[1].total, 221);
  assert.equal(points[2].day, 30);
  assert.equal(points[2].total, null);
  assert.equal(points[2].hasAttempt, false);
});

test('Index.html CHAPTER_WEIGHTAGE sums to 100 per subject and 300 across Easy + Medium + Hard', async () => {
  const fs = await import('node:fs');
  const html = fs.readFileSync('Index.html', 'utf-8');
  const match = html.match(/const CHAPTER_WEIGHTAGE = \[([\s\S]*?)\];/);
  assert.ok(match, 'CHAPTER_WEIGHTAGE array exists in Index.html');

  const entries = [...match[1].matchAll(/\{\s*id:\s*"([^"]+)",\s*sub:\s*"([^"]+)",\s*ch:\s*"([^"]+)",\s*marks:\s*(\d+),\s*diff:\s*"([^"]+)"/g)].map(
    (m) => ({ id: m[1], sub: m[2], ch: m[3], marks: Number(m[4]), diff: m[5] })
  );

  const phy = entries.filter((e) => e.sub === 'PHYSICS').reduce((a, b) => a + b.marks, 0);
  const chem = entries.filter((e) => e.sub === 'CHEMISTRY').reduce((a, b) => a + b.marks, 0);
  const math = entries.filter((e) => e.sub === 'MATHS').reduce((a, b) => a + b.marks, 0);

  assert.equal(phy, 100);
  assert.equal(chem, 100);
  assert.equal(math, 100);

  const easy = entries.filter((e) => e.diff === 'Easy').reduce((a, b) => a + b.marks, 0);
  const med = entries.filter((e) => e.diff === 'Medium').reduce((a, b) => a + b.marks, 0);
  const hard = entries.filter((e) => e.diff === 'Hard').reduce((a, b) => a + b.marks, 0);

  assert.equal(easy + med + hard, 300);
});

