import { useEffect, useRef, useState } from "react";

export function PiPTimer() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [time, setTime] = useState(0);

  // تحديث المؤقت
  useEffect(() => {
    const interval = setInterval(() => {
      setTime((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // رسم الوقت على Canvas وتحويله لفيديو
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 40px Arial";
    ctx.textAlign = "center";
    ctx.fillText(formatTime(time), canvas.width / 2, canvas.height / 2);
  }, [time]);

  // بدء PiP
  const startPiP = async () => {
    if (!canvasRef.current || !videoRef.current) return;

    const stream = canvasRef.current.captureStream(30);
    videoRef.current.srcObject = stream;
    await videoRef.current.play();

    try {
      await videoRef.current.requestPictureInPicture();
    } catch (error) {
      console.error("Error starting PiP", error);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <canvas ref={canvasRef} width={200} height={100} className="hidden" />
      <video ref={videoRef} className="hidden" muted playsInline />
      <button
        onClick={startPiP}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        Start PiP Timer
      </button>
    </div>
  );
}

function formatTime(seconds: number) {
  const mins = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const secs = (seconds % 60).toString().padStart(2, "0");
  return `${mins}:${secs}`;
}
