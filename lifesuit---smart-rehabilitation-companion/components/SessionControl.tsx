import React from 'react';
import Card from './Card';

interface SessionControlProps {
  isSessionActive: boolean;
  startSession: () => void;
  endSession: () => void;
}

const SessionControl = ({ isSessionActive, startSession, endSession }: SessionControlProps): React.ReactNode => {
  return (
    <Card title="Session">
      <div className="flex flex-col space-y-4">
        {isSessionActive ? (
          <button
            onClick={endSession}
            className="w-full bg-brand-warn hover:bg-red-600 text-white font-bold py-3 px-4 rounded-lg transition duration-300 ease-in-out transform hover:scale-105"
          >
            End Session
          </button>
        ) : (
          <button
            onClick={startSession}
            className="w-full bg-brand-primary hover:bg-brand-primary-dark text-white font-bold py-3 px-4 rounded-lg transition duration-300 ease-in-out transform hover:scale-105"
          >
            Start Session
          </button>
        )}
        <div className="flex items-center justify-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${isSessionActive ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`}></div>
            <span className="text-brand-text-dark">{isSessionActive ? 'Session in Progress' : 'Session Inactive'}</span>
        </div>
      </div>
    </Card>
  );
};

export default React.memo(SessionControl);