import React from 'react';
import { Achievement } from '../../types';
import Card from '../Card';
import { TrophyIcon } from '../icons/Icons';
import { AchievementsIcon, CoachIcon, DashboardIcon, HistoryIcon } from '../icons/FeatureIcons';

interface AchievementsProps {
  achievements: Achievement[];
}

export const initialAchievements: Achievement[] = [
    { id: 'first-session', title: 'First Step', description: 'Complete your very first session.', unlocked: false, icon: <DashboardIcon /> },
    { id: 'ten-reps', title: 'Rep Rookie', description: 'Complete 10 total repetitions in a session.', unlocked: false, icon: <TrophyIcon /> },
    { id: 'fifty-reps', title: 'Rep Rockstar', description: 'Complete 50 total repetitions in a session.', unlocked: false, icon: <TrophyIcon /> },
    { id: 'five-minutes', title: 'Endurance Starter', description: 'Complete a session lasting 5 minutes.', unlocked: false, icon: <HistoryIcon /> },
    { id: 'fifteen-minutes', title: 'Marathoner', description: 'Complete a session lasting 15 minutes.', unlocked: false, icon: <HistoryIcon /> },
    { id: 'first-feedback', title: 'Coachable', description: 'Get your first feedback from the AI Coach.', unlocked: false, icon: <CoachIcon /> },
];

// FIX: Extracted inline props to a dedicated interface to solve TS error with 'key' prop.
interface AchievementCardProps {
  achievement: Achievement;
}

// FIX: Wrapped component in React.memo to fix TypeScript error with the 'key' prop.
const AchievementCard = React.memo(({ achievement }: AchievementCardProps) => (
    <div className={`p-4 rounded-lg flex items-center space-x-4 transition-all duration-300 ${achievement.unlocked ? 'bg-brand-secondary/20 border-brand-secondary/50' : 'bg-brand-bg-dark/50 border-gray-700'} border`}>
        <div className={`p-3 rounded-full ${achievement.unlocked ? 'bg-brand-secondary text-white' : 'bg-gray-700 text-gray-500'}`}>
            {/* FIX: Removed unnecessary type cast. The type of achievement.icon is now correctly defined as React.ReactElement in the Achievement interface. */}
            {React.cloneElement(achievement.icon, { className: "w-8 h-8" })}
        </div>
        <div>
            <h4 className={`font-bold text-lg ${achievement.unlocked ? 'text-brand-text-light' : 'text-gray-500'}`}>{achievement.title}</h4>
            <p className="text-sm text-brand-text-dark">{achievement.description}</p>
        </div>
        {achievement.unlocked && <TrophyIcon className="w-8 h-8 text-brand-accent ml-auto" />}
    </div>
));

const Achievements = ({ achievements }: AchievementsProps): React.ReactNode => {
  return (
    <div className="animate-fade-in">
        <header className="mb-8">
            <h1 className="text-4xl sm:text-5xl font-extrabold text-white">Achievements</h1>
            <p className="text-lg text-brand-text-dark mt-2">Track your milestones and celebrate your progress!</p>
        </header>
        <Card title="Your Badge Collection" icon={<AchievementsIcon className="w-6 h-6"/>}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {achievements.map(ach => (
                    <AchievementCard key={ach.id} achievement={ach} />
                ))}
            </div>
        </Card>
    </div>
  );
};

export default Achievements;