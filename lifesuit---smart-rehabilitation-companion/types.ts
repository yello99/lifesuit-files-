
import React from 'react';

export type MotorMode = 'off' | 'forward' | 'reverse';
export type HorizontalMotorMode = 'off' | 'left' | 'right';

export interface HealthDataPoint {
  time: number;
  heartRate: number;
  spo2: number;
  temperature: number;
}

export interface SessionSummary {
  id: string;
  date: string;
  durationMinutes: number;
  totalReps: {
    left: number;
    right: number;
  };
  avgHeartRate: number;
  avgSpo2: number;
  videoUrl?: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  unlocked: boolean;
  icon: React.ReactElement<{ className?: string }>;
}

export interface LimbState {
  verticalMode: MotorMode;
  horizontalMode: HorizontalMotorMode;
  verticalAngle: number;
  horizontalAngle: number;
  reps: number;
  horizontalReps: number;
  repState: 'flexing' | 'extending';
  hRepState: 'moving-left' | 'moving-right';
}

export interface TimedRehabConfig {
  startTime: string; // "HH:mm"
  endTime: string;   // "HH:mm"
  isActive: boolean;
}
