import React, { useRef, useEffect, useState, useCallback } from 'react';

interface Particle {
  x: number;
  y: number;
  z: number;
  originalX: number;
  originalY: number;
  originalZ: number;
  targetX: number;
  targetY: number;
  targetZ: number;
  size: number;
  opacity: number;
  phase: number;
  speed: number;
}

interface AudioVisualizationProps {
  isListening: boolean;
  isSpeaking: boolean;
  audioLevel: number;
  className?: string;
  size?: number;
}

const AudioVisualization: React.FC<AudioVisualizationProps> = ({
  isListening,
  isSpeaking,
  audioLevel = 0,
  className = '',
  size = 300
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | undefined>(undefined);
  const particlesRef = useRef<Particle[]>([]);
  const timeRef = useRef(0);

  const [isInitialized, setIsInitialized] = useState(false);
  const [transitionFactor, setTransitionFactor] = useState(0); // 0 = idle, 1 = full active
  const lastActiveRef = useRef(0); // Track when user was last active

  // Initialize particles in a sphere formation
  const initializeParticles = useCallback(() => {
    const particles: Particle[] = [];
    const particleCount = 250;
    const radius = size * 0.35;

    for (let i = 0; i < particleCount; i++) {
      // Use fibonacci sphere for even distribution
      const phi = Math.acos(-1 + (2 * i) / particleCount);
      const theta = Math.sqrt(particleCount * Math.PI) * phi;

      const x = radius * Math.cos(theta) * Math.sin(phi);
      const y = radius * Math.sin(theta) * Math.sin(phi);
      const z = radius * Math.cos(phi);

      // Create varied particle sizes - mix of small, medium, and large
      let particleSize;
      const sizeRandom = Math.random();
      if (sizeRandom < 0.6) {
        // 60% small particles
        particleSize = Math.random() * 1.5 + 0.5; // 0.5 to 2
      } else {
        // 40% medium particles
        particleSize = Math.random() * 2 + 2; // 2 to 4
      }

      particles.push({
        x,
        y,
        z,
        originalX: x,
        originalY: y,
        originalZ: z,
        targetX: x,
        targetY: y,
        targetZ: z,
        size: particleSize,
        opacity: Math.random() * 0.7 + 0.3,
        phase: Math.random() * Math.PI * 2,
        speed: Math.random() * 0.02 + 0.01
      });
    }

    particlesRef.current = particles;
    setIsInitialized(true);
  }, [size]);

  // Get color based on state with smooth interpolation
  const getParticleColor = (state: 'idle' | 'listening' | 'speaking', opacity: number, transitionFactor: number) => {
    const idleColor = { r: 59, g: 130, b: 246 }; // Blue
    const listeningColor = { r: 59, g: 130, b: 246 }; // Blue
    const speakingColor = { r: 20, g: 184, b: 166 }; // Teal

    let targetColor = idleColor;
    if (state === 'listening') {
      targetColor = listeningColor;
    } else if (state === 'speaking') {
      targetColor = speakingColor;
    }

    // Smooth color interpolation
    const r = Math.round(idleColor.r + (targetColor.r - idleColor.r) * transitionFactor);
    const g = Math.round(idleColor.g + (targetColor.g - idleColor.g) * transitionFactor);
    const b = Math.round(idleColor.b + (targetColor.b - idleColor.b) * transitionFactor);

    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  };

  // Animation loop
  const animate = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !isInitialized) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    timeRef.current += 0.016; // ~60fps

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Use CSS size for calculations (not scaled canvas size)
    const centerX = size / 2;
    const centerY = size / 2;

    // Smooth transition logic
    const isCurrentlyActive = (isListening && audioLevel > 0.1) || isSpeaking;

    if (isCurrentlyActive) {
      lastActiveRef.current = timeRef.current;
    }

    // Calculate smooth transition factor (0 = idle, 1 = fully active)
    const timeSinceActive = timeRef.current - lastActiveRef.current;
    const fadeOutDuration = 1.5; // 1.5 seconds fade out

    let targetTransition = isCurrentlyActive ? 1 : Math.max(0, 1 - (timeSinceActive / fadeOutDuration));

    // Smooth interpolation towards target
    const transitionSpeed = 0.05;
    setTransitionFactor(prev => {
      const newValue = prev + (targetTransition - prev) * transitionSpeed;
      // Clamp to avoid floating point precision issues
      return Math.max(0, Math.min(1, newValue));
    });

    // Determine base state for color mixing
    let primaryState: 'idle' | 'listening' | 'speaking' = 'idle';
    if (isSpeaking) primaryState = 'speaking';
    else if ((isListening && audioLevel > 0.1) || transitionFactor > 0.1) primaryState = 'listening';

    // Animation parameters based on transition
    const baseRadius = size * 0.35;
    const radiusMultiplier = 1 + (audioLevel * 0.3 * transitionFactor);
    const breathingEffect = Math.sin(timeRef.current * 2) * 0.05 + 1;
    const particleScale = primaryState === 'speaking' ? 1 + (0.5 * transitionFactor) : 1;

    particlesRef.current.forEach((particle, index) => {
      // Update particle position based on state
      let targetRadius = baseRadius * radiusMultiplier * breathingEffect;

      if (primaryState === 'speaking') {
        // Add wave effect for speaking
        const waveOffset = Math.sin(timeRef.current * 3 + index * 0.1) * 20 * transitionFactor;
        targetRadius += waveOffset;
      } else if (primaryState === 'listening') {
        // Add gentle pulsing for listening
        const pulseOffset = Math.sin(timeRef.current * 4 + particle.phase) * 10 * transitionFactor;
        targetRadius += pulseOffset;
      }

      // Calculate target position
      const normalizedRadius = Math.sqrt(
        particle.originalX ** 2 + particle.originalY ** 2 + particle.originalZ ** 2
      );
      const scale = targetRadius / normalizedRadius;

      particle.targetX = particle.originalX * scale;
      particle.targetY = particle.originalY * scale;
      particle.targetZ = particle.originalZ * scale;

      // Smooth interpolation to target position
      const lerpSpeed = 0.08; // Smooth movement speed
      particle.x += (particle.targetX - particle.x) * lerpSpeed;
      particle.y += (particle.targetY - particle.y) * lerpSpeed;
      particle.z += (particle.targetZ - particle.z) * lerpSpeed;

      // Update particle properties
      particle.phase += particle.speed;

      // Keep consistent opacity
      let particleOpacity = particle.opacity;
      if (primaryState === 'listening') {
        particleOpacity *= (Math.sin(particle.phase) * 0.3 + 0.8); // Gentle shimmer
      } else if (primaryState === 'speaking') {
        particleOpacity *= (Math.sin(particle.phase * 2) * 0.3 + 0.7); // Slightly more dynamic
      }

      // 3D to 2D projection (simple perspective)
      const perspective = 400;
      const scale3D = perspective / (perspective + particle.z);
      const x2D = centerX + particle.x * scale3D;
      const y2D = centerY + particle.y * scale3D;

      // Draw particle
      const particleSize = particle.size * scale3D * particleScale;
      const color = getParticleColor(primaryState, particleOpacity, transitionFactor);

      ctx.beginPath();
      ctx.arc(x2D, y2D, particleSize, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();

      // Add glow effect for active states
      if (primaryState !== 'idle' && transitionFactor > 0.1) {
        ctx.beginPath();
        ctx.arc(x2D, y2D, particleSize * 2, 0, Math.PI * 2);
        ctx.fillStyle = getParticleColor(primaryState, particleOpacity * 0.1, transitionFactor);
        ctx.fill();
      }
    });

    animationFrameRef.current = requestAnimationFrame(animate);
  }, [isInitialized, isListening, isSpeaking, audioLevel, size]);

  // Setup high-DPI canvas
  const setupCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Get device pixel ratio for crisp rendering on high DPI screens
    const dpr = window.devicePixelRatio || 1;

    // Set actual canvas size (high resolution)
    canvas.width = size * dpr;
    canvas.height = size * dpr;

    // Scale context for high DPI
    ctx.scale(dpr, dpr);

    // Set CSS size (what user sees)
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;

    // Enable anti-aliasing
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
  }, [size]);

  // Initialize and start animation
  useEffect(() => {
    setupCanvas();
    initializeParticles();
  }, [setupCanvas, initializeParticles]);

  useEffect(() => {
    if (isInitialized) {
      animate();
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isInitialized, animate]);

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <canvas
        ref={canvasRef}
        className="drop-shadow-lg"
        style={{
          background: 'transparent',
          borderRadius: '50%',
        }}
      />
    </div>
  );
};

export default AudioVisualization;
