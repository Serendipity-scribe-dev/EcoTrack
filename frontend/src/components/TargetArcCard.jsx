import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { TreePine, CheckCircle2 } from 'lucide-react';

// SVG arc constants — 270° arc (three-quarters circle)
const R = 62;
const SW = 12;
const C = 2 * Math.PI * R;
const ARC = C * 0.75; // 270° of the total circumference

export default function TargetArcCard({ monthlyCarbon, monthlyGoal, actionsCount, coolPoints }) {
  const { user } = useSelector((s) => s.user);
  const saved = parseFloat(monthlyCarbon.toFixed(2));
  const rawProgress = Math.min((saved / monthlyGoal) * 100, 100);

  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setProgress(rawProgress), 150);
    return () => clearTimeout(t);
  }, [rawProgress]);

  const filled = (progress / 100) * ARC;
  const rotation = 135; // start at lower-left
  const isOver = saved >= monthlyGoal;

  // Estimated tree equivalence: 1 tree ≈ 21 kg CO₂/yr ≈ 1.75 kg/month
  const trees = Math.max(0, Math.floor(monthlyGoal / 1.75));

  return (
    <div
      className="eco-card-elevated"
      style={{ padding: '28px 24px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}
    >
      {/* Subtle green radial glow */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 360,
          height: 360,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0,191,111,0.06) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      {/* Tabs pill */}
      <div
        style={{
          display: 'inline-flex',
          gap: 4,
          background: 'rgba(0,0,0,0.3)',
          borderRadius: 99,
          padding: '4px 6px',
          marginBottom: 24,
          border: '1px solid rgba(0,191,111,0.1)',
        }}
      >
        {['Personal', 'Community', 'Global'].map((tab, i) => (
          <button
            key={tab}
            style={{
              padding: '5px 14px',
              borderRadius: 99,
              fontFamily: 'Poppins, sans-serif',
              fontSize: '0.78rem',
              fontWeight: i === 0 ? 600 : 400,
              color: i === 0 ? '#fff' : 'var(--eco-muted)',
              background: i === 0 ? 'var(--eco-green)' : 'transparent',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Target label */}
      <div
        style={{
          fontFamily: 'Poppins, sans-serif',
          fontSize: '0.7rem',
          fontWeight: 600,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: 'var(--eco-muted)',
          marginBottom: 4,
        }}
      >
        Target 🎯
      </div>
      <div
        style={{
          fontFamily: 'Poppins, sans-serif',
          fontSize: '1rem',
          fontWeight: 600,
          color: 'var(--eco-text)',
          marginBottom: 24,
          opacity: 0.8,
        }}
      >
        Save {monthlyGoal} kg CO₂eq this month
      </div>

      {/* Arc SVG */}
      <div style={{ position: 'relative', display: 'inline-block', marginBottom: 16 }}>
        <svg width={180} height={180} viewBox="0 0 160 160">
          {/* Track */}
          <circle
            cx={80} cy={80} r={R}
            fill="none"
            stroke="rgba(0,191,111,0.1)"
            strokeWidth={SW}
            strokeDasharray={`${ARC} ${C - ARC}`}
            strokeLinecap="round"
            transform={`rotate(${rotation} 80 80)`}
          />
          {/* Progress (green) */}
          <circle
            cx={80} cy={80} r={R}
            fill="none"
            stroke={isOver ? '#FACC15' : 'url(#targetGrad)'}
            strokeWidth={SW}
            strokeDasharray={`${filled} ${C - filled}`}
            strokeLinecap="round"
            transform={`rotate(${rotation} 80 80)`}
            style={{ transition: 'stroke-dasharray 1.3s cubic-bezier(0.4,0,0.2,1)' }}
          />
          <defs>
            <linearGradient id="targetGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#009958" />
              <stop offset="100%" stopColor="#00E87F" />
            </linearGradient>
          </defs>
        </svg>

        {/* Center text */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              fontFamily: 'Poppins, sans-serif',
              fontSize: '0.62rem',
              fontWeight: 500,
              color: 'var(--eco-muted)',
              marginBottom: 2,
            }}
          >
            You Saved
          </div>
          <div
            style={{
              fontFamily: 'Poppins, sans-serif',
              fontWeight: 800,
              fontSize: '1.4rem',
              color: isOver ? '#FACC15' : 'var(--eco-green)',
              lineHeight: 1.1,
            }}
          >
            {saved}
          </div>
          <div
            style={{
              fontFamily: 'Poppins, sans-serif',
              fontSize: '0.58rem',
              fontWeight: 500,
              color: 'var(--eco-muted)',
              marginTop: 1,
            }}
          >
            kg CO₂eq
          </div>
        </div>
      </div>

      {/* Tree equivalence */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 6,
          fontFamily: 'Poppins, sans-serif',
          fontSize: '0.82rem',
          color: 'var(--eco-muted)',
          marginBottom: 24,
        }}
      >
        <TreePine size={15} color="#00BF6F" />
        Your CO₂ savings equal what{' '}
        <strong style={{ color: 'var(--eco-green)' }}>{trees}</strong>{' '}
        trees fix in a month
      </div>

      {/* Stats row */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          gap: 32,
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 4,
              marginBottom: 4,
            }}
          >
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: 8,
                background: 'rgba(0,191,111,0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <span style={{ fontSize: '0.9rem' }}>🌿</span>
            </div>
          </div>
          <div
            style={{
              fontFamily: 'Poppins, sans-serif',
              fontWeight: 700,
              fontSize: '1.3rem',
              color: 'var(--eco-text)',
            }}
          >
            {coolPoints}
          </div>
          <div
            style={{
              fontFamily: 'Poppins, sans-serif',
              fontSize: '0.68rem',
              color: 'var(--eco-muted)',
            }}
          >
            Cool Points
          </div>
        </div>

        <div
          style={{
            width: 1,
            background: 'rgba(0,191,111,0.1)',
            alignSelf: 'stretch',
          }}
        />

        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 4,
              marginBottom: 4,
            }}
          >
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: 8,
                background: 'rgba(0,191,111,0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <CheckCircle2 size={14} color="#00BF6F" />
            </div>
          </div>
          <div
            style={{
              fontFamily: 'Poppins, sans-serif',
              fontWeight: 700,
              fontSize: '1.3rem',
              color: 'var(--eco-text)',
            }}
          >
            {actionsCount}
          </div>
          <div
            style={{
              fontFamily: 'Poppins, sans-serif',
              fontSize: '0.68rem',
              color: 'var(--eco-muted)',
            }}
          >
            Actions Completed
          </div>
        </div>
      </div>
    </div>
  );
}
