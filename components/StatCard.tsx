import React from 'react';

interface StatCardProps {
  title: string;
  value: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value }) => {
  return (
    <div className="bg-[#2D2D2D] p-4 rounded-lg text-center flex flex-col justify-center min-h-[100px]">
      <h3 className="text-xs md:text-sm text-gray-400 uppercase tracking-wider">{title}</h3>
      <p className="text-lg md:text-xl lg:text-2xl font-bold mt-2 text-white whitespace-nowrap">{value}</p>
    </div>
  );
};

export default StatCard;