import { useEffect, useRef } from 'react';
import {
  Chart,
  LineController,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Filler,
  Tooltip,
  Legend,
  type ChartConfiguration,
} from 'chart.js';
import type { Locale } from '@/utils/i18n';

Chart.register(LineController, LineElement, PointElement, CategoryScale, LinearScale, Filler, Tooltip, Legend);

export interface LineDataset {
  label: string;
  data: number[];
  color?: string;
  fill?: boolean;
}

interface Props {
  id: string;
  title: string;
  labels: string[];
  datasets: LineDataset[];
  lang: Locale;
  yAxisLabel?: string;
}

function cssVar(name: string, fallback: string): string {
  if (typeof document === 'undefined') return fallback;
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;
}

const PALETTE = ['--brand-primary', '--brand-accent'];
const PALETTE_FALLBACKS = ['#1B3A6B', '#E8A020'];

export default function LineChart({ id, title, labels, datasets, lang, yAxisLabel }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef  = useRef<Chart | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d')!;

    const resolvedDatasets = datasets.map((ds, i) => {
      const color = ds.color ?? cssVar(PALETTE[i % PALETTE.length], PALETTE_FALLBACKS[i % PALETTE_FALLBACKS.length]);

      // Gradient fill below the line for the first dataset
      let background: string | CanvasGradient = 'transparent';
      if (ds.fill !== false) {
        const gradient = ctx.createLinearGradient(0, 0, 0, 280);
        gradient.addColorStop(0, color + '33');   // 20% opacity
        gradient.addColorStop(1, color + '00');   // 0% opacity
        background = gradient;
      }

      return {
        label: ds.label,
        data: ds.data,
        borderColor: color,
        borderWidth: 2.5,
        backgroundColor: background,
        fill: ds.fill !== false,
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 6,
        pointHoverBackgroundColor: color,
        pointHoverBorderColor: '#fff',
        pointHoverBorderWidth: 2,
      };
    });

    const config: ChartConfiguration<'line'> = {
      type: 'line',
      data: { labels, datasets: resolvedDatasets },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: { display: datasets.length > 1 },
          tooltip: {
            backgroundColor: '#1a1a2e',
            titleColor: '#fff',
            bodyColor: 'rgba(255,255,255,0.8)',
            padding: 12,
            cornerRadius: 8,
            callbacks: {
              label: (ctx) => ` ${ctx.dataset.label}: ${ctx.formattedValue}${yAxisLabel ? ' ' + yAxisLabel : ''}`,
            },
          },
        },
        scales: {
          x: {
            grid: { display: false },
            border: { display: false },
            ticks: { color: '#9ca3af', font: { size: 12 } },
          },
          y: {
            border: { display: false },
            grid: { color: 'rgba(0,0,0,0.05)' },
            ticks: {
              color: '#9ca3af',
              font: { size: 12 },
              callback: (v) => `${v}${yAxisLabel ? ' ' + yAxisLabel : ''}`,
            },
          },
        },
      },
    };

    chartRef.current = new Chart(canvasRef.current, config);
    return () => { chartRef.current?.destroy(); chartRef.current = null; };
  }, []);

  return (
    <div>
      <div className="relative h-72 w-full">
        <canvas ref={canvasRef} aria-label={title} role="img" />
      </div>

      <table className="sr-only" id={`chart-table-${id}`}>
        <caption>{title}</caption>
        <thead>
          <tr>
            <th scope="col">{lang === 'tr' ? 'Dönem' : 'Period'}</th>
            {datasets.map((ds) => <th key={ds.label} scope="col">{ds.label}</th>)}
          </tr>
        </thead>
        <tbody>
          {labels.map((label, i) => (
            <tr key={label}>
              <th scope="row">{label}</th>
              {datasets.map((ds) => <td key={ds.label}>{ds.data[i]}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
