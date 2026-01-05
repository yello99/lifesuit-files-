import React, { useState, useRef, useEffect, useCallback } from 'react';
import Card from './Card';
import { VideoCameraIcon } from './icons/FeatureIcons';

interface SessionRecorderProps {
  isSessionActive: boolean;
  onRecordingComplete: (videoUrl: string) => void;
}

const SessionRecorder = ({ isSessionActive, onRecordingComplete }: SessionRecorderProps) => {
  const [isCameraEnabled, setIsCameraEnabled] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<'prompt' | 'granted' | 'denied'>('prompt');
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setPermissionStatus('granted');
      mediaRecorderRef.current = new MediaRecorder(stream);
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };
      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        onRecordingComplete(url);
        recordedChunksRef.current = [];
      };
    } catch (err) {
      console.error("Camera access denied:", err);
      setPermissionStatus('denied');
      setIsCameraEnabled(false);
    }
  }, [onRecordingComplete]);

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  const handleToggle = () => {
    const shouldEnable = !isCameraEnabled;
    setIsCameraEnabled(shouldEnable);
    if (shouldEnable) {
      startCamera();
    } else {
      stopCamera();
    }
  };

  useEffect(() => {
    if (isSessionActive && mediaRecorderRef.current && mediaRecorderRef.current.state === 'inactive') {
      recordedChunksRef.current = [];
      mediaRecorderRef.current.start();
    } else if (!isSessionActive && mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
  }, [isSessionActive]);
  
  useEffect(() => {
    return () => stopCamera();
  }, []);

  return (
    <Card title="Session Recorder" icon={<VideoCameraIcon className="w-6 h-6" />}>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <label htmlFor="camera-toggle" className="text-brand-text-light font-medium">
            Record this session
          </label>
          <button
            id="camera-toggle"
            onClick={handleToggle}
            className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${
              isCameraEnabled ? 'bg-brand-primary' : 'bg-gray-600'
            }`}
          >
            <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${
                isCameraEnabled ? 'translate-x-6' : 'translate-x-1'
            }`} />
          </button>
        </div>

        {isCameraEnabled && (
          <div className="bg-brand-bg-dark rounded-lg overflow-hidden aspect-video">
            {permissionStatus === 'granted' && <video ref={videoRef} autoPlay muted className="w-full h-full object-cover"></video>}
            {permissionStatus === 'denied' && (
              <div className="w-full h-full flex items-center justify-center text-center p-4">
                <p className="text-brand-warn">Camera access was denied. Please enable it in your browser settings to use this feature.</p>
              </div>
            )}
             {permissionStatus === 'prompt' && (
              <div className="w-full h-full flex items-center justify-center text-center p-4">
                <p>Waiting for camera permission...</p>
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
};

export default SessionRecorder;
