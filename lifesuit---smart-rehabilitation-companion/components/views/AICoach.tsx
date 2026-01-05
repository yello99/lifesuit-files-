
import React, { useState, useEffect } from 'react';
import { GoogleGenAI, GenerateContentResponse } from '@google/genai';
import { SessionSummary } from '../../types';
import Card from '../Card';
import { CoachIcon } from '../icons/FeatureIcons';

interface AICoachProps {
    lastSession: SessionSummary | null;
}

const AICoach = ({ lastSession }: AICoachProps): React.ReactNode => {
    const [feedback, setFeedback] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');
    
    useEffect(() => {
        if (!lastSession) {
            setFeedback("Complete a session to get your first personalized feedback from the AI Coach!");
            return;
        };

        const fetchFeedback = async () => {
            setIsLoading(true);
            setError('');
            setFeedback('');

            try {
                if (!process.env.API_KEY) {
                    throw new Error("API key is not available.");
                }
                const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
                
                const prompt = `You are a professional, encouraging AI rehabilitation coach. Analyze this data from a 'LifeSuit' smart exoskeleton session:
                
                Session Summary:
                - Duration: ${lastSession.durationMinutes} min
                - Reps: ${lastSession.totalReps.left} (Left), ${lastSession.totalReps.right} (Right)
                - Heart Rate: ${lastSession.avgHeartRate} bpm
                - SpO2: ${lastSession.avgSpo2}%
                
                Provide 2-3 sentences of motivating insight and one specific goal for next time. Speak directly to the patient.`;

                const response: GenerateContentResponse = await ai.models.generateContent({
                    model: 'gemini-3-flash-preview',
                    contents: prompt,
                });
                
                setFeedback(response.text ?? "I've analyzed your data! Keep pushing forward for a great recovery.");

            } catch (e) {
                console.error(e);
                setError("AI Coach is currently resting. Please try again after your next session.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchFeedback();
    }, [lastSession]);

    return (
        <div className="animate-fade-in">
            <header className="mb-8">
                <h1 className="text-4xl font-black text-white tracking-tight uppercase">AI COACH</h1>
                <p className="text-lg text-brand-text-dark mt-2 font-medium">Data-driven recovery insights.</p>
            </header>
            <Card title="Coach Analysis" icon={<CoachIcon className="w-6 h-6"/>}>
                <div className="p-6 bg-brand-bg-dark/40 rounded-xl min-h-[180px] flex items-center justify-center border border-gray-800">
                    {isLoading && (
                        <div className="text-center">
                             <div className="w-10 h-10 border-4 border-brand-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
                             <p className="mt-4 font-bold text-brand-primary uppercase tracking-widest text-xs">Reviewing Performance...</p>
                        </div>
                    )}
                    {error && <p className="text-brand-warn text-center font-medium">{error}</p>}
                    {feedback && (
                        <p className="whitespace-pre-wrap text-lg leading-relaxed text-brand-text-light italic">"{feedback}"</p>
                    )}
                </div>
            </Card>
        </div>
    );
};

export default AICoach;
