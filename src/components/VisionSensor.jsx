import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Camera, Cpu, Zap, AlertCircle } from 'lucide-react';

export default function VisionSensor({ onDistanceUpdate, active }) {
  const videoRef = useRef(null);
  const [status, setStatus] = useState('idle'); // idle, loading, live, error
  const [distance, setDistance] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const animRef = useRef(null);
  const streamRef = useRef(null);
  const detectorRef = useRef(null);
  
  const lastDistance = useRef(40);
  const alpha = 0.15; // Faster response for the demo

  const stopSensor = useCallback(() => {
    if (animRef.current) cancelAnimationFrame(animRef.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    setStatus('idle');
    setDistance(null);
  }, []);

  const loadScript = (src) => {
    return new Promise((resolve, reject) => {
      if (document.querySelector(`script[src="${src}"]`)) return resolve();
      const script = document.createElement('script');
      script.src = src;
      script.async = true;
      script.onload = resolve;
      script.onerror = () => reject(new Error(`Failed to load ${src}`));
      document.head.appendChild(script);
    });
  };

  const startSensor = async () => {
    setStatus('loading');
    setErrorMsg(null);
    
    try {
      // 1. Get Camera Stream First (to show video as soon as possible)
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: 'user' }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      // 2. Load Neural Scripts (MediaPipe + TFJS)
      try {
        if (!window.faceDetection) {
          await loadScript('https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-core@4.17.0');
          await loadScript('https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-backend-webgl@4.17.0');
          await loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/face_detection@0.4.1646425229');
          await loadScript('https://cdn.jsdelivr.net/npm/@tensorflow-models/face-detection@1.0.2');
        }

        // 3. Initialize High-Precision Detector
        const model = window.faceDetection.SupportedModels.MediaPipeFaceDetector;
        detectorRef.current = await window.faceDetection.createDetector(model, {
          runtime: 'mediapipe',
          solutionPath: 'https://cdn.jsdelivr.net/npm/@mediapipe/face_detection',
        });
        
        setStatus('live');
        detectLoop();
      } catch (scriptErr) {
        console.error('Neural Engine Load Failed:', scriptErr);
        setErrorMsg('Neural Engine Offline');
        setStatus('error');
      }
    } catch (cameraErr) {
      console.error('Camera Access Failed:', cameraErr);
      setErrorMsg('Camera Blocked');
      setStatus('error');
    }
  };

  const detectLoop = async () => {
    if (!detectorRef.current || !videoRef.current || !active) return;

    try {
      const faces = await detectorRef.current.estimateFaces(videoRef.current, { flipHorizontal: false });
      
      if (faces.length > 0) {
        const face = faces[0];
        const keypoints = face.keypoints;
        
        // MediaPipe Face Detection Keypoints:
        // 0: Right Eye, 1: Left Eye
        const rightEye = keypoints[0];
        const leftEye = keypoints[1];
        
        if (rightEye && leftEye) {
          const dx = rightEye.x - leftEye.x;
          const dy = rightEye.y - leftEye.y;
          const pixelIPD = Math.sqrt(dx * dx + dy * dy);
          
          // Calibration: Distance = (Real IPD * Focal) / Pixel IPD
          // Standard webcam focal length is roughly 600-800
          const focalLength = 750; 
          const realIPD = 6.3; // Average human IPD in cm
          
          const rawDistance = (realIPD * focalLength) / pixelIPD;
          
          // Smoothing with slightly higher alpha for more 'live' response
          let smoothedDistance = lastDistance.current * (1 - alpha) + rawDistance * alpha;
          
          // Limit range for simulation stability
          const finalDistance = Math.max(20, Math.min(120, Math.round(smoothedDistance)));
          
          lastDistance.current = smoothedDistance;
          setDistance(finalDistance);
          onDistanceUpdate(finalDistance);
        }
      }
    } catch (err) {
      // Don't crash the loop on occasional frame errors
    }

    if (active) animRef.current = requestAnimationFrame(detectLoop);
  };

  useEffect(() => {
    if (active) startSensor();
    else stopSensor();
    return () => stopSensor();
  }, [active]);

  if (!active) return null;

  return (
    <div className="absolute top-4 right-4 z-50">
      <div className="bg-[#0D1424]/95 backdrop-blur-xl border border-cyan-500/30 p-4 flex items-center gap-5 shadow-[0_0_50px_rgba(0,0,0,0.6)] rounded-sm">
        {/* Radar Viewport */}
        <div className="relative overflow-hidden w-32 h-24 border border-slate-800 bg-black">
          <video
            ref={videoRef}
            className="w-full h-full object-cover grayscale brightness-125 contrast-110 opacity-60"
            muted
            playsInline
          />
          {/* Scanning Overlay */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-0 w-full h-0.5 bg-cyan-400/30 animate-[scan_2s_linear_infinite]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)]" />
          </div>
          
          {status === 'live' && (
            <div className="absolute top-2 left-2 flex items-center gap-1.5 bg-black/40 px-2 py-0.5 border border-emerald-500/30">
               <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_#10b981]" />
               <span className="text-[7px] font-black text-emerald-400 tracking-[0.2em] uppercase">Tracking</span>
            </div>
          )}
        </div>
        
        {/* Telemetry Data */}
        <div className="flex flex-col gap-1 min-w-[120px]">
          <div className="flex items-center gap-2">
            <Cpu className={`w-3 h-3 ${status === 'live' ? 'text-cyan-400' : 'text-slate-600'}`} />
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-cyan-400/80">
              {status === 'loading' ? 'Neural_Boot' : status === 'live' ? 'Distance_Sync' : 'Sensor_Err'}
            </span>
          </div>
          
          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-mono text-white tabular-nums tracking-tighter">
              {distance || '--'}
            </span>
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">cm</span>
          </div>
          
          <div className="flex items-center gap-1.5">
             <span className="text-[7px] text-slate-500 font-black uppercase tracking-[0.2em]">
               {status === 'live' ? 'High_Precision' : 'Calibrating...'}
             </span>
          </div>

          {errorMsg && (
            <div className="flex items-center gap-2 mt-2 bg-rose-500/10 border border-rose-500/20 px-2 py-1">
              <AlertCircle size={10} className="text-rose-500" />
              <span className="text-[8px] text-rose-500 font-black uppercase tracking-tighter">
                {errorMsg}
              </span>
            </div>
          )}
        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes scan {
          0% { transform: translateY(0); }
          100% { transform: translateY(96px); }
        }
      `}} />
    </div>
  );
}
