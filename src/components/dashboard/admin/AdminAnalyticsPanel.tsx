import React from "react";

// --- AdminAnalyticsPanel ---
// Premium analytics zone for admin dashboard (charts, stats)

interface ChartPanelProps {
  title: string;
  children: React.ReactNode;
}

const ChartPanel: React.FC<ChartPanelProps> = ({ title, children }) => (
  <div className="glass-card p-4 flex flex-col mb-4">
    <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider mb-1">{title}</span>
    <div className="min-h-[120px] flex-1 flex items-center justify-center">{children}</div>
  </div>
);

interface AdminAnalyticsPanelProps {
  revenueChart: React.ReactNode;
  occupancyChart: React.ReactNode;
  complaintsChart: React.ReactNode;
  roomUsageChart: React.ReactNode;
  feeCollectionChart: React.ReactNode;
}

export const AdminAnalyticsPanel: React.FC<AdminAnalyticsPanelProps> = ({
  revenueChart,
  occupancyChart,
  complaintsChart,
  roomUsageChart,
  feeCollectionChart,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
      <ChartPanel title="Revenue Trends">{revenueChart}</ChartPanel>
      <ChartPanel title="Occupancy Analytics">{occupancyChart}</ChartPanel>
      <ChartPanel title="Complaints Trends">{complaintsChart}</ChartPanel>
      <ChartPanel title="Room Usage">{roomUsageChart}</ChartPanel>
      <ChartPanel title="Fee Collection Stats">{feeCollectionChart}</ChartPanel>
    </div>
  );
};
