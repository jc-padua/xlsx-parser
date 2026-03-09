import { useEffect, useRef } from 'react';
import { cn } from '../../lib/cn';

const DEFAULT_COLORS = [
  'rgba(14, 165, 233, 0.30)',
  'rgba(45, 212, 191, 0.25)',
  'rgba(56, 189, 248, 0.20)',
  'rgba(20, 184, 166, 0.25)',
  'rgba(125, 211, 252, 0.20)',
];

export function BokehBackground({
  className,
  children,
  count = 22,
  minSize = 50,
  maxSize = 180,
  speed = 1,
  colors = DEFAULT_COLORS,
  fixed = false,
}) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return undefined;

    const ctx = canvas.getContext('2d');
    if (!ctx) return undefined;

    const rect = container.getBoundingClientRect();
    let width = rect.width;
    let height = rect.height;
    canvas.width = width;
    canvas.height = height;

    let animationId;
    let tick = 0;

    const createOrb = () => {
      const size = minSize + Math.random() * (maxSize - minSize);
      return {
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.3 * speed,
        vy: (Math.random() - 0.5) * 0.3 * speed,
        size,
        color: colors[Math.floor(Math.random() * colors.length)],
        opacity: 0.15 + Math.random() * 0.2,
        pulseOffset: Math.random() * Math.PI * 2,
        pulseSpeed: 0.005 + Math.random() * 0.01,
      };
    };

    const orbs = Array.from({ length: count }, createOrb).sort((a, b) => a.size - b.size);

    const handleResize = () => {
      const nextRect = container.getBoundingClientRect();
      width = nextRect.width;
      height = nextRect.height;
      canvas.width = width;
      canvas.height = height;
    };

    const ro = new ResizeObserver(handleResize);
    ro.observe(container);

    const animate = () => {
      tick += 1;
      ctx.clearRect(0, 0, width, height);

      for (const orb of orbs) {
        orb.x += orb.vx;
        orb.y += orb.vy;

        if (orb.x < -orb.size / 2) orb.x = width + orb.size / 2;
        if (orb.x > width + orb.size / 2) orb.x = -orb.size / 2;
        if (orb.y < -orb.size / 2) orb.y = height + orb.size / 2;
        if (orb.y > height + orb.size / 2) orb.y = -orb.size / 2;

        const pulse = Math.sin(tick * orb.pulseSpeed + orb.pulseOffset) * 0.1 + 1;
        const currentSize = orb.size * pulse;
        const gradient = ctx.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, currentSize / 2);

        gradient.addColorStop(0, orb.color.replace(/[\d.]+\)$/, `${orb.opacity * 1.2})`));
        gradient.addColorStop(0.4, orb.color.replace(/[\d.]+\)$/, `${orb.opacity})`));
        gradient.addColorStop(0.7, orb.color.replace(/[\d.]+\)$/, `${orb.opacity * 0.5})`));
        gradient.addColorStop(1, orb.color.replace(/[\d.]+\)$/, '0)'));

        ctx.beginPath();
        ctx.arc(orb.x, orb.y, currentSize / 2, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(orb.x, orb.y, currentSize / 2 - 2, 0, Math.PI * 2);
        ctx.strokeStyle = orb.color.replace(/[\d.]+\)$/, `${orb.opacity * 0.3})`);
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationId);
      ro.disconnect();
    };
  }, [count, minSize, maxSize, speed, colors]);

  return (
    <div
      ref={containerRef}
      className={cn(
        fixed ? 'fixed inset-0' : 'absolute inset-0',
        'overflow-hidden',
        className
      )}
      style={{
        background: 'linear-gradient(135deg, #0a1224 0%, #0b1a2d 50%, #07101f 100%)',
      }}
    >
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />

      <div
        className="pointer-events-none absolute inset-0 opacity-25"
        style={{
          background:
            'radial-gradient(ellipse at 28% 28%, rgba(45, 212, 191, 0.16) 0%, transparent 52%)',
        }}
      />

      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at center, transparent 0%, transparent 40%, rgba(2,6,23,0.82) 100%)',
        }}
      />

      {children ? <div className="relative z-10 h-full w-full">{children}</div> : null}
    </div>
  );
}
