import React from 'react';

interface DashboardChartProps {
  title: string;
  children: React.ReactNode;
}

const DashboardChart: React.FC<DashboardChartProps> = ({ title, children }) => {
  return (
    <div className="bg-[#2D2D2D] p-6 rounded-lg">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold text-white uppercase">{title}</h2>
        <div className="flex items-center space-x-2 text-gray-400">
           {/* Placeholder for icons like AZ sort or options */}
           <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 cursor-pointer" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4h13M3 8h9M3 12h9m-9 4h13m0-4l3 3m0 0l-3 3m3-3H3" /></svg>
           <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 cursor-pointer" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" /></svg>
        </div>
      </div>
      {children}
    </div>
  );
};

export default DashboardChart;
