import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { HealthDataPoint } from '../types';
import { HeartIcon, OxygenIcon, TempIcon } from './icons/Icons';
import Card from './Card';

interface HealthMonitorProps {
  latestData: HealthDataPoint | null;
  history: HealthDataPoint[];
}

const VitalDisplay = React.memo(({ icon, label, value, unit, colorClass }: { icon: React.ReactNode, label: string, value: number | string, unit: string, colorClass: string }) => (
  <div className="flex items-center space-x-3 p-3 bg-brand-bg-dark/50 rounded-lg">
    <div className={colorClass}>{icon}</div>
    <div>
      <div className="text-sm text-brand-text-dark">{label}</div>
      <div className="text-2xl font-bold text-white">
        {value} <span className="text-base font-normal">{unit}</span>
      </div>
    </div>
  </div>
));

const HealthMonitor = ({ latestData, history }: HealthMonitorProps): React.ReactNode => {

  return (
    <Card title="Real-Time Vitals" icon={<HeartIcon className="w-6 h-6"/>}>
      <div className="relative">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <VitalDisplay icon={<HeartIcon className="w-8 h-8"/>} label="Heart Rate" value={latestData?.heartRate.toFixed(0) ?? '--'} unit="bpm" colorClass="text-brand-warn" />
          <VitalDisplay icon={<OxygenIcon className="w-8 h-8"/>} label="SpO₂" value={latestData?.spo2.toFixed(0) ?? '--'} unit="%" colorClass="text-blue-400" />
          <VitalDisplay icon={<TempIcon className="w-8 h-8"/>} label="Temperature" value={latestData?.temperature.toFixed(1) ?? '--'} unit="°C" colorClass="text-green-400" />
        </div>
        <div className="h-64 mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={history} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="time" tickFormatter={(time) => new Date(time).toLocaleTimeString()} stroke="#9CA3AF" fontSize={12} />
              <YAxis yAxisId="left" stroke="#9CA3AF" fontSize={12} />
              <YAxis yAxisId="right" orientation="right" stroke="#9CA3AF" fontSize={12} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '0.5rem' }}
                labelStyle={{ color: '#F3F4F6' }}
              />
              <Legend />
              <Line yAxisId="left" type="monotone" dataKey="heartRate" name="HR" stroke="#EF4444" strokeWidth={2} dot={false} />
              <Line yAxisId="right" type="monotone" dataKey="spo2" name="SpO2" stroke="#3B82F6" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Card>
  );
};

export default React.memo(HealthMonitor);