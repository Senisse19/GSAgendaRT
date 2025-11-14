import React from 'react';

interface StatCardProps {
  title: string;
  value: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value }) => {
  return (
    <div className="bg-[#2D2D2D] px-2 py-4 rounded-lg text-center flex flex-col justify-center min-h-[100px] overflow-hidden">
      <h3 className="text-gray-400 uppercase tracking-wider whitespace-nowrap text-xs md:text-sm lg:text-xs">
        {title}
      </h3>
      <p className="font-bold mt-2 text-white whitespace-nowrap text-lg md:text-2xl lg:text-base xl:text-lg 2xl:text-xl">
        {value}
      </p>
    </div>
  );
};

export default StatCard;