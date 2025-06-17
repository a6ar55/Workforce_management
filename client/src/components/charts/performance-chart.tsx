import { useEffect, useRef } from "react";
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

interface PerformanceChartProps {
  data?: number[];
  labels?: string[];
  type?: 'line' | 'doughnut' | 'pie';
}

export function PerformanceChart({ 
  data = [65, 78, 90, 81, 56, 75], 
  labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
  type = 'line'
}: PerformanceChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    // Destroy existing chart
    if (chartRef.current) {
      chartRef.current.destroy();
    }

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    const chartConfig: any = {
      type,
      data: {
        labels,
        datasets: [{
          label: 'Performance',
          data,
          backgroundColor: type === 'line' 
            ? 'rgba(16, 185, 129, 0.1)'
            : [
                'rgba(59, 130, 246, 0.8)',
                'rgba(16, 185, 129, 0.8)',
                'rgba(245, 158, 11, 0.8)',
                'rgba(239, 68, 68, 0.8)',
                'rgba(139, 92, 246, 0.8)',
                'rgba(236, 72, 153, 0.8)',
              ],
          borderColor: type === 'line' ? 'rgba(16, 185, 129, 1)' : undefined,
          borderWidth: type === 'line' ? 2 : 1,
          fill: type === 'line',
          tension: type === 'line' ? 0.4 : undefined,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: type !== 'line'
          }
        },
        scales: type === 'line' ? {
          y: {
            beginAtZero: true,
            grid: {
              color: 'rgba(148, 163, 184, 0.3)'
            },
            ticks: {
              color: 'rgba(71, 85, 105, 0.8)'
            }
          },
          x: {
            grid: {
              color: 'rgba(148, 163, 184, 0.3)'
            },
            ticks: {
              color: 'rgba(71, 85, 105, 0.8)'
            }
          }
        } : undefined
      }
    };

    chartRef.current = new Chart(ctx, chartConfig);

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, [data, labels, type]);

  return (
    <div className="relative h-64 w-full">
      <canvas ref={canvasRef} />
    </div>
  );
}
