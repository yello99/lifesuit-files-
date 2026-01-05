import React from 'react';
import { TrophyIcon } from './icons/Icons';
import Card from './Card';

interface RepetitionCounterProps {
  reps: { left: number; right: number };
}

const RepetitionCounter = ({ reps }: RepetitionCounterProps): React.ReactNode => {
  return (
    <Card title="Repetitions" icon={<TrophyIcon className="w-6 h-6"/>}>
      <div className="flex justify-around text-center">
        <div>
          <div className="text-brand-text-dark text-sm">LEFT</div>
          <div className="text-4xl font-bold text-brand-accent">{reps.left}</div>
        </div>
        <div className="border-l border-gray-700"></div>
        <div>
          <div className="text-brand-text-dark text-sm">RIGHT</div>
          <div className="text-4xl font-bold text-brand-accent">{reps.right}</div>
        </div>
      </div>
    </Card>
  );
};

export default React.memo(RepetitionCounter);