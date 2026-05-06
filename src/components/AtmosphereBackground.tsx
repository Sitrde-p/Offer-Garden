import React, { useEffect, useRef, useMemo } from 'react';

interface Particle {
  x: number;
  y: number;
  size: number;
  speedY: number;
  speedX: number;
  opacity: number;
  fadeSpeed: number;
  color: string;
}

interface AtmosphereBackgroundProps {
  density?: number; // 0 to 1
  className?: string;
  variant?: 'subtle' | 'rich' | 'reflection';
}

export const AtmosphereBackground: React.FC<AtmosphereBackgroundProps> = ({ 
  density = 0.5, 
  className = "",
  variant = 'subtle'
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = window.innerWidth;
    let height = window.innerHeight;

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };

    window.addEventListener('resize', resize);
    resize();

    const particles: Particle[] = [];
    const particleCount = Math.floor(100 * density); // Increased baseline

    const colors = [
      'rgba(167, 139, 250, ALPHA)', // Purple
      'rgba(147, 197, 253, ALPHA)', // Blue
      'rgba(216, 180, 254, ALPHA)', // Light Purple
      'rgba(255, 255, 255, ALPHA)', // Soft white
    ];

    const createParticle = (isInitial = false): Particle => ({
      x: Math.random() * width,
      y: isInitial ? Math.random() * height : height + 20,
      size: Math.random() * 2.0 + 0.5, // Slightly larger range
      speedY: -(Math.random() * 0.4 + 0.15), // Slightly faster rising
      speedX: (Math.random() - 0.5) * 0.3,
      opacity: Math.random() * 0.4,
      fadeSpeed: Math.random() * 0.008 + 0.003,
      color: colors[Math.floor(Math.random() * colors.length)],
    });

    for (let i = 0; i < particleCount; i++) {
      particles.push(createParticle(true));
    }

    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      // Create a soft gradient background
      const grad = ctx.createRadialGradient(
        width / 2, height, 0,
        width / 2, height, height * 1.2
      );
      
      if (variant === 'reflection') {
        grad.addColorStop(0, '#0f172a'); // Dark slate/blue
        grad.addColorStop(1, '#020617'); // Almost black
      } else {
        grad.addColorStop(0, '#1e1b4b'); // Deep indigo
        grad.addColorStop(1, '#050711'); // Dark blue-black
      }
      
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // Draw light flow texture (subtle streaks)
      ctx.globalCompositeOperation = 'screen';
      
      particles.forEach((p, i) => {
        p.y += p.speedY;
        p.x += p.speedX;
        
        // Twinkle / Breath effect
        p.opacity += p.fadeSpeed;
        if (p.opacity > 0.6 || p.opacity < 0.1) {
          p.fadeSpeed = -p.fadeSpeed;
        }

        if (p.y < -20) {
          particles[i] = createParticle();
        }

        const color = p.color.replace('ALPHA', p.opacity.toString());
        
        // Glow effect
        ctx.shadowBlur = p.size * 3;
        ctx.shadowColor = color;
        ctx.fillStyle = color;
        
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.shadowBlur = 0; // Reset for next
      });

      // Special variations: Bottom flow
      if (variant !== 'subtle') {
        const bottomGrad = ctx.createLinearGradient(0, height, 0, height - 300);
        bottomGrad.addColorStop(0, 'rgba(99, 102, 241, 0.05)');
        bottomGrad.addColorStop(1, 'rgba(99, 102, 241, 0)');
        ctx.fillStyle = bottomGrad;
        ctx.fillRect(0, height - 300, width, 300);
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [density, variant]);

  return (
    <canvas 
      ref={canvasRef} 
      className={`fixed inset-0 z-0 pointer-events-none ${className}`}
    />
  );
};
