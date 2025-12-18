'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Heart,
  Bookmark,
  Share2,
  Clock,
  Eye,
  TrendingUp,
  TrendingDown,
  Users,
  Briefcase,
  DollarSign,
  Building2,
  Calendar,
  FileText,
  Star,
  MessageSquare,
  BookOpen,
  Award,
  BarChart3,
} from 'lucide-react';
import {
  DiscoverContentDetail,
  JobMetadata,
  BlogMetadata,
  BookMetadata,
  CourseMetadata,
  JobRoleMetadata
} from '@/lib/api/types/discover.types';
import { DiscoverContentCard } from '@/components/ui/discover-content-card';
import { ActionBar } from '@/components/ui/action-bar';
import { MetaRow } from '@/components/ui/meta-row';
import { Badge } from '@/components/ui/badge';
import { Chip } from '@/components/ui/chip';
import { Progress } from '@/components/ui/progress';
import { SearchComposeInput } from '@/components/ui/search-compose-input';
import { cn } from '@/lib/utils';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

// Chart.js 등록
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export interface DiscoverDetailPageProps {
  content: DiscoverContentDetail;
}

// TrendChart Component using Chart.js
interface TrendChartProps {
  data: number[];
  labels?: string[];
  color?: string;
  reverse?: boolean;
  label?: string;
}

const TrendChart: React.FC<TrendChartProps> = ({
  data,
  labels = ['1월', '2월', '3월', '4월', '5월', '6월'],
  color = '#F97316',
  reverse = false,
  label = '추이'
}) => {
  const processedData = reverse ? [...data].reverse() : data;

  const chartData = {
    labels,
    datasets: [
      {
        label,
        data: processedData,
        borderColor: color,
        backgroundColor: `${color}20`,
        fill: true,
        tension: 0.4,
        pointRadius: 3,
        pointHoverRadius: 5,
        pointBackgroundColor: color,
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleFont: {
          size: 14,
          weight: 'bold' as const
        },
        bodyFont: {
          size: 13
        },
        cornerRadius: 8
      }
    },
    scales: {
      x: {
        display: true,
        grid: {
          display: false
        },
        ticks: {
          font: {
            size: 10
          },
          color: '#94a3b8'
        }
      },
      y: {
        display: true,
        grid: {
          color: '#f1f5f9',
          drawBorder: false
        },
        ticks: {
          font: {
            size: 10
          },
          color: '#94a3b8',
          padding: 8
        }
      }
    },
    interaction: {
      mode: 'nearest' as const,
      axis: 'x' as const,
      intersect: false
    }
  };

  return (
    <div className="space-y-2">
      {label && (
        <div className="text-sm font-medium text-slate-700">{label}</div>
      )}
      <div className="h-32">
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
};

// MultiLineTrendChart Component
interface MultiLineTrendChartProps {
  datasets: Array<{
    label: string;
    data: number[];
    color: string;
    originalData?: number[];  // 툴팁에 표시할 실제 데이터
    unit?: string;  // 단위 (예: '건', '만원')
  }>;
  labels?: string[];
  height?: string;
}

const MultiLineTrendChart: React.FC<MultiLineTrendChartProps> = ({
  datasets,
  labels = ['1월', '2월', '3월', '4월', '5월', '6월'],
  height = 'h-40'
}) => {
  const chartData = {
    labels,
    datasets: datasets.map(dataset => ({
      label: dataset.label,
      data: dataset.data,
      borderColor: dataset.color,
      backgroundColor: `${dataset.color}20`,
      fill: true,
      tension: 0.4,
      pointRadius: 4,
      pointHoverRadius: 6,
      pointBackgroundColor: dataset.color,
      pointBorderColor: '#fff',
      pointBorderWidth: 2,
    }))
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top' as const,
        align: 'end' as const,
        labels: {
          usePointStyle: true,
          padding: 15,
          font: {
            size: 12,
            weight: 500
          }
        }
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleFont: {
          size: 14,
          weight: 'bold' as const
        },
        bodyFont: {
          size: 13
        },
        cornerRadius: 8,
        callbacks: {
          label: function(context: any) {
            const datasetIndex = context.datasetIndex;
            const dataIndex = context.dataIndex;
            const dataset = datasets[datasetIndex];

            // originalData가 있으면 실제 값 표시, 없으면 지수 값 표시
            if (dataset.originalData) {
              const originalValue = dataset.originalData[dataIndex];
              const unit = dataset.unit || '';
              return `${dataset.label}: ${originalValue.toLocaleString()}${unit}`;
            } else {
              return `${dataset.label}: ${context.parsed.y.toFixed(1)}`;
            }
          }
        }
      }
    },
    scales: {
      x: {
        display: true,
        grid: {
          display: false
        },
        ticks: {
          font: {
            size: 11
          },
          color: '#64748b'
        }
      },
      y: {
        display: true,
        grid: {
          color: '#f1f5f9',
          drawBorder: false
        },
        ticks: {
          font: {
            size: 11
          },
          color: '#64748b',
          padding: 8
        }
      }
    },
    interaction: {
      mode: 'nearest' as const,
      axis: 'x' as const,
      intersect: false
    }
  };

  return (
    <div className={height}>
      <Line data={chartData} options={options} />
    </div>
  );
};

