import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

const fragmentShader = `
  uniform sampler2D u_texture;
  uniform float u_sphere;
  uniform float u_cyl;
  uniform float u_axis;
  uniform float u_init_sphere;
  uniform float u_init_cyl;
  uniform float u_init_axis;
  uniform float u_contrast;
  uniform float u_split;
  uniform vec2 u_resolution;
  uniform float u_zoom;
  varying vec2 vUv;

  mat2 rotMat(float a) {
    float s = sin(a), c = cos(a);
    return mat2(c, -s, s, c);
  }

  vec2 getZoomedUV(vec2 uv) {
    vec2 centered = uv - 0.5;
    centered /= u_zoom;
    return centered + 0.5;
  }

  vec4 getBlurry(vec2 uv) {
    vec2 zuv = getZoomedUV(uv);
    float totalPower = abs(u_sphere) + abs(u_cyl) * 0.5;
    if (totalPower < 0.01) return texture2D(u_texture, zuv);
    
    float blurRadius = totalPower * 6.0; 
    float cylExtra = abs(u_cyl) * 3.0;
    mat2 rot = rotMat(u_axis * 0.0174533);
    
    vec4 color = vec4(0.0);
    float total = 0.0;
    
    for (int x = -6; x <= 6; x++) {
      for (int y = -6; y <= 6; y++) {
        float fx = float(x);
        float fy = float(y);
        float dist = length(vec2(fx, fy));
        if (dist > 6.0) continue;
        
        vec2 offset = vec2(fx * blurRadius, fy * (blurRadius + cylExtra));
        offset = rot * offset / (u_resolution + 0.0001);
        
        float sigma = totalPower * 1.5 + 0.5;
        float weight = exp(-(dist * dist) / (2.0 * sigma * sigma));
        
        color += texture2D(u_texture, zuv + offset) * weight;
        total += weight;
      }
    }
    return color / total;
  }

  // Interactive Calibration Simulation
  // The 'Corrected' view is only clear when the current settings match the initial prescription
  vec4 getCorrected(vec2 uv) {
    vec2 zuv = getZoomedUV(uv);
    vec4 original = texture2D(u_texture, zuv);
    
    // Calculate Calibration Delta
    float diffSph = abs(u_sphere - u_init_sphere);
    float diffCyl = abs(u_cyl - u_init_cyl);
    float delta = diffSph + diffCyl * 0.5;
    
    // If we are perfectly tuned (delta near zero), return crisp clear image
    if (delta < 0.05) {
       // Apply a tiny 'crisp' boost for the wow effect
       vec3 lumWeights = vec3(0.299, 0.587, 0.114);
       float centerLum = dot(original.rgb, lumWeights);
       
       float spread = 0.5; 
       vec2 off = vec2(spread) / (u_resolution + 0.0001);
       vec4 n = texture2D(u_texture, zuv + vec2(0.0, off.y));
       vec4 w = texture2D(u_texture, zuv - vec2(off.x, 0.0));
       float avgLum = (dot(n.rgb, lumWeights) + dot(w.rgb, lumWeights)) / 2.0;
       
       float k = (u_contrast - 1.0) * 0.5 + 0.1;
       float sharpenedLum = clamp(centerLum + (centerLum - avgLum) * k, 0.0, 1.0);
       return vec4(original.rgb * (sharpenedLum / (centerLum + 0.00001)), original.a);
    }

    // Otherwise, apply calibration blur (representing an untuned display)
    float blurRadius = delta * 4.0;
    vec4 color = vec4(0.0);
    float total = 0.0;
    for (int x = -3; x <= 3; x++) {
      for (int y = -3; y <= 3; y++) {
        float fx = float(x); float fy = float(y);
        vec2 offset = vec2(fx * blurRadius, fy * blurRadius) / (u_resolution + 0.0001);
        float weight = exp(-(length(vec2(fx, fy)) * length(vec2(fx, fy))) / 2.0);
        color += texture2D(u_texture, zuv + offset) * weight;
        total += weight;
      }
    }
    return color / total;
  }

  void main() {
    vec4 finalColor;
    if (vUv.x < u_split) {
      finalColor = getBlurry(vUv);
    } else {
      finalColor = getCorrected(vUv);
    }

    if (u_split > 0.01 && u_split < 0.99 && abs(vUv.x - u_split) < 0.0025) {
      finalColor = vec4(0.0, 1.0, 0.6, 1.0);
    }

    gl_FragColor = finalColor;
  }
`;

