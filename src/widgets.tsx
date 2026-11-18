import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { PlannerProgressBar } from './components/PlannerProgressBar';
import { MockScoreLineChart } from './components/MockScoreLineChart';
import {
  calculatePlannerProgress,
  MockScoreItem,
  TodoItem,
} from './utils/plannerMetrics';

interface PrepskmBridgeState {
  completedDays: Record<number, boolean>;
  completedLectures: Record<number, boolean>;
  todos: TodoItem[];
  mocks: MockScoreItem[];
  selectedPlanDay: number;
  darkMode: boolean;
}

interface PrepskmBridgeAPI {
  getState: () => PrepskmBridgeState;
  getApproxScore: () => { total: number; phy: number; chem: number; math: number };
  getActiveTab: () => string;
  toggleDayComplete: (day: number) => void;
  openPlannerBlock: (blockRange: string) => void;
  switchTab: (tab: string) => void;
  loadSampleMocks: () => void;
}

declare global {
  interface Window {
    __PREPSKM_API__?: PrepskmBridgeAPI;
  }
}

function usePrepskmBridge() {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const handler = () => setTick((t) => t + 1);
    window.addEventListener('prepskm:state-change', handler);
    return () => window.removeEventListener('prepskm:state-change', handler);
  }, []);

  const api = window.__PREPSKM_API__;
  const state: PrepskmBridgeState = api?.getState() || {
    completedDays: {},
    completedLectures: {},
    todos: [],
    mocks: [],
    selectedPlanDay: 1,
    darkMode: false,
  };
  const approx = api?.getApproxScore() || { total: 0, phy: 0, chem: 0, math: 0 };
  const activeTab = api?.getActiveTab() || 'todo';

  return { state, approx, activeTab, api, tick };
}

const TopProgressWidget: React.FC = () => {
  const { state, api } = usePrepskmBridge();
  const selectedPlanDay = state.selectedPlanDay || 1;

  const metrics = calculatePlannerProgress({
    completedDays: state.completedDays || {},
    todos: state.todos || [],
    selectedPlanDay,
    completedLectures: state.completedLectures || {},
    totalLectures: 78,
  });

  const dayTodos = (state.todos || []).filter((t) => (t.day || 1) === selectedPlanDay);
  const allDayTodosDone = dayTodos.length > 0 && dayTodos.every((t) => t.done);
  const isCurrentDayMarkedDone = !!(state.completedDays?.[selectedPlanDay] || allDayTodosDone);

  return (
    <PlannerProgressBar
      metrics={metrics}
      selectedPlanDay={selectedPlanDay}
      isCurrentDayMarkedDone={isCurrentDayMarkedDone}
      onToggleCurrentDay={() => api?.toggleDayComplete(selectedPlanDay)}
      onOpenPlannerTab={() => api?.switchTab('planner')}
      onSelectBlock={(blockRange) => api?.openPlannerBlock(blockRange)}
    />
  );
};

const MockChartWidget: React.FC = () => {
  const { state, approx, activeTab, api } = usePrepskmBridge();

  return (
    <MockScoreLineChart
      key={`mock-chart-${activeTab}`}
      mocks={state.mocks || []}
      expectedScore={approx.total || 180}
      darkMode={!!state.darkMode}
      onLoadSampleTrend={() => api?.loadSampleMocks()}
    />
  );
};

function mountWidgets() {
  const progressEl = document.getElementById('planner-progress-root');
  if (progressEl) {
    createRoot(progressEl).render(<TopProgressWidget />);
  }

  const mockChartEl = document.getElementById('recharts-mock-root');
  if (mockChartEl) {
    createRoot(mockChartEl).render(<MockChartWidget />);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', mountWidgets);
} else {
  mountWidgets();
}
