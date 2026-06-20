import { useEffect, useRef } from 'react';
import {
  Chart,
  DoughnutController,
  ArcElement,
  Tooltip,
  Legend,
  type ChartConfiguration,
} from 'chart.js';
import type { Locale } from '@/utils/i18n';

Chart.register(DoughnutController, ArcElement, Tooltip, Legend);

export interface DonutSegment {
  label: string;
  value: number;
}

interface Props {
  id: string;
  title: string;
  segments: DonutSegment[];
  lang: Locale;
  unit?: string; // e.g. '%'
}

function cssVar(name: string, fallback: string): string {
  if (typeof document === 'undefined') return fallback;
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;
}

/** Generate a palette from brand colors + fixed neutrals. */
function buildPalette(): string[] {
  const primary = cssVar('--brand-primary', '#1B3A6B');
  const accent  = cssVar('--brand-accent',  '#E8A020');
  return [primary, accent, '#64748b', '#94a3b8', '#cbd5e1', '#e2e8f0'];
}

export default function DonutChart({ id, title, segments, lang, unit = '%' }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef  = useRef<Chart | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    const palette = buildPalette();

    const config: ChartConfiguration<'doughnut'> = {
      type: 'doughnut',
      data: {
        labels: segments.map((s) => s.label),
        datasets: [{
          data: segments.map((s) => s.value),
          backgroundColor: palette.slice(0, segments.length),
          borderWidth: 3,
          borderColor: '#ffffff',
          hoverOffset: 6,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '65%',
        plugins: {
          legend: {
            position: 'right',
            labels: {
              padding: 16,
              usePointStyle: true,
              pointStyleWidth: 10,
              font: { size: 12 },
              color: '#4b5563',
            },
          },
          tooltip: {
            backgroundColor: '#1a1a2e',
            titleColor: '#fff',
            bodyColor: 'rgba(255,255,255,0.8)',
            padding: 12,
            cornerRadius: 8,
            callbacks: {
              label: (ctx) => ` ${ctx.label}: ${ctx.formattedValue}${unit}`,
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
      <div className="relative mx-auto h-64 w-full max-w-sm">
        <canvas ref={canvasRef} aria-label={title} role="img" />
      </div>

      <table className="sr-only" id={`chart-table-${id}`}>
        <caption>{title}</caption>
        <thead>
          <tr>
            <th scope="col">{lang === 'tr' ? 'Kategori' : 'Category'}</th>
            <th scope="col">{lang === 'tr' ? 'Değer' : 'Value'}</th>
          </tr>
        </thead>
        <tbody>
          {segments.map((s) => (
            <tr key={s.label}>
              <th scope="row">{s.label}</th>
              <td>{s.value}{unit}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