const ScreenQuad = ({ config, initialPower, isSplit, url, zoom }) => {
  const meshRef = useRef();
  const configRef = useRef(config);
  const zoomRef = useRef(zoom);
  const texture = useTexture(url);
  const { size } = useThree();

  useEffect(() => { configRef.current = config; }, [config]);
  useEffect(() => { zoomRef.current = zoom; }, [zoom]);

  const uniforms = useMemo(() => ({
    u_texture: { value: texture },
    u_sphere: { value: 0 },
    u_cyl: { value: 0 },
    u_axis: { value: 0 },
    u_init_sphere: { value: initialPower.sphere },
    u_init_cyl: { value: initialPower.cyl },
    u_init_axis: { value: initialPower.axis },
    u_contrast: { value: 1.0 },
    u_split: { value: 0.5 },
    u_resolution: { value: new THREE.Vector2(size.width, size.height) },
    u_zoom: { value: 1.0 },
  }), [texture, initialPower]);

  useFrame(() => {
    if (!meshRef.current) return;
    const u = meshRef.current.material.uniforms;
    const c = configRef.current;
    
    u.u_sphere.value = THREE.MathUtils.lerp(u.u_sphere.value, c.sphere || 0, 0.1);
    u.u_cyl.value = THREE.MathUtils.lerp(u.u_cyl.value, c.cyl || 0, 0.1);
    u.u_axis.value = THREE.MathUtils.lerp(u.u_axis.value, c.axis || 0, 0.1);
    u.u_contrast.value = THREE.MathUtils.lerp(u.u_contrast.value, c.contrast_boost || 1.0, 0.1);
    u.u_split.value = isSplit ? 0.5 : 1.0;
    u.u_resolution.value.set(size.width, size.height);
    u.u_zoom.value = zoomRef.current;
  });

  return (
    <mesh ref={meshRef}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial vertexShader={vertexShader} fragmentShader={fragmentShader} uniforms={uniforms} />
    </mesh>
  );
};

export default function VisionEngine({ config, initialPower, isSplit, imageUrl }) {
  const [zoom, setZoom] = useState(1.0);
  const containerRef = useRef();

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const handleWheel = (e) => {
      e.preventDefault();
      setZoom(prev => Math.max(1.0, Math.min(5, prev + (e.deltaY > 0 ? -0.1 : 0.1))));
    };
    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
  }, []);

  return (
    <div ref={containerRef} className="w-full h-full bg-black relative">
      <Canvas gl={{ preserveDrawingBuffer: true, antialias: true }}>
        <React.Suspense fallback={<mesh><planeGeometry args={[2, 2]} /><meshBasicMaterial color="#0A0F1A" /></mesh>}>
          <ScreenQuad key={imageUrl} config={config} initialPower={initialPower} isSplit={isSplit} url={imageUrl} zoom={zoom} />
        </React.Suspense>
      </Canvas>
      {isSplit && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 pointer-events-none flex gap-6">
          <div className="flex flex-col items-center gap-1">
            <span className="text-[10px] uppercase tracking-[0.2em] font-black text-rose-500/80 bg-black/80 px-4 py-2 border border-rose-500/20 rounded-sm">Without EYEP</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <span className="text-[10px] uppercase tracking-[0.2em] font-black text-cyan-400 bg-cyan-950/80 px-4 py-2 border border-cyan-500/40 rounded-sm shadow-[0_0_15px_rgba(0,255,255,0.1)]">With EYEP Solution</span>
          </div>
        </div>
      )}
    </div>
  );
}
