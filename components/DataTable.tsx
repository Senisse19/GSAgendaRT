import React, { useState } from 'react';
import { DashboardData } from '../types';

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    }).format(value);
};

const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR').format(date);
}

const ITEMS_PER_PAGE = 10;

const DataTable: React.FC<{ data: DashboardData[] }> = ({ data }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const totalPages = Math.ceil(data.length / ITEMS_PER_PAGE);

    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const paginatedData = data.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    const goToNextPage = () => {
        setCurrentPage((page) => Math.min(page + 1, totalPages));
    };

    const goToPrevPage = () => {
        setCurrentPage((page) => Math.max(page - 1, 1));
    };

    return (
        <div className="bg-[#2D2D2D] p-6 rounded-lg">
            <div className="flex justify-between items-center mb-4">
                 <h2 className="text-lg font-bold text-white uppercase">Tabela de Dashboard AGENDA RT</h2>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs text-gray-300 uppercase bg-[#4A3F31]">
                        <tr>
                            <th scope="col" className="px-6 py-3">DATA</th>
                            <th scope="col" className="px-6 py-3">EMPRESA</th>
                            <th scope="col" className="px-6 py-3">Gestão de Projetos</th>
                            <th scope="col" className="px-6 py-3">JOB</th>
                            <th scope="col" className="px-6 py-3 text-right">TOTAL DE CRÉDITOS</th>
                            <th scope="col" className="px-6 py-3 text-right">TOTAL DE HONORÁRIOS</th>
                            <th scope="col" className="px-6 py-3 text-right">RESTITUIÇÃO</th>
                            <th scope="col" className="px-6 py-3 text-right">COMPENSAÇÃO</th>
                            <th scope="col" className="px-6 py-3">STATUS RT</th>
                            <th scope="col" className="px-6 py-3">APROVADO EM RT</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedData.map((item, index) => (
                            <tr key={`${item.job}-${index}`} className="border-b border-gray-700 hover:bg-gray-600">
                                <td className="px-6 py-4">{formatDate(item.data)}</td>
                                <td className="px-6 py-4">{item.empresa}</td>
                                <td className="px-6 py-4">{item.gestaoDeProjetos}</td>
                                <td className="px-6 py-4">{item.job}</td>
                                <td className="px-6 py-4 text-right">{formatCurrency(item.totalDeCreditos)}</td>
                                <td className="px-6 py-4 text-right">{formatCurrency(item.totalDeHonorarios)}</td>
                                <td className="px-6 py-4 text-right">{formatCurrency(item.restituicao)}</td>
                                <td className="px-6 py-4 text-right">{formatCurrency(item.compensacao)}</td>
                                <td className="px-6 py-4">{item.statusRT}</td>
                                <td className="px-6 py-4">{item.aprovadoEmRT}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="flex justify-between items-center pt-4 text-gray-400">
                <span>
                    Página {currentPage} de {totalPages}
                </span>
                <div className="flex items-center space-x-2">
                    <button onClick={goToPrevPage} disabled={currentPage === 1} className="px-3 py-1 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600">
                        &lt;
                    </button>
                    <span className="text-sm">
                        {startIndex + 1}-{Math.min(startIndex + ITEMS_PER_PAGE, data.length)} de {data.length}
                    </span>
                    <button onClick={goToNextPage} disabled={currentPage === totalPages} className="px-3 py-1 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600">
                        &gt;
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DataTable;