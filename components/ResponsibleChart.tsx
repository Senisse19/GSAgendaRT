import React, { useEffect, useRef, useMemo } from 'react';
import Chart from 'chart.js/auto';
import { DashboardData } from '../types';
import DashboardChart from './DashboardChart';

const ResponsibleChart: React.FC<{ data: DashboardData[] }> = ({ data }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart | null>(null);

  const chartData = useMemo(() => {
    const responsibleData = data.reduce((acc, item) => {
      const responsible = item.gestaoDeProjetos;
      if (!responsible) return acc;
      if (!acc[responsible]) {
        acc[responsible] = { totalCreditos: 0, totalHonorarios: 0, reunioesRealizadas: 0 };
      }
      acc[responsible].totalCreditos += item.totalDeCreditos;
      acc[responsible].totalHonorarios += item.totalDeHonorarios;
      if (item.statusRT === 'Realizada') {
          acc[responsible].reunioesRealizadas += 1;
      }
      return acc;
    }, {} as Record<string, { totalCreditos: number; totalHonorarios: number; reunioesRealizadas: number }>);
    
    const sortedData = Object.entries(responsibleData).sort(([, a], [, b]) => (b.totalCreditos + b.totalHonorarios) - (a.totalCreditos + a.totalHonorarios));

    return {
      labels: sortedData.map(([label]) => label),
      datasets: [
        {
          label: 'TOTAL DE CRÉDITOS',
          data: sortedData.map(([, values]) => values.totalCreditos),
          backgroundColor: '#C8A464',
          xAxisID: 'x',
        },
        {
          label: 'TOTAL DE HONORÁRIOS',
          data: sortedData.map(([, values]) => values.totalHonorarios),
          backgroundColor: '#8B6F4A',
          xAxisID: 'x',
        },
        {
          label: 'REUNIÕES REALIZADAS',
          data: sortedData.map(([, values]) => values.reunioesRealizadas),
          backgroundColor: '#A9A9A9', // Cor alterada para maior contraste
          xAxisID: 'x2',
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
            indexAxis: 'y',
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
                  color: '#4B5563',
                },
                ticks: {
                  color: '#9CA3AF',
                  callback: (value) => `${Number(value) / 1000000} mi`,
                },
                border: {
                    display: false,
                },
              },
              x2: {
                type: 'linear',
                position: 'top',
                grid: {
                  display: false,
                },
                ticks: {
                  color: '#9CA3AF',
                  precision: 0,
                },
                border: {
                    display: false,
                },
                title: {
                    display: true,
                    text: 'Nº de Reuniões Realizadas',
                    color: '#9CA3AF',
                    align: 'end'
                }
              },
              y: {
                grid: {
                  display: false,
                },
                ticks: {
                  color: '#9CA3AF',
                },
                border: {
                    color: '#4B5563'
                },
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
    <DashboardChart title="TOTAL DE CRÉDITOS e TOTAL DE HONORÁRIOS por responsável">
       <div style={{ height: '400px' }}>
        <canvas ref={canvasRef} />
      </div>
    </DashboardChart>
  );
};

export default ResponsibleChart;