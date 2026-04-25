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
  uniform float u_distance;
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

  // Real-time Neural Blur based on prescriptions AND distance
  vec4 getBlurry(vec2 uv) {
    vec2 zuv = getZoomedUV(uv);
    
    // Base power from prescription
    float basePower = abs(u_sphere) + abs(u_cyl) * 0.5;
    
    // Distance-induced blur (Accommodation Stress)
    // Toned down to avoid 'Too Blur' state
    float distanceStress = max(0.0, (60.0 - u_distance) * 0.04);
    float totalPower = basePower + distanceStress;
    
    if (totalPower < 0.01) return texture2D(u_texture, zuv);
    
    // Balanced blur scaling: ensures text is still 'readable' but out of focus
    float blurRadius = pow(totalPower, 0.7) * 2.2; 
    float cylExtra = abs(u_cyl) * 1.5;
    mat2 rot = rotMat(u_axis * 0.0174533);
    
    vec4 color = vec4(0.0);
    float total = 0.0;
    
    for (int x = -6; x <= 6; x++) {
      for (int y = -6; y <= 6; y++) {
        float fx = float(x); float fy = float(y);
        float dist = length(vec2(fx, fy));
        if (dist > 6.0) continue;
        
        vec2 offset = vec2(fx * blurRadius, fy * (blurRadius + cylExtra));
        offset = rot * offset / (u_resolution + 0.0001);
        
        float sigma = totalPower * 0.8 + 0.4;
        float weight = exp(-(dist * dist) / (2.0 * sigma * sigma));
        color += texture2D(u_texture, zuv + offset) * weight;
        total += weight;
      }
    }
    return color / total;
  }

  // EYEP Adaptive Solution - Clears up even with distance changes
  vec4 getCorrected(vec2 uv) {
    vec2 zuv = getZoomedUV(uv);
    vec4 original = texture2D(u_texture, zuv);
    
    // Current optical state vs Initial target
    float diffSph = abs(u_sphere - u_init_sphere);
    float diffCyl = abs(u_cyl - u_init_cyl);
    float delta = diffSph + diffCyl * 0.5;
    
    // EYEP compensates for distance stress automatically on this side
    // so we only apply blur if the 'Tuning' is off.
    if (delta < 0.08) {
       vec3 lumWeights = vec3(0.299, 0.587, 0.114);
       float centerLum = dot(original.rgb, lumWeights);
       float spread = 0.5; 
       vec2 off = vec2(spread) / (u_resolution + 0.0001);
       vec4 n = texture2D(u_texture, zuv + vec2(0.0, off.y));
       vec4 w = texture2D(u_texture, zuv - vec2(off.x, 0.0));
       float avgLum = (dot(n.rgb, lumWeights) + dot(w.rgb, lumWeights)) / 2.0;
       float k = (u_contrast - 1.0) * 0.5 + 0.2;
       float sharpenedLum = clamp(centerLum + (centerLum - avgLum) * k, 0.0, 1.0);
       return vec4(original.rgb * (sharpenedLum / (centerLum + 0.00001)), original.a);
    }

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
    if (vUv.x < u_split) {
      gl_FragColor = getBlurry(vUv);
    } else {
      gl_FragColor = getCorrected(vUv);
    }
    if (u_split > 0.01 && u_split < 0.99 && abs(vUv.x - u_split) < 0.002) {
      gl_FragColor = vec4(0.0, 1.0, 0.7, 1.0);
    }
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
    u_distance: { value: 60.0 },
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
    u.u_distance.value = THREE.MathUtils.lerp(u.u_distance.value, c.distance_cm || 60, 0.1);
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
    </div>
  );
}
