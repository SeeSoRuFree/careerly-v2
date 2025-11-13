'use client';

import * as React from 'react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Briefcase } from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Filler,
  ChartOptions,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Filler
);

export interface JobMarketTrend {
  id: string;
  category: string;
  position: string;
  postingCount: number;
  change: number;
  changePercent: number;
  chart?: number[];
}

export interface JobMarketTrendCardProps extends React.HTMLAttributes<HTMLDivElement> {
  trends: JobMarketTrend[];
  title?: string;
}

export const JobMarketTrendCard = React.forwardRef<HTMLDivElement, JobMarketTrendCardProps>(
  (
    {
      trends,
      title = '채용 시장 동향',
      className,
      ...props
    },
    ref
  ) => {
    return (
      <div ref={ref} className={cn(className)} {...props}>
        {/* Header */}
        <div className="flex items-center gap-2 mb-4">
          <Briefcase className="h-5 w-5 text-coral-500" />
          <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
        </div>

        {/* Trends List - One item per row */}
        <div className="space-y-3">
          {trends.map((trend) => {
            const isPositive = trend.change >= 0;
            const changeColor = isPositive ? 'text-emerald-600' : 'text-red-600';
            const bgColor = isPositive ? 'bg-emerald-50' : 'bg-red-50';
            const lineColor = isPositive ? 'rgb(16, 185, 129)' : 'rgb(239, 68, 68)';
            const gradientColor = isPositive ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)';

            // Chart data configuration
            const chartData = {
              labels: trend.chart?.map((_, idx) => `Day ${idx + 1}`) || [],
              datasets: [
                {
                  data: trend.chart || [],
                  borderColor: lineColor,
                  backgroundColor: gradientColor,
                  borderWidth: 2,
                  tension: 0.4,
                  pointRadius: 0,
                  pointHoverRadius: 4,
                  fill: true,
                },
              ],
            };

            // Chart options
            const chartOptions: ChartOptions<'line'> = {
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  display: false,
                },
                tooltip: {
                  enabled: true,
                  mode: 'index',
                  intersect: false,
                  backgroundColor: 'rgba(0, 0, 0, 0.8)',
                  padding: 8,
                  displayColors: false,
                  callbacks: {
                    title: () => '',
                    label: (context) => `${context.parsed.y} 건`,
                  },
                },
              },
              scales: {
                x: {
                  display: false,
                },
                y: {
                  display: false,
                },
              },
              interaction: {
                mode: 'nearest',
                axis: 'x',
                intersect: false,
              },
            };

            return (
              <Card
                key={trend.id}
                className="p-4 hover:border-slate-400 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    {/* Category Badge */}
                    <span className="text-xs text-slate-500 font-medium">
                      {trend.category}
                    </span>

                    {/* Position */}
                    <h4 className="text-sm font-bold text-slate-900 mt-1 line-clamp-1">
                      {trend.position}
                    </h4>
                  </div>

                  {/* Change Badge */}
                  <div className={cn('flex items-center gap-1 text-xs font-bold px-2 py-1 rounded', changeColor, bgColor)}>
                    {isPositive ? (
                      <TrendingUp className="h-3 w-3" />
                    ) : (
                      <TrendingDown className="h-3 w-3" />
                    )}
                    <span>
                      {isPositive ? '+' : ''}
                      {trend.changePercent.toFixed(1)}%
                    </span>
                  </div>
                </div>

                {/* Chart */}
                {trend.chart && trend.chart.length > 0 && (
                  <div className="w-full h-16 mb-3">
                    <Line data={chartData} options={chartOptions} />
                  </div>
                )}

                {/* Posting Count and Change */}
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-2xl font-bold text-slate-900">
                      {trend.postingCount.toLocaleString()}
                    </p>
                    <p className="text-xs text-slate-500">채용공고</p>
                  </div>
                  <div className={cn('flex items-center gap-1 text-sm font-semibold', changeColor)}>
                    <span>
                      {isPositive ? '+' : ''}
                      {trend.change}
                    </span>
                    <span className="text-xs text-slate-500 font-normal">건</span>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Footer Note */}
        <div className="mt-4">
          <p className="text-xs text-slate-500 text-center">
            실시간 채용공고 데이터 (업데이트: 매일 오전 9시)
          </p>
        </div>
      </div>
    );
  }
);

JobMarketTrendCard.displayName = 'JobMarketTrendCard';
