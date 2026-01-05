import React, { useState, useMemo } from 'react';
import { SessionSummary } from '../../types';
import { CalendarIcon } from '../icons/Icons';
import Card from '../Card';

interface SessionHistoryProps {
  sessionHistory: SessionSummary[];
}

const SessionHistory = ({ sessionHistory }: SessionHistoryProps): React.ReactNode => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const sessionsByDate = useMemo(() => {
    return sessionHistory.reduce((acc, session) => {
      const date = session.date;
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(session);
      return acc;
    }, {} as Record<string, SessionSummary[]>);
  }, [sessionHistory]);

  const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  const startDay = startOfMonth.getDay();
  const daysInMonth = endOfMonth.getDate();

  const days = [];
  for (let i = 0; i < startDay; i++) {
    days.push(<div key={`empty-${i}`} className="p-2"></div>);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
    const hasSession = !!sessionsByDate[dateStr];
    days.push(
      <div
        key={i}
        className={`p-2 text-center rounded-full transition-colors ${
          hasSession ? 'bg-brand-secondary text-white font-bold' : 'text-brand-text-dark'
        }`}
      >
        {i}
      </div>
    );
  }

  const changeMonth = (offset: number) => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + offset, 1));
  };
  
  const currentMonthSessions = sessionHistory.filter(s => {
      const sessionDate = new Date(s.date);
      return sessionDate.getFullYear() === currentDate.getFullYear() && sessionDate.getMonth() === currentDate.getMonth();
  });


  return (
    <div className="animate-fade-in">
        <header className="mb-8">
            <h1 className="text-4xl sm:text-5xl font-extrabold text-white">Session History</h1>
            <p className="text-lg text-brand-text-dark mt-2">Review your past performance and progress.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
                 <Card title="Calendar View" icon={<CalendarIcon className="w-6 h-6"/>}>
                    <div className="flex justify-between items-center mb-4">
                        <button onClick={() => changeMonth(-1)} className="p-2 rounded-md hover:bg-gray-700" aria-label="Previous month">&lt;</button>
                        <div className="font-bold text-lg text-brand-text-light">{currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</div>
                        <button onClick={() => changeMonth(1)} className="p-2 rounded-md hover:bg-gray-700" aria-label="Next month">&gt;</button>
                    </div>
                    <div className="grid grid-cols-7 gap-2 text-sm">
                        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(day => (
                        <div key={day} className="font-semibold text-center text-gray-500">{day}</div>
                        ))}
                        {days}
                    </div>
                </Card>
            </div>
            <div className="lg:col-span-2">
                <Card title={`${currentDate.toLocaleString('default', { month: 'long' })} Sessions`}>
                    <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                        {currentMonthSessions.length > 0 ? currentMonthSessions.map(session => (
                             <div key={session.id} className="p-4 bg-brand-bg-dark/50 rounded-lg">
                                <h4 className="font-bold text-lg text-brand-text-light">Session on {new Date(session.date).toLocaleDateString()}</h4>
                                <div className="text-sm grid grid-cols-2 gap-x-4 gap-y-1 mt-2">
                                    <p>Duration: {session.durationMinutes} min</p>
                                    <p>Avg. HR: {session.avgHeartRate} bpm</p>
                                    <p>Total Reps: {session.totalReps.left} (L), {session.totalReps.right} (R)</p>
                                    <p>Avg. SpO₂: {session.avgSpo2}%</p>
                                </div>
                             </div>
                        )) : (
                            <p>No sessions recorded for this month.</p>
                        )}
                    </div>
                </Card>
            </div>
        </div>
    </div>
  );
};

export default React.memo(SessionHistory);
