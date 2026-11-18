import React from 'react';
import { PlannerProgressMetrics } from '../utils/plannerMetrics';

interface PlannerProgressBarProps {
  metrics: PlannerProgressMetrics;
  selectedPlanDay: number;
  isCurrentDayMarkedDone: boolean;
  onToggleCurrentDay: () => void;
  onOpenPlannerTab: () => void;
  onSelectBlock: (blockRange: string) => void;
}

export const PlannerProgressBar: React.FC<PlannerProgressBarProps> = ({
  metrics,
  selectedPlanDay,
  isCurrentDayMarkedDone,
  onToggleCurrentDay,
  onOpenPlannerTab,
  onSelectBlock,
}) => {
  const {
    overallPercentage,
    completedPlannerDays,
    totalPlannerDays,
    plannerDaysPercentage,
    completedSelectedDayTasks,
    totalSelectedDayTasks,
    selectedDayPercentage,
    completedAllDailyTasks,
    totalAllDailyTasks,
    completedLecturesCount,
    totalLecturesCount,
    blocks,
  } = metrics;

  return (
    <section
      aria-label="60-Day JEE Main Planner Progress"
      data-testid="planner-progress-banner"
      className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3.5"
    >
      {/* Top Row: Title, Primary Completion Percentage, and Quick Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <span className="font-semibold text-indigo-600 dark:text-indigo-400">
              60-Day JEE Main 2027 Master Progress
            </span>
            <span aria-hidden="true">·</span>
            <span className="tabular-nums">
              {completedAllDailyTasks} of {totalAllDailyTasks} Daily Tasks Completed
            </span>
            <span aria-hidden="true">·</span>
            <span className="tabular-nums">
              {completedPlannerDays} of {totalPlannerDays} Planner Days Done ({plannerDaysPercentage}%)
            </span>
          </div>
          <div className="flex items-baseline gap-3">
            <h2 className="text-lg sm:text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Overall Daily Task Completion
            </h2>
            <span
              data-testid="overall-planner-pct"
              className="text-2xl sm:text-3xl font-extrabold tabular-nums text-indigo-600 dark:text-indigo-400"
            >
              {overallPercentage}%
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onToggleCurrentDay}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap shrink-0 cursor-pointer ${
              isCurrentDayMarkedDone
                ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            {isCurrentDayMarkedDone
              ? `Day ${String(selectedPlanDay).padStart(2, '0')} Completed`
              : `Mark Day ${String(selectedPlanDay).padStart(2, '0')} Complete`}
          </button>
          <button
            type="button"
            onClick={onOpenPlannerTab}
            className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition whitespace-nowrap shrink-0 cursor-pointer"
          >
            Open 60-Day Schedule
          </button>
        </div>
      </div>

      {/* Main Dual-Layer Progress Bar */}
      <div className="space-y-1.5">
        <div
          role="progressbar"
          aria-label="Overall 60-Day Daily Tasks Completion"
          aria-valuenow={overallPercentage}
          aria-valuemin={0}
          aria-valuemax={100}
          className="w-full h-3.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5"
        >
          <div
            data-testid="overall-planner-bar-fill"
            className="h-full rounded-full bg-gradient-to-r from-indigo-600 via-violet-600 to-emerald-500 transition-all duration-300"
            style={{ width: `${Math.max(overallPercentage > 0 ? 2 : 0, overallPercentage)}%` }}
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400 tabular-nums">
          <div>
            Active Day {String(selectedPlanDay).padStart(2, '0')} To-Do:{' '}
            <strong className="text-slate-800 dark:text-slate-200">
              {completedSelectedDayTasks}/{totalSelectedDayTasks} tasks ({selectedDayPercentage}%)
            </strong>
          </div>
          <div>
            Manzil Lectures Watched:{' '}
            <strong className="text-slate-800 dark:text-slate-200">
              {completedLecturesCount}/{totalLecturesCount} ({Math.round((completedLecturesCount / totalLecturesCount) * 100)}%)
            </strong>
          </div>
        </div>
      </div>

      {/* 6x 10-Day Block Milestone Segments */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 pt-1">
        {blocks.map((block) => {
          const rangeKey = `${block.startDay}-${block.endDay}`;
          return (
            <button
              key={rangeKey}
              type="button"
              onClick={() => onSelectBlock(rangeKey)}
              aria-label={`Inspect ${block.label}: ${block.completedDays} of ${block.totalDays} days completed`}
              className="text-left p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-800 transition cursor-pointer"
            >
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-600 dark:text-slate-300 tabular-nums">
                <span>{block.label}</span>
                <span
                  className={
                    block.percentage === 100
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-indigo-600 dark:text-indigo-400'
                  }
                >
                  {block.completedDays}/10d
                </span>
              </div>
              <div className="mt-1.5 w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    block.percentage === 100 ? 'bg-emerald-500' : 'bg-indigo-600 dark:bg-indigo-400'
                  }`}
                  style={{ width: `${block.percentage}%` }}
                />
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
};
