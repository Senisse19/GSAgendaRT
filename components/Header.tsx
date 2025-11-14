import React, { useState } from 'react';

interface HeaderProps {
  startDate: Date | null;
  endDate: Date | null;
  onStartDateChange: (date: Date) => void;
  onEndDateChange: (date: Date) => void;
  onPresetChange: (preset: 'last7' | 'last30' | 'thisMonth' | 'allTime') => void;
  responsibles: string[];
  selectedResponsible: string;
  onResponsibleChange: (responsible: string) => void;
  isExporting: boolean;
  onExport: () => void;
}

const formatDateForDisplay = (date: Date | null): string => {
  if (!date) return '...';
  // "1 de nov. de 2025" format
  return date.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short', year: 'numeric' })
    .replace(' de', '').replace('.', '');
}

// Format date to YYYY-MM-DD for input[type=date]
const formatDateForInput = (date: Date | null): string => {
  if (!date) return '';
  return date.toISOString().split('T')[0];
}

const Header: React.FC<HeaderProps> = ({ 
  startDate, endDate, onStartDateChange, onEndDateChange, onPresetChange,
  responsibles, selectedResponsible, onResponsibleChange, isExporting, onExport
}) => {
  const [isDateOpen, setIsDateOpen] = useState(false);

  const handleStartDate = (e: React.ChangeEvent<HTMLInputElement>) => {
    // The value from input type=date is YYYY-MM-DD.
    // To avoid timezone issues, we add T00:00:00 to specify time in the local timezone.
    const date = new Date(`${e.target.value}T00:00:00`);
    onStartDateChange(date);
  };

  const handleEndDate = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = new Date(`${e.target.value}T00:00:00`);
    onEndDateChange(date);
  };

  const handlePresetClick = (preset: 'last7' | 'last30' | 'thisMonth' | 'allTime') => {
    onPresetChange(preset);
    setIsDateOpen(false);
  };

  return (
    <header className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
      <h1 className="text-4xl font-light text-gray-400">
        GRUPO <span className="font-semibold text-[#C8A464]">STUDIO</span>
      </h1>
      <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4">
        
        <button 
            id="export-button"
            onClick={onExport}
            disabled={isExporting}
            className="bg-[#4A3F31] text-white px-4 py-2 rounded-md hover:bg-[#5a4f41] transition-colors disabled:opacity-50 disabled:cursor-wait"
        >
            {isExporting ? 'Exportando...' : 'Exportar Relatório (PDF)'}
        </button>

        {/* Responsible Filter */}
        <div className="relative">
          <select
            value={selectedResponsible}
            onChange={(e) => onResponsibleChange(e.target.value)}
            className="bg-[#4A3F31] text-white px-4 py-2 rounded-md appearance-none cursor-pointer w-full sm:w-auto min-w-[220px]"
            style={{ paddingRight: '2.5rem' }}
          >
            <option value="all">Todos os Responsáveis</option>
            {responsibles.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-white">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </div>
        </div>

        {/* Date Filter */}
        <div className="relative">
          <div 
            className="bg-[#4A3F31] text-white px-4 py-2 rounded-md flex items-center cursor-pointer min-w-[280px] justify-between"
            onClick={() => setIsDateOpen(!isDateOpen)}
          >
            <span>{formatDateForDisplay(startDate)} - {formatDateForDisplay(endDate)}</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2 transition-transform" style={{ transform: isDateOpen ? 'rotate(180deg)' : 'rotate(0deg)' }} viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </div>
          {isDateOpen && (
            <div className="absolute top-full right-0 mt-2 bg-[#2D2D2D] p-4 rounded-lg shadow-lg z-10 w-full border border-gray-700">
              <div className="grid grid-cols-2 gap-2 mb-4">
                  <button onClick={() => handlePresetClick('last7')} className="text-sm bg-[#4A3F31] text-white px-3 py-1.5 rounded-md hover:bg-[#5a4f41] transition-colors">Últimos 7 dias</button>
                  <button onClick={() => handlePresetClick('last30')} className="text-sm bg-[#4A3F31] text-white px-3 py-1.5 rounded-md hover:bg-[#5a4f41] transition-colors">Últimos 30 dias</button>
                  <button onClick={() => handlePresetClick('thisMonth')} className="text-sm bg-[#4A3F31] text-white px-3 py-1.5 rounded-md hover:bg-[#5a4f41] transition-colors">Este Mês</button>
                  <button onClick={() => handlePresetClick('allTime')} className="text-sm bg-[#4A3F31] text-white px-3 py-1.5 rounded-md hover:bg-[#5a4f41] transition-colors">Todo o período</button>
              </div>
              <hr className="border-gray-600 mb-4" />
              <div className="space-y-4">
                  <div>
                      <p className="block text-sm text-gray-400 mb-2">Ou selecione um período personalizado:</p>
                  </div>
                <div>
                  <label htmlFor="startDate" className="block text-sm font-medium text-gray-300 mb-1">Data de Início</label>
                  <input 
                    type="date"
                    id="startDate"
                    name="startDate"
                    value={formatDateForInput(startDate)}
                    onChange={handleStartDate}
                    className="w-full bg-[#4A3F31] text-white px-3 py-2 rounded-md border border-gray-600 focus:outline-none focus:ring-1 focus:ring-[#C8A464] [color-scheme:dark]"
                  />
                </div>
                <div>
                  <label htmlFor="endDate" className="block text-sm font-medium text-gray-300 mb-1">Data de Fim</label>
                  <input 
                    type="date"
                    id="endDate"
                    name="endDate"
                    value={formatDateForInput(endDate)}
                    onChange={handleEndDate}
                    className="w-full bg-[#4A3F31] text-white px-3 py-2 rounded-md border border-gray-600 focus:outline-none focus:ring-1 focus:ring-[#C8A464] [color-scheme:dark]"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;