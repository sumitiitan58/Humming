export interface TodoItem {
  id: number;
  day?: number;
  title: string;
  chId: string;
  type: 'lecture' | 'practice' | 'revision';
  done: boolean;
}

export interface DayPlanItem {
  day: number;
  s1Sub: string;
  s1Topic: string;
  s2Sub: string;
  s2Topic: string;
}

export interface MockScoreItem {
  id: number;
  label: string;
  date: string;
  phy: number;
  chem: number;
  math: number;
  notes?: string;
}

export interface BlockProgress {
  blockIndex: number;
  label: string;
  startDay: number;
  endDay: number;
  completedDays: number;
  totalDays: number;
  percentage: number;
}

export interface PlannerProgressMetrics {
  overallPercentage: number;
  completedPlannerDays: number;
  totalPlannerDays: number;
  plannerDaysPercentage: number;
  completedSelectedDayTasks: number;
  totalSelectedDayTasks: number;
  selectedDayPercentage: number;
  completedAllDailyTasks: number;
  totalAllDailyTasks: number;
  dailyTasksPercentage: number;
  completedLecturesCount: number;
  totalLecturesCount: number;
  blocks: BlockProgress[];
}

export interface MockChartPoint {
  id: string;
  day: number;
  dayLabel: string;
  testName: string;
  date: string;
  total: number | null;
  phy: number | null;
  chem: number | null;
  math: number | null;
  target: number;
  hasAttempt: boolean;
  notes?: string;
}

export const TOTAL_PLANNER_DAYS = 60;
export const DEFAULT_TOTAL_LECTURES = 78;

/**
 * Calculates daily task and 60-day planner completion metrics.
 * Combines 60-day schedule completion with daily To-Do task completion
 * so ticking either a daily task or a planner day reflects immediately.
 */
export function calculatePlannerProgress(params: {
  completedDays: Record<number, boolean>;
  todos: TodoItem[];
  selectedPlanDay: number;
  completedLectures?: Record<number, boolean>;
  totalLectures?: number;
}): PlannerProgressMetrics {
  const {
    completedDays = {},
    todos = [],
    selectedPlanDay = 1,
    completedLectures = {},
    totalLectures = DEFAULT_TOTAL_LECTURES,
  } = params;

  // Count how many of the 60 planner days are marked complete
  // A day is also considered active/progressed if all of its assigned daily tasks (at least 1) are completed
  let completedPlannerDays = 0;
  const blocks: BlockProgress[] = [];

  for (let b = 0; b < 6; b++) {
    const startDay = b * 10 + 1;
    const endDay = (b + 1) * 10;
    let blockDone = 0;

    for (let d = startDay; d <= endDay; d++) {
      const dayTodos = todos.filter((t) => (t.day || 1) === d);
      const allDayTodosDone = dayTodos.length > 0 && dayTodos.every((t) => t.done);
      if (completedDays[d] || allDayTodosDone) {
        completedPlannerDays++;
        blockDone++;
      }
    }

    blocks.push({
      blockIndex: b + 1,
      label: `Days ${startDay}–${endDay}`,
      startDay,
      endDay,
      completedDays: blockDone,
      totalDays: 10,
      percentage: Math.round((blockDone / 10) * 100),
    });
  }

  const plannerDaysPercentage = Math.round((completedPlannerDays / TOTAL_PLANNER_DAYS) * 100);

  // Selected day tasks
  const selectedDayTodos = todos.filter((t) => (t.day || 1) === selectedPlanDay);
  const totalSelectedDayTasks = selectedDayTodos.length;
  const completedSelectedDayTasks = selectedDayTodos.filter((t) => t.done).length;
  const selectedDayPercentage =
    totalSelectedDayTasks > 0
      ? Math.round((completedSelectedDayTasks / totalSelectedDayTasks) * 100)
      : completedDays[selectedPlanDay]
        ? 100
        : 0;

  // Total daily tasks across the 60-day planner:
  // Each of the 60 days has 3 standard daily tasks (Lecture, Practice, Revision) = 180 total daily tasks
  // unless custom tasks exist on a day. We compute exact completed daily tasks out of the 60-day task pool.
  let completedAllDailyTasks = 0;
  let totalAllDailyTasks = 0;

  for (let d = 1; d <= TOTAL_PLANNER_DAYS; d++) {
    const dayTodos = todos.filter((t) => (t.day || 1) === d);
    if (dayTodos.length > 0) {
      totalAllDailyTasks += dayTodos.length;
      if (completedDays[d]) {
        completedAllDailyTasks += dayTodos.length;
      } else {
        completedAllDailyTasks += dayTodos.filter((t) => t.done).length;
      }
    } else {
      // Standard 3 daily tasks per planner day
      totalAllDailyTasks += 3;
      if (completedDays[d]) {
        completedAllDailyTasks += 3;
      }
    }
  }

  const dailyTasksPercentage =
    totalAllDailyTasks > 0 ? Math.round((completedAllDailyTasks / totalAllDailyTasks) * 100) : 0;

  const completedLecturesCount = Object.values(completedLectures).filter(Boolean).length;

  return {
    overallPercentage: dailyTasksPercentage,
    completedPlannerDays,
    totalPlannerDays: TOTAL_PLANNER_DAYS,
    plannerDaysPercentage,
    completedSelectedDayTasks,
    totalSelectedDayTasks,
    selectedDayPercentage,
    completedAllDailyTasks,
    totalAllDailyTasks,
    dailyTasksPercentage,
    completedLecturesCount,
    totalLecturesCount: totalLectures,
    blocks,
  };
}

