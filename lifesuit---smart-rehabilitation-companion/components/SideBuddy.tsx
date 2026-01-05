
import React, { useState, useEffect, useRef } from 'react';
// Correctly import MotorMode from types
import { MotorMode } from '../types';

interface SideBuddyProps {
    limbAngle: number;
    repCount: number;
    isSessionActive: boolean;
    motorMode: MotorMode;
}

const motivationalMessages = {
    repComplete: ["Great rep!", "Awesome!", "You got it!", "Keep it up!", "Super!"],
    sessionStart: "Let's do this!",
    sessionEnd: "Awesome work today!",
    idle: "Ready when you are!",
};

const getRandomMessage = (type: keyof typeof motivationalMessages) => {
    if (type === 'repComplete') {
        const messages = motivationalMessages.repComplete;
        return messages[Math.floor(Math.random() * messages.length)];
    }
    return motivationalMessages[type];
};

const SideBuddy = ({ limbAngle, repCount, isSessionActive, motorMode }: SideBuddyProps): React.ReactNode => {
    const [animation, setAnimation] = useState<'idle' | 'celebrate'>('idle');
    const [message, setMessage] = useState(motivationalMessages.idle);
    const [showMessage, setShowMessage] = useState(true);
    const prevRepCount = useRef(repCount);
    const prevSessionState = useRef(isSessionActive);
    const messageTimeout = useRef<number | null>(null);

    const displayMessage = (msg: string) => {
        if (messageTimeout.current) {
            clearTimeout(messageTimeout.current);
        }
        setMessage(msg);
        setShowMessage(true);
        messageTimeout.current = window.setTimeout(() => {
            setShowMessage(false);
        }, 3000);
    };

    // Handle session start/end messages
    useEffect(() => {
        if (isSessionActive && !prevSessionState.current) {
            displayMessage(getRandomMessage('sessionStart'));
        } else if (!isSessionActive && prevSessionState.current) {
            displayMessage(getRandomMessage('sessionEnd'));
        }
        prevSessionState.current = isSessionActive;
    }, [isSessionActive]);

    // Handle rep completion animation and message
    useEffect(() => {
        if (repCount > prevRepCount.current) {
            setAnimation('celebrate');
            displayMessage(getRandomMessage('repComplete'));
            setTimeout(() => setAnimation('idle'), 500); // Duration of the celebration animation
        }
        prevRepCount.current = repCount;
    }, [repCount]);

    const isMoving = isSessionActive && motorMode !== 'off';

    // Hand animation logic: Make the hand detach and fly around
    const animatedAngle = limbAngle * 5; // Increase speed for chaotic movement
    const angleInRadians = (animatedAngle * Math.PI) / 180;
    
    // Calculate the hand's position to fly around in a large orbit
    const orbitRadius = 60; // A large radius makes it "go everywhere"
    const handX = 50 + orbitRadius * Math.cos(angleInRadians);
    const handY = 55 + orbitRadius * Math.sin(angleInRadians);

    return (
        <div className="relative flex flex-col items-center justify-center h-48 w-48 pointer-events-auto">
            {showMessage && (
                <div className="absolute -top-4 bg-brand-primary text-white text-sm font-bold py-2 px-4 rounded-full shadow-lg animate-speech-bubble-appear z-10">
                    {message}
                    <div className="absolute left-1/2 -translate-x-1/2 bottom-0 w-0 h-0 border-l-8 border-l-transparent border-r-8 border-r-transparent border-t-8 border-t-brand-primary transform translate-y-full"></div>
                </div>
            )}
            
            <div className={`relative ${animation === 'celebrate' ? 'animate-celebrate-jump' : (isMoving ? '' : 'animate-idle-bounce')}`}>
                <svg width="120" height="120" viewBox="0 0 100 100" className="overflow-visible">
                    <g stroke="#F3F4F6" strokeWidth="6" strokeLinecap="round">
                        {/* Head */}
                        <circle cx="50" cy="25" r="10" fill="#4F46E5" stroke="#F3F4F6" />
                        {/* Body */}
                        <line x1="50" y1="35" x2="50" y2="65" />
                        {/* Legs */}
                        <line x1="50" y1="65" x2="35" y2="90" />
                        <line x1="50" y1="65" x2="65" y2="90" />

                        {/* Right Arm (static) */}
                        <line x1="50" y1="45" x2="65" y2="55" />
                        <circle cx="70" cy="60" r="5" fill="#F3F4F6" />

                        {/* Left Arm (animated, upper arm only) */}
                        <g transform={`rotate(${-limbAngle * 1.2}, 50, 45)`} style={{ transformOrigin: '50px 45px', transition: 'transform 0.2s linear' }}>
                            <line x1="50" y1="45" x2="40" y2="55" />
                        </g>

                        {/* Detached Left Hand (animated) */}
                        <circle 
                            cx={handX} 
                            cy={handY} 
                            r="5" 
                            fill="#F3F4F6" 
                            style={{ transition: 'cx 0.1s linear, cy 0.1s linear' }}
                        />
                    </g>
                </svg>
            </div>
        </div>
    );
};

export default React.memo(SideBuddy);