function MetadataCard({
  title,
  children,
  className
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("rounded-xl p-4", className)}>
      <h2 className="text-xl font-bold text-slate-900 mb-4">{title}</h2>
      {children}
    </div>
  );
}

function MetadataItem({
  icon,
  label,
  value,
  className
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center gap-2 text-sm text-slate-600">
        {icon}
        <span>{label}</span>
      </div>
      <div className="text-slate-900">{value}</div>
    </div>
  );
}

// HiringTrendComparisonSection Component
interface HiringTrendComparisonProps {
  companyTrend: number[];     // 회사의 채용 추이
  marketTrend: number[];      // 시장 전체 채용 수요
}

// 데이터를 지수화 (첫 값을 100으로 정규화)
const normalizeToIndex = (data: number[]): number[] => {
  const baseline = data[0];
  return data.map(value => (value / baseline) * 100);
};

const HiringTrendComparisonSection: React.FC<HiringTrendComparisonProps> = ({
  companyTrend,
  marketTrend
}) => {
  // 두 데이터셋을 지수로 변환 (첫 달을 100으로)
  const companyIndex = normalizeToIndex(companyTrend);
  const marketIndex = normalizeToIndex(marketTrend);

  // 증가율 계산
  const companyGrowth = (((companyTrend[companyTrend.length - 1] - companyTrend[0]) / companyTrend[0]) * 100).toFixed(1);
  const marketGrowth = (((marketTrend[marketTrend.length - 1] - marketTrend[0]) / marketTrend[0]) * 100).toFixed(1);

  // 인사이트 텍스트 생성
  const comparisonText = Number(companyGrowth) > Number(marketGrowth)
    ? `이 회사의 채용 증가율(+${companyGrowth}%)이 시장 평균(+${marketGrowth}%)보다 ${(Number(companyGrowth) - Number(marketGrowth)).toFixed(1)}%p 높아 적극적으로 인재를 영입하고 있습니다.`
    : `이 회사의 채용 증가율(+${companyGrowth}%)은 시장 평균(+${marketGrowth}%)과 비슷한 수준으로, 안정적인 채용 기조를 유지하고 있습니다.`;

  return (
    <MetadataCard title="채용 추이 비교">
      <div className="space-y-4">
        {/* 요약 인사이트 */}
        <div className="p-3 bg-slate-50 rounded-lg">
          <p className="text-sm text-slate-700 leading-relaxed">
            {comparisonText}
          </p>
        </div>

        <div className="text-xs text-slate-500">
          * 첫 달을 100으로 하여 상대적 증가율을 비교합니다
        </div>

        <MultiLineTrendChart
          datasets={[
            {
              label: '이 회사 채용',
              data: companyIndex,
              originalData: companyTrend,
              unit: '건',
              color: '#F97316'  // coral
            },
            {
              label: '시장 전체 채용',
              data: marketIndex,
              originalData: marketTrend,
              unit: '건',
              color: '#10B981'  // emerald
            }
          ]}
          height="h-48"
        />

        {/* 인사이트 */}
        <div className="grid grid-cols-2 gap-4 pt-2">
          <div className="flex flex-col items-center p-3 bg-orange-50 rounded-lg">
            <div className="text-xs text-slate-600 mb-1">회사 채용 증가율</div>
            <div className="text-2xl font-bold text-coral-600">
              +{companyGrowth}%
            </div>
          </div>
          <div className="flex flex-col items-center p-3 bg-emerald-50 rounded-lg">
            <div className="text-xs text-slate-600 mb-1">시장 수요 증가율</div>
            <div className="text-2xl font-bold text-emerald-600">
              +{marketGrowth}%
            </div>
          </div>
        </div>
      </div>
    </MetadataCard>
  );
};

// 직무 프로필 컴포넌트
function JobRoleProfile({ metadata }: { metadata: JobRoleMetadata }) {
  const demandColor = metadata.marketDemand >= 80 ? 'text-emerald-600' : metadata.marketDemand >= 60 ? 'text-blue-600' : 'text-slate-600';
  const competitionColor = metadata.competitionLevel === 'high' ? 'text-red-600' : metadata.competitionLevel === 'medium' ? 'text-amber-600' : 'text-emerald-600';
  const competitionText = metadata.competitionLevel === 'high' ? '높음' : metadata.competitionLevel === 'medium' ? '보통' : '낮음';

  // 직무명에서 약자 추출 (프론트엔드 -> FE, 백엔드 -> BE 등)
  const getJobAbbreviation = (roleName: string) => {
    if (roleName.includes('프론트엔드')) return 'FE';
    if (roleName.includes('백엔드')) return 'BE';
    if (roleName.includes('풀스택')) return 'FS';
    if (roleName.includes('데이터')) return 'DA';
    if (roleName.includes('디자인')) return 'UX';
    return roleName.substring(0, 2).toUpperCase();
  };

  return (
    <div className="flex items-center gap-4 p-4 bg-white rounded-xl border border-slate-200">
      {/* 직무 아이콘 */}
      <div className="w-16 h-16 rounded-lg bg-coral-50 border border-coral-200 flex items-center justify-center flex-shrink-0">
        <span className="text-2xl font-bold text-coral-600">
          {getJobAbbreviation(metadata.roleName)}
        </span>
      </div>

      {/* 직무 정보 */}
      <div className="flex-1 min-w-0">
        <h3 className="text-lg font-bold text-slate-900 truncate">
          {metadata.roleName}
        </h3>
        <div className="flex flex-wrap items-center gap-3 mt-1 text-sm">
          <div className="flex items-center gap-1">
            <DollarSign className="h-3.5 w-3.5 text-slate-600" />
            <span className="text-slate-600">
              평균 {(metadata.salaryRange.average / 10000).toFixed(0)}만원
            </span>
          </div>
          <span className="text-slate-300">•</span>
          <div className="flex items-center gap-1">
            <TrendingUp className="h-3.5 w-3.5 text-slate-600" />
            <span className={demandColor}>
              수요 {metadata.marketDemand}점
            </span>
          </div>
          <span className="text-slate-300">•</span>
          <div className="flex items-center gap-1">
            <Users className="h-3.5 w-3.5 text-slate-600" />
            <span className={competitionColor}>
              경쟁도 {competitionText}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// 회사 프로필 컴포넌트
function CompanyProfile({ metadata }: { metadata: JobMetadata }) {
  return (
    <div className="flex items-center gap-4 p-4 bg-white rounded-xl border border-slate-200">
      {/* 회사 로고 */}
      <div className="w-16 h-16 rounded-lg bg-slate-100 flex items-center justify-center overflow-hidden flex-shrink-0">
        {metadata.companyLogo ? (
          <img src={metadata.companyLogo} alt={metadata.companyName} className="w-full h-full object-cover" />
        ) : (
          <Building2 className="h-8 w-8 text-slate-400" />
        )}
      </div>

      {/* 회사 정보 */}
      <div className="flex-1 min-w-0">
        <h3 className="text-lg font-bold text-slate-900 truncate">
          {metadata.companyName || '회사명'}
        </h3>
        <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-slate-600">
          <div className="flex items-center gap-1">
            <Briefcase className="h-3.5 w-3.5" />
            <span>{metadata.industry}</span>
          </div>
          {metadata.foundedYear && (
            <>
              <span className="text-slate-300">•</span>
              <div className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                <span>{metadata.foundedYear}년 설립</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function JobMetadataSection({ metadata }: { metadata: JobMetadata }) {
  // 채용 추이 데이터 (최근 6개월)
  const hiringTrendData = [45, 52, 48, 61, 58, 67];
  // 직원 수 추이 데이터 (최근 6개월, 단위: 명)
  const employeeTrendData = [2800, 2900, 3000, 3100, 3200, 3400];

  // 지수화 (첫 달을 100으로)
  const hiringIndex = normalizeToIndex(hiringTrendData);
  const employeeIndex = normalizeToIndex(employeeTrendData);

  // 인사이트 텍스트 생성
  const trendDirection = metadata.hiringTrend && metadata.hiringTrend > 0 ? '증가' : '감소';
  const employeeSatisfaction = metadata.employeeSatisfaction ?? 0;
  const satisfactionLevel = employeeSatisfaction >= 80 ? '매우 높은' : employeeSatisfaction >= 60 ? '양호한' : '보통의';

  const insightText = `${metadata.companySize} 규모의 ${metadata.industry} 기업으로, 현재 ${metadata.openPositions}개의 포지션을 채용 중입니다. 직원 만족도는 ${employeeSatisfaction}%로 ${satisfactionLevel} 수준이며, 최근 ${Math.abs(metadata.hiringTrend || 0)}% ${trendDirection} 추세를 보이고 있습니다.`;

  return (
    <MetadataCard title="회사 정보">
      <div className="space-y-4">
        {/* 회사 프로필 */}
        <CompanyProfile metadata={metadata} />

        {/* 요약 인사이트 */}
        <div className="p-3 bg-slate-50 rounded-lg">
          <p className="text-sm text-slate-700 leading-relaxed">
            {insightText}
          </p>
        </div>

        {/* 채용 추이 & 직원 수 그래프 */}
        <div className="col-span-full">
          <div className="text-xs text-slate-500 mb-2">
            * 첫 달을 100으로 하여 상대적 증감률을 비교합니다
          </div>
          <MultiLineTrendChart
            datasets={[
              {
                label: '월간 채용',
                data: hiringIndex,
                originalData: hiringTrendData,
                unit: '건',
                color: '#F97316'  // coral
              },
              {
                label: '총 직원 수',
                data: employeeIndex,
                originalData: employeeTrendData,
                unit: '명',
                color: '#3B82F6'  // blue
              }
            ]}
            height="h-40"
          />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          <MetadataItem
            icon={<DollarSign className="h-4 w-4" />}
            label="평균 연봉"
            value={<div className="text-3xl font-bold text-emerald-600">{metadata.averageSalary}</div>}
          />
          <MetadataItem
            icon={<Briefcase className="h-4 w-4" />}
            label="채용 중인 포지션"
            value={<div className="text-3xl font-bold text-slate-900">{metadata.openPositions}개</div>}
          />
          <MetadataItem
            icon={<Users className="h-4 w-4" />}
            label="직원 만족도"
            value={
              <div className="space-y-2">
                <div className="text-2xl font-bold text-slate-900">{metadata.employeeSatisfaction}%</div>
                <Progress value={metadata.employeeSatisfaction} className="h-2" />
              </div>
            }
          />
          <MetadataItem
            icon={metadata.hiringTrend && metadata.hiringTrend > 0 ? <TrendingUp className="h-4 w-4 text-emerald-600" /> : <TrendingDown className="h-4 w-4 text-red-600" />}
            label="최근 채용률 추이"
            value={
              <div className={cn(
                "text-2xl font-bold flex items-center gap-2",
                metadata.hiringTrend && metadata.hiringTrend > 0 ? "text-emerald-600" : "text-red-600"
              )}>
                {metadata.hiringTrend && metadata.hiringTrend > 0 ? <TrendingUp className="h-6 w-6" /> : <TrendingDown className="h-6 w-6" />}
                {metadata.hiringTrend && metadata.hiringTrend > 0 ? '+' : ''}{metadata.hiringTrend}%
              </div>
            }
          />
          <MetadataItem
            icon={<Building2 className="h-4 w-4" />}
            label="회사 규모"
            value={<div className="text-lg font-semibold text-slate-700">{metadata.companySize}</div>}
          />
          <MetadataItem
            icon={<Briefcase className="h-4 w-4" />}
            label="업종"
            value={<div className="text-lg font-semibold text-slate-700">{metadata.industry}</div>}
          />
        </div>
      </div>
    </MetadataCard>
  );
}

function JobRoleMetadataSection({ metadata }: { metadata: JobRoleMetadata }) {
  // 프론트엔드 개발자 평균 연봉 추이 (단위: 만원, 최근 6개월)
  const salaryTrend = [6500, 6600, 6700, 6750, 6800, 6800];

  // 지수화 (첫 달을 100으로)
  const demandIndex = normalizeToIndex(metadata.demandTrend);
  const salaryIndex = normalizeToIndex(salaryTrend);

  // 증가율 계산
  const demandGrowth = (((metadata.demandTrend[metadata.demandTrend.length - 1] - metadata.demandTrend[0]) / metadata.demandTrend[0]) * 100).toFixed(1);
  const salaryGrowth = (((salaryTrend[salaryTrend.length - 1] - salaryTrend[0]) / salaryTrend[0]) * 100).toFixed(1);

  // 인사이트 텍스트 생성
  const demandLevel = metadata.marketDemand >= 80 ? '매우 높은' : metadata.marketDemand >= 60 ? '높은' : '보통의';
  const competitionText = metadata.competitionLevel === 'high' ? '높은' : metadata.competitionLevel === 'medium' ? '보통의' : '낮은';
  const salaryAvg = (metadata.salaryRange.average / 10000).toFixed(0);

  const insightText = `${metadata.roleName}은 현재 시장 수요 ${metadata.marketDemand}점으로 ${demandLevel} 수요를 보이고 있으며, 최근 6개월간 채용 공고는 ${demandGrowth}% 증가한 반면 평균 연봉은 ${salaryGrowth}% 증가에 그쳤습니다. 평균 연봉은 ${salaryAvg}만원이며, 경쟁 강도는 ${competitionText} 편입니다.`;

  return (
    <MetadataCard title={`직무 분석: ${metadata.roleName}`}>
      <div className="space-y-4">
        {/* 직무 프로필 */}
        <JobRoleProfile metadata={metadata} />

        {/* 요약 인사이트 */}
        <div className="p-3 bg-slate-50 rounded-lg">
          <p className="text-sm text-slate-700 leading-relaxed">
            {insightText}
          </p>
        </div>

        {/* 채용 수요 & 연봉 증감률 비교 */}
        <div className="col-span-full">
          <div className="text-xs text-slate-500 mb-2">
            * 첫 달을 100으로 하여 상대적 증감률을 비교합니다
          </div>
          <MultiLineTrendChart
            datasets={[
              {
                label: '채용 공고',
                data: demandIndex,
                originalData: metadata.demandTrend,
                unit: '건',
                color: '#10B981'  // emerald
              },
              {
                label: '평균 연봉',
                data: salaryIndex,
                originalData: salaryTrend,
                unit: '만원',
                color: '#F59E0B'  // amber
              }
            ]}
            height="h-48"
          />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          {/* 시장 수요 */}
          <MetadataItem
            icon={<TrendingUp className="h-4 w-4" />}
            label="시장 수요"
            value={
              <div className="space-y-2">
                <div className="text-3xl font-bold text-emerald-600">{metadata.marketDemand}</div>
                <Progress value={metadata.marketDemand} className="h-2" />
              </div>
            }
          />

          {/* 평균 연봉 */}
          <MetadataItem
            icon={<DollarSign className="h-4 w-4" />}
            label="평균 연봉"
            value={
              <div>
                <div className="text-2xl font-bold text-slate-900">
                  {(metadata.salaryRange.average / 10000).toFixed(0)}만원
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  {(metadata.salaryRange.min / 10000).toFixed(0)}만 ~ {(metadata.salaryRange.max / 10000).toFixed(0)}만
                </div>
              </div>
            }
          />

          {/* 직무 성장률 */}
          <MetadataItem
            icon={<TrendingUp className="h-4 w-4" />}
            label="성장률"
            value={
              <div className="flex items-center gap-2">
                <div className="text-3xl font-bold text-emerald-600">+{metadata.growthRate}%</div>
                <TrendingUp className="h-5 w-5 text-emerald-600" />
              </div>
            }
          />

          {/* 경쟁 강도 */}
          <MetadataItem
            icon={<Users className="h-4 w-4" />}
            label="경쟁 강도"
            value={
              <Badge tone={
                metadata.competitionLevel === 'high' ? 'coral' :
                metadata.competitionLevel === 'medium' ? 'warning' : 'success'
              }>
                {metadata.competitionLevel === 'high' ? '높음' :
                 metadata.competitionLevel === 'medium' ? '보통' : '낮음'}
              </Badge>
            }
          />
        </div>

        {/* 경력 분포 */}
        <div className="space-y-3">
          <div className="text-sm font-medium text-slate-700">경력 요구사항 분포</div>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-600 w-16">신입/주니어</span>
              <Progress value={metadata.experienceDistribution.junior} className="flex-1 h-2" />
              <span className="text-xs text-slate-600 w-8">{metadata.experienceDistribution.junior}%</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-600 w-16">중급</span>
              <Progress value={metadata.experienceDistribution.mid} className="flex-1 h-2" />
              <span className="text-xs text-slate-600 w-8">{metadata.experienceDistribution.mid}%</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-600 w-16">시니어</span>
              <Progress value={metadata.experienceDistribution.senior} className="flex-1 h-2" />
              <span className="text-xs text-slate-600 w-8">{metadata.experienceDistribution.senior}%</span>
            </div>
          </div>
        </div>

        {/* 필요 스킬 */}
        <div className="space-y-3">
          <div className="text-sm font-medium text-slate-700">필요 역량 TOP 6</div>
          <div className="grid grid-cols-2 gap-3">
            {metadata.requiredSkills.map((skill) => (
              <div key={skill.name} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <span className="text-sm font-medium text-slate-700">{skill.name}</span>
                <span className="text-xs font-semibold text-coral-600">{skill.importance}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </MetadataCard>
  );
}

function BlogMetadataSection({ metadata }: { metadata: BlogMetadata }) {
  // 조회수 추이 데이터 (최근 6개월)
  const viewsTrendData = [8500, 9200, 11000, 10800, 12300, 12500];

  // 인사이트 텍스트 생성
  const viewGrowth = (((viewsTrendData[viewsTrendData.length - 1] - viewsTrendData[0]) / viewsTrendData[0]) * 100).toFixed(1);
  const insightText = `총 ${metadata.totalPosts?.toLocaleString()}개의 게시글을 보유한 블로그로, 평균 조회수는 ${metadata.averageViews?.toLocaleString()}회입니다. 최근 6개월간 조회수가 ${viewGrowth}% 증가했으며, ${metadata.postFrequency} 빈도로 새 콘텐츠를 업데이트하고 있습니다. 인기 게시글 순위는 ${metadata.popularityRank}위입니다.`;

  return (
    <MetadataCard title="블로그 정보">
      <div className="space-y-4">
        {/* 요약 인사이트 */}
        <div className="p-3 bg-slate-50 rounded-lg">
          <p className="text-sm text-slate-700 leading-relaxed">
            {insightText}
          </p>
        </div>

        {/* 조회수 추이 그래프 */}
        <div className="col-span-full">
          <TrendChart
            data={viewsTrendData}
            label="평균 조회수"
            color="#F97316"
          />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          <MetadataItem
            icon={<FileText className="h-4 w-4" />}
            label="총 게시글 수"
            value={<div className="text-3xl font-bold text-slate-900">{metadata.totalPosts?.toLocaleString()}개</div>}
          />
          <MetadataItem
            icon={<Eye className="h-4 w-4" />}
            label="평균 조회수"
            value={<div className="text-3xl font-bold text-slate-900">{metadata.averageViews?.toLocaleString()}</div>}
          />
          <MetadataItem
            icon={<Calendar className="h-4 w-4" />}
            label="게시 빈도"
            value={<div className="text-lg font-semibold text-slate-700">{metadata.postFrequency}</div>}
          />
          <MetadataItem
            icon={<Award className="h-4 w-4" />}
            label="인기 게시글 순위"
            value={<div className="text-2xl font-bold text-coral-600">#{metadata.popularityRank}</div>}
          />
          {metadata.techStack && metadata.techStack.length > 0 && (
            <div className="col-span-2 md:col-span-3">
              <div className="flex items-center gap-2 text-sm text-slate-600 mb-3">
                <BarChart3 className="h-4 w-4" />
                <span>기술 스택</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {metadata.techStack.map((tech, idx) => (
                  <Chip key={idx} variant="default" className="bg-slate-100 text-slate-700">
                    {tech}
                  </Chip>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </MetadataCard>
  );
}

function BookMetadataSection({ metadata }: { metadata: BookMetadata }) {
  // 판매 순위 추이 데이터 (최근 6개월, 낮을수록 좋음)
  const salesRankData = [145, 132, 98, 87, 75, 68];

  // 인사이트 텍스트 생성
  const rankImprovement = salesRankData[0] - salesRankData[salesRankData.length - 1];
  const ratingStars = '⭐'.repeat(Math.floor(metadata.rating || 0));
  const insightText = `${metadata.publisher} 출판사에서 ${metadata.publishDate}에 출간한 ${metadata.pages}쪽 분량의 도서입니다. 평균 평점 ${metadata.rating}점(${ratingStars})으로 ${metadata.reviewCount?.toLocaleString()}개의 리뷰를 보유하고 있으며, 최근 6개월간 판매 순위가 ${rankImprovement}계단 상승하며 인기를 얻고 있습니다.`;

  return (
    <MetadataCard title="도서 정보">
      <div className="space-y-4">
        {/* 요약 인사이트 */}
        <div className="p-3 bg-slate-50 rounded-lg">
          <p className="text-sm text-slate-700 leading-relaxed">
            {insightText}
          </p>
        </div>

        {/* 판매 순위 추이 그래프 */}
        <div className="col-span-full">
          <TrendChart
            data={salesRankData}
            label="판매 순위"
            color="#10B981"
            reverse={false}
          />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          {metadata.publisher && (
            <MetadataItem
              icon={<Building2 className="h-4 w-4" />}
              label="출판사"
              value={<div className="text-lg font-semibold text-slate-700">{metadata.publisher}</div>}
            />
          )}
          {metadata.rating && (
            <MetadataItem
              icon={<Star className="h-4 w-4 fill-amber-400 text-amber-400" />}
              label="평점"
              value={
                <div className="flex items-center gap-2">
                  <div className="text-3xl font-bold text-slate-900">{metadata.rating}</div>
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={cn(
                          "h-4 w-4",
                          i < Math.floor(metadata.rating!)
                            ? "fill-amber-400 text-amber-400"
                            : "text-slate-300"
                        )}
                      />
                    ))}
                  </div>
                </div>
              }
            />
          )}
          {metadata.reviewCount && (
            <MetadataItem
              icon={<MessageSquare className="h-4 w-4" />}
              label="리뷰 수"
              value={<div className="text-2xl font-bold text-slate-900">{metadata.reviewCount.toLocaleString()}개</div>}
            />
          )}
          {metadata.pages && (
            <MetadataItem
              icon={<BookOpen className="h-4 w-4" />}
              label="페이지 수"
              value={<div className="text-lg font-semibold text-slate-700">{metadata.pages}쪽</div>}
            />
          )}
          {metadata.publishDate && (
            <MetadataItem
              icon={<Calendar className="h-4 w-4" />}
              label="출판일"
              value={<div className="text-lg font-semibold text-slate-700">{metadata.publishDate}</div>}
            />
          )}
          {metadata.isbn && (
            <MetadataItem
              icon={<FileText className="h-4 w-4" />}
              label="ISBN"
              value={<div className="text-sm font-mono text-slate-600">{metadata.isbn}</div>}
            />
          )}
        </div>
      </div>
    </MetadataCard>
  );
}

function CourseMetadataSection({ metadata }: { metadata: CourseMetadata }) {
  // 수강생 증가 추이 데이터 (최근 6개월 누적)
  const studentsTrendData = [8200, 9450, 10300, 11200, 11900, 12847];

  // 인사이트 텍스트 생성
  const studentGrowth = (((studentsTrendData[studentsTrendData.length - 1] - studentsTrendData[0]) / studentsTrendData[0]) * 100).toFixed(1);
  const ratingStars = '⭐'.repeat(Math.floor(metadata.rating || 0));
  const insightText = `${metadata.duration} 분량의 ${metadata.level} 강의로, 현재 ${metadata.students?.toLocaleString()}명의 수강생이 학습 중입니다. 평균 평점 ${metadata.rating}점(${ratingStars})을 기록하고 있으며, 완강률은 ${metadata.completionRate}%입니다. 최근 6개월간 수강생이 ${studentGrowth}% 증가하며 꾸준한 인기를 얻고 있습니다.`;

  return (
    <MetadataCard title="강의 정보">
      <div className="space-y-4">
        {/* 요약 인사이트 */}
        <div className="p-3 bg-slate-50 rounded-lg">
          <p className="text-sm text-slate-700 leading-relaxed">
            {insightText}
          </p>
        </div>

        {/* 수강생 증가 추이 그래프 */}
        <div className="col-span-full">
          <TrendChart
            data={studentsTrendData}
            label="수강생 수"
            color="#F97316"
          />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          {metadata.students && (
            <MetadataItem
              icon={<Users className="h-4 w-4" />}
              label="수강생 수"
              value={<div className="text-3xl font-bold text-slate-900">{metadata.students.toLocaleString()}명</div>}
            />
          )}
          {metadata.rating && (
            <MetadataItem
              icon={<Star className="h-4 w-4 fill-amber-400 text-amber-400" />}
              label="평균 평점"
              value={
                <div className="flex items-center gap-2">
                  <div className="text-3xl font-bold text-slate-900">{metadata.rating}</div>
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={cn(
                          "h-4 w-4",
                          i < Math.floor(metadata.rating!)
                            ? "fill-amber-400 text-amber-400"
                            : "text-slate-300"
                        )}
                      />
                    ))}
                  </div>
                </div>
              }
            />
          )}
          {metadata.completionRate !== undefined && (
            <MetadataItem
              icon={<Award className="h-4 w-4" />}
              label="완강률"
              value={
                <div className="space-y-2">
                  <div className="text-2xl font-bold text-slate-900">{metadata.completionRate}%</div>
                  <Progress value={metadata.completionRate} className="h-2" />
                </div>
              }
            />
          )}
          {metadata.duration && (
            <MetadataItem
              icon={<Clock className="h-4 w-4" />}
              label="총 강의 시간"
              value={<div className="text-lg font-semibold text-slate-700">{metadata.duration}</div>}
            />
          )}
          {metadata.level && (
            <MetadataItem
              icon={<BarChart3 className="h-4 w-4" />}
              label="강의 레벨"
              value={<div className="text-lg font-semibold text-slate-700">{metadata.level}</div>}
            />
          )}
        </div>
      </div>
    </MetadataCard>
  );
}

export function DiscoverDetailPage({ content }: DiscoverDetailPageProps) {
  const router = useRouter();
  const [liked, setLiked] = React.useState(content.liked || false);
  const [bookmarked, setBookmarked] = React.useState(content.bookmarked || false);
  const [aiQuery, setAiQuery] = React.useState('');
  const [aiLoading, setAiLoading] = React.useState(false);
  const [showHeaderTitle, setShowHeaderTitle] = React.useState(false);

  // 스크롤 이벤트 감지
  React.useEffect(() => {
    const handleScroll = () => {
      // 300px 이상 스크롤하면 헤더에 제목 표시
      setShowHeaderTitle(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLike = () => setLiked(!liked);
  const handleBookmark = () => setBookmarked(!bookmarked);
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: content.title,
        text: content.summary,
        url: window.location.href,
      });
    }
  };

  const handleAiSubmit = (_query: string) => {
    setAiLoading(true);
    // TODO: AI API 호출
    setTimeout(() => {
      setAiLoading(false);
      setAiQuery('');
    }, 2000);
  };

  const metaItems = [];

  if (content.sources && content.sources.length > 0) {
    metaItems.push({
      icon: content.sources[0].icon,
      label: content.sources[0].name,
    });
  }

  if (content.readTime) {
    metaItems.push({
      icon: <Clock className="h-4 w-4" />,
      label: content.readTime,
    });
  }

  if (content.stats?.views) {
    metaItems.push({
      icon: <Eye className="h-4 w-4" />,
      label: `${content.stats.views.toLocaleString()} 조회`,
    });
  }

  const actions = [
    {
      id: 'like',
      icon: <Heart className={cn('h-5 w-5', liked && 'fill-current')} />,
      label: content.stats?.likes ? `${content.stats.likes}` : '좋아요',
      pressed: liked,
    },
    {
      id: 'bookmark',
      icon: <Bookmark className={cn('h-5 w-5', bookmarked && 'fill-current')} />,
      label: '북마크',
      pressed: bookmarked,
    },
    {
      id: 'share',
      icon: <Share2 className="h-5 w-5" />,
      label: '공유',
    },
  ];

  const handleAction = (actionId: string) => {
    switch (actionId) {
      case 'like':
        handleLike();
        break;
      case 'bookmark':
        handleBookmark();
        break;
      case 'share':
        handleShare();
        break;
    }
  };

  const difficultyLabel = {
    beginner: '초급',
    intermediate: '중급',
    advanced: '고급',
  };

  // Determine content type based on contentId
  const contentType = content.contentId.toString().split('-')[0];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-slate-50 transition-all duration-200">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <button
                onClick={() => router.back()}
                className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors flex-shrink-0"
              >
                <ArrowLeft className="h-5 w-5" />
                <span className="font-medium">뒤로</span>
              </button>

              {/* 스크롤 시 나타나는 제목 */}
              <div
                className={cn(
                  "flex-1 min-w-0 transition-all duration-200",
                  showHeaderTitle ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2 pointer-events-none"
                )}
              >
                <h2 className="text-base font-semibold text-slate-900 truncate">
                  {content.title}
                </h2>
              </div>
            </div>

            <ActionBar actions={actions} onAction={handleAction} size="sm" />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-4 pb-24">
        <article className="space-y-4">
          {/* Badge and Title */}
          <div className="space-y-4">
            {content.badge && (
              <div>
                <Badge tone={content.badgeTone}>{content.badge}</Badge>
              </div>
            )}

            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 leading-tight">
              {content.title}
            </h1>

            {/* Meta Information */}
            <div className="flex flex-wrap items-center gap-4">
              <MetaRow items={metaItems} />
              {content.difficulty && (
                <Badge tone="slate" icon={<TrendingUp className="h-3 w-3" />}>
                  {difficultyLabel[content.difficulty]}
                </Badge>
              )}
            </div>
          </div>

          {/* Hero Image */}
          {content.thumbnailUrl && (
            <div className="relative w-full h-64 rounded-xl overflow-hidden bg-slate-100">
              <img
                src={content.thumbnailUrl}
                alt={content.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Summary */}
          {content.summary && (
            <div className="rounded-xl p-4">
              <h2 className="text-lg font-semibold text-slate-900 mb-3">요약</h2>
              <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                {content.summary}
              </p>
            </div>
          )}

          {/* 채용 추이 비교 - NEW */}
          {contentType === 'job' && content.jobRoleMetadata && (
            <>
              <HiringTrendComparisonSection
                companyTrend={[45, 52, 48, 61, 58, 67]}
                marketTrend={content.jobRoleMetadata.demandTrend}
              />
              {/* 구분선 */}
              <div className="border-t border-slate-200"></div>
            </>
          )}

          {/* Metadata Section - Company Info */}
          {content.metadata && (
            <>
              {contentType === 'job' && <JobMetadataSection metadata={content.metadata as JobMetadata} />}
              {contentType === 'blog' && <BlogMetadataSection metadata={content.metadata as BlogMetadata} />}
              {contentType === 'book' && <BookMetadataSection metadata={content.metadata as BookMetadata} />}
              {contentType === 'course' && <CourseMetadataSection metadata={content.metadata as CourseMetadata} />}
              {/* 구분선 */}
              {contentType === 'job' && content.jobRoleMetadata && (
                <div className="border-t border-slate-200"></div>
              )}
            </>
          )}

          {/* Job Role Analysis Section - NEW */}
          {contentType === 'job' && content.jobRoleMetadata && (
            <JobRoleMetadataSection metadata={content.jobRoleMetadata} />
          )}

          {/* Full Content */}
          {content.fullContent && content.fullContent !== content.summary && (
            <div className="rounded-xl p-4">
              <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                {content.fullContent}
              </p>
            </div>
          )}

          {/* Tags */}
          {content.tags && content.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {content.tags.map((tag, index) => (
                <Chip key={index} variant="default">
                  {tag}
                </Chip>
              ))}
            </div>
          )}

          {/* Actions Bar - Mobile */}
          <div className="md:hidden sticky bottom-4 rounded-full shadow-lg p-3 bg-white">
            <ActionBar actions={actions} onAction={handleAction} size="md" />
          </div>

          {/* Related Content - Moved to bottom */}
          {content.relatedContent && content.relatedContent.length > 0 && (
            <div className="space-y-4 pt-4">
              <h2 className="text-2xl font-bold text-slate-900">관련 콘텐츠</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {content.relatedContent.map((related, index) => (
                  <DiscoverContentCard
                    key={related.id || index}
                    {...related}
                    layout="vertical"
                  />
                ))}
              </div>
            </div>
          )}
        </article>
      </main>

      {/* 플로팅 AI 대화창 */}
      <div className="fixed bottom-0 left-20 right-0 z-40 bg-slate-50/95 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-4 pt-2 pb-0.5">
          <SearchComposeInput
            value={aiQuery}
            onChange={setAiQuery}
            onSubmit={handleAiSubmit}
            placeholder="이 콘텐츠에 대해 질문하기..."
            loading={aiLoading}
            actions={{
              voice: false,
              fileUpload: false,
              modelSelect: true
            }}
            onModelSelectClick={() => {}}
            className="[&_textarea]:min-h-[48px] [&_textarea]:py-2 [&>div]:pb-1.5"
          />
        </div>
      </div>
    </div>
  );
}
