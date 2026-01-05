
import React from 'react';
import { useHardwareConnection } from '../../hooks/useMockHardware';
import HealthMonitor from '../HealthMonitor';
import MotorControl from '../MotorControl';
import SessionControl from '../SessionControl';
import RepetitionCounter from '../RepetitionCounter';
import ConnectionManager from '../ConnectionManager';
import SessionRecorder from '../SessionRecorder';
import TimedRehabControl from '../TimedRehabControl';

type DashboardProps = ReturnType<typeof useHardwareConnection>;

const Dashboard = (props: DashboardProps): React.ReactNode => {
    const {
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
        MAX_ANGLE,
        setSessionVideoUrl,
        timedRehab,
        setTimedRehab,
        sequenceStep,
        isWaiting,
        waitProgress,
      } = props;
    
  const isConnected = connectionStatus === 'connected';

  return (
    <div className="animate-fade-in pb-12">
      <header className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight">
            DASHBOARD
          </h1>
          <p className="text-brand-text-dark font-medium">Multi-Axis Control & Bio-Feedback</p>
        </div>
        <div className="flex items-center gap-3">
          <div className={`px-4 py-1.5 rounded-full text-xs font-black border tracking-widest ${isConnected ? 'bg-brand-secondary/10 border-brand-secondary text-brand-secondary shadow-[0_0_10px_rgba(20,184,166,0.2)]' : 'bg-brand-warn/10 border-brand-warn text-brand-warn'}`}>
            {connectionStatus.toUpperCase()}
          </div>
        </div>
      </header>
      
      <main className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Essential Controls */}
        <div className="lg:col-span-4 space-y-6">
          <ConnectionManager 
            status={connectionStatus}
            connect={connect}
            disconnect={disconnect}
          />
          
          <div className={`${!isConnected ? 'opacity-40 grayscale pointer-events-none' : ''} transition-all duration-300`}>
            <SessionControl
              isSessionActive={isSessionActive}
              startSession={startSession}
              endSession={endSession}
            />
          </div>

          <div className={`${!isSessionActive ? 'opacity-40 grayscale pointer-events-none' : ''} transition-all duration-300 space-y-6`}>
            <TimedRehabControl 
              config={timedRehab}
              setConfig={setTimedRehab}
              isSessionActive={isSessionActive}
              currentAngles={jointAngles.left}
              maxAngle={MAX_ANGLE}
              sequenceStep={sequenceStep}
              isWaiting={isWaiting}
              waitProgress={waitProgress}
              reps={{ 
                v: reps.vLeft, 
                h: reps.hLeft, 
                total: reps.left 
              }}
            />
            <RepetitionCounter reps={reps} />
            <SessionRecorder isSessionActive={isSessionActive} onRecordingComplete={setSessionVideoUrl}/>
          </div>
        </div>
        
        {/* Center & Right: Monitoring & Motor Control */}
        <div className="lg:col-span-8 space-y-6">
          <div className={`${!isSessionActive ? 'opacity-40 grayscale' : ''} transition-all duration-300`}>
             <MotorControl
                motorStates={motorStates}
                jointAngles={jointAngles}
                setVerticalMode={setVerticalMode}
                setHorizontalMode={setHorizontalMode}
                isSessionActive={isSessionActive}
                maxAngle={MAX_ANGLE}
              />
          </div>

          <div className={`${!isSessionActive ? 'opacity-40 grayscale' : ''} transition-all duration-300`}>
            <HealthMonitor 
              latestData={latestHealthData} 
              history={healthDataHistory} 
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
