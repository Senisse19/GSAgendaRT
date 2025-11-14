import React, { useEffect, useRef, useMemo } from 'react';
import Chart from 'chart.js/auto';
import { DashboardData } from '../types';
import DashboardChart from './DashboardChart';

const TimelineChart: React.FC<{ data: DashboardData[] }> = ({ data }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart | null>(null);

  const chartData = useMemo(() => {
    const monthlyData = data.reduce((acc, item) => {
      // Use 'YYYY-MM' as the key for grouping by month
      const dateKey = item.data.toISOString().substring(0, 7); 
      if (!acc[dateKey]) {
        acc[dateKey] = { totalCreditos: 0, totalHonorarios: 0, dateObj: item.data };
      }
      acc[dateKey].totalCreditos += item.totalDeCreditos;
      acc[dateKey].totalHonorarios += item.totalDeHonorarios;
      return acc;
    }, {} as Record<string, { totalCreditos: number; totalHonorarios: number, dateObj: Date }>);

    // The 'YYYY-MM' keys can be sorted alphabetically, which corresponds to chronologically
    const sortedKeys = Object.keys(monthlyData).sort();
    
    // Format labels to show month and year, e.g., "nov/2025"
    const formattedLabels = sortedKeys.map(key => 
        monthlyData[key].dateObj.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }).replace(' de ', '/').replace('.', '')
    );

    return {
      labels: formattedLabels,
      datasets: [
        {
          label: 'TOTAL DE CRÉDITOS',
          data: sortedKeys.map(key => monthlyData[key].totalCreditos),
          backgroundColor: '#C8A464',
        },
        {
          label: 'TOTAL DE HONORÁRIOS',
          data: sortedKeys.map(key => monthlyData[key].totalHonorarios),
          backgroundColor: '#8B6F4A',
        },
      ],
    };
  }, [data]);
  

  useEffect(() => {
    if (canvasRef.current) {
      if (chartRef.current) {
        chartRef.current.destroy();
      }

      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        chartRef.current = new Chart(ctx, {
          type: 'bar',
          data: chartData,
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'top',
                align: 'start',
                labels: {
                  color: '#D1D5DB',
                  boxWidth: 12,
                  padding: 20
                },
              },
            },
            scales: {
              x: {
                grid: {
                  display: false,
                },
                ticks: {
                  color: '#9CA3AF',
                },
                border: {
                    color: '#4B5563'
                }
              },
              y: {
                grid: {
                  color: '#4B5563',
                },
                ticks: {
                  color: '#9CA3AF',
                  callback: (value) => `${Number(value) / 1000000} mi`,
                },
                 border: {
                    display: false,
                }
              },
            },
          },
        });
      }
    }

    return () => {
      chartRef.current?.destroy();
    };
  }, [chartData]);

  return (
    <DashboardChart title="TOTAL DE CRÉDITOS e TOTAL DE HONORÁRIOS ao longo do tempo">
      <div style={{ height: '300px' }}>
        <canvas ref={canvasRef} />
      </div>
    </DashboardChart>
  );
};

export default TimelineChart;