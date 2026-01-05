
import React from 'react';
import { ArrowUpIcon, ArrowDownIcon, ArrowLeftIcon, ArrowRightIcon } from './icons/Icons';
import Card from './Card';
import { MotorMode, HorizontalMotorMode } from '../types';

interface MotorControlProps {
  motorStates: { 
    left: { v: MotorMode; h: HorizontalMotorMode }; 
    right: { v: MotorMode; h: HorizontalMotorMode } 
  };
  jointAngles: { 
    left: { v: number; h: number }; 
    right: { v: number; h: number } 
  };
  setVerticalMode: (limb: 'left' | 'right', mode: MotorMode) => void;
  setHorizontalMode: (limb: 'left' | 'right', mode: HorizontalMotorMode) => void;
  isSessionActive: boolean;
  maxAngle: number;
}

const DirectionButton = ({ 
  onClick, 
  active, 
  disabled, 
  icon: Icon, 
  label, 
  className = "" 
}: { 
  onClick: () => void, 
  active: boolean, 
  disabled: boolean, 
  icon: any, 
  label: string,
  className?: string
}) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`group relative flex items-center justify-center w-12 h-12 rounded-lg transition-all ${
      active 
        ? 'bg-brand-primary text-white shadow-[0_0_15px_rgba(79,70,229,0.6)] scale-105' 
        : 'bg-brand-bg-dark text-brand-text-dark border border-gray-700 hover:border-brand-primary/50'
    } ${disabled ? 'opacity-30 grayscale cursor-not-allowed' : 'active:scale-95'} ${className}`}
    aria-label={label}
  >
    <Icon className="w-6 h-6" />
    <span className="absolute -bottom-6 text-[10px] font-bold uppercase opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
      {label}
    </span>
  </button>
);

const LimbControl = React.memo(({ 
  limb, 
  name, 
  angles, 
  modes, 
  setVerticalMode, 
  setHorizontalMode, 
  isSessionActive, 
  maxAngle 
}: { 
  limb: 'left' | 'right', 
  name: string, 
  angles: { v: number; h: number }, 
  modes: { v: MotorMode; h: HorizontalMotorMode }, 
  setVerticalMode: (limb: 'left' | 'right', mode: MotorMode) => void,
  setHorizontalMode: (limb: 'left' | 'right', mode: HorizontalMotorMode) => void,
  isSessionActive: boolean, 
  maxAngle: number 
}) => {
  return (
    <div className="bg-brand-bg-dark/30 p-4 rounded-xl border border-gray-800/50 space-y-6">
      <div className="flex justify-between items-center border-b border-gray-800 pb-2">
        <h4 className="text-lg font-black text-white tracking-wider uppercase">{name}</h4>
        <div className="flex gap-2">
            <span className="text-[10px] bg-brand-bg-dark px-2 py-1 rounded border border-gray-700 font-mono text-brand-secondary">V: {angles.v.toFixed(0)}°</span>
            <span className="text-[10px] bg-brand-bg-dark px-2 py-1 rounded border border-gray-700 font-mono text-brand-secondary">H: {angles.h.toFixed(0)}°</span>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center py-6">
        {/* D-PAD UI */}
        <div className="relative grid grid-cols-3 grid-rows-3 gap-2 p-2 bg-brand-bg-dark rounded-2xl border border-gray-800 shadow-inner">
          <div />
          <DirectionButton 
            icon={ArrowUpIcon} 
            label="Up" 
            active={modes.v === 'forward'} 
            disabled={!isSessionActive || angles.v >= maxAngle} 
            onClick={() => setVerticalMode(limb, 'forward')}
          />
          <div />

          <DirectionButton 
            icon={ArrowLeftIcon} 
            label="Left" 
            active={modes.h === 'left'} 
            disabled={!isSessionActive || angles.h <= 0} 
            onClick={() => setHorizontalMode(limb, 'left')}
          />
          <div className="w-12 h-12 rounded-lg bg-gray-800/50 flex items-center justify-center">
             <div className="w-2 h-2 rounded-full bg-brand-secondary animate-pulse"></div>
          </div>
          <DirectionButton 
            icon={ArrowRightIcon} 
            label="Right" 
            active={modes.h === 'right'} 
            disabled={!isSessionActive || angles.h >= maxAngle} 
            onClick={() => setHorizontalMode(limb, 'right')}
          />

          <div />
          <DirectionButton 
            icon={ArrowDownIcon} 
            label="Down" 
            active={modes.v === 'reverse'} 
            disabled={!isSessionActive || angles.v <= 0} 
            onClick={() => setVerticalMode(limb, 'reverse')}
          />
          <div />
        </div>
      </div>

      <div className="space-y-3">
        <div className="space-y-1">
            <div className="flex justify-between text-[10px] font-bold text-gray-500 uppercase">
                <span>Vertical Alignment</span>
                <span>{((angles.v / maxAngle) * 100).toFixed(0)}%</span>
            </div>
            <div className="h-1.5 w-full bg-gray-800 rounded-full overflow-hidden">
                <div 
                    className="h-full bg-brand-primary transition-all duration-300" 
                    style={{ width: `${(angles.v / maxAngle) * 100}%` }}
                />
            </div>
        </div>
        <div className="space-y-1">
            <div className="flex justify-between text-[10px] font-bold text-gray-500 uppercase">
                <span>Horizontal Alignment</span>
                <span>{((angles.h / maxAngle) * 100).toFixed(0)}%</span>
            </div>
            <div className="h-1.5 w-full bg-gray-800 rounded-full overflow-hidden">
                <div 
                    className="h-full bg-brand-secondary transition-all duration-300" 
                    style={{ width: `${(angles.h / maxAngle) * 100}%` }}
                />
            </div>
        </div>
      </div>
    </div>
  );
});

const MotorControl = ({ 
  motorStates, 
  jointAngles, 
  setVerticalMode, 
  setHorizontalMode, 
  isSessionActive, 
  maxAngle 
}: MotorControlProps): React.ReactNode => {
  return (
    <Card title="Joint Trajectory Control">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <LimbControl 
                limb="left" 
                name="Left Arm" 
                angles={jointAngles.left} 
                modes={motorStates.left}
                setVerticalMode={setVerticalMode}
                setHorizontalMode={setHorizontalMode}
                isSessionActive={isSessionActive}
                maxAngle={maxAngle}
            />
            <LimbControl 
                limb="right" 
                name="Right Arm"
                angles={jointAngles.right}
                modes={motorStates.right}
                setVerticalMode={setVerticalMode}
                setHorizontalMode={setHorizontalMode}
                isSessionActive={isSessionActive}
                maxAngle={maxAngle}
            />
        </div>
    </Card>
  );
};

export default React.memo(MotorControl);
