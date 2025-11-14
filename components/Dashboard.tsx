import React, { useEffect, useMemo, useState } from 'react';
import { fetchData } from '../services/dataService';
import { DashboardData } from '../types';
import Header from './Header';
import StatCard from './StatCard';
import TimelineChart from './TimelineChart';
import ResponsibleChart from './ResponsibleChart';
import StatusPieCharts from './StatusPieCharts';
import DataTable from './DataTable';

// Declaração para as bibliotecas carregadas globalmente via <script>
declare global {
  interface Window {
    jspdf: any;
  }
}

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    }).format(value);
};

const Dashboard: React.FC = () => {
    const [allData, setAllData] = useState<DashboardData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [startDate, setStartDate] = useState<Date | null>(null);
    const [endDate, setEndDate] = useState<Date | null>(null);
    const [selectedResponsible, setSelectedResponsible] = useState<string>('all');
    const [isExporting, setIsExporting] = useState(false);


    useEffect(() => {
        fetchData()
            .then((data) => {
                setAllData(data);
                if (data.length > 0) {
                    const dates = data.map(d => d.data.getTime());
                    const minDate = new Date(Math.min(...dates));
                    const maxDate = new Date(Math.max(...dates));
                    setStartDate(minDate);
                    setEndDate(maxDate);
                }
                setLoading(false);
            })
            .catch((err) => {
                console.error("Failed to fetch data:", err);
                setError('Falha ao carregar os dados.');
                setLoading(false);
            });
    }, []);
    
    const { minDate, maxDate, responsibles } = useMemo(() => {
        if (allData.length === 0) return { minDate: null, maxDate: null, responsibles: [] };
        const dates = allData.map(d => d.data.getTime());
        const uniqueResponsibles = Array.from(new Set(allData.map(d => d.gestaoDeProjetos).filter(r => r && r.trim() !== ''))).sort();
        return {
            minDate: new Date(Math.min(...dates)),
            maxDate: new Date(Math.max(...dates)),
            responsibles: uniqueResponsibles,
        };
    }, [allData]);

    const handlePresetChange = (preset: 'last7' | 'last30' | 'thisMonth' | 'allTime') => {
        if (!maxDate || !minDate) return;

        const end = new Date(maxDate);
        let start: Date;

        switch (preset) {
            case 'last7':
                start = new Date(maxDate);
                start.setDate(end.getDate() - 6);
                break;
            case 'last30':
                start = new Date(maxDate);
                start.setDate(end.getDate() - 29);
                break;
            case 'thisMonth':
                start = new Date(end.getFullYear(), end.getMonth(), 1);
                break;
            case 'allTime':
            default:
                start = new Date(minDate);
                break;
        }

        setStartDate(start);
        setEndDate(end);
    };

    const handleExportDashboardPDF = () => {
        setIsExporting(true);
    
        try {
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF({
                orientation: 'p',
                unit: 'pt',
                format: 'a4'
            });
    
            // Helper for formatting currency within this function
            const formatCurrencyForPDF = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    
            // --- PAGE 1: CAPA E RESUMO ---
            doc.setFontSize(22);
            doc.setFont('helvetica', 'bold');
            doc.text('Relatório de Performance Mensal', doc.internal.pageSize.getWidth() / 2, 60, { align: 'center' });
    
            const dateRangeText = `Período: ${startDate?.toLocaleDateString('pt-BR') || 'N/A'} a ${endDate?.toLocaleDateString('pt-BR') || 'N/A'}`;
            doc.setFontSize(12);
            doc.setFont('helvetica', 'normal');
            doc.text(dateRangeText, doc.internal.pageSize.getWidth() / 2, 80, { align: 'center' });
    
            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.text('Principais Indicadores (KPIs)', 40, 120);
    
            (doc as any).autoTable({
                startY: 130,
                theme: 'grid',
                head: [['Indicador', 'Valor']],
                body: [
                    ['Total de Honorários', formatCurrencyForPDF(totalHonorarios)],
                    ['Total de Créditos', formatCurrencyForPDF(totalCreditos)],
                    ['Restituição', formatCurrencyForPDF(totalRestituicao)],
                    ['Compensação', formatCurrencyForPDF(totalCompensacao)],
                    ['Empresas Únicas', totalEmpresas.toString()],
                    ['Jobs Únicos', totalJobs.toString()],
                ],
                headStyles: { fillColor: [74, 63, 49] },
                margin: { left: 40, right: 40 },
            });
    
            const kpiTableY = (doc as any).lastAutoTable.finalY;
            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.text('Resumo Executivo', 40, kpiTableY + 40);
    
            const summaryText = `Este relatório apresenta uma análise da performance da Agenda RT para o período de ${startDate?.toLocaleDateString('pt-BR') || 'N/A'} a ${endDate?.toLocaleDateString('pt-BR') || 'N/A'}. Durante este intervalo, foram registrados um total de ${formatCurrencyForPDF(totalHonorarios)} em honorários e ${formatCurrencyForPDF(totalCreditos)}, envolvendo ${totalEmpresas} empresas e ${totalJobs} jobs distintos. Os dados detalhados estão apresentados na(s) página(s) seguinte(s).`;
            doc.setFontSize(11);
            doc.setFont('helvetica', 'normal');
            doc.text(summaryText, 40, kpiTableY + 60, { maxWidth: doc.internal.pageSize.getWidth() - 80 });
    
            // --- PÁGINAS SEGUINTES: TABELA DE DADOS ---
            doc.addPage();
            doc.setFontSize(16);
            doc.setFont('helvetica', 'bold');
            doc.text('Detalhamento dos Dados', 40, 40);
    
            const head = [['Data', 'Empresa', 'Gestor', 'Job', 'Créditos', 'Honorários', 'Restituição', 'Compensação', 'Status RT', 'Aprovado RT']];
            const body = filteredData.map(item => [
                item.data.toLocaleDateString('pt-BR'),
                item.empresa,
                item.gestaoDeProjetos,
                item.job,
                formatCurrencyForPDF(item.totalDeCreditos),
                formatCurrencyForPDF(item.totalDeHonorarios),
                formatCurrencyForPDF(item.restituicao),
                formatCurrencyForPDF(item.compensacao),
                item.statusRT,
                item.aprovadoEmRT
            ]);
    
            (doc as any).autoTable({
                head,
                body,
                startY: 60,
                theme: 'grid',
                headStyles: { fillColor: [74, 63, 49] },
                styles: { fontSize: 7 },
                columnStyles: {
                    4: { halign: 'right' },
                    5: { halign: 'right' },
                    6: { halign: 'right' },
                    7: { halign: 'right' },
                }
            });
    
            doc.save(`relatorio-performance-${new Date().toISOString().split('T')[0]}.pdf`);
    
        } catch (error) {
            console.error("Erro ao exportar o relatório em PDF:", error);
        } finally {
            setIsExporting(false);
        }
    };

    const filteredData = useMemo(() => {
        if (!allData.length) return [];
    
        let dateFiltered = allData;
    
        if (startDate && endDate) {
            const start = new Date(startDate);
            start.setHours(0, 0, 0, 0);
    
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);
            
            dateFiltered = allData.filter(item => {
                const itemDate = item.data;
                return itemDate >= start && itemDate <= end;
            });
        }
    
        if (selectedResponsible === 'all') {
            return dateFiltered;
        }
    
        return dateFiltered.filter(item => item.gestaoDeProjetos === selectedResponsible);
    
    }, [allData, startDate, endDate, selectedResponsible]);
    

    const { totalHonorarios, totalCreditos, totalEmpresas, totalJobs, totalRestituicao, totalCompensacao } = useMemo(() => {
        const dataToProcess = filteredData;
        const honorarios = dataToProcess.reduce((sum, item) => sum + item.totalDeHonorarios, 0);
        const creditos = dataToProcess.reduce((sum, item) => sum + item.totalDeCreditos, 0);
        const restituicao = dataToProcess.reduce((sum, item) => sum + item.restituicao, 0);
        const compensacao = dataToProcess.reduce((sum, item) => sum + item.compensacao, 0);
        const empresas = new Set(dataToProcess.filter(item => item.empresa && item.empresa.trim() !== '').map(item => item.empresa)).size;
        const jobs = new Set(dataToProcess.filter(item => item.job && item.job.trim() !== '').map(item => item.job)).size;
        return {
            totalHonorarios: honorarios,
            totalCreditos: creditos,
            totalEmpresas: empresas,
            totalJobs: jobs,
            totalRestituicao: restituicao,
            totalCompensacao: compensacao
        };
    }, [filteredData]);

    if (loading) {
        return <div className="flex items-center justify-center h-screen"><div className="text-xl">Carregando...</div></div>;
    }

    if (error) {
        return <div className="flex items-center justify-center h-screen"><div className="text-xl text-red-500">{error}</div></div>;
    }

    return (
        <div id="dashboard-container" className="p-4 md:p-8">
            <Header 
                startDate={startDate}
                endDate={endDate}
                onStartDateChange={setStartDate}
                onEndDateChange={setEndDate}
                onPresetChange={handlePresetChange}
                responsibles={responsibles}
                selectedResponsible={selectedResponsible}
                onResponsibleChange={setSelectedResponsible}
                isExporting={isExporting}
                onExport={handleExportDashboardPDF}
            />
            <main id="dashboard-to-export" className="mt-8 space-y-6">
                <section className="grid grid-cols-1 gap-6 md:grid-cols-3 lg:grid-cols-6">
                    <StatCard title="TOTAL DE HONORÁRIO" value={formatCurrency(totalHonorarios)} />
                    <StatCard title="TOTAL DE CRÉDITOS" value={formatCurrency(totalCreditos)} />
                    <StatCard title="RESTITUIÇÃO" value={formatCurrency(totalRestituicao)} />
                    <StatCard title="COMPENSAÇÃO" value={formatCurrency(totalCompensacao)} />
                    <StatCard title="EMPRESA" value={totalEmpresas.toString()} />
                    <StatCard title="JOB" value={totalJobs.toString()} />
                </section>
                
                <hr className="border-gray-700" />

                <div className="space-y-6">
                    <TimelineChart data={filteredData} />
                    <ResponsibleChart data={filteredData} />
                    <StatusPieCharts data={filteredData} />
                    <DataTable data={filteredData} />
                </div>
            </main>
        </div>
    );
};

export default Dashboard;