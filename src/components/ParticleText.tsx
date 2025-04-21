'use client';

import { useEffect, useRef, useState } from 'react';

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
  hoverRadius = 240,
  edgeComplexity = 5,
  animationSpeed = 0.003,
  animationIntensity = 0.3,
  className = '',
}: ParticleTextProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mousePositionRef = useRef({ x: 0, y: 0 });
  const isTouchingRef = useRef(false);
  const animationTimeRef = useRef(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    const updateCanvasSize = () => {
      // Ensure the canvas has a parent with dimensions before setting width/height
      if (canvas.clientWidth > 0 && canvas.clientHeight > 0) {
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;
        setIsMobile(window.innerWidth < 768);
      } else {
        // Set minimum dimensions to prevent errors
        canvas.width = 1;
        canvas.height = 1;
      }
    };

    let particles: {
      x: number;
      y: number;
      baseX: number;
      baseY: number;
      size: number;
      color: string;
      scatteredColor: string;
      life: number;
      angle?: number;
    }[] = [];

    let textImageData: ImageData | null = null;

    function createTextImage() {
      if (!ctx || !canvas) return 0;

      // Check for valid canvas dimensions
      if (canvas.width <= 0 || canvas.height <= 0) {
        console.warn('Invalid canvas dimensions, skipping text rendering');
        return 0;
      }

      // Clear the canvas to transparency
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Calculate font size based on provided size and mobile status
      const fontSize = isMobile ? size * 0.6 : size;

      // Set font properties
      ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
      ctx.fillStyle = baseColor;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // Draw text in the center of the canvas
      ctx.fillText(text, canvas.width / 2, canvas.height / 2);

      try {
        // Wrap in try/catch to handle potential errors
        textImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      } catch (error) {
        console.error('Error getting image data:', error);
        textImageData = null;
      }

      return fontSize;
    }

    function createParticle() {
      if (!ctx || !canvas || !textImageData) return null;

      // Verify dimensions again
      if (textImageData.width <= 0 || textImageData.height <= 0) {
        return null;
      }

      const data = textImageData.data;

      // Try to find a pixel that's part of the text
      for (let attempt = 0; attempt < 100; attempt++) {
        const x = Math.floor(Math.random() * canvas.width);
        const y = Math.floor(Math.random() * canvas.height);

        // Ensure coordinates are within bounds
        if (x < 0 || x >= canvas.width || y < 0 || y >= canvas.height) {
          continue;
        }

        // Calculate index with bounds checking
        const index = (y * canvas.width + x) * 4;
        if (index < 0 || index >= data.length - 3) {
          continue;
        }

        // Check if this pixel has alpha > 128 (part of the text)
        if (data[index + 3] > 128) {
          return {
            x: x,
            y: y,
            baseX: x,
            baseY: y,
            size: Math.random() * particleSize + 0.5,
            color: baseColor,
            scatteredColor: hoverColor,
            life: Math.random() * 100 + 50,
            angle: Math.random() * Math.PI * 2, // Random angle for each particle
          };
        }
      }

      return null;
    }

    function createInitialParticles() {
      // Scale particle count based on canvas size
      if (!canvas) return;
      const scaledParticleCount = Math.floor(particleCount * Math.sqrt((canvas.width * canvas.height) / (1920 * 1080)));
      for (let i = 0; i < scaledParticleCount; i++) {
        const particle = createParticle();
        if (particle) particles.push(particle);
      }
    }

    let animationFrameId: number;

    function animate(timestamp: number) {
      if (!ctx || !canvas) return;

      // Update animation time
      animationTimeRef.current = timestamp * animationSpeed;

      // Clear the canvas to transparency
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Apply background if not transparent
      if (backgroundColor !== 'transparent') {
        // Parse the background color to apply opacity
        if (backgroundColor.startsWith('#')) {
          // Handle hex color
          const r = Number.parseInt(backgroundColor.slice(1, 3), 16);
          const g = Number.parseInt(backgroundColor.slice(3, 5), 16);
          const b = Number.parseInt(backgroundColor.slice(5, 7), 16);
          ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${backgroundOpacity})`;
        } else if (backgroundColor.startsWith('rgb')) {
          // Handle rgb/rgba color
          const rgbMatch = backgroundColor.match(/\d+/g);
          if (rgbMatch && rgbMatch.length >= 3) {
            const [r, g, b] = rgbMatch.map(Number);
            ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${backgroundOpacity})`;
          } else {
            ctx.fillStyle = backgroundColor;
          }
        } else {
          // Handle named colors
          ctx.fillStyle = backgroundColor;
          if (backgroundOpacity < 1) {
            // For named colors with opacity, we need to create a temporary element
            // to get the RGB values
            const tempEl = document.createElement('div');
            tempEl.style.color = backgroundColor;
            document.body.appendChild(tempEl);
            const computedColor = getComputedStyle(tempEl).color;
            document.body.removeChild(tempEl);

            const rgbMatch = computedColor.match(/\d+/g);
            if (rgbMatch && rgbMatch.length >= 3) {
              const [r, g, b] = rgbMatch.map(Number);
              ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${backgroundOpacity})`;
            }
          }
        }

        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      const { x: mouseX, y: mouseY } = mousePositionRef.current;

      // Debug: Visualize the dynamic hover area (uncomment for debugging)
      // if (mouseX > 0 && mouseY > 0) {
      //   ctx.beginPath();
      //   for (let i = 0; i < 360; i += 5) {
      //     const angle = (i * Math.PI) / 180;
      //     // Calculate dynamic radius with sine waves
      //     const dynamicRadius = calculateDynamicRadius(angle, animationTimeRef.current);
      //     const x = mouseX + Math.cos(angle) * dynamicRadius;
      //     const y = mouseY + Math.sin(angle) * dynamicRadius;
      //     if (i === 0) {
      //       ctx.moveTo(x, y);
      //     } else {
      //       ctx.lineTo(x, y);
      //     }
      //   }
      //   ctx.closePath();
      //   ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      //   ctx.stroke();
      // }

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        const dx = mouseX - p.x;
        const dy = mouseY - p.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx);

        // Calculate dynamic radius based on angle and time
        const dynamicRadius = calculateDynamicRadius(angle, animationTimeRef.current);

        if (distance < dynamicRadius && (isTouchingRef.current || !('ontouchstart' in window))) {
          // Calculate force based on dynamic radius
          const force = (dynamicRadius - distance) / dynamicRadius;

          // Add slight variation to the angle for more organic movement
          const angleVariation = Math.sin(p.angle! + animationTimeRef.current) * 0.2;
          const moveAngle = angle + angleVariation;

          // Calculate movement with organic variation
          const moveX = Math.cos(moveAngle) * force * 60;
          const moveY = Math.sin(moveAngle) * force * 60;

          // Apply a subtle oscillation to the particle position
          const oscillation = Math.sin(animationTimeRef.current * 10 + p.angle!) * 2;

          p.x = p.baseX - moveX + oscillation * Math.cos(p.angle!);
          p.y = p.baseY - moveY + oscillation * Math.sin(p.angle!);

          ctx.fillStyle = p.scatteredColor;
        } else {
          // Add subtle movement even when not hovering
          const returnSpeed = 0.1;
          p.x += (p.baseX - p.x) * returnSpeed;
          p.y += (p.baseY - p.y) * returnSpeed;
          ctx.fillStyle = p.color;
        }

        ctx.fillRect(p.x, p.y, p.size, p.size);

        p.life--;
        if (p.life <= 0) {
          const newParticle = createParticle();
          if (newParticle) {
            particles[i] = newParticle;
          } else {
            particles.splice(i, 1);
            i--;
          }
        }
      }

      // Maintain particle count
      const scaledParticleCount = Math.floor(particleCount * Math.sqrt((canvas.width * canvas.height) / (1920 * 1080)));
      while (particles.length < scaledParticleCount) {
        const newParticle = createParticle();
        if (newParticle) particles.push(newParticle);
      }

      animationFrameId = requestAnimationFrame(animate);
    }

    // Function to calculate dynamic radius with sine waves for uneven edge
    function calculateDynamicRadius(angle: number, time: number): number {
      let radius = hoverRadius;

      // Add multiple sine waves with different frequencies and amplitudes
      for (let i = 1; i <= edgeComplexity; i++) {
        const frequency = i * 2;
        const amplitude = (hoverRadius * animationIntensity) / i;
        radius += Math.sin(angle * frequency + time * i) * amplitude;
      }

      return radius;
    }

    // Delay initialization slightly to ensure the canvas has proper dimensions
    const initTimeout = setTimeout(() => {
      updateCanvasSize();
      createTextImage();
      createInitialParticles();
      animationFrameId = requestAnimationFrame(animate);
    }, 50);

    const handleResize = () => {
      updateCanvasSize();
      createTextImage();
      particles = [];
      createInitialParticles();
    };

    const handleMove = (clientX: number, clientY: number) => {
      if (!canvas) return;

      // Get the canvas's bounding rectangle relative to the viewport
      const rect = canvas.getBoundingClientRect();

      // Calculate the mouse position relative to the canvas
      const x = clientX - rect.left;
      const y = clientY - rect.top;

      mousePositionRef.current = { x, y };
    };

    const handleMouseMove = (e: MouseEvent) => {
      handleMove(e.clientX, e.clientY);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        e.preventDefault();
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
        // Set mousePosition to a value outside the canvas instead of 0,0
        // This prevents particles from gathering at the top-left corner
        mousePositionRef.current = { x: -1000, y: -1000 };
      }
    };

    const resizeObserver = new ResizeObserver(() => {
      updateCanvasSize();
      createTextImage();
      particles = [];
      createInitialParticles();
    });

    resizeObserver.observe(canvas);

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('touchend', handleTouchEnd);

    return () => {
      clearTimeout(initTimeout);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
      resizeObserver.disconnect();
      cancelAnimationFrame(animationFrameId);
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
    isMobile,
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
