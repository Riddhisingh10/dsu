import React, { useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useTexture, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = `
  uniform sampler2D u_texture;
  uniform float u_sphere;
  uniform float u_focal;
  uniform float u_contrast;
  uniform float u_split;
  uniform vec2 u_resolution;
  varying vec2 vUv;

  // Simple Wiener-like Deconvolution/Pre-distortion
  // In a real medical app, this would involve FFTs, but for real-time GLSL,
  // we use a multi-tap sharpened laplacian or a synthetic inverse PSF.
  
  vec4 getCorrected(vec2 uv, float diopter) {
    float strength = abs(diopter) * 0.005;
    vec2 off = vec2(strength) / u_resolution;
    
    // 9-tap sharpening filter as a simplified "pre-distortion"
    // to counteract the eye's blur (PSF)
    vec4 center = texture2D(u_texture, uv);
    vec4 n = texture2D(u_texture, uv + vec2(0.0, off.y));
    vec4 s = texture2D(u_texture, uv - vec2(0.0, off.y));
    vec4 e = texture2D(u_texture, uv + vec2(off.x, 0.0));
    vec4 w = texture2D(u_texture, uv - vec2(off.x, 0.0));
    
    vec4 ne = texture2D(u_texture, uv + vec2(off.x, off.y));
    vec4 nw = texture2D(u_texture, uv + vec2(-off.x, off.y));
    vec4 se = texture2D(u_texture, uv + vec2(off.x, -off.y));
    vec4 sw = texture2D(u_texture, uv + vec2(-off.x, -off.y));

    // Wiener-inspired high-pass kernel
    // Adjust kernel based on diopter (pre-compensation)
    float k = 8.0 * u_contrast;
    vec4 sharpened = center * (1.0 + k) - (n + s + e + w + ne + nw + se + sw) * (k / 8.0);
    
    return clamp(sharpened, 0.0, 1.0);
  }

  vec4 getBlurry(vec2 uv, float diopter) {
    float blurSize = abs(diopter) * 0.01;
    vec4 color = vec4(0.0);
    float total = 0.0;
    
    for (float x = -2.0; x <= 2.0; x++) {
      for (float y = -2.0; y <= 2.0; y++) {
        vec2 offset = vec2(x, y) * blurSize;
        color += texture2D(u_texture, uv + offset);
        total += 1.0;
      }
    }
    return color / total;
  }

  void main() {
    vec4 finalColor;
    
    if (vUv.x < u_split) {
      // Left side: Standard Vision (Simulated Blurry)
      finalColor = getBlurry(vUv, u_sphere);
    } else {
      // Right side: EYEP Corrected (Pre-distorted)
      finalColor = getCorrected(vUv, u_sphere);
    }

    // Split line
    if (abs(vUv.x - u_split) < 0.002) {
      finalColor = vec4(0.0, 1.0, 0.25, 1.0); // Cyber Green line
    }

    gl_FragColor = finalColor;
  }
`;

const ScreenQuad = ({ config, isSplit }) => {
  const meshRef = useRef();
  const texture = useTexture('https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=2070&auto=format&fit=crop'); // High res document example
  const { size } = useThree();

  const uniforms = useMemo(() => ({
    u_texture: { value: texture },
    u_sphere: { value: config.sphere },
    u_focal: { value: config.distance_cm / 100 },
    u_contrast: { value: config.contrast_boost },
    u_split: { value: isSplit ? 0.5 : 1.0 },
    u_resolution: { value: new THREE.Vector2(size.width, size.height) }
  }), [texture, size]);

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.material.uniforms.u_sphere.value = config.sphere;
      meshRef.current.material.uniforms.u_focal.value = config.distance_cm / 100;
      meshRef.current.material.uniforms.u_contrast.value = config.contrast_boost;
      meshRef.current.material.uniforms.u_split.value = isSplit ? 0.5 : 1.0;
      meshRef.current.material.uniforms.u_resolution.value.set(size.width, size.height);
    }
  });

  return (
    <mesh ref={meshRef}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
      />
    </mesh>
  );
};

export default function VisionEngine({ config, isSplit }) {
  return (
    <div className="w-full h-full bg-black">
      <Canvas>
        <PerspectiveCamera makeDefault position={[0, 0, 1]} />
        <ScreenQuad config={config} isSplit={isSplit} />
      </Canvas>
      <div className="absolute top-4 left-1/2 -translate-x-1/2 pointer-events-none">
        <div className="flex gap-8 text-[10px] uppercase tracking-widest font-bold text-cyber-green/50">
          {isSplit && (
            <>
              <span className="flex-1 text-center">Standard Vision</span>
              <span className="flex-1 text-center">EYEP Corrected</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
