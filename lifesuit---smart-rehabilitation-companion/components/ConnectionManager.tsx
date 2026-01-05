import React from 'react';
import Card from './Card';
import { WifiIcon } from './icons/Icons';
import { ConnectionStatus } from '../hooks/useMockHardware';

interface ConnectionManagerProps {
  status: ConnectionStatus;
  connect: () => void;
  disconnect: () => void;
}

const ConnectionManager = ({ status, connect, disconnect }: ConnectionManagerProps): React.ReactNode => {
  const isConnecting = status === 'connecting';
  const isConnected = status === 'connected';

  let statusText = "Disconnected";
  let statusColor = "text-brand-warn";
  if (isConnecting) {
      statusText = "Connecting...";
      statusColor = "text-yellow-400";
  } else if (isConnected) {
      statusText = "Connected";
      statusColor = "text-brand-secondary";
  } else if (status === 'error') {
      statusText = "Error";
      statusColor = "text-red-500";
  }

  return (
    <Card title="Simulation Control" icon={<WifiIcon className="w-6 h-6"/>}>
      <div className="space-y-4">
        <p className="text-sm text-center text-brand-text-dark">
          This is a simulated demo. Click below to start the fake hardware connection.
        </p>
        
        {isConnected ? (
          <button
            onClick={disconnect}
            className="w-full bg-brand-warn hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg transition duration-300"
          >
            Disconnect
          </button>
        ) : (
          <button
            onClick={connect}
            disabled={isConnecting}
            className="w-full bg-brand-primary hover:bg-brand-primary-dark text-white font-bold py-2 px-4 rounded-lg transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isConnecting ? 'Starting...' : 'Start Simulation'}
          </button>
        )}

        <div className="flex items-center justify-center space-x-2 pt-2">
            <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : (isConnecting ? 'bg-yellow-500 animate-pulse' : 'bg-gray-500')}`}></div>
            <span className={`font-semibold ${statusColor}`}>{statusText}</span>
        </div>
      </div>
    </Card>
  );
};

export default React.memo(ConnectionManager);