
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { HealthDataPoint, SessionSummary, Achievement, LimbState, MotorMode, HorizontalMotorMode, TimedRehabConfig } from '../types';
import { initialAchievements } from '../components/views/Achievements';

const MAX_ANGLE = 110;
const PHASE_DELAY_MS = 5000;
const PHASE_ACTIVE_DURATION_MS = 10000;

export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';
export type SequenceStep = 'up' | 'down' | 'left' | 'right';

const triggerHaptic = (pattern: VibratePattern) => {
  if (window.navigator && window.navigator.vibrate) {
    window.navigator.vibrate(pattern);
  }
};

const getInitialLimbState = (): { left: LimbState, right: LimbState } => ({
  left: {
    verticalMode: 'off',
    horizontalMode: 'off',
    verticalAngle: 0,
    horizontalAngle: 55,
    reps: 0,
    horizontalReps: 0,
    repState: 'extending',
    hRepState: 'moving-left',
  },
  right: {
    verticalMode: 'off',
    horizontalMode: 'off',
    verticalAngle: 0,
    horizontalAngle: 55,
    reps: 0,
    horizontalReps: 0,
    repState: 'extending',
    hRepState: 'moving-left',
  },
});

export const useHardwareConnection = () => {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected');
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [healthDataHistory, setHealthDataHistory] = useState<HealthDataPoint[]>([]);
  const [latestHealthData, setLatestHealthData] = useState<HealthDataPoint | null>(null);
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  const [sessionHistory, setSessionHistory] = useState<SessionSummary[]>([]);
  const [lastSessionSummary, setLastSessionSummary] = useState<SessionSummary | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>(initialAchievements);
  const [sessionVideoUrl, setSessionVideoUrl] = useState<string | undefined>(undefined);
  const [limbs, setLimbs] = useState(getInitialLimbState());
  const [timedRehab, setTimedRehab] = useState<TimedRehabConfig>({ startTime: '00:00', endTime: '23:59', isActive: false });
  
  const sequenceStepRef = useRef<SequenceStep>('up');
  const [sequenceStep, setSequenceStepState] = useState<SequenceStep>('up');
  
  const isWaitingRef = useRef<boolean>(false);
  const [isWaiting, setIsWaitingState] = useState<boolean>(false);
  const phaseStartTimeRef = useRef<number>(0);
  const [phaseProgress, setPhaseProgress] = useState<number>(0);

  const animationFrameId = useRef<number | null>(null);
  const lastHealthUpdateRef = useRef<number>(0);

  // Derived state for the UI
  const jointAngles = { 
    left: { v: limbs.left.verticalAngle, h: limbs.left.horizontalAngle }, 
    right: { v: limbs.right.verticalAngle, h: limbs.right.horizontalAngle } 
  };
  const reps = { 
    left: limbs.left.reps + limbs.left.horizontalReps, 
    right: limbs.right.reps + limbs.right.horizontalReps,
    vLeft: limbs.left.reps,
    vRight: limbs.right.reps,
    hLeft: limbs.left.horizontalReps,
    hRight: limbs.right.horizontalReps
  };
  const motorStates = { 
    left: { v: limbs.left.verticalMode, h: limbs.left.horizontalMode }, 
    right: { v: limbs.right.verticalMode, h: limbs.right.horizontalMode } 
  };

  const runSimulation = useCallback((timestamp: number) => {
    if (!isSessionActive) return;

    setLimbs(prevLimbs => {
      const nextLimbs = {
        left: { ...prevLimbs.left },
        right: { ...prevLimbs.right }
      };
      
      const speed = 0.4; // Slower speed to fill 10s duration better
      
      if (timedRehab.isActive) {
        const now = new Date();
        const currentTimeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
        
        if (currentTimeStr >= timedRehab.startTime && currentTimeStr < timedRehab.endTime) {
          const elapsed = Date.now() - phaseStartTimeRef.current;

          if (isWaitingRef.current) {
            // Pause Phase (5s)
            const progress = Math.min(1, elapsed / PHASE_DELAY_MS);
            setPhaseProgress(progress);
            
            nextLimbs.left.verticalMode = 'off';
            nextLimbs.left.horizontalMode = 'off';
            nextLimbs.right.verticalMode = 'off';
            nextLimbs.right.horizontalMode = 'off';

            if (elapsed >= PHASE_DELAY_MS) {
              isWaitingRef.current = false;
              setIsWaitingState(false);
              phaseStartTimeRef.current = Date.now();
              setPhaseProgress(0);
            }
          } else {
            // Active Phase (10s)
            const progress = Math.min(1, elapsed / PHASE_ACTIVE_DURATION_MS);
            setPhaseProgress(progress);

            const l = nextLimbs.left;
            if (sequenceStepRef.current === 'up') {
              l.verticalMode = 'forward';
              l.horizontalMode = 'off';
            } else if (sequenceStepRef.current === 'down') {
              l.verticalMode = 'reverse';
              l.horizontalMode = 'off';
            } else if (sequenceStepRef.current === 'left') {
              l.verticalMode = 'off';
              l.horizontalMode = 'left';
            } else if (sequenceStepRef.current === 'right') {
              l.verticalMode = 'off';
              l.horizontalMode = 'right';
            }

            // Phase transition after 10 seconds
            if (elapsed >= PHASE_ACTIVE_DURATION_MS) {
              const sequenceOrder: SequenceStep[] = ['up', 'down', 'left', 'right'];
              const currentIndex = sequenceOrder.indexOf(sequenceStepRef.current);
              const nextIndex = (currentIndex + 1) % sequenceOrder.length;
              
              sequenceStepRef.current = sequenceOrder[nextIndex];
              setSequenceStepState(sequenceOrder[nextIndex]);
              
              isWaitingRef.current = true;
              setIsWaitingState(true);
              phaseStartTimeRef.current = Date.now();
              setPhaseProgress(0);
            }

            nextLimbs.right.verticalMode = l.verticalMode;
            nextLimbs.right.horizontalMode = l.horizontalMode;
          }
        } else if (currentTimeStr >= timedRehab.endTime) {
           setTimedRehab(prev => ({ ...prev, isActive: false }));
        }
      }

      const processLimbMotion = (limb: LimbState) => {
        if (limb.verticalMode === 'forward' && limb.verticalAngle < MAX_ANGLE) limb.verticalAngle += speed;
        else if (limb.verticalMode === 'reverse' && limb.verticalAngle > 0) limb.verticalAngle -= speed;

        if (limb.horizontalMode === 'left' && limb.horizontalAngle > 0) limb.horizontalAngle -= speed;
        else if (limb.horizontalMode === 'right' && limb.horizontalAngle < MAX_ANGLE) limb.horizontalAngle += speed;

        limb.verticalAngle = Math.max(0, Math.min(MAX_ANGLE, limb.verticalAngle));
        limb.horizontalAngle = Math.max(0, Math.min(MAX_ANGLE, limb.horizontalAngle));
        
        if (!timedRehab.isActive) {
          if ((limb.verticalAngle >= MAX_ANGLE || limb.verticalAngle <= 0) && limb.verticalMode !== 'off') limb.verticalMode = 'off';
          if ((limb.horizontalAngle >= MAX_ANGLE || limb.horizontalAngle <= 0) && limb.horizontalMode !== 'off') limb.horizontalMode = 'off';
        }

        if (limb.repState === 'extending' && limb.verticalAngle >= MAX_ANGLE * 0.95) limb.repState = 'flexing';
        else if (limb.repState === 'flexing' && limb.verticalAngle <= 5) {
          limb.repState = 'extending';
          limb.reps += 1;
          triggerHaptic([100, 50, 100]);
        }

        if (limb.hRepState === 'moving-left' && limb.horizontalAngle <= 5) limb.hRepState = 'moving-right';
        else if (limb.hRepState === 'moving-right' && limb.horizontalAngle >= MAX_ANGLE * 0.95) {
          limb.hRepState = 'moving-left';
          limb.horizontalReps += 1;
          triggerHaptic([100, 50, 100]);
        }
        return limb;
      };

      nextLimbs.left = processLimbMotion(nextLimbs.left);
      nextLimbs.right = processLimbMotion(nextLimbs.right);
      return nextLimbs;
    });

    if (timestamp - lastHealthUpdateRef.current > 1000) {
      const now = Date.now();
      const active = motorStates.left.v !== 'off' || motorStates.left.h !== 'off' || motorStates.right.v !== 'off' || motorStates.right.h !== 'off';
      const newPoint: HealthDataPoint = {
        time: now,
        heartRate: 80 + Math.random() * 10 + (active ? 10 : 0),
        spo2: 98 + Math.random() * 2,
        temperature: 36.5 + Math.random() * 0.5,
      };
      setHealthDataHistory(prev => [...prev.slice(-59), newPoint]);
      setLatestHealthData(newPoint);
      lastHealthUpdateRef.current = timestamp;
    }

    animationFrameId.current = requestAnimationFrame(runSimulation);
  }, [isSessionActive, timedRehab, motorStates.left.v, motorStates.left.h, motorStates.right.v, motorStates.right.h]);

  useEffect(() => {
    if (isSessionActive && connectionStatus === 'connected') {
      phaseStartTimeRef.current = Date.now();
      animationFrameId.current = requestAnimationFrame(runSimulation);
    } else {
      if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
    }
    return () => {
      if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
    };
  }, [isSessionActive, connectionStatus, runSimulation]);

  const endSession = useCallback(() => {
    if (!isSessionActive) return;
    setIsSessionActive(false);
    if (sessionStartTime) {
      const summary: SessionSummary = {
        id: new Date().toISOString(),
        date: new Date().toISOString().split('T')[0],
        durationMinutes: Math.max(1, Math.round((new Date().getTime() - sessionStartTime.getTime()) / 60000)),
        totalReps: { left: reps.left, right: reps.right },
        avgHeartRate: latestHealthData?.heartRate || 0,
        avgSpo2: latestHealthData?.spo2 || 0,
        videoUrl: sessionVideoUrl,
      };
      setLastSessionSummary(summary);
      setSessionHistory(prev => [summary, ...prev]);
    }
    setLimbs(getInitialLimbState());
    setSessionStartTime(null);
    setTimedRehab(prev => ({ ...prev, isActive: false }));
    sequenceStepRef.current = 'up';
    setSequenceStepState('up');
    isWaitingRef.current = false;
    setIsWaitingState(false);
    setPhaseProgress(0);
  }, [isSessionActive, sessionStartTime, latestHealthData, sessionVideoUrl, reps.left, reps.right]);

  const connect = useCallback(() => {
    setConnectionStatus('connecting');
    setTimeout(() => setConnectionStatus('connected'), 500);
  }, []);

  const disconnect = useCallback(() => {
    if (isSessionActive) endSession();
    setConnectionStatus('disconnected');
  }, [isSessionActive, endSession]);

  const startSession = useCallback(() => {
    if (connectionStatus !== 'connected') return;
    setIsSessionActive(true);
    setHealthDataHistory([]);
    setLatestHealthData(null);
    setLimbs(getInitialLimbState());
    setSessionStartTime(new Date());
    setLastSessionSummary(null);
    sequenceStepRef.current = 'up';
    setSequenceStepState('up');
    isWaitingRef.current = false;
    setIsWaitingState(false);
    phaseStartTimeRef.current = Date.now();
  }, [connectionStatus]);

  const setVerticalMode = useCallback((limb: 'left' | 'right', mode: MotorMode) => {
    if (!isSessionActive || timedRehab.isActive) return;
    setLimbs(prev => ({
      ...prev,
      [limb]: { ...prev[limb], verticalMode: prev[limb].verticalMode === mode ? 'off' : mode }
    }));
  }, [isSessionActive, timedRehab.isActive]);

  const setHorizontalMode = useCallback((limb: 'left' | 'right', mode: HorizontalMotorMode) => {
    if (!isSessionActive || timedRehab.isActive) return;
    setLimbs(prev => ({
      ...prev,
      [limb]: { ...prev[limb], horizontalMode: prev[limb].horizontalMode === mode ? 'off' : mode }
    }));
  }, [isSessionActive, timedRehab.isActive]);

  return {
    connectionStatus,
    connect,
    disconnect,
    isSessionActive,
    startSession,
    endSession,
    healthDataHistory,
    latestHealthData,
    reps,
    jointAngles,
    motorStates,
    setVerticalMode,
    setHorizontalMode,
    lastSessionSummary,
    setLastSessionSummary,
    sessionHistory,
    achievements,
    MAX_ANGLE,
    setSessionVideoUrl,
    timedRehab,
    setTimedRehab,
    sequenceStep,
    isWaiting,
    waitProgress: phaseProgress,
  };
};