/**
 * Extracts the day number (1..60) from a mock test label such as "Day 10 — Test + Analysis".
 */
export function extractDayFromMockLabel(label: string, fallbackIndex: number): number {
  const match = label.match(/Day\s+(\d+)/i);
  if (match) {
    const parsed = parseInt(match[1], 10);
    if (!Number.isNaN(parsed) && parsed >= 1 && parsed <= 60) {
      return parsed;
    }
  }
  return Math.min(60, Math.max(1, (fallbackIndex + 1) * 10));
}

/**
 * Builds the 60-day mock test score progression series for the Recharts LineChart.
 * Always anchors the 6 milestone test days (Day 10, 20, 30, 40, 50, 60) and merges any
 * logged user mock tests in chronological day order so trends over the 60 days are clear.
 */
export function buildMockTrendData(
  mocks: MockScoreItem[],
  expectedScore = 185
): MockChartPoint[] {
  const milestoneDays = [10, 20, 30, 40, 50, 60];
  // Progressive target curve across the 60 days (from 150 on Day 10 up to max ~240 on Day 60)
  const defaultTargets: Record<number, number> = {
    10: 150,
    20: 170,
    30: 190,
    40: 210,
    50: 225,
    60: 240,
  };

  const byDay = new Map<number, MockChartPoint>();

  for (const d of milestoneDays) {
    byDay.set(d, {
      id: `day-${d}`,
      day: d,
      dayLabel: `Day ${d}`,
      testName: d === 60 ? 'Day 60 — Final Mock + Analysis' : `Day ${d} — Test + Analysis`,
      date: 'Scheduled',
      total: null,
      phy: null,
      chem: null,
      math: null,
      target: Math.max(defaultTargets[d] || 180, Math.min(272, expectedScore || defaultTargets[d])),
      hasAttempt: false,
    });
  }

  const customPoints: MockChartPoint[] = [];

  mocks.forEach((m, idx) => {
    const phy = Math.min(100, Math.max(0, Number(m.phy) || 0));
    const chem = Math.min(100, Math.max(0, Number(m.chem) || 0));
    const math = Math.min(100, Math.max(0, Number(m.math) || 0));
    const total = phy + chem + math;
    const day = extractDayFromMockLabel(m.label || '', idx);

    if (byDay.has(day) && !byDay.get(day)!.hasAttempt) {
      const existing = byDay.get(day)!;
      byDay.set(day, {
        ...existing,
        id: String(m.id || `mock-${idx}`),
        testName: m.label || existing.testName,
        date: m.date || 'Logged',
        total,
        phy,
        chem,
        math,
        hasAttempt: true,
        notes: m.notes,
      });
    } else {
      // Custom mock or multiple mocks on the same milestone day
      customPoints.push({
        id: String(m.id || `custom-${idx}`),
        day,
        dayLabel: m.label.startsWith('Day ') ? `Day ${day} (#${idx + 1})` : `Mock ${idx + 1} (D${day})`,
        testName: m.label || `Custom Mock #${idx + 1}`,
        date: m.date || 'Logged',
        total,
        phy,
        chem,
        math,
        target: defaultTargets[day] || Math.min(272, expectedScore || 200),
        hasAttempt: true,
        notes: m.notes,
      });
    }
  });

  const combined = [...Array.from(byDay.values()), ...customPoints];
  combined.sort((a, b) => a.day - b.day || a.id.localeCompare(b.id));
  return combined;
}
