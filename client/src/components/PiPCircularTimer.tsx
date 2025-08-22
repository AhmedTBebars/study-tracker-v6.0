import { useEffect, useRef } from 'react';
import { useFocusStore } from '../stores/focus-store';
import { Button } from './ui/button';
import { PictureInPicture } from 'lucide-react';
import { useSettingsStore } from '../stores/settings-store';
import { motion, AnimatePresence } from 'framer-motion';

// Helper function to format time from seconds to MM:SS
const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};

// We need a global reference to the PiP window to communicate with it
let pipWindow: Window | null = null;

export function PiPCircularTimer() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    
    // Get state from Zustand stores
    const { timeRemaining, sessionType, isActive, togglePause } = useFocusStore();
    const { sessionLength, breakLength, focusTimerColor } = useSettingsStore();

    const totalDuration = sessionType === 'focus' ? sessionLength * 60 : breakLength * 60;

    const colorMap = {
        blue: '#3b82f6',   // blue-500
        green: '#22c55e',  // green-500
        orange: '#f97316', // orange-500
        red: '#ef4444',    // red-500
    };

    // This effect redraws the timer on the canvas whenever the time changes
    useEffect(() => {
        const canvas = canvasRef.current;
        const video = videoRef.current;
        if (!canvas || !video) return;

        // @ts-ignore - Experimental browser feature
        if (!video.srcObject) {
            // @ts-ignore
            video.srcObject = canvas.captureStream();
            video.play().catch(e => console.error("Video play failed:", e));
        }

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const width = canvas.width;
        const height = canvas.height;
        const radius = height / 2 - 20;
        const progress = totalDuration > 0 ? timeRemaining / totalDuration : 0;

        ctx.fillStyle = '#1c1917';
        ctx.fillRect(0, 0, width, height);

        ctx.beginPath();
        ctx.arc(width / 2, height / 2, radius, 0, 2 * Math.PI);
        ctx.strokeStyle = '#3f3f46';
        ctx.lineWidth = 20;
        ctx.stroke();

        if (isActive) {
            ctx.beginPath();
            ctx.arc(width / 2, height / 2, radius, -0.5 * Math.PI, -0.5 * Math.PI + (1 - progress) * 2 * Math.PI, false);
            ctx.strokeStyle = colorMap[focusTimerColor];
            ctx.lineWidth = 20;
            ctx.stroke();
        }

        ctx.fillStyle = 'white';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = 'bold 50px Inter, sans-serif';
        ctx.fillText(formatTime(timeRemaining), width / 2, height / 2);

        // Send updates to PiP window if it exists
        if (pipWindow && !pipWindow.closed) {
            pipWindow.postMessage({
                type: 'TIMER_UPDATE',
                payload: {
                    timeRemaining,
                    totalDuration,
                    isActive,
                    focusTimerColor: colorMap[focusTimerColor],
                    sessionType,
                }
            }, '*');
        }
    }, [timeRemaining, totalDuration, isActive, focusTimerColor, colorMap]);

    // This effect listens for control messages (like play/pause) FROM the PiP window
    useEffect(() => {
        const messageHandler = (event: MessageEvent) => {
            if (event.source !== pipWindow) return; 
            if (event.data.type === 'TIMER_TOGGLE_PAUSE') {
                togglePause();
            }
        };
        window.addEventListener('message', messageHandler);
        return () => window.removeEventListener('message', messageHandler);
    }, [togglePause]);

    const handleEnterPiP = async () => {
        // First try the video-based PiP approach
        const video = videoRef.current;
        if (video) {
            try {
                // @ts-ignore
                if (document.pictureInPictureElement) {
                    // @ts-ignore
                    await document.exitPictureInPicture();
                    return;
                } else {
                    if (video.readyState >= 1) {
                        // @ts-ignore
                        await video.requestPictureInPicture();
                        return;
                    } else {
                        video.onloadedmetadata = () => {
                            // @ts-ignore
                            video.requestPictureInPicture();
                        };
                        return;
                    }
                }
            } catch (error) {
                console.log("Video PiP failed, trying Document PiP:", error);
            }
        }

        // Fall back to Document Picture-in-Picture API if available
        // @ts-ignore - Check for browser support for the new API
        if (!window.documentPictureInPicture) {
            alert('This feature is not supported here. It requires a modern browser environment like Chrome or the latest version of Electron.');
            return;
        }

        if (pipWindow) {
            pipWindow.close();
            pipWindow = null;
            return;
        }

        try {
            // @ts-ignore
            pipWindow = await window.documentPictureInPicture.requestWindow({
                width: 280,
                height: 280,
            });

            pipWindow.addEventListener('pagehide', () => {
                pipWindow = null;
            });

            const response = await fetch('/pip.html');
            if (!response.ok) {
                throw new Error(`Failed to fetch pip.html: ${response.status} ${response.statusText}`);
            }
            const html = await response.text();
            
            // Inject the fetched HTML into the new window's document
            pipWindow?.document.write(html);
            // Close the document stream to ensure scripts are parsed and executed
            pipWindow?.document.close();

        } catch (error) {
            console.error("PiP feature failed with an error:", error);
            alert(`Could not open the timer window. Please ensure 'pip.html' is in the 'client/public' folder. Error: ${error}`);
            pipWindow = null;
        }
    };

    return (
        <>
            <AnimatePresence>
                {isActive && (
                    <motion.div
                        className="fixed bottom-8 right-8 z-50"
                        initial={{ scale: 0, y: 50 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0, y: 50 }}
                        transition={{ type: "spring", stiffness: 260, damping: 20 }}
                    >
                        <Button
                            variant="default"
                            size="lg"
                            className="rounded-full h-16 w-16 shadow-lg btn-premium flex items-center justify-center gap-2"
                            onClick={handleEnterPiP}
                            title="Toggle Picture-in-Picture Timer"
                        >
                            <PictureInPicture className="h-6 w-6" />
                        </Button>
                    </motion.div>
                )}
            </AnimatePresence>
            
            {/* These hidden elements are required for the PiP API to work */}
            <canvas ref={canvasRef} width="320" height="180" style={{ display: 'none' }}></canvas>
            <video ref={videoRef} muted playsInline style={{ display: 'none' }}></video>
        </>
    );
}