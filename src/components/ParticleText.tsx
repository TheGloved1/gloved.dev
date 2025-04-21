'use client';

import { useIsMobile } from '@/hooks/use-mobile';
import { useCallback, useEffect, useMemo, useRef } from 'react';

interface ParticleTextProps {
  text: string;
  size?: number;
  fontFamily?: string;
  fontWeight?: string | number;
  particleSize?: number;
  particleCount?: number;
  baseColor?: string;
  hoverColor?: string;
  backgroundColor?: string | 'transparent';
  backgroundOpacity?: number;
  hoverRadius?: number;
  edgeComplexity?: number;
  animationSpeed?: number;
  animationIntensity?: number;
  blurRadius?: number;
  performanceMode?: boolean;
  className?: string;
}

export default function ParticleText({
  text,
  size = 80,
  fontFamily = 'sans-serif',
  fontWeight = 'bold',
  particleSize = 1,
  particleCount = 7000,
  baseColor = 'white',
  hoverColor = '#00DCFF',
  backgroundColor = 'transparent',
  backgroundOpacity = 1,
  hoverRadius = 40,
  edgeComplexity = 5,
  animationSpeed = 0.003,
  animationIntensity = 0.3,
  blurRadius = 240,
  performanceMode = false,
  className = '',
}: ParticleTextProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mousePositionRef = useRef({ x: -1000, y: -1000 });
  const isTouchingRef = useRef(false);
  const animationTimeRef = useRef(0);
  const lastFrameTimeRef = useRef(0);
  const fpsLimitRef = useRef(60); // Target FPS
  const isMobile = useIsMobile();

  // Pre-parse colors to avoid doing it every frame
  const parsedColors = useMemo(() => {
    return {
      base: parseColor(baseColor),
      hover: parseColor(hoverColor),
      background: backgroundColor !== 'transparent' ? parseColor(backgroundColor) : null,
    };
  }, [baseColor, hoverColor, backgroundColor]);

  // Parse a color string into RGB components
  function parseColor(color: string): { r: number; g: number; b: number } {
    // For hex colors
    if (color.startsWith('#')) {
      return {
        r: Number.parseInt(color.slice(1, 3), 16),
        g: Number.parseInt(color.slice(3, 5), 16),
        b: Number.parseInt(color.slice(5, 7), 16),
      };
    }

    // For rgb/rgba colors
    const rgbMatch = color.match(/\d+/g);
    if (color.startsWith('rgb') && rgbMatch && rgbMatch.length >= 3) {
      return {
        r: Number(rgbMatch[0]),
        g: Number(rgbMatch[1]),
        b: Number(rgbMatch[2]),
      };
    }

    // For named colors, use a canvas to parse
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = color;
      ctx.fillRect(0, 0, 1, 1);
      const data = ctx.getImageData(0, 0, 1, 1).data;
      return {
        r: data[0],
        g: data[1],
        b: data[2],
      };
    }

    // Default to white if parsing fails
    return { r: 255, g: 255, b: 255 };
  }

  // Blend two colors efficiently
  function blendColors(
    color1: { r: number; g: number; b: number },
    color2: { r: number; g: number; b: number },
    ratio: number,
  ): string {
    const r = Math.round(color1.r + (color2.r - color1.r) * ratio);
    const g = Math.round(color1.g + (color2.g - color1.g) * ratio);
    const b = Math.round(color1.b + (color2.b - color1.b) * ratio);
    return `rgb(${r},${g},${b})`;
  }

  // Cache for dynamic radius calculations
  const radiusCache = useRef<Map<string, number>>(new Map());

  // Optimized dynamic radius calculation with caching
  const calculateDynamicRadius = useCallback(
    (angle: number, time: number): number => {
      // Round values to reduce cache size while maintaining visual quality
      const roundedAngle = Math.round(angle * 100) / 100;
      const roundedTime = Math.round(time * 100) / 100;

      const cacheKey = `${roundedAngle}-${roundedTime}-${edgeComplexity}-${animationIntensity}`;

      if (radiusCache.current.has(cacheKey)) {
        return radiusCache.current.get(cacheKey)!;
      }

      let radius = hoverRadius;

      // Optimize sine wave calculations
      if (edgeComplexity > 0 && animationIntensity > 0) {
        // Limit complexity for performance mode
        const actualComplexity = performanceMode ? Math.min(3, edgeComplexity) : edgeComplexity;

        for (let i = 1; i <= actualComplexity; i++) {
          const frequency = i * 2;
          const amplitude = (hoverRadius * animationIntensity) / i;
          radius += Math.sin(roundedAngle * frequency + roundedTime * i) * amplitude;
        }
      }

      // Limit cache size to prevent memory issues
      if (radiusCache.current.size > 1000) {
        // Clear half the cache when it gets too large
        const keys = Array.from(radiusCache.current.keys());
        for (let i = 0; i < 500; i++) {
          radiusCache.current.delete(keys[i]);
        }
      }

      radiusCache.current.set(cacheKey, radius);
      return radius;
    },
    [hoverRadius, edgeComplexity, animationIntensity, performanceMode],
  );

  // Easing function for smoother transitions
  function easeOutCubic(x: number): number {
    return 1 - Math.pow(1 - x, 3);
  }

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    // Set appropriate FPS limit based on device performance
    if (performanceMode || isMobile) {
      fpsLimitRef.current = 30;
    } else {
      fpsLimitRef.current = 60;
    }

    const updateCanvasSize = () => {
      if (canvas.clientWidth > 0 && canvas.clientHeight > 0) {
        // Use device pixel ratio for high-DPI displays, but limit it for performance
        const dpr = performanceMode ? 1 : Math.min(window.devicePixelRatio || 1, 2);

        canvas.width = canvas.clientWidth * dpr;
        canvas.height = canvas.clientHeight * dpr;

        // Scale the context to account for the device pixel ratio
        ctx.scale(dpr, dpr);
      } else {
        canvas.width = 1;
        canvas.height = 1;
      }
    };

    // Particle type with optimized properties
    type Particle = {
      x: number;
      y: number;
      baseX: number;
      baseY: number;
      size: number;
      life: number;
      angle: number;
      // Remove color strings and use indices to parsedColors instead
    };

    let particles: Particle[] = [];
    let textImageData: ImageData | null = null;
    let activeParticleCount = 0;

    function createTextImage() {
      if (!ctx || !canvas) return 0;

      if (canvas.width <= 0 || canvas.height <= 0) {
        console.warn('Invalid canvas dimensions, skipping text rendering');
        return 0;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const fontSize = isMobile ? size * 0.6 : size;
      ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
      ctx.fillStyle = baseColor;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, canvas.width / 2, canvas.height / 2);

      try {
        textImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      } catch (error) {
        console.error('Error getting image data:', error);
        textImageData = null;
      }

      return fontSize;
    }

    function createParticle(): Particle | null {
      if (!ctx || !canvas || !textImageData) return null;

      if (textImageData.width <= 0 || textImageData.height <= 0) {
        return null;
      }

      const data = textImageData.data;
      const canvasWidth = canvas.width / (window.devicePixelRatio || 1);
      const canvasHeight = canvas.height / (window.devicePixelRatio || 1);

      // Optimize particle creation with fewer attempts
      const maxAttempts = performanceMode ? 50 : 100;

      for (let attempt = 0; attempt < maxAttempts; attempt++) {
        const x = Math.floor(Math.random() * canvasWidth);
        const y = Math.floor(Math.random() * canvasHeight);

        if (x < 0 || x >= canvasWidth || y < 0 || y >= canvasHeight) {
          continue;
        }

        // Scale coordinates for high-DPI
        const scaledX = Math.floor(x * (window.devicePixelRatio || 1));
        const scaledY = Math.floor(y * (window.devicePixelRatio || 1));

        const index = (scaledY * textImageData.width + scaledX) * 4;

        if (index < 0 || index >= data.length - 3) {
          continue;
        }

        if (data[index + 3] > 128) {
          return {
            x: x,
            y: y,
            baseX: x,
            baseY: y,
            size: Math.random() * particleSize + 0.5,
            life: Math.random() * 100 + 50,
            angle: Math.random() * Math.PI * 2,
          };
        }
      }

      return null;
    }

    function createInitialParticles() {
      if (!canvas) return;

      // Scale particle count based on performance mode and device
      let scaleFactor = Math.sqrt((canvas.clientWidth * canvas.clientHeight) / (1920 * 1080));

      if (performanceMode) {
        scaleFactor *= 0.5; // Reduce particles by 50% in performance mode
      } else if (isMobile) {
        scaleFactor *= 0.7; // Reduce particles by 30% on mobile
      }

      const scaledParticleCount = Math.floor(particleCount * scaleFactor);

      // Create particles in batches to avoid blocking the main thread
      const batchSize = 500;
      let created = 0;

      function createBatch() {
        const batchEnd = Math.min(created + batchSize, scaledParticleCount);

        for (let i = created; i < batchEnd; i++) {
          const particle = createParticle();
          if (particle) {
            particles.push(particle);
            activeParticleCount++;
          }
        }

        created = batchEnd;

        if (created < scaledParticleCount) {
          // Schedule next batch
          setTimeout(createBatch, 0);
        }
      }

      createBatch();
    }

    let animationFrameId: number;

    function animate(timestamp: number) {
      // Frame rate limiting
      const elapsed = timestamp - lastFrameTimeRef.current;
      const fpsInterval = 1000 / fpsLimitRef.current;

      if (elapsed < fpsInterval) {
        animationFrameId = requestAnimationFrame(animate);
        return;
      }

      lastFrameTimeRef.current = timestamp - (elapsed % fpsInterval);
      animationTimeRef.current = timestamp * animationSpeed;

      if (!ctx || !canvas) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (backgroundColor !== 'transparent' && parsedColors.background) {
        ctx.fillStyle = `rgba(${parsedColors.background.r}, ${parsedColors.background.g}, ${parsedColors.background.b}, ${backgroundOpacity})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      const { x: mouseX, y: mouseY } = mousePositionRef.current;
      const isHovering = mouseX > -999 && mouseY > -999 && (isTouchingRef.current || !('ontouchstart' in window));

      // Skip expensive calculations if not hovering
      const maxEffectDistance = hoverRadius + blurRadius + hoverRadius * animationIntensity;

      // Process particles in batches for better performance
      const batchSize = performanceMode ? 100 : 200;

      for (let i = 0; i < activeParticleCount; i++) {
        const p = particles[i];

        // Skip calculation if far from mouse and not in transition
        const dx = mouseX - p.x;
        const dy = mouseY - p.y;
        const distanceSquared = dx * dx + dy * dy;

        // Quick check using squared distance (faster than sqrt)
        if (isHovering && distanceSquared < maxEffectDistance * maxEffectDistance) {
          const distance = Math.sqrt(distanceSquared);
          const angle = Math.atan2(dy, dx);

          // Calculate dynamic radius based on angle and time
          const dynamicRadius = calculateDynamicRadius(angle, animationTimeRef.current);

          // Calculate the blur zone
          const blurStart = dynamicRadius;
          const blurEnd = dynamicRadius + blurRadius;

          // Determine if the particle is in the blur zone
          let blurRatio = 0;

          if (distance < blurStart) {
            // Inside the main hover area - full effect
            blurRatio = 1;
          } else if (distance < blurEnd) {
            // Inside the blur zone - partial effect based on distance
            blurRatio = 1 - (distance - blurStart) / (blurEnd - blurStart);

            // Apply easing function for smoother transition
            blurRatio = easeOutCubic(blurRatio);
          }

          if (blurRatio > 0) {
            // Calculate force based on blur ratio
            const force = blurRatio;

            // Add slight variation to the angle for more organic movement
            const angleVariation = Math.sin(p.angle + animationTimeRef.current) * 0.2;
            const moveAngle = angle + angleVariation;

            // Calculate movement with organic variation
            const moveX = Math.cos(moveAngle) * force * 60;
            const moveY = Math.sin(moveAngle) * force * 60;

            // Apply a subtle oscillation to the particle position
            const oscillation = Math.sin(animationTimeRef.current * 10 + p.angle) * 2;

            p.x = p.baseX - moveX * blurRatio + oscillation * Math.cos(p.angle) * blurRatio;
            p.y = p.baseY - moveY * blurRatio + oscillation * Math.sin(p.angle) * blurRatio;

            // Blend colors based on blur ratio
            ctx.fillStyle = blendColors(parsedColors.base, parsedColors.hover, blurRatio);
          } else {
            // Add subtle movement even when not hovering
            const returnSpeed = 0.1;
            p.x += (p.baseX - p.x) * returnSpeed;
            p.y += (p.baseY - p.y) * returnSpeed;
            ctx.fillStyle = baseColor;
          }
        } else {
          // Outside effect range - return to base position
          const returnSpeed = 0.1;
          p.x += (p.baseX - p.x) * returnSpeed;
          p.y += (p.baseY - p.y) * returnSpeed;
          ctx.fillStyle = baseColor;
        }

        ctx.fillRect(p.x, p.y, p.size, p.size);

        p.life--;
        if (p.life <= 0) {
          const newParticle = createParticle();
          if (newParticle) {
            particles[i] = newParticle;
          } else {
            // Remove particle if can't create a new one
            particles.splice(i, 1);
            i--;
            activeParticleCount--;
          }
        }
      }

      // Maintain particle count, but do it less frequently
      if (timestamp % 60 < 16) {
        // Only check every ~4 frames
        const scaleFactor = Math.sqrt((canvas.clientWidth * canvas.clientHeight) / (1920 * 1080));
        const targetCount = Math.floor(particleCount * scaleFactor * (performanceMode ? 0.5 : 1) * (isMobile ? 0.7 : 1));

        // Add particles if needed, but limit how many we add per frame
        if (activeParticleCount < targetCount) {
          const toAdd = Math.min(5, targetCount - activeParticleCount);
          for (let i = 0; i < toAdd; i++) {
            const newParticle = createParticle();
            if (newParticle) {
              particles.push(newParticle);
              activeParticleCount++;
            }
          }
        }
      }

      animationFrameId = requestAnimationFrame(animate);
    }

    // Delay initialization slightly to ensure the canvas has proper dimensions
    const initTimeout = setTimeout(() => {
      updateCanvasSize();
      createTextImage();
      createInitialParticles();
      animationFrameId = requestAnimationFrame(animate);
    }, 50);

    const handleResize = () => {
      // Clear the radius cache on resize
      radiusCache.current.clear();

      updateCanvasSize();
      createTextImage();
      particles = [];
      activeParticleCount = 0;
      createInitialParticles();
    };

    const handleMove = (clientX: number, clientY: number) => {
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top;

      mousePositionRef.current = { x, y };
    };

    // Throttle mouse move events for better performance
    let lastMoveTime = 0;
    const moveThreshold = performanceMode ? 30 : 16; // ms between move events (60fps or 30fps)

    const handleMouseMove = (e: MouseEvent) => {
      const now = performance.now();
      if (now - lastMoveTime < moveThreshold) return;

      lastMoveTime = now;
      handleMove(e.clientX, e.clientY);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        e.preventDefault();

        const now = performance.now();
        if (now - lastMoveTime < moveThreshold) return;

        lastMoveTime = now;
        handleMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    const handleTouchStart = () => {
      isTouchingRef.current = true;
    };

    const handleTouchEnd = () => {
      isTouchingRef.current = false;
      mousePositionRef.current = { x: -1000, y: -1000 };
    };

    const handleMouseLeave = () => {
      if (!('ontouchstart' in window)) {
        mousePositionRef.current = { x: -1000, y: -1000 };
      }
    };

    // Use a more efficient resize observer
    const resizeObserver = new ResizeObserver(() => {
      // Debounce resize events
      if (resizeTimeout) clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(handleResize, 100);
    });

    let resizeTimeout: ReturnType<typeof setTimeout> | null = null;

    resizeObserver.observe(canvas);

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('touchend', handleTouchEnd);

    return () => {
      if (resizeTimeout) clearTimeout(resizeTimeout);
      clearTimeout(initTimeout);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
      resizeObserver.disconnect();
      cancelAnimationFrame(animationFrameId);

      // Clear caches
      // eslint-disable-next-line react-hooks/exhaustive-deps
      radiusCache.current.clear();
    };
  }, [
    text,
    size,
    fontFamily,
    fontWeight,
    particleSize,
    particleCount,
    baseColor,
    hoverColor,
    backgroundColor,
    backgroundOpacity,
    hoverRadius,
    edgeComplexity,
    animationSpeed,
    animationIntensity,
    blurRadius,
    performanceMode,
    isMobile,
    parsedColors,
    calculateDynamicRadius,
  ]);

  return (
    <canvas
      ref={canvasRef}
      className={`h-full w-full touch-none ${className}`}
      aria-label={`Interactive particle effect displaying: ${text}`}
      style={{ background: 'transparent' }}
    />
  );
}
