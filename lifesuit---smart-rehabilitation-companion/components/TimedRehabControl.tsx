
import React from 'react';
import Card from './Card';
import { HistoryIcon } from './icons/FeatureIcons';
import { TimedRehabConfig } from '../types';
import { SequenceStep } from '../hooks/useMockHardware';

interface TimedRehabControlProps {
  config: TimedRehabConfig;
  setConfig: React.Dispatch<React.SetStateAction<TimedRehabConfig>>;
  isSessionActive: boolean;
  currentAngles: { v: number; h: number };
  maxAngle: number;
  sequenceStep: SequenceStep;
  reps: { v: number; h: number; total: number };
  isWaiting: boolean;
  waitProgress: number;
}

const TimedRehabControl = ({ 
  config, 
  setConfig, 
  isSessionActive, 
  currentAngles, 
  maxAngle, 
  sequenceStep, 
  reps,
  isWaiting,
  waitProgress
}: TimedRehabControlProps) => {
  const handleToggle = () => {
    setConfig(prev => ({ ...prev, isActive: !prev.isActive }));
  };

  const updateStartTime = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfig(prev => ({ ...prev, startTime: e.target.value }));
  };

  const updateEndTime = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfig(prev => ({ ...prev, endTime: e.target.value }));
  };

  const now = new Date();
  const currentTimeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
  const isCurrentlyRunning = config.isActive && isSessionActive && currentTimeStr >= config.startTime && currentTimeStr < config.endTime;

  // Calculate dot position on 100x100 grid
  const dotX = (currentAngles.h / maxAngle) * 100;
  const dotY = 100 - (currentAngles.v / maxAngle) * 100;

  // Sequence Progress (1 to 4)
  const sequenceOrder: SequenceStep[] = ['up', 'down', 'left', 'right'];
  const currentStepIndex = sequenceOrder.indexOf(sequenceStep);
  const sequenceProgressPercent = ((currentStepIndex + (isWaiting ? 0.5 : 0)) / sequenceOrder.length) * 100;

  return (
    <Card title="Time Set Rehab" icon={<HistoryIcon className="w-6 h-6" />}>
      <div className="space-y-6">
        <p className="text-xs text-brand-text-dark">
          Multi-axis automation sequence. Each motor runs for 10s with a 5s cooling delay.
        </p>

        {/* Live Spatial Tracker with Rep HUD */}
        <div className="relative group">
          <div className="aspect-square w-full bg-brand-bg-dark border border-gray-800 rounded-xl relative overflow-hidden shadow-inner">
            {/* Grid Lines */}
            <div className="absolute inset-0 grid grid-cols-4 grid-rows-4 pointer-events-none opacity-20">
              {[...Array(16)].map((_, i) => (
                <div key={i} className="border-[0.5px] border-gray-600" />
              ))}
            </div>

            {/* Rep HUD Overlays */}
            <div className="absolute top-3 left-3 flex flex-col gap-1 z-20">
               <div className="bg-black/60 backdrop-blur-sm border border-brand-primary/30 px-2 py-1 rounded text-[9px] font-black uppercase tracking-widest flex items-center gap-2">
                  <span className="text-brand-text-dark">V-Axis Reps</span>
                  <span className="text-brand-primary text-sm">{reps.v}</span>
               </div>
               <div className="bg-black/60 backdrop-blur-sm border border-brand-secondary/30 px-2 py-1 rounded text-[9px] font-black uppercase tracking-widest flex items-center gap-2">
                  <span className="text-brand-text-dark">H-Axis Reps</span>
                  <span className="text-brand-secondary text-sm">{reps.h}</span>
               </div>
            </div>

            <div className="absolute top-3 right-3 z-20">
               <div className="bg-brand-accent/20 border border-brand-accent/50 px-3 py-1 rounded-full text-[10px] font-black text-brand-accent tracking-tighter">
                  TOTAL: {reps.total}
               </div>
            </div>

            {/* Sequence Phase Overlays */}
            <div className="absolute inset-x-0 top-12 flex justify-center">
              <span className={`text-[9px] font-black tracking-widest transition-all ${isCurrentlyRunning && !isWaiting && sequenceStep === 'up' ? 'text-brand-secondary scale-110 drop-shadow-[0_0_8px_rgba(20,184,166,0.6)]' : 'text-gray-700'}`}>
                UP {isCurrentlyRunning && sequenceStep === 'up' && !isWaiting && '▲'}
              </span>
            </div>
            <div className="absolute inset-x-0 bottom-12 flex justify-center">
              <span className={`text-[9px] font-black tracking-widest transition-all ${isCurrentlyRunning && !isWaiting && sequenceStep === 'down' ? 'text-brand-secondary scale-110 drop-shadow-[0_0_8px_rgba(20,184,166,0.6)]' : 'text-gray-700'}`}>
                DOWN {isCurrentlyRunning && sequenceStep === 'down' && !isWaiting && '▼'}
              </span>
            </div>
            <div className="absolute inset-y-0 left-12 flex flex-col justify-center">
              <span className={`text-[9px] font-black tracking-widest transition-all [writing-mode:vertical-lr] rotate-180 ${isCurrentlyRunning && !isWaiting && sequenceStep === 'left' ? 'text-brand-secondary scale-110 drop-shadow-[0_0_8px_rgba(20,184,166,0.6)]' : 'text-gray-700'}`}>
                LEFT {isCurrentlyRunning && sequenceStep === 'left' && !isWaiting && '◀'}
              </span>
            </div>
            <div className="absolute inset-y-0 right-12 flex flex-col justify-center">
              <span className={`text-[9px] font-black tracking-widest transition-all [writing-mode:vertical-lr] ${isCurrentlyRunning && !isWaiting && sequenceStep === 'right' ? 'text-brand-secondary scale-110 drop-shadow-[0_0_8px_rgba(20,184,166,0.6)]' : 'text-gray-700'}`}>
                RIGHT {isCurrentlyRunning && sequenceStep === 'right' && !isWaiting && '▶'}
              </span>
            </div>

            {/* Current Phase Timer UI */}
            {isCurrentlyRunning && (
              <div className="absolute bottom-10 left-0 right-0 flex flex-col items-center gap-1">
                 <div className="text-[8px] font-bold text-gray-500 uppercase tracking-widest">Phase Time</div>
                 <div className="w-24 h-1 bg-gray-800 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-100 ${isWaiting ? 'bg-brand-accent' : 'bg-brand-secondary'}`}
                      style={{ width: `${waitProgress * 100}%` }}
                    ></div>
                 </div>
              </div>
            )}

            {/* Waiting/Pause Overlay */}
            {isCurrentlyRunning && isWaiting && (
              <div className="absolute inset-0 bg-brand-bg-dark/70 backdrop-blur-[2px] z-30 flex flex-col items-center justify-center p-6 text-center">
                <div className="text-brand-accent text-[10px] font-black uppercase tracking-[0.2em] mb-2 animate-pulse">Stabilizing...</div>
                <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden max-w-[120px]">
                  <div 
                    className="h-full bg-brand-accent transition-all duration-300"
                    style={{ width: `${waitProgress * 100}%` }}
                  ></div>
                </div>
                <div className="text-[9px] text-brand-text-dark mt-2 font-mono">NEXT PHASE: {sequenceStep.toUpperCase()}</div>
              </div>
            )}

            {/* Tracking Dot */}
            <div 
              className={`absolute w-4 h-4 rounded-full transition-all duration-300 ease-out z-10 flex items-center justify-center ${isCurrentlyRunning && !isWaiting ? 'bg-brand-secondary shadow-[0_0_20px_rgba(20,184,166,1)]' : 'bg-gray-600 shadow-[0_0_5px_rgba(0,0,0,0.5)]'}`}
              style={{ left: `${dotX}%`, top: `${dotY}%`, transform: 'translate(-50%, -50%)' }}
            >
               <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
            </div>
            
            <div className="absolute bottom-2 right-3 text-[8px] text-gray-500 font-mono tracking-tighter">
              COORDS: {currentAngles.h.toFixed(0)}H / {currentAngles.v.toFixed(0)}V
            </div>
          </div>
        </div>

        {/* Sequence Progress Tracking */}
        <div className="space-y-2">
            <div className="flex justify-between items-end">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Overall Sequence Progress</span>
                <span className="text-[10px] font-mono text-brand-secondary">{Math.round(sequenceProgressPercent)}%</span>
            </div>
            <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-brand-secondary transition-all duration-500 ease-in-out"
                  style={{ width: `${sequenceProgressPercent}%` }}
                ></div>
            </div>
            <div className="flex justify-between text-[8px] text-gray-600 font-black uppercase px-0.5">
                <span className={sequenceStep === 'up' ? (isWaiting ? 'text-brand-text-dark' : 'text-brand-secondary') : ''}>Up</span>
                <span className={sequenceStep === 'down' ? (isWaiting ? 'text-brand-text-dark' : 'text-brand-secondary') : ''}>Down</span>
                <span className={sequenceStep === 'left' ? (isWaiting ? 'text-brand-text-dark' : 'text-brand-secondary') : ''}>Left</span>
                <span className={sequenceStep === 'right' ? (isWaiting ? 'text-brand-text-dark' : 'text-brand-secondary') : ''}>Right</span>
            </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-500 uppercase">Start Time</label>
            <input 
              type="time" 
              value={config.startTime}
              onChange={updateStartTime}
              disabled={config.isActive}
              className="w-full bg-brand-bg-dark border border-gray-700 rounded p-2 text-brand-text-light focus:outline-none focus:border-brand-primary disabled:opacity-50"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-500 uppercase">End Time</label>
            <input 
              type="time" 
              value={config.endTime}
              onChange={updateEndTime}
              disabled={config.isActive}
              className="w-full bg-brand-bg-dark border border-gray-700 rounded p-2 text-brand-text-light focus:outline-none focus:border-brand-primary disabled:opacity-50"
            />
          </div>
        </div>

        <button
          onClick={handleToggle}
          disabled={!isSessionActive}
          className={`w-full font-black text-sm tracking-widest py-3 px-4 rounded-lg transition-all duration-300 transform active:scale-95 ${
            config.isActive 
              ? 'bg-brand-warn text-white shadow-lg' 
              : 'bg-brand-secondary text-white shadow-lg hover:brightness-110'
          } ${!isSessionActive ? 'opacity-40 cursor-not-allowed' : ''}`}
        >
          {config.isActive ? 'ABORT PROGRAM' : 'ENGAGE PROGRAM'}
        </button>

        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <div className={`w-2.5 h-2.5 rounded-full ${isCurrentlyRunning ? 'bg-brand-secondary animate-pulse shadow-[0_0_5px_rgba(20,184,166,0.8)]' : 'bg-gray-600'}`}></div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              {isCurrentlyRunning ? (isWaiting ? 'COOLING DELAY...' : `Phase: ${sequenceStep.toUpperCase()}`) : (config.isActive ? 'Standby Mode' : 'System Idle')}
            </span>
          </div>
          {isCurrentlyRunning && (
            <div className="flex items-center gap-1">
               <div className="w-1 h-1 bg-brand-secondary rounded-full animate-ping"></div>
               <span className="text-[10px] font-black text-brand-secondary">ACTIVE</span>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default React.memo(TimedRehabControl);
