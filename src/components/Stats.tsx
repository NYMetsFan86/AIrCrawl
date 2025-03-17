"use client"

// components/Stats.tsx
import React from 'react';
import { Card } from '@/components/ui/card';

interface StatsProps {
  totalMembers?: number;
  memberGrowth?: number;
  activeCrawls?: number;
  completedCrawls?: number;
  totalDataPoints?: string;
  dataGrowth?: number;
}

const Stats: React.FC<StatsProps> = ({
  totalMembers = 1234,
  memberGrowth = 25,
  activeCrawls = 42,
  completedCrawls = 18,
  totalDataPoints = '2.4M',
  dataGrowth = 573,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <StatCard
        title="Total Members"
        value={totalMembers.toLocaleString()}
        changeText={`+${memberGrowth} from last month`}
        isPositive={true}
      />
      
      <StatCard
        title="Active Crawls"
        value={activeCrawls.toString()}
        changeText={`${completedCrawls} completed this week`}
        isPositive={true}
      />
      
      <StatCard
        title="Total Data Points"
        value={totalDataPoints}
        changeText={`+${dataGrowth} this week`}
        isPositive={true}
      />
    </div>
  );
};

interface StatCardProps {
  title: string;
  value: string;
  changeText: string;
  isPositive: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, changeText, isPositive }) => {
  return (
    <Card className="p-6">
      <h3 className="text-sm font-medium text-[#3f383b]">{title}</h3>
      <p className="mt-2 text-3xl font-semibold text-black">{value}</p>
      <p className={`mt-1 text-sm ${isPositive ? 'text-[#860808]' : 'text-red-600'}`}>
        {changeText}
      </p>
    </Card>
  );
};

export default Stats;