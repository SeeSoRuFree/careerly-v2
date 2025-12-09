'use client';

import * as React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Filler
);

export interface WeeklyStat {
  date: string;
  count: number;
  companies: number;
}

export interface AIStats {
  aiCore: number;    // AI 핵심 직무
  aiEnabled: number; // AI 활용 직무
  traditional: number; // 전통 직무
}

export interface DailySummaryCardProps {
  date: string;
  summary: string;
  totalJobs: number;
  totalCompanies: number;
  weeklyStats?: WeeklyStat[];
  selectedDate?: string;
  onDateClick?: (date: string) => void;
  aiStats?: AIStats;
  // 범용화를 위한 추가 props
  title?: string;           // 헤더 타이틀 (기본: "최근 1주일간의 채용공고 현황")
  unitLabel?: string;       // 단위 레이블 (기본: "건 수집")
  sourceLabel?: string;     // 출처 레이블 (기본: "개 기업")
  chartColor?: 'teal' | 'purple' | 'amber';  // 차트 색상 (기본: teal)
}

function formatDayLabel(dateString: string): string {
  const date = new Date(dateString);
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  return days[date.getDay()];
}

export function DailySummaryCard({
  summary,
  totalJobs,
  totalCompanies,
  weeklyStats,
  selectedDate,
  onDateClick,
  aiStats,
  title = '최근 1주일간의 채용공고 현황',
  unitLabel = '건 수집',
  sourceLabel = '개 기업',
  chartColor = 'teal',
}: DailySummaryCardProps) {
  // 색상 설정
  const colorConfig = {
    teal: {
      bg: 'rgba(13, 148, 136, 0.1)',
      border: '#0d9488',
      point: '#0d9488',
      pointSelected: '#0f766e',
      text: 'text-teal-600',
    },
    purple: {
      bg: 'rgba(147, 51, 234, 0.1)',
      border: '#9333ea',
      point: '#9333ea',
      pointSelected: '#7e22ce',
      text: 'text-purple-600',
    },
    amber: {
      bg: 'rgba(245, 158, 11, 0.1)',
      border: '#f59e0b',
      point: '#f59e0b',
      pointSelected: '#d97706',
      text: 'text-amber-600',
    },
  };
  const colors = colorConfig[chartColor];
  // Calculate trend
  const trend = React.useMemo(() => {
    if (!weeklyStats || weeklyStats.length < 2) return null;
    const today = weeklyStats[weeklyStats.length - 1];
    const yesterday = weeklyStats[weeklyStats.length - 2];
    const diff = today.count - yesterday.count;
    const percent = Math.round((diff / yesterday.count) * 100);
    return { diff, percent, isUp: diff >= 0 };
  }, [weeklyStats]);

  // Chart.js data
  const chartData = React.useMemo(() => {
    if (!weeklyStats) return null;
    return {
      labels: weeklyStats.map(d => formatDayLabel(d.date)),
      datasets: [{
        data: weeklyStats.map(d => d.count),
        fill: true,
        backgroundColor: colors.bg,
        borderColor: colors.border,
        borderWidth: 2,
        pointBackgroundColor: weeklyStats.map(d =>
          d.date === selectedDate ? colors.pointSelected : colors.point
        ),
        pointBorderColor: weeklyStats.map(d =>
          d.date === selectedDate ? '#fff' : colors.point
        ),
        pointBorderWidth: weeklyStats.map(d =>
          d.date === selectedDate ? 2 : 0
        ),
        pointRadius: weeklyStats.map(d =>
          d.date === selectedDate ? 6 : 4
        ),
        pointHoverRadius: 8,
        tension: 0.4,
      }],
    };
  }, [weeklyStats, selectedDate, colors]);

  // Handle chart click
  const handleChartClick = React.useCallback((event: any, elements: any[]) => {
    if (!weeklyStats || !onDateClick || elements.length === 0) return;
    const index = elements[0].index;
    const clickedDate = weeklyStats[index].date;
    onDateClick(clickedDate);
  }, [weeklyStats, onDateClick]);

  // Chart.js options
  const chartOptions = React.useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    onClick: handleChartClick,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: true,
        backgroundColor: '#1e293b',
        titleColor: '#fff',
        bodyColor: '#fff',
        padding: 10,
        cornerRadius: 8,
        displayColors: false,
        callbacks: {
          title: (items: any) => {
            if (!weeklyStats || !items[0]) return '';
            const index = items[0].dataIndex;
            const stat = weeklyStats[index];
            const date = new Date(stat.date);
            return `${date.getMonth() + 1}/${date.getDate()} (${formatDayLabel(stat.date)})`;
          },
          label: (item: any) => {
            if (!weeklyStats) return '';
            const stat = weeklyStats[item.dataIndex];
            return `${stat.count}건 · ${stat.companies}개 기업`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#94a3b8',
          font: {
            size: 11,
          },
        },
        border: {
          display: false,
        },
      },
      y: {
        display: false,
        beginAtZero: false,
        min: weeklyStats ? Math.min(...weeklyStats.map(d => d.count)) * 0.8 : 0,
      },
    },
    interaction: {
      intersect: false,
      mode: 'index' as const,
    },
    onHover: (event: any, elements: any[]) => {
      const canvas = event.native?.target;
      if (canvas) {
        canvas.style.cursor = elements.length > 0 ? 'pointer' : 'default';
      }
    },
  }), [weeklyStats, handleChartClick]);

  return (
    <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
      {/* Chart Header */}
      <div className="px-5 py-4 border-b border-slate-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className={`w-4 h-4 ${colors.text}`} />
            <span className="text-sm font-semibold text-slate-900">{title}</span>
          </div>
          {trend && (
            <div className={`flex items-center gap-1 text-xs font-medium ${trend.isUp ? 'text-teal-600' : 'text-red-500'}`}>
              {trend.isUp ? (
                <TrendingUp className="w-3 h-3" />
              ) : (
                <TrendingDown className="w-3 h-3" />
              )}
              <span>전일 대비 {trend.isUp ? '+' : ''}{trend.percent}%</span>
            </div>
          )}
        </div>
      </div>

      {/* Chart Area */}
      {chartData && (
        <div className="px-5 py-4">
          <div className="h-28">
            <Line data={chartData} options={chartOptions} />
          </div>
        </div>
      )}

      {/* Today's Stats Bar */}
      <div className="px-5 py-3 bg-slate-50 border-t border-slate-100">
        <div className="flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{totalJobs}</span>
            <span className="text-sm text-slate-600">{unitLabel}</span>
            <span className="text-slate-300 mx-1">·</span>
            <span className="text-sm text-slate-500">{totalCompanies}{sourceLabel}</span>
          </div>
          {/* AI Stats */}
          {aiStats && (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="text-sm">🤖</span>
                <span className="text-sm font-medium text-purple-700">{aiStats.aiCore}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm">🔧</span>
                <span className="text-sm font-medium text-teal-700">{aiStats.aiEnabled}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm">📋</span>
                <span className="text-sm font-medium text-slate-600">{aiStats.traditional}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
