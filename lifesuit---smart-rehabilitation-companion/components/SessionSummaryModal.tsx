import React from 'react';
import { SessionSummary } from '../types';
import { TrophyIcon, WhatsAppIcon } from './icons/Icons';

interface SessionSummaryModalProps {
  summary: SessionSummary | null;
  onClose: () => void;
}

const SessionSummaryModal = ({ summary, onClose }: SessionSummaryModalProps): React.ReactNode => {
  if (!summary) return null;

  const motivationalMessages = [
    "Great job! Every step forward is a victory.",
    "Consistency is key. You're building a stronger you!",
    "Amazing effort today! Rest well and come back stronger.",
    "You've conquered another session. Be proud of your progress!",
    "Your hard work is paying off. Keep it up!",
  ];
  const message = motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)];

  const shareText = encodeURIComponent(
    `I just completed my LifeSuit rehab session! 🎉\n` +
    `Duration: ${summary.durationMinutes} mins\n` +
    `Reps: ${summary.totalReps.left} (Left), ${summary.totalReps.right} (Right)\n` +
    `Avg HR: ${summary.avgHeartRate} bpm\n\n` +
    `Making progress every day!`
  );
  const whatsappLink = `https://api.whatsapp.com/send?text=${shareText}`;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" role="dialog" aria-modal="true" aria-labelledby="summary-title">
      <div className="bg-brand-bg-light rounded-xl shadow-2xl p-6 sm:p-8 max-w-2xl w-full text-center transform transition-all animate-fade-in"
           onClick={(e) => e.stopPropagation()}>
        <TrophyIcon className="w-16 h-16 mx-auto text-brand-accent" />
        <h2 id="summary-title" className="text-3xl font-bold mt-4 text-white">Session Complete!</h2>
        <p className="text-lg mt-2 text-brand-text-dark">{message}</p>
        
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
            <div className="bg-brand-bg-dark/50 p-4 rounded-lg space-y-2">
                <h3 className="font-bold text-xl mb-2 text-white">Your Summary:</h3>
                <p><span className="font-semibold text-gray-400">Duration:</span> {summary.durationMinutes} minutes</p>
                <p><span className="font-semibold text-gray-400">Total Reps (L/R):</span> {summary.totalReps.left} / {summary.totalReps.right}</p>
                <p><span className="font-semibold text-gray-400">Avg. Heart Rate:</span> {summary.avgHeartRate} bpm</p>
                <p><span className="font-semibold text-gray-400">Avg. SpO₂:</span> {summary.avgSpo2}%</p>
            </div>
            {summary.videoUrl && (
              <div className="bg-brand-bg-dark/50 p-4 rounded-lg">
                <h3 className="font-bold text-xl mb-2 text-white">Session Recording:</h3>
                <video src={summary.videoUrl} controls className="w-full rounded-md aspect-video"></video>
              </div>
            )}
        </div>
        
        <div className="mt-8 flex flex-col sm:flex-row gap-4">
            <a 
              href={whatsappLink} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-lg transition duration-300"
            >
              <WhatsAppIcon className="w-6 h-6" />
              Share on WhatsApp
            </a>
            <button
              onClick={onClose}
              className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-4 rounded-lg transition duration-300"
            >
              Close
            </button>
        </div>
      </div>
    </div>
  );
};

export default React.memo(SessionSummaryModal);
