'use client';

import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { getAnalytics } from '@/lib/api';
import { cn } from '@/lib/utils';
import type { AnalyticsResponse, PlatformAnalytics } from '@/types/analytics';
import { RefreshCw } from 'lucide-react';

const CHART_W = 1100;
const CHART_H = 240;
const PAD_L = 58;
const PAD_R = 16;
const PAD_T = 16;
const PAD_B = 38;

type MetricKey = 'views' | 'comments' | 'likes' | 'shares';

const ALL_METRICS: MetricKey[] = ['views', 'comments', 'likes', 'shares'];

const METRIC_CONFIG: Record<MetricKey, { label: string; color: string }> = {
  views: { label: 'Views', color: '#3b1287' },
  comments: { label: 'Comments', color: '#ff7bbd' },
  likes: { label: 'Likes', color: '#f45b53' },
  shares: { label: 'Shares', color: '#d8ad00' },
};

const PRESETS = [
  { label: 'Last 7 days', days: 7 },
  { label: 'Last 30 days', days: 30 },
  { label: 'Last 90 days', days: 90 },
] as const;

function formatDateInput(date: Date) {
  return date.toISOString().slice(0, 10);
}

function subtractDays(days: number) {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - days);
  return formatDateInput(d);
}

export function AnalyticsSection() {
  const today = formatDateInput(new Date());

  const [fromDate, setFromDate] = useState(subtractDays(29));
  const [toDate, setToDate] = useState(today);
  const [activeMetrics, setActiveMetrics] = useState<Set<MetricKey>>(new Set(ALL_METRICS));
  const [analytics, setAnalytics] = useState<AnalyticsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  async function loadAnalytics(from = fromDate, to = toDate) {
    setIsLoading(true);
    setError('');

    try {
      setAnalytics(await getAnalytics({ fromDate: from, toDate: to }));
    } catch (analyticsError) {
      setError(
        analyticsError instanceof Error ? analyticsError.message : 'Could not load analytics.',
      );
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadAnalytics();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function applyPreset(days: number) {
    const from = subtractDays(days - 1);
    const to = today;
    setFromDate(from);
    setToDate(to);
    void loadAnalytics(from, to);
  }

  function toggleMetric(metric: MetricKey) {
    setActiveMetrics((prev) => {
      if (prev.has(metric) && prev.size === 1) return prev;
      const next = new Set(prev);
      next.has(metric) ? next.delete(metric) : next.add(metric);
      return next;
    });
  }

  return (
    <section className="relative z-10 mx-auto w-full max-w-6xl pb-16 pt-8">
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="mb-2 text-sm font-black uppercase text-[#6f5a00]">Zernio analytics</p>
          <h2 className="max-w-2xl text-4xl font-black leading-tight text-grape drop-shadow-[2px_2px_0_#fff1ad] sm:text-5xl">
            How are the clips doing?
          </h2>
          {analytics ? (
            <p className="mt-2 text-base font-bold text-[#6f5a00]">
              {analytics.fromDate} to {analytics.toDate}
            </p>
          ) : null}
        </div>

        <Button
          type="button"
          onClick={() => void loadAnalytics()}
          disabled={isLoading}
          className="h-12 rounded-lg border-2 border-grape bg-cream px-5 font-black text-grape shadow-[5px_5px_0_#3b1287] hover:bg-white"
        >
          <RefreshCw className={cn('mr-2 h-5 w-5', isLoading ? 'animate-spin' : '')} />
          Refresh
        </Button>
      </div>

      {/* Controls */}
      <div className="mb-6 flex flex-col gap-4 rounded-xl border-2 border-grape bg-cream p-4 shadow-[4px_4px_0_#3b1287] sm:flex-row sm:flex-wrap sm:items-center">
        {/* Date presets */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-black uppercase text-[#6f5a00]">Range</span>
          {PRESETS.map(({ label, days }) => (
            <button
              key={label}
              type="button"
              onClick={() => applyPreset(days)}
              className="rounded-md border-2 border-grape bg-white px-3 py-1 text-xs font-black text-grape shadow-[2px_2px_0_#3b1287] transition-all hover:bg-[#fff1ad] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
            >
              {label}
            </button>
          ))}
        </div>

        {/* Custom date inputs */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-black uppercase text-[#6f5a00]">Custom</span>
          <input
            type="date"
            value={fromDate}
            max={toDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="rounded-md border-2 border-grape bg-white px-2 py-1 text-xs font-black text-grape shadow-[2px_2px_0_#3b1287]"
          />
          <span className="text-xs font-black text-[#6f5a00]">to</span>
          <input
            type="date"
            value={toDate}
            min={fromDate}
            max={today}
            onChange={(e) => setToDate(e.target.value)}
            className="rounded-md border-2 border-grape bg-white px-2 py-1 text-xs font-black text-grape shadow-[2px_2px_0_#3b1287]"
          />
          <button
            type="button"
            onClick={() => void loadAnalytics()}
            disabled={isLoading}
            className="rounded-md border-2 border-grape bg-grape px-3 py-1 text-xs font-black text-white shadow-[2px_2px_0_#3b1287] hover:bg-[#3b1287] disabled:opacity-50"
          >
            Apply
          </button>
        </div>

        <div className="hidden h-6 w-px bg-grape opacity-30 sm:block" />

        {/* Metric toggles */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-black uppercase text-[#6f5a00]">Show</span>
          {ALL_METRICS.map((metric) => {
            const active = activeMetrics.has(metric);
            return (
              <button
                key={metric}
                type="button"
                onClick={() => toggleMetric(metric)}
                style={active ? { backgroundColor: METRIC_CONFIG[metric].color } : undefined}
                className={cn(
                  'rounded-md border-2 border-grape px-3 py-1 text-xs font-black shadow-[2px_2px_0_#3b1287] transition-colors',
                  active ? 'text-white' : 'bg-white text-grape hover:bg-[#fff1ad]',
                )}
              >
                {METRIC_CONFIG[metric].label}
              </button>
            );
          })}
        </div>
      </div>

      {error ? (
        <Card className="border-4 border-grape bg-cream shadow-[8px_8px_0_#3b1287]">
          <CardContent className="p-6">
            <p className="font-black text-red-800">{error}</p>
          </CardContent>
        </Card>
      ) : null}

      {isLoading && !analytics ? (
        <div className="grid gap-5">
          <AnalyticsSkeleton />
          <AnalyticsSkeleton />
        </div>
      ) : null}

      {analytics ? (
        <div className="grid gap-5">
          {analytics.platforms.map((platform) => (
            <PlatformAnalyticsCard
              key={platform.platform}
              analytics={platform}
              activeMetrics={activeMetrics}
            />
          ))}
        </div>
      ) : null}
    </section>
  );
}

function PlatformAnalyticsCard({
  analytics,
  activeMetrics,
}: {
  analytics: PlatformAnalytics;
  activeMetrics: Set<MetricKey>;
}) {
  const hasSeries = analytics.series.length > 0;

  return (
    <Card className="border-4 border-grape bg-cream shadow-[8px_8px_0_#3b1287]">
      <CardContent className="grid gap-5 p-5 sm:p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-black uppercase text-[#6f5a00]">{analytics.platform}</p>
            <div className="flex items-center gap-3">
              <h3 className="text-3xl font-black text-grape">{analytics.label}</h3>
              <div className="rounded-full border-4 border-grape bg-[#ffaf22] px-4 py-2 text-sm font-black text-grape shadow-[4px_4px_0_#3b1287]">
                Live-ish
              </div>
            </div>
          </div>

          <div className="flex flex-wrap justify-end gap-3">
            {ALL_METRICS.filter((m) => activeMetrics.has(m)).map((metric) => (
              <MetricPill
                key={metric}
                label={METRIC_CONFIG[metric].label}
                value={analytics.totals[metric]}
                color={METRIC_CONFIG[metric].color}
              />
            ))}
          </div>
        </div>

        <div className="rounded-lg border-2 border-grape bg-field p-3 shadow-[4px_4px_0_#d8ad00]">
          {hasSeries ? (
            <EngagementChart series={analytics.series} activeMetrics={activeMetrics} />
          ) : (
            <div className="flex h-48 items-center justify-center text-center text-sm font-black text-[#6f5a00]">
              No post analytics returned for this date range yet.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function MetricPill({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="rounded-lg border-2 border-grape bg-white px-3 py-3 text-grape shadow-[3px_3px_0_#d8ad00]">
      <div className="text-xs font-black uppercase" style={{ color }}>
        {label}
      </div>
      <div className="mt-1 text-2xl font-black">{formatNumber(value)}</div>
    </div>
  );
}

function EngagementChart({
  series,
  activeMetrics,
}: {
  series: PlatformAnalytics['series'];
  activeMetrics: Set<MetricKey>;
}) {
  const { chartPoints, chartMetrics, maxMetric } = useMemo(() => {
    const metrics = ALL_METRICS.filter((m) => activeMetrics.has(m));
    const max = Math.max(1, ...series.flatMap((point) => metrics.map((m) => point[m])));

    const pts = Object.fromEntries(
      metrics.map((metric) => [
        metric,
        series.map((point, index) => toChartPoint(point[metric], index, series.length, max)),
      ]),
    ) as Partial<Record<MetricKey, string[]>>;

    return { chartPoints: pts, chartMetrics: metrics, maxMetric: max };
  }, [series, activeMetrics]);

  const primaryMetric = chartMetrics[0];

  const yTicks = useMemo(
    () => [0, 0.25, 0.5, 0.75, 1].map((frac) => Math.round(frac * maxMetric)),
    [maxMetric],
  );

  const xLabelIndices = useMemo(() => {
    if (series.length <= 1) return series.map((_, i) => i);
    const count = Math.min(series.length, 6);
    return Array.from({ length: count }, (_, i) =>
      Math.round((i / (count - 1)) * (series.length - 1)),
    );
  }, [series]);

  return (
    <div>
      <div className="mb-3 flex flex-wrap gap-3 text-xs font-black">
        {chartMetrics.map((metric) => (
          <span key={metric} className="inline-flex items-center gap-2">
            <span
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: METRIC_CONFIG[metric].color }}
            />
            <span style={{ color: METRIC_CONFIG[metric].color }}>
              {METRIC_CONFIG[metric].label}
            </span>
          </span>
        ))}
      </div>

      <svg
        viewBox={`0 0 ${CHART_W} ${CHART_H}`}
        role="img"
        aria-label="Metrics over time"
        className="h-56 w-full overflow-visible"
      >
        {/* Y-axis gridlines + labels */}
        {yTicks.map((tick) => {
          const y = chartY(tick, maxMetric);
          return (
            <g key={tick}>
              <line
                x1={PAD_L}
                y1={y}
                x2={CHART_W - PAD_R}
                y2={y}
                stroke="#3b1287"
                strokeWidth={tick === 0 ? 3 : 1}
                strokeOpacity={tick === 0 ? 1 : 0.15}
                strokeDasharray={tick === 0 ? undefined : '4 4'}
              />
              <text
                x={PAD_L - 8}
                y={y}
                textAnchor="end"
                dominantBaseline="middle"
                fontSize="11"
                fontWeight="700"
                fill="#6f5a00"
              >
                {formatNumber(tick)}
              </text>
            </g>
          );
        })}

        {/* Y-axis spine */}
        <line
          x1={PAD_L}
          y1={PAD_T}
          x2={PAD_L}
          y2={CHART_H - PAD_B}
          stroke="#3b1287"
          strokeWidth="3"
          strokeLinecap="round"
        />

        {/* Metric lines */}
        {chartMetrics.map((metric, i) => (
          <polyline
            key={metric}
            points={(chartPoints[metric] ?? []).join(' ')}
            fill="none"
            stroke={METRIC_CONFIG[metric].color}
            strokeWidth={i === 0 ? 8 : 7}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ))}

        {/* Dots on primary metric */}
        {primaryMetric
          ? series.map((point, index) => {
              const [x, y] = toChartPoint(point[primaryMetric], index, series.length, maxMetric)
                .split(',')
                .map(Number);
              return (
                <circle
                  key={`${point.date}-${index}`}
                  cx={x}
                  cy={y}
                  r="6"
                  fill="#ffaf22"
                  stroke="#3b1287"
                  strokeWidth="4"
                />
              );
            })
          : null}

        {/* X-axis date labels */}
        {xLabelIndices.map((i) => {
          const point = series[i];
          if (!point) return null;
          const x = chartX(i, series.length);
          return (
            <text
              key={i}
              x={x}
              y={CHART_H - PAD_B + 16}
              textAnchor="middle"
              fontSize="11"
              fontWeight="700"
              fill="#6f5a00"
            >
              {formatShortDate(point.date)}
            </text>
          );
        })}
      </svg>
    </div>
  );
}

function AnalyticsSkeleton() {
  return (
    <Card className="border-4 border-grape bg-cream shadow-[8px_8px_0_#3b1287]">
      <CardContent className="grid gap-5 p-6">
        <div className="h-10 w-48 animate-pulse rounded-lg bg-[#e0c95d]" />
        <div className="grid grid-cols-4 gap-3">
          {[0, 1, 2, 3].map((item) => (
            <div
              key={item}
              className="h-20 animate-pulse rounded-lg border-2 border-grape bg-field"
            />
          ))}
        </div>
        <div className="h-48 animate-pulse rounded-lg border-2 border-grape bg-field" />
      </CardContent>
    </Card>
  );
}

function chartX(index: number, length: number) {
  const usableWidth = CHART_W - PAD_L - PAD_R;
  return PAD_L + (length <= 1 ? usableWidth / 2 : (index / (length - 1)) * usableWidth);
}

function chartY(value: number, maxValue: number) {
  const usableHeight = CHART_H - PAD_T - PAD_B;
  return CHART_H - PAD_B - (value / maxValue) * usableHeight;
}

function toChartPoint(value: number, index: number, length: number, maxValue: number) {
  return `${chartX(index, length).toFixed(1)},${chartY(value, maxValue).toFixed(1)}`;
}

function formatShortDate(dateStr: string) {
  return new Date(`${dateStr}T00:00:00Z`).toLocaleDateString('en', {
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  });
}

function formatNumber(value: number) {
  return new Intl.NumberFormat('en', {
    notation: value >= 10000 ? 'compact' : 'standard',
  }).format(value);
}
