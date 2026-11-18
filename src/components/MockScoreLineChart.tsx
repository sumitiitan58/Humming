import React, { useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from 'recharts';
import { MockScoreItem, buildMockTrendData } from '../utils/plannerMetrics';

interface MockScoreLineChartProps {
  mocks: MockScoreItem[];
  expectedScore: number;
  darkMode: boolean;
  onLoadSampleTrend: () => void;
}

type ViewMode = 'all' | 'total' | 'subjects';

export const MockScoreLineChart: React.FC<MockScoreLineChartProps> = ({
  mocks,
  expectedScore,
  darkMode,
  onLoadSampleTrend,
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>('all');

  const data = buildMockTrendData(mocks, expectedScore);
  const attemptedMocks = data.filter((d) => d.hasAttempt && d.total !== null);

  const latestTotal =
    attemptedMocks.length > 0 ? (attemptedMocks[attemptedMocks.length - 1].total ?? 0) : null;
  const firstTotal = attemptedMocks.length > 0 ? (attemptedMocks[0].total ?? 0) : null;
  const bestTotal =
    attemptedMocks.length > 0
      ? Math.max(...attemptedMocks.map((d) => d.total ?? 0))
      : null;
  const avgTotal =
    attemptedMocks.length > 0
      ? Math.round(
          attemptedMocks.reduce((acc, d) => acc + (d.total ?? 0), 0) / attemptedMocks.length
        )
      : null;
  const scoreDelta =
    attemptedMocks.length >= 2 && latestTotal !== null && firstTotal !== null
      ? latestTotal - firstTotal
      : null;

  const axisColor = darkMode ? '#94a3b8' : '#475569';
  const gridColor = darkMode ? '#1e293b' : '#e2e8f0';
  const tooltipBg = darkMode ? '#0f172a' : '#ffffff';
  const tooltipBorder = darkMode ? '#334155' : '#cbd5e1';

  return (
    <div className="space-y-4" data-testid="recharts-mock-container">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">
            60-Day Mock Test Score Progression (Recharts)
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Tracks Total Score (/300) and Subject Split (/100) across the Day 10–60 assessment milestones.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
            <button
              type="button"
              onClick={() => setViewMode('all')}
              className={`px-2.5 py-1 text-xs font-bold rounded-md transition whitespace-nowrap cursor-pointer ${
                viewMode === 'all'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
              }`}
            >
              All Lines
            </button>
            <button
              type="button"
              onClick={() => setViewMode('total')}
              className={`px-2.5 py-1 text-xs font-bold rounded-md transition whitespace-nowrap cursor-pointer ${
                viewMode === 'total'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
              }`}
            >
              Total (/300)
            </button>
            <button
              type="button"
              onClick={() => setViewMode('subjects')}
              className={`px-2.5 py-1 text-xs font-bold rounded-md transition whitespace-nowrap cursor-pointer ${
                viewMode === 'subjects'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
              }`}
            >
              Subject Split (/100)
            </button>
          </div>

          {mocks.length === 0 && (
            <button
              type="button"
              onClick={onLoadSampleTrend}
              className="px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/70 text-indigo-700 dark:text-indigo-300 text-xs font-bold transition whitespace-nowrap cursor-pointer"
            >
              Load Sample 60-Day Trend
            </button>
          )}
        </div>
      </div>

      {/* Trend Summary Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs tabular-nums">
        <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800">
          <div className="text-slate-500 dark:text-slate-400 font-medium">Tests Logged</div>
          <div className="mt-0.5 text-base font-extrabold text-slate-900 dark:text-white">
            {attemptedMocks.length} / 6 Milestones
          </div>
        </div>
        <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800">
          <div className="text-slate-500 dark:text-slate-400 font-medium">Latest Score</div>
          <div className="mt-0.5 text-base font-extrabold text-indigo-600 dark:text-indigo-400">
            {latestTotal !== null ? `${latestTotal} / 300` : 'No attempts yet'}
          </div>
        </div>
        <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800">
          <div className="text-slate-500 dark:text-slate-400 font-medium">Best / Average</div>
          <div className="mt-0.5 text-base font-extrabold text-slate-900 dark:text-white">
            {bestTotal !== null ? `${bestTotal} max · ${avgTotal} avg` : '--'}
          </div>
        </div>
        <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800">
          <div className="text-slate-500 dark:text-slate-400 font-medium">60-Day Net Trend</div>
          <div
            className={`mt-0.5 text-base font-extrabold ${
              scoreDelta === null
                ? 'text-slate-500'
                : scoreDelta >= 0
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-red-600 dark:text-red-400'
            }`}
          >
            {scoreDelta === null
              ? 'Log 2+ mocks'
              : `${scoreDelta >= 0 ? '+' : ''}${scoreDelta} marks`}
          </div>
        </div>
      </div>

      {/* Recharts LineChart Viewport */}
      <div className="h-64 sm:h-72 w-full min-w-[280px] min-h-[220px]">
        <ResponsiveContainer width="100%" height="100%" minWidth={280} minHeight={220}>
          <LineChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
            <XAxis
              dataKey="dayLabel"
              tick={{ fill: axisColor, fontSize: 12, fontWeight: 600 }}
              stroke={gridColor}
            />
            <YAxis
              domain={[0, viewMode === 'subjects' ? 100 : 300]}
              tick={{ fill: axisColor, fontSize: 12 }}
              stroke={gridColor}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: tooltipBg,
                borderColor: tooltipBorder,
                borderRadius: '12px',
                fontSize: '12px',
                color: darkMode ? '#f8fafc' : '#0f172a',
              }}
              formatter={(value: unknown, name: unknown) => {
                if (value === null || value === undefined) return ['Not attempted yet', String(name)];
                return [`${value} marks`, String(name)];
              }}
              labelFormatter={(label, payload) => {
                const point = payload && payload[0] && payload[0].payload;
                if (point) {
                  return `${point.testName} (${point.date})`;
                }
                return String(label);
              }}
            />
            <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '6px' }} />

            {viewMode !== 'subjects' && expectedScore > 0 && (
              <ReferenceLine
                y={expectedScore}
                stroke="#f59e0b"
                strokeDasharray="4 4"
                label={{
                  value: `Expected ~${expectedScore}`,
                  position: 'insideTopRight',
                  fill: '#f59e0b',
                  fontSize: 11,
                }}
              />
            )}

            {viewMode !== 'subjects' && (
              <>
                <Line
                  type="monotone"
                  dataKey="total"
                  name="Total Score (/300)"
                  stroke="#4f46e5"
                  strokeWidth={3}
                  dot={{ r: 5, strokeWidth: 2, fill: '#4f46e5' }}
                  activeDot={{ r: 7 }}
                  connectNulls
                />
                <Line
                  type="monotone"
                  dataKey="target"
                  name="60-Day Target Curve"
                  stroke="#94a3b8"
                  strokeWidth={1.5}
                  strokeDasharray="5 5"
                  dot={{ r: 3, fill: '#94a3b8' }}
                  connectNulls
                />
              </>
            )}

            {viewMode !== 'total' && (
              <>
                <Line
                  type="monotone"
                  dataKey="phy"
                  name="Physics (/100)"
                  stroke="#dc2626"
                  strokeWidth={2}
                  dot={{ r: 4, fill: '#dc2626' }}
                  connectNulls
                />
                <Line
                  type="monotone"
                  dataKey="chem"
                  name="Chemistry (/100)"
                  stroke="#059669"
                  strokeWidth={2}
                  dot={{ r: 4, fill: '#059669' }}
                  connectNulls
                />
                <Line
                  type="monotone"
                  dataKey="math"
                  name="Mathematics (/100)"
                  stroke="#2563eb"
                  strokeWidth={2}
                  dot={{ r: 4, fill: '#2563eb' }}
                  connectNulls
                />
              </>
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
