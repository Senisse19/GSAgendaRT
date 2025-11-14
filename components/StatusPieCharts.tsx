import React, { useEffect, useRef, useMemo } from 'react';
import Chart from 'chart.js/auto';
import { DashboardData } from '../types';

const PieChart: React.FC<{ chartData: any }> = ({ chartData }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const chartRef = useRef<Chart | null>(null);

    useEffect(() => {
        if (canvasRef.current) {
            chartRef.current?.destroy();
            const ctx = canvasRef.current.getContext('2d');
            if (ctx) {
                chartRef.current = new Chart(ctx, {
                    type: 'pie',
                    data: chartData,
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: {
                                position: 'right',
                                labels: {
                                    color: '#D1D5DB',
                                },
                            },
                             tooltip: {
                                callbacks: {
                                    label: function(context) {
                                        let label = context.label || '';
                                        if (label) {
                                            label += ': ';
                                        }
                                        if (context.parsed !== null) {
                                            // FIX: Add generic type to reduce to ensure 'total' is inferred as a number.
                                            const total = context.chart.data.datasets[0].data.reduce<number>((a, b) => a + (Number(b) || 0), 0);
                                            const value = context.parsed;
                                            
                                            if (typeof value === 'number' && total > 0) {
                                                const percentage = ((value / total) * 100).toFixed(1);
                                                label += `${value} (${percentage}%)`;
                                            } else {
                                                label += '0 (0.0%)';
                                            }
                                        }
                                        return label;
                                    }
                                }
                            }
                        },
                    },
                });
            }
        }
        return () => chartRef.current?.destroy();
    }, [chartData]);

    return <div className="h-full w-full relative"><canvas ref={canvasRef} /></div>;
};

const aggregateData = (data: DashboardData[], key: keyof DashboardData) => {
    const counts = data.reduce((acc, item) => {
        const status = item[key] as string;
        if (status && status.trim() !== '') {
            acc[status] = (acc[status] || 0) + 1;
        }
        return acc;
    }, {} as Record<string, number>);

    return {
        labels: Object.keys(counts),
        datasets: [{
            data: Object.values(counts),
            backgroundColor: ['#C8A464', '#8B6F4A', '#EAC696', '#65451F', '#A9A9A9', '#D2B48C'],
            borderColor: '#1E1E1E',
            borderWidth: 4,
        }]
    };
};


const StatusPieCharts: React.FC<{ data: DashboardData[] }> = ({ data }) => {
    
    const meetingStatusData = useMemo(() => aggregateData(data, 'statusRT'), [data]);
    const approvalStatusData = useMemo(() => aggregateData(data, 'aprovadoEmRT'), [data]);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-[#2D2D2D] p-6 rounded-lg">
                <h2 className="text-lg font-bold text-white uppercase text-center mb-4">STATUS DA REUNIÃO</h2>
                <div className="h-64">
                    <PieChart chartData={meetingStatusData} />
                </div>
            </div>
             <div className="bg-[#2D2D2D] p-6 rounded-lg">
                <h2 className="text-lg font-bold text-white uppercase text-center mb-4">APROVAÇÃO EM RT</h2>
                <div className="h-64">
                    <PieChart chartData={approvalStatusData} />
                </div>
            </div>
        </div>
    );
};

export default StatusPieCharts;