import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';

export type ParticleKind = 'COIN' | 'STAR' | 'GEM' | 'SPARKLE' | 'NUMBER';

interface Particle {
  id: number;
  kind: ParticleKind;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  size: number;
  rotation: number;
  targetRotation: number;
  scale: number;
  delay: number;
  duration: number;
  content: string;
}

interface ParticleExplosionProps {
  active: boolean;
  type?: 'COINS' | 'STARS' | 'ALL';
  count?: number;
  origin?: { x?: number; y?: number }; // Percentage 0-100 or screen coords
  onComplete?: () => void;
}

export const ParticleExplosion: React.FC<ParticleExplosionProps> = ({
  active,
  type = 'ALL',
  count = 28,
  origin = { x: 50, y: 45 },
  onComplete,
}) => {
  // Generate random explosion trajectory vectors radiating outward in 360 degrees
  const particles: Particle[] = useMemo(() => {
    if (!active) return [];

    const list: Particle[] = [];
    const starIcons = ['⭐', '🌟', '✨'];
    const coinIcons = ['🪙', '¢', '💰'];
    const gemIcons = ['💎', '🔸', '⚡'];
    const mathSymbols = ['+10', '★', '7', '💯', 'π'];

    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5;
      // Distance of outward burst (80px to 220px radius)
      const distance = 90 + Math.random() * 150;
      const targetX = Math.cos(angle) * distance;
      // Gravity pulls slightly down towards the end of arc
      const targetY = Math.sin(angle) * distance + (distance * 0.25);

      let kind: ParticleKind = 'COIN';
      let content = '🪙';

      if (type === 'STARS') {
        kind = 'STAR';
        content = starIcons[Math.floor(Math.random() * starIcons.length)];
      } else if (type === 'COINS') {
        kind = 'COIN';
        content = coinIcons[Math.floor(Math.random() * coinIcons.length)];
      } else {
        const rand = Math.random();
        if (rand < 0.4) {
          kind = 'COIN';
          content = coinIcons[Math.floor(Math.random() * coinIcons.length)];
        } else if (rand < 0.75) {
          kind = 'STAR';
          content = starIcons[Math.floor(Math.random() * starIcons.length)];
        } else if (rand < 0.9) {
          kind = 'GEM';
          content = gemIcons[Math.floor(Math.random() * gemIcons.length)];
        } else {
          kind = 'NUMBER';
          content = mathSymbols[Math.floor(Math.random() * mathSymbols.length)];
        }
      }

      list.push({
        id: i,
        kind,
        x: 0,
        y: 0,
        targetX,
        targetY,
        size: 18 + Math.random() * 18,
        rotation: 0,
        targetRotation: (Math.random() - 0.5) * 720,
        scale: 0.8 + Math.random() * 0.6,
        delay: Math.random() * 0.08,
        duration: 0.9 + Math.random() * 0.4,
        content,
      });
    }

    return list;
  }, [active, type, count]);

  return (
    <div
      className="absolute inset-0 pointer-events-none z-50 overflow-visible"
      aria-hidden="true"
    >
      <AnimatePresence onExitComplete={onComplete}>
        {active && (
          <div
            className="absolute"
            style={{
              left: `${origin.x}%`,
              top: `${origin.y}%`,
              transform: 'translate(-50%, -50%)',
            }}
          >
            {/* Outward Shockwave Ripple */}
            <motion.div
              initial={{ scale: 0.2, opacity: 0.9 }}
              animate={{ scale: 3.5, opacity: 0 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="absolute -translate-x-1/2 -translate-y-1/2 w-28 h-28 rounded-full border-4 border-amber-300 shadow-[0_0_30px_rgba(251,191,36,0.8)] pointer-events-none"
            />
            {/* Secondary Golden Glow flash */}
            <motion.div
              initial={{ scale: 0.4, opacity: 0.8 }}
              animate={{ scale: 2.2, opacity: 0 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="absolute -translate-x-1/2 -translate-y-1/2 w-36 h-36 rounded-full bg-gradient-to-r from-amber-400 via-yellow-200 to-amber-500 blur-xl pointer-events-none"
            />

            {/* Individual Exploding Particles */}
            {particles.map((p) => (
              <motion.div
                key={p.id}
                initial={{
                  x: 0,
                  y: 0,
                  scale: 0,
                  rotate: 0,
                  opacity: 1,
                }}
                animate={{
                  x: [0, p.targetX * 0.6, p.targetX],
                  y: [0, p.targetY * 0.5 - 20, p.targetY],
                  scale: [0, p.scale * 1.35, p.scale, 0],
                  rotate: [0, p.targetRotation * 0.5, p.targetRotation],
                  opacity: [1, 1, 0.9, 0],
                }}
                transition={{
                  duration: p.duration,
                  delay: p.delay,
                  ease: [0.22, 1, 0.36, 1], // snappy explosive ease-out
                }}
                className="absolute select-none font-game font-black drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)] flex items-center justify-center"
                style={{
                  fontSize: `${p.size}px`,
                  transformOrigin: 'center center',
                }}
              >
                {p.content === '¢' ? (
                  <span className="w-7 h-7 rounded-full bg-gradient-to-tr from-yellow-500 via-amber-400 to-yellow-200 border-2 border-white flex items-center justify-center text-xs font-black text-amber-950 shadow-md">
                    ¢
                  </span>
                ) : (
                  <span>{p.content}</span>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
