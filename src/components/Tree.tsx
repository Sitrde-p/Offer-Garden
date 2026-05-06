import React, { useEffect, useRef, useMemo } from 'react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

interface TreeProps {
  attemptsCount: number;
  isFlowing?: boolean;
  offersCount?: number;
  couragePoints?: number;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  isLanding?: boolean;
}

class Particle {
  x: number;
  y: number;
  originX: number;
  originY: number;
  vx: number = 0;
  vy: number = 0;
  size: number;
  color: string;
  alpha: number;
  targetAlpha: number;
  angle: number;
  distance: number;
  speed: number;
  twinkleSpeed: number;

  constructor(x: number, y: number, color: string, alpha: number, size: number) {
    this.x = x;
    this.y = y;
    this.originX = x;
    this.originY = y;
    this.color = color;
    this.alpha = alpha;
    this.targetAlpha = alpha;
    this.size = size;
    this.angle = Math.random() * Math.PI * 2;
    this.distance = Math.random() * 3;
    this.speed = 0.005 + Math.random() * 0.01;
    this.twinkleSpeed = 0.02 + Math.random() * 0.03;
  }

  update(mouseX: number, mouseY: number, time: number) {
    // Elegant breathing & drifting
    this.angle += this.speed; 
    const breatheEffect = Math.sin(time * 0.001 + this.angle) * 0.2 + 0.8;
    const floatX = Math.cos(this.angle) * this.distance; 
    const floatY = Math.sin(this.angle) * this.distance;

    // Mouse feedback
    const dx = mouseX - this.x;
    const dy = mouseY - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 80) {
      const force = (80 - dist) / 80;
      this.vx -= dx * force * 0.04;
      this.vy -= dy * force * 0.04;
    }

    // Pull to skeleton
    this.vx += (this.originX + floatX - this.x) * 0.05;
    this.vy += (this.originY + floatY - this.y) * 0.05;
    
    this.vx *= 0.88;
    this.vy *= 0.88;
    
    this.x += this.vx;
    this.y += this.vy;

    // Soft twinkling
    if (Math.random() > 0.99) {
       this.targetAlpha = Math.random() * 0.4 + 0.2;
    }
    this.alpha += (this.targetAlpha - this.alpha) * this.twinkleSpeed;
    return breatheEffect;
  }

  draw(ctx: CanvasRenderingContext2D, globalAlpha: number, breathe: number) {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size * breathe, 0, Math.PI * 2);
    ctx.fillStyle = this.color.replace('ALPHA', (this.alpha * globalAlpha * breathe).toString());
    ctx.fill();
  }
}

class FlowParticle {
  path: {x: number, y: number}[];
  progress: number;
  speed: number;
  size: number;
  color: string;
  offset: {x: number, y: number};

  constructor(path: {x: number, y: number}[], speed: number, size: number, color: string) {
    this.path = path;
    this.progress = 0;
    this.speed = speed;
    this.size = size;
    this.color = color;
    this.offset = {
      x: (Math.random() - 0.5) * 12,
      y: (Math.random() - 0.5) * 12
    };
  }

  update() {
    this.progress += this.speed;
    return this.progress < 1;
  }

  draw(ctx: CanvasRenderingContext2D) {
    const idx = Math.floor(this.progress * (this.path.length - 1));
    const nextIdx = Math.min(idx + 1, this.path.length - 1);
    const segmentT = (this.progress * (this.path.length - 1)) - idx;
    
    const p1 = this.path[idx];
    const p2 = this.path[nextIdx];
    
    const x = p1.x + (p2.x - p1.x) * segmentT + this.offset.x;
    const y = p1.y + (p2.y - p1.y) * segmentT + this.offset.y;
    
    // Smooth alpha fade in and out
    const alpha = Math.sin(this.progress * Math.PI) * 0.7;
    
    // Draw Glow Halo
    const grad = ctx.createRadialGradient(x, y, 0, x, y, this.size * 5);
    grad.addColorStop(0, this.color.replace('ALPHA', (alpha * 0.4).toString()));
    grad.addColorStop(1, this.color.replace('ALPHA', '0'));
    
    ctx.beginPath();
    ctx.arc(x, y, this.size * 5, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();

    // Draw Core
    ctx.beginPath();
    ctx.arc(x, y, this.size, 0, Math.PI * 2);
    ctx.fillStyle = this.color.replace('ALPHA', alpha.toString());
    ctx.fill();
  }
}

class RisingParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  life: number;
  color: string;

  constructor(width: number, height: number) {
    this.x = Math.random() * width;
    this.y = height + Math.random() * 50;
    this.vx = (Math.random() - 0.5) * 0.4;
    this.vy = -0.3 - Math.random() * 1.2;
    this.size = Math.random() * 2.5 + 1.5;
    this.alpha = 0;
    this.life = 0;
    const colors = [
      'rgba(167, 139, 250, ALPHA)', // purple
      'rgba(147, 197, 253, ALPHA)', // blue
      'rgba(196, 181, 253, ALPHA)', // indigo
    ];
    this.color = colors[Math.floor(Math.random() * colors.length)];
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.life += 0.003;
    this.alpha = Math.sin(this.life * Math.PI) * 0.3;
    return this.life < 1;
  }

