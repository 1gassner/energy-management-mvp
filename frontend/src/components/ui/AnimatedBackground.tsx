import React, { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface AnimatedBackgroundProps {
  variant?: 'particles' | 'gradient' | 'mesh' | 'waves';
  intensity?: 'low' | 'medium' | 'high';
  className?: string;
}

const AnimatedBackground: React.FC<AnimatedBackgroundProps> = ({
  variant = 'particles',
  intensity = 'medium',
  className
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Animation variables
    let animationId: number;
    const particles: Particle[] = [];
    const particleCount = intensity === 'low' ? 30 : intensity === 'medium' ? 60 : 100;

    class Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      opacity: number;
      color: string;

      constructor() {
        this.x = Math.random() * (canvas?.width ?? window.innerWidth);
        this.y = Math.random() * (canvas?.height ?? window.innerHeight);
        this.vx = (Math.random() - 0.5) * 0.5;
        this.vy = (Math.random() - 0.5) * 0.5;
        this.size = Math.random() * 3 + 1;
        this.opacity = Math.random() * 0.5 + 0.1;
        
        // Eco-theme colors
        const colors = ['#10b981', '#0ea5e9', '#8b5cf6', '#f59e0b'];
        this.color = colors[Math.floor(Math.random() * colors.length)];
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;

        // Bounce off edges
        const width = canvas?.width ?? window.innerWidth;
        const height = canvas?.height ?? window.innerHeight;
        if (this.x < 0 || this.x > width) this.vx *= -1;
        if (this.y < 0 || this.y > height) this.vy *= -1;

        // Keep within bounds
        this.x = Math.max(0, Math.min(width, this.x));
        this.y = Math.max(0, Math.min(height, this.y));
      }

      draw() {
        if (!ctx) return;
        ctx.save();
        ctx.globalAlpha = this.opacity;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    // Initialize particles
    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (variant === 'particles') {
        // Draw connections between nearby particles
        for (let i = 0; i < particles.length; i++) {
          for (let j = i + 1; j < particles.length; j++) {
            const dx = particles[i].x - particles[j].x;
            const dy = particles[i].y - particles[j].y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < 120) {
              ctx.save();
              ctx.globalAlpha = (120 - distance) / 120 * 0.2;
              ctx.strokeStyle = '#10b981';
              ctx.lineWidth = 1;
              ctx.beginPath();
              ctx.moveTo(particles[i].x, particles[i].y);
              ctx.lineTo(particles[j].x, particles[j].y);
              ctx.stroke();
              ctx.restore();
            }
          }
        }

        // Update and draw particles
        particles.forEach(particle => {
          particle.update();
          particle.draw();
        });
      }

      if (variant === 'gradient') {
        // Animated gradient background
        const time = Date.now() * 0.001;
        const gradient = ctx.createRadialGradient(
          canvas.width / 2 + Math.sin(time) * 100,
          canvas.height / 2 + Math.cos(time) * 100,
          0,
          canvas.width / 2,
          canvas.height / 2,
          Math.max(canvas.width, canvas.height)
        );
        gradient.addColorStop(0, 'rgba(16, 185, 129, 0.1)');
        gradient.addColorStop(0.5, 'rgba(14, 165, 233, 0.05)');
        gradient.addColorStop(1, 'rgba(139, 92, 246, 0.02)');

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      if (variant === 'mesh') {
        // Draw animated mesh pattern
        const time = Date.now() * 0.001;
        const spacing = 50;
        
        ctx.strokeStyle = 'rgba(16, 185, 129, 0.1)';
        ctx.lineWidth = 1;
        
        for (let x = 0; x < canvas.width; x += spacing) {
          for (let y = 0; y < canvas.height; y += spacing) {
            const offsetX = Math.sin(time + x * 0.01) * 10;
            const offsetY = Math.cos(time + y * 0.01) * 10;
            
            ctx.beginPath();
            ctx.arc(x + offsetX, y + offsetY, 2, 0, Math.PI * 2);
            ctx.stroke();
          }
        }
      }

      if (variant === 'waves') {
        // Draw animated wave patterns
        const time = Date.now() * 0.002;
        
        for (let i = 0; i < 3; i++) {
          ctx.beginPath();
          ctx.strokeStyle = `rgba(${i === 0 ? '16, 185, 129' : i === 1 ? '14, 165, 233' : '139, 92, 246'}, ${0.1 - i * 0.02})`;
          ctx.lineWidth = 2;
          
          for (let x = 0; x <= canvas.width; x += 5) {
            const y = canvas.height / 2 + 
              Math.sin(x * 0.01 + time + i * 2) * 50 + 
              Math.sin(x * 0.005 + time * 0.5 + i) * 30;
            
            if (x === 0) {
              ctx.moveTo(x, y);
            } else {
              ctx.lineTo(x, y);
            }
          }
          ctx.stroke();
        }
      }

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationId);
    };
  }, [variant, intensity]);

  return (
    <canvas
      ref={canvasRef}
      className={cn(
        "fixed inset-0 pointer-events-none z-0",
        className
      )}
      style={{ opacity: intensity === 'low' ? 0.3 : intensity === 'medium' ? 0.5 : 0.7 }}
    />
  );
};

export default AnimatedBackground;