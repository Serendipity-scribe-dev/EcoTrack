import { useSelector } from 'react-redux';
import { Flame, Award } from 'lucide-react';

export default function StreakCounter() {
  const { currentStreak, longestStreak } = useSelector((s) => s.user);

  const flameColor = currentStreak >= 7
    ? '#FACC15'
    : currentStreak >= 3
    ? '#FB923C'
    : '#00BF6F';

  return (
    <div className="eco-card p-5">
      {/* Header */}
      <div
        style={{
          fontFamily: 'Poppins, sans-serif',
          fontSize: '0.7rem',
          fontWeight: 600,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: 'var(--eco-muted)',
          marginBottom: 16,
        }}
      >
        Daily Streak
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {/* Streak count */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 14,
              background: `${flameColor}18`,
              border: `1px solid ${flameColor}30`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Flame
              size={24}
              color={flameColor}
              style={{
                filter: currentStreak > 0 ? `drop-shadow(0 0 6px ${flameColor})` : 'none',
                animation: currentStreak >= 3 ? 'pulseGreen 2s ease-in-out infinite' : 'none',
              }}
            />
          </div>
          <div>
            <div
              style={{
                fontFamily: 'Poppins, sans-serif',
                fontWeight: 800,
                fontSize: '2rem',
                lineHeight: 1,
                color: flameColor,
              }}
            >
              {currentStreak}
              <span
                style={{
                  fontSize: '0.85rem',
                  fontWeight: 500,
                  color: 'var(--eco-muted)',
                  marginLeft: 4,
                }}
              >
                days
              </span>
            </div>
            <div
              style={{
                fontFamily: 'Poppins, sans-serif',
                fontSize: '0.75rem',
                color: 'var(--eco-muted)',
                marginTop: 2,
              }}
            >
              {currentStreak === 0 ? 'Start your streak today!' : 'Keep it up! 🎯'}
            </div>
          </div>
        </div>

        {/* Best streak */}
        <div
          style={{
            textAlign: 'right',
            paddingLeft: 16,
            borderLeft: '1px solid rgba(0,191,111,0.15)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              color: 'var(--eco-muted)',
              marginBottom: 2,
            }}
          >
            <Award size={12} />
            <span
              style={{
                fontFamily: 'Poppins, sans-serif',
                fontSize: '0.65rem',
                fontWeight: 600,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
              }}
            >
              Best
            </span>
          </div>
          <div
            style={{
              fontFamily: 'Poppins, sans-serif',
              fontWeight: 700,
              fontSize: '1.2rem',
              color: 'var(--eco-text)',
            }}
          >
            {longestStreak}d
          </div>
        </div>
      </div>

      {/* Streak dots (last 7 days visualization) */}
      <div style={{ display: 'flex', gap: 6, marginTop: 16 }}>
        {Array.from({ length: 7 }).map((_, i) => {
          const active = i < (currentStreak % 7 || (currentStreak > 0 ? 7 : 0));
          return (
            <div
              key={i}
              style={{
                flex: 1,
                height: 4,
                borderRadius: 99,
                background: active ? flameColor : 'rgba(0,191,111,0.1)',
                transition: 'background 0.3s ease',
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
