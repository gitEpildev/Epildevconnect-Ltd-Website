import { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  alpha: number;
  targetAlpha: number;
}

export default function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef({ x: 0, y: 0 });
  const mouseVelocityRef = useRef({ vx: 0, vy: 0 });
  const lastPointerRef = useRef<{ x: number; y: number; t: number } | null>(null);
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const reducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Set canvas size
    let width = window.innerWidth;
    let height = window.innerHeight;
    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;

      // Crisp canvas on high-DPI screens while keeping particle math in CSS pixels.
      const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);

    // Initialize particles
    const maxParticles = 170;
    const particleCount = Math.max(60, Math.min(maxParticles, Math.floor((width * height) / 15000)));
    particlesRef.current = Array.from({ length: particleCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      radius: Math.random() * 2 + 1,
      alpha: Math.random() * 0.5 + 0.2,
      targetAlpha: Math.random() * 0.5 + 0.2,
    }));

    // Mouse move handler
    const handlePointerMove = (e: PointerEvent) => {
      const x = e.clientX;
      const y = e.clientY;
      const now = performance.now();

      mouseRef.current = { x, y };

      const last = lastPointerRef.current;
      if (last) {
        const dt = Math.max(16, now - last.t); // Prevent huge jumps on first frame.
        mouseVelocityRef.current = {
          vx: ((x - last.x) / dt) * 16.67,
          vy: ((y - last.y) / dt) * 16.67,
        };
      }
      lastPointerRef.current = { x, y, t: now };
    };
    window.addEventListener('pointermove', handlePointerMove, { passive: true });

    // Optional: a small burst when the user clicks/taps.
    const handlePointerDown = (e: PointerEvent) => {
      const x = e.clientX;
      const y = e.clientY;
      particlesRef.current.forEach((p) => {
        const dx = x - p.x;
        const dy = y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        if (dist < 140) {
          const t = 1 - dist / 140;
          p.vx += (dx / dist) * t * 1.2;
          p.vy += (dy / dist) * t * 1.2;
          p.targetAlpha = 1;
        }
      });
    };
    window.addEventListener('pointerdown', handlePointerDown, { passive: true });

    // Animation loop
    const animate = () => {
      if (!reducedMotion) {
        // Low-alpha clearing gives a subtle trail behind moving particles.
        ctx.fillStyle = 'rgba(10, 10, 15, 0.14)';
        ctx.fillRect(0, 0, width, height);
      } else {
        ctx.clearRect(0, 0, width, height);
      }

      ctx.globalCompositeOperation = 'lighter';

      particlesRef.current.forEach((particle, i) => {
        // Update position
        particle.x += particle.vx;
        particle.y += particle.vy;

        // Dampen so forces don't build up forever.
        particle.vx *= 0.995;
        particle.vy *= 0.995;

        // Bounce off edges
        if (particle.x < 0 || particle.x > width) particle.vx *= -1;
        if (particle.y < 0 || particle.y > height) particle.vy *= -1;

        // Mouse interaction
        const dx = mouseRef.current.x - particle.x;
        const dy = mouseRef.current.y - particle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        const influenceRadius = 190;
        if (distance < influenceRadius) {
          const t = 1 - distance / influenceRadius;

          // Attraction + a small swirl so particles feel "alive" around the cursor.
          const invDist = 1 / (distance || 1);
          const nx = dx * invDist;
          const ny = dy * invDist;
          const tx = -ny;
          const ty = nx;

          const force = 0.05 * t;
          particle.vx += nx * force;
          particle.vy += ny * force;

          particle.vx += tx * (force * 0.45);
          particle.vy += ty * (force * 0.45);

          // Drag based on mouse velocity to make the motion clearly follow the cursor.
          particle.vx += mouseVelocityRef.current.vx * (t * 0.02);
          particle.vy += mouseVelocityRef.current.vy * (t * 0.02);

          particle.targetAlpha = Math.min(1, particle.targetAlpha + 0.45 * t);
        } else {
          particle.targetAlpha = Math.random() * 0.45 + 0.15;
        }

        // Smooth alpha transition
        particle.alpha += (particle.targetAlpha - particle.alpha) * 0.05;

        // Draw particle
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 217, 255, ${particle.alpha})`;
        ctx.fill();

        // Draw connections
        particlesRef.current.slice(i + 1).forEach((otherParticle) => {
          const dx = particle.x - otherParticle.x;
          const dy = particle.y - otherParticle.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 120) {
            ctx.beginPath();
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(otherParticle.x, otherParticle.y);
            const opacity = (1 - distance / 120) * 0.3;
            ctx.strokeStyle = `rgba(0, 217, 255, ${opacity})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        });

        // Add quantum burst effect near mouse
        if (distance < 100) {
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, particle.radius + 2, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(0, 217, 255, ${(1 - distance / 100) * 0.3})`;
          ctx.fill();
        }
      });

      ctx.globalCompositeOperation = 'source-over';
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerdown', handlePointerDown);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      id="particle-canvas"
      className="fixed inset-0 -z-10"
    />
  );
}


