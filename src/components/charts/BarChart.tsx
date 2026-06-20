import { useEffect, useRef } from 'react';
import {
  Chart,
  BarController,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  type ChartConfiguration,
} from 'chart.js';
import type { Locale } from '@/utils/i18n';

Chart.register(BarController, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

export interface BarDataset {
  label: string;
  data: number[];
  color?: string; // hex override; defaults to brand-primary
}

interface Props {
  id: string; // unique id for the accessible table
  title: string;
  labels: string[];
  datasets: BarDataset[];
  lang: Locale;
  yAxisLabel?: string;
  stacked?: boolean;
}

/** Read a CSS custom property from :root, with a hex fallback. */
function cssVar(name: string, fallback: string): string {
  if (typeof document === 'undefined') return fallback;
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;
}

const PALETTE = ['--brand-primary', '--brand-accent', '--color-muted'];
const PALETTE_FALLBACKS = ['#1B3A6B', '#E8A020', '#6b7280'];

export default function BarChart({ id, title, labels, datasets, lang, yAxisLabel, stacked = false }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef  = useRef<Chart | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const resolvedDatasets = datasets.map((ds, i) => {
      const color = ds.color ?? cssVar(PALETTE[i % PALETTE.length], PALETTE_FALLBACKS[i % PALETTE_FALLBACKS.length]);
      return {
        label: ds.label,
        data: ds.data,
        backgroundColor: color,
        borderRadius: 6,
        borderSkipped: false as const,
      };
    });

    const config: ChartConfiguration<'bar'> = {
      type: 'bar',
      data: { labels, datasets: resolvedDatasets },
      options: {
        responsive: true,
        maintainAspectRatio: false,
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
            stacked,
            grid: { display: false },
            border: { display: false },
            ticks: { color: '#9ca3af', font: { size: 12 } },
          },
          y: {
            stacked,
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
        <canvas
          ref={canvasRef}
          aria-label={title}
          role="img"
        />
      </div>

      {/* Accessible data table (visually hidden) */}
      <table className="sr-only" id={`chart-table-${id}`}>
        <caption>{title}</caption>
        <thead>
          <tr>
            <th scope="col">{lang === 'tr' ? 'Kategori' : 'Category'}</th>
            {datasets.map((ds) => (
              <th key={ds.label} scope="col">{ds.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {labels.map((label, i) => (
            <tr key={label}>
              <th scope="row">{label}</th>
              {datasets.map((ds) => (
                <td key={ds.label}>{ds.data[i]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
