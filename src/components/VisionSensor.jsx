import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Camera, Cpu, Zap } from 'lucide-react';

export default function VisionSensor({ onDistanceUpdate, active }) {
  const videoRef = useRef(null);
  const [status, setStatus] = useState('idle'); // idle, loading, live, error
  const [distance, setDistance] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const animRef = useRef(null);
  const streamRef = useRef(null);
  const detectorRef = useRef(null);
  
  // Smooth distance tracking
  const lastDistance = useRef(40);
  const alpha = 0.05; // Significant smoothing for stability

  const stopSensor = useCallback(() => {
    if (animRef.current) cancelAnimationFrame(animRef.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    setStatus('idle');
    setDistance(null);
  }, []);

  useEffect(() => {
    if (active) {
      startSensor();
    } else {
      stopSensor();
    }
    return () => stopSensor();
  }, [active]);

  const startSensor = async () => {
    setStatus('loading');
    setErrorMsg(null);
    try {
      // 1. Load MediaPipe Scripts
      if (!window.faceDetection) {
        await loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/face_detection');
        await loadScript('https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-core');
        await loadScript('https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-backend-webgl');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: 'user' }
      });
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      // 2. Setup Detector
      const model = window.faceDetection.SupportedModels.MediaPipeFaceDetector;
      detectorRef.current = await window.faceDetection.createDetector(model, {
        runtime: 'mediapipe',
        solutionPath: 'https://cdn.jsdelivr.net/npm/@mediapipe/face_detection',
      });

      setStatus('live');
      detectLoop();
    } catch (err) {
      console.error('Vision Sensor Error:', err);
      setErrorMsg('Camera access denied');
      setStatus('error');
    }
  };

  const detectLoop = async () => {
    if (!detectorRef.current || !videoRef.current || !active) return;

    try {
      const faces = await detectorRef.current.estimateFaces(videoRef.current);
      
      if (faces.length > 0) {
        const face = faces[0];
        const keypoints = face.keypoints;
        
        // Find eyes (Index 0 is right eye, 1 is left eye in MediaPipe Face Detection)
        const rightEye = keypoints[0];
        const leftEye = keypoints[1];
        
        if (rightEye && leftEye) {
          // Interpupillary distance in pixels
          const dx = rightEye.x - leftEye.x;
          const dy = rightEye.y - leftEye.y;
          const pixelIPD = Math.sqrt(dx * dx + dy * dy);
          
          // Formula: Distance = (Real IPD * Focal Length) / Pixel IPD
          // Real IPD ~ 6.3cm (Human Average)
          // Focal Length ~ 700 (Adjusted for accuracy based on 640x480 webcam)
          const focalLength = 700;
          const realIPD = 6.3;
          
          const rawDistance = (realIPD * focalLength) / pixelIPD;
          
          // Apply EMA (Exponential Moving Average) smoothing
          let smoothedDistance = lastDistance.current * (1 - alpha) + rawDistance * alpha;
          
          // Deadzone to prevent micro-fluctuations (0.5cm threshold)
          if (Math.abs(smoothedDistance - lastDistance.current) < 0.5) {
            smoothedDistance = lastDistance.current;
          }

          const finalDistance = Math.round(smoothedDistance);
          
          if (finalDistance > 20 && finalDistance < 150) {
            lastDistance.current = smoothedDistance;
            setDistance(finalDistance);
            onDistanceUpdate(finalDistance);
          }
        }
      }
    } catch (err) {
      console.error('Detection frame error:', err);
    }

    animRef.current = requestAnimationFrame(detectLoop);
  };

  const loadScript = (src) => {
    return new Promise((resolve, reject) => {
      if (document.querySelector(`script[src="${src}"]`)) return resolve();
      const script = document.createElement('script');
      script.src = src;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  };

  if (!active) return null;

  return (
    <div className="absolute top-4 right-4 z-50">
      <div className="bg-[#0D1424]/90 backdrop-blur-md border border-cyan-500/20 p-4 flex items-center gap-4 shadow-[0_0_30px_rgba(0,0,0,0.5)] rounded-lg">
        <div className="relative group">
          <video
            ref={videoRef}
            className="w-32 h-24 object-cover grayscale contrast-125 opacity-50 border border-slate-700 rounded-sm"
            muted
            playsInline
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A0F1A] via-transparent to-transparent opacity-60" />
          {status === 'live' && (
            <div className="absolute top-2 left-2 flex items-center gap-1.5">
               <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_#10b981]" />
               <span className="text-[7px] font-black text-emerald-500 tracking-widest uppercase">Live_Feed</span>
            </div>
          )}
        </div>
        
        <div className="flex flex-col gap-1 min-w-[100px]">
          <div className="flex items-center gap-2">
            <Cpu className={`w-3 h-3 ${status === 'live' ? 'text-cyan-400 animate-pulse' : 'text-slate-600'}`} />
            <span className="text-[9px] font-black uppercase tracking-widest text-cyan-400/80">
              {status === 'loading' ? 'INITIALIZING' : status === 'live' ? 'NEURAL_SYNC' : 'SENSOR_ERR'}
            </span>
          </div>
          
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-3xl font-mono text-white tabular-nums tracking-tighter">
              {distance || '--'}
            </span>
            <span className="text-[10px] text-slate-500 font-bold tracking-widest uppercase">CM</span>
          </div>
          
          <div className="flex items-center gap-1.5 mt-1">
             <Zap size={10} className={distance ? 'text-amber-400' : 'text-slate-700'} />
             <span className="text-[7px] text-slate-500 font-black uppercase tracking-widest">Accuracy: {distance ? 'High_Precision' : 'Scanning...'}</span>
          </div>

          {errorMsg && (
            <div className="text-[8px] text-rose-500 font-bold uppercase mt-1 tracking-tighter bg-rose-500/10 px-1 py-0.5 border border-rose-500/20">
              {errorMsg}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