  draw(ctx: CanvasRenderingContext2D) {
    // Large, soft halo for rising spores
    const grad = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size * 5);
    grad.addColorStop(0, this.color.replace('ALPHA', (this.alpha * 0.4).toString()));
    grad.addColorStop(1, this.color.replace('ALPHA', '0'));
    
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size * 5, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();

    // Denser core
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fillStyle = this.color.replace('ALPHA', (this.alpha * 1.5).toString());
    ctx.fill();
  }
}

export function GlowingTree({ 
  attemptsCount, 
  isFlowing = false, 
  offersCount = 0, 
  couragePoints = 0,
  className, 
  size = 'md',
  isLanding = false
}: TreeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const requestRef = useRef<number | null>(null);
  const prevOffersCount = useRef(offersCount);
  const bloomRef = useRef(0);

  // Growth Stage Logic
  const level = useMemo(() => {
    if (isLanding) return 5;
    if (attemptsCount === 0) return 1;
    if (attemptsCount <= 2) return 2;
    if (attemptsCount <= 4) return 3;
    if (attemptsCount <= 7) return 4;
    return 5;
  }, [attemptsCount, isLanding]);

  const sizes = {
    sm: 'w-48 h-48',
    md: 'w-72 h-72',
    lg: 'w-full h-full max-w-[600px] max-h-[600px]',
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width = 800;
    const height = canvas.height = 800;

    const trunkColor = 'rgba(167, 139, 250, ALPHA)';
    const leafColor = 'rgba(147, 197, 253, ALPHA)'; 
    const flowerColor = 'rgba(253, 230, 138, ALPHA)';
    const flowColor = 'rgba(255, 255, 255, ALPHA)';

    let trunkParticles: Particle[] = [];
    let flowerClusters: { x: number, y: number, particles: Particle[] }[] = [];
    let flowPaths: {x: number, y: number}[][] = [];
    let activeFlows: FlowParticle[] = [];
    let environmentalParticles: RisingParticle[] = [];

    const getPointsOnCurve = (p0: any, p1: any, p2: any, count: number) => {
      const points = [];
      for (let i = 0; i <= count; i++) {
        const t = i / count;
        const x = (1 - t) * (1 - t) * p0.x + 2 * (1 - t) * t * p1.x + t * t * p2.x;
        const y = (1 - t) * (1 - t) * p0.y + 2 * (1 - t) * t * p1.y + t * t * p2.y;
        points.push({ x, y });
      }
      return points;
    };

    const skeleton = [
      { p0: { x: 400, y: 750 }, p1: { x: 400, y: 600 }, p2: { x: 400, y: 480 }, count: 120, thickness: 80, id: 'trunk' },
      { p0: { x: 400, y: 550 }, p1: { x: 220, y: 440 }, p2: { x: 100, y: 320 }, count: 80, thickness: 52 },
      { p0: { x: 400, y: 550 }, p1: { x: 580, y: 440 }, p2: { x: 700, y: 320 }, count: 80, thickness: 52 },
      { p0: { x: 400, y: 480 }, p1: { x: 300, y: 380 }, p2: { x: 200, y: 180 }, count: 70, thickness: 38 },
      { p0: { x: 400, y: 480 }, p1: { x: 500, y: 380 }, p2: { x: 600, y: 180 }, count: 70, thickness: 38 },
      { p0: { x: 400, y: 450 }, p1: { x: 400, y: 280 }, p2: { x: 400, y: 60 },  count: 90, thickness: 42 },
      { p0: { x: 300, y: 380 }, p1: { x: 200, y: 320 }, p2: { x: 140, y: 220 }, count: 60, thickness: 24 },
      { p0: { x: 500, y: 380 }, p1: { x: 600, y: 320 }, p2: { x: 660, y: 220 }, count: 60, thickness: 24 },
    ];

    const branchTips = [
      { x: 400, y: 60 }, { x: 200, y: 180 }, { x: 600, y: 180 }, { x: 140, y: 220 }, 
      { x: 660, y: 220 }, { x: 100, y: 320 }, { x: 700, y: 320 }
    ];

    // Build flow paths from root to tip
    const trunkPts = getPointsOnCurve(skeleton[0].p0, skeleton[0].p1, skeleton[0].p2, skeleton[0].count);
    skeleton.slice(1).forEach(branch => {
        const branchPts = getPointsOnCurve(branch.p0, branch.p1, branch.p2, branch.count);
        // Find junction point in trunk
        flowPaths.push([...trunkPts.filter(p => p.y >= branch.p0.y), ...branchPts]);
    });
    // Center top path
    flowPaths.push([...trunkPts, ...getPointsOnCurve(skeleton[5].p0, skeleton[5].p1, skeleton[5].p2, skeleton[5].count)]);

    skeleton.forEach(branch => {
      const points = getPointsOnCurve(branch.p0, branch.p1, branch.p2, branch.count);
      points.forEach((pt, idx) => {
        const taper = 1 - (idx / branch.count) * 0.45;
        const currentThickness = branch.thickness * taper;
        const density = Math.ceil(currentThickness / 1.6); // Denser
        
        for(let d=0; d<density; d++) {
          const offX = (Math.random() - 0.5) * currentThickness;
          const offY = (Math.random() - 0.5) * currentThickness;
          const distFromCore = Math.abs(offX) / (currentThickness / 2);
          const alpha = 0.25 + (1 - distFromCore) * 0.35;
          const size = Math.random() * 1.8 + 0.8;
          trunkParticles.push(new Particle(pt.x + offX, pt.y + offY, trunkColor, alpha, size));
        }
      });
    });

    const flowersToDraw = isLanding ? 7 : Math.min(offersCount, 7);
    for(let i=0; i<flowersToDraw; i++) {
      const tip = branchTips[i % branchTips.length];
      const cluster = [];
      const flowerDensity = 30; // More particles
      for(let j=0; j<flowerDensity; j++) {
        cluster.push(new Particle(
          tip.x + (Math.random() - 0.5) * 50, // Reduced spread to 50
          tip.y + (Math.random() - 0.5) * 50,
          flowerColor, 0.95, Math.random() * 5 + 3
        ));
      }
      flowerClusters.push({ x: tip.x, y: tip.y, particles: cluster });
    }

    const animate = (time: number) => {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, width, height);

      if (offersCount > prevOffersCount.current) bloomRef.current = 1.0;
      prevOffersCount.current = offersCount;
      if (bloomRef.current > 0) bloomRef.current -= 0.015;

      ctx.globalCompositeOperation = 'lighter';
      const globalAlpha = (Math.max(0.2, level / 5) * 0.7) + (couragePoints / 100) * 0.1 + bloomRef.current * 0.4;
      const mouseX = mouseRef.current.x;
      const mouseY = mouseRef.current.y;

      // Environment
      if (environmentalParticles.length < 130 && Math.random() > 0.6) {
          environmentalParticles.push(new RisingParticle(width, height));
      }
      environmentalParticles = environmentalParticles.filter(ep => {
          const active = ep.update();
          if (active) ep.draw(ctx);
          return active;
      });

      // Energy Flow - Constant stream from root to tips
      if (isFlowing && Math.random() > 0.45) {
          const path = flowPaths[Math.floor(Math.random() * flowPaths.length)];
          // Energy flow in blue-purple with glow
          const fColor = 'rgba(167, 139, 250, ALPHA)'; 
          activeFlows.push(new FlowParticle(path, 0.008 + Math.random() * 0.004, 3.2, fColor));
      }
      activeFlows = activeFlows.filter(f => {
          const active = f.update();
          if (active) f.draw(ctx);
          return active;
      });

      trunkParticles.forEach(p => {
        const breathe = p.update(mouseX, mouseY, time);
        p.draw(ctx, globalAlpha, breathe);
      });

      flowerClusters.forEach(cluster => {
        cluster.particles.forEach(p => {
          const breathe = p.update(mouseX, mouseY, time);
          p.draw(ctx, 1.2, breathe);
        });
        const glowPulse = Math.sin(time * 0.001) * 0.4 + 0.6;
        const grad = ctx.createRadialGradient(cluster.x, cluster.y, 0, cluster.x, cluster.y, 70 * glowPulse);
        grad.addColorStop(0, 'rgba(253, 230, 138, 0.35)');
        grad.addColorStop(1, 'rgba(253, 230, 138, 0)');
        ctx.beginPath(); ctx.arc(cluster.x, cluster.y, 70 * glowPulse, 0, Math.PI * 2);
        ctx.fillStyle = grad; ctx.fill();
      });

      ctx.globalCompositeOperation = 'source-over';
      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      mouseRef.current = {
        x: ((e.clientX - rect.left) / rect.width) * width,
        y: ((e.clientY - rect.top) / rect.height) * height,
      };
    };
    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [level, isFlowing, offersCount, isLanding, couragePoints]);

  return (
    <div ref={containerRef} className={cn("relative flex items-center justify-center", sizes[size], className)}>
      <motion.div className="absolute inset-0 rounded-full pointer-events-none"
        animate={{ opacity: Math.min(0.15, (level / 5) * 0.15), background: `radial-gradient(circle, rgba(139, 92, 246, 0.08) 0%, transparent 75%)` }}
        transition={{ duration: 3 }}
      />
      <canvas ref={canvasRef} className="w-full h-full z-10" style={{ imageRendering: 'auto' }} />
    </div>
  );
}
