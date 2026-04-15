import { useSelector } from 'react-redux';
import { useEffect, useState } from 'react';

const LEVEL_THRESHOLDS = [
  { level: 1, min: 0,    max: 99,   badge: 'Seedling',  emoji: '🌱' },
  { level: 2, min: 100,  max: 299,  badge: 'Sapling',   emoji: '🌿' },
  { level: 3, min: 300,  max: 599,  badge: 'Redwood',   emoji: '🌳' },
  { level: 4, min: 600,  max: 999,  badge: 'Ancient',   emoji: '🌲' },
  { level: 5, min: 1000, max: 9999, badge: 'Guardian',  emoji: '🌍' },
];

// SVG arc helpers
const RADIUS    = 54;
const STROKE    = 10;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
// Arc is 75% of the circle (270°), starting from bottom-left
const ARC_LENGTH = CIRCUMFERENCE * 0.75;

export default function XPProgressBar() {
  const { totalXP, level, badge, badgeEmoji } = useSelector((s) => s.user);

  const current  = LEVEL_THRESHOLDS.find(l => l.level === level) || LEVEL_THRESHOLDS[0];
  const next     = LEVEL_THRESHOLDS.find(l => l.level === level + 1);
  const rangeMin = current.min;
  const rangeMax = next ? next.min : current.max + 1;
  const progress = next
    ? Math.min(((totalXP - rangeMin) / (rangeMax - rangeMin)) * 100, 100)
    : 100;

  const [animated, setAnimated] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setAnimated(progress), 120);
    return () => clearTimeout(t);
  }, [progress]);

  const filled = (animated / 100) * ARC_LENGTH;
  // Rotate so arc starts at lower-left (225°)
  const rotation = 135;

  return (
    <div className="eco-card p-5" style={{ textAlign: 'center' }}>
      {/* Arc SVG */}
      <div style={{ position: 'relative', display: 'inline-block', marginBottom: 8 }}>
        <svg width={140} height={140} viewBox="0 0 140 140">
          {/* Background track arc */}
          <circle
            cx={70} cy={70} r={RADIUS}
            fill="none"
            stroke="rgba(0,191,111,0.12)"
            strokeWidth={STROKE}
            strokeDasharray={`${ARC_LENGTH} ${CIRCUMFERENCE - ARC_LENGTH}`}
            strokeLinecap="round"
            transform={`rotate(${rotation} 70 70)`}
          />
          {/* Progress arc */}
          <circle
            cx={70} cy={70} r={RADIUS}
            fill="none"
            stroke="url(#xpGrad)"
            strokeWidth={STROKE}
            strokeDasharray={`${filled} ${CIRCUMFERENCE - filled}`}
            strokeLinecap="round"
            transform={`rotate(${rotation} 70 70)`}
            style={{ transition: 'stroke-dasharray 1.1s cubic-bezier(0.4,0,0.2,1)' }}
          />
          {/* Milestone dots at 25%, 50%, 75% */}
          {[0.25, 0.5, 0.75].map((frac) => {
            const angle = (rotation + frac * 270) * (Math.PI / 180);
            const dx = 70 + RADIUS * Math.cos(angle);
            const dy = 70 + RADIUS * Math.sin(angle);
            const reached = (animated / 100) >= frac;
            return (
              <circle
                key={frac}
                cx={dx} cy={dy} r={4}
                fill={reached ? '#00BF6F' : 'rgba(0,191,111,0.2)'}
                style={{ transition: 'fill 0.4s ease' }}
              />
            );
          })}
          <defs>
            <linearGradient id="xpGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%"   stopColor="#009958" />
              <stop offset="100%" stopColor="#00E87F" />
            </linearGradient>
          </defs>
        </svg>

        {/* Center content */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: -10,
          }}
        >
          <div style={{ fontSize: '1.5rem', lineHeight: 1 }}>{badgeEmoji}</div>
          <div
            style={{
              fontFamily: 'Poppins, sans-serif',
              fontWeight: 800,
              fontSize: '1.4rem',
              color: 'var(--eco-green)',
              lineHeight: 1.1,
            }}
          >
            {level}
          </div>
          <div
            style={{
              fontFamily: 'Poppins, sans-serif',
              fontSize: '0.6rem',
              fontWeight: 600,
              color: 'var(--eco-muted)',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
            }}
          >
            Level
          </div>
        </div>
      </div>

      {/* Badge + XP info below arc */}
      <div
        style={{
          fontFamily: 'Poppins, sans-serif',
          fontWeight: 700,
          fontSize: '0.95rem',
          color: 'var(--eco-text)',
        }}
      >
        {badge}
      </div>
      <div
        style={{
          fontFamily: 'Poppins, sans-serif',
          fontSize: '0.78rem',
          color: 'var(--eco-muted)',
          marginTop: 2,
        }}
      >
        {totalXP} XP
        {next && ` · ${rangeMax - totalXP} to ${next.badge}`}
      </div>

      {/* Progress bar */}
      <div className="eco-progress-track" style={{ marginTop: 12 }}>
        <div className="eco-progress-bar" style={{ width: `${animated}%` }} />
      </div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginTop: 4,
          fontFamily: 'Poppins, sans-serif',
          fontSize: '0.68rem',
          color: 'var(--eco-muted)',
        }}
      >
        <span>{rangeMin}</span>
        {next && <span>{rangeMax}</span>}
      </div>
    </div>
  );
}
