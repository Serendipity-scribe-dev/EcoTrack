import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchGlobalImpact } from '../features/activitySlice';
import { Globe2 } from 'lucide-react';

function AnimatedNumber({ target, duration = 1500 }) {
  const [display, setDisplay] = useState(0);
  const startRef = useRef(null);
  const rafRef   = useRef(null);
  const prevTarget = useRef(0);

  useEffect(() => {
    const from = prevTarget.current;
    prevTarget.current = target;
    startRef.current = null;

    const animate = (ts) => {
      if (!startRef.current) startRef.current = ts;
      const elapsed  = ts - startRef.current;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(from + (target - from) * eased);
      if (progress < 1) rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target, duration]);

  return display.toFixed(2);
}

export default function GlobalMeter() {
  const dispatch    = useDispatch();
  const { globalImpact } = useSelector((s) => s.activity);

  useEffect(() => {
    dispatch(fetchGlobalImpact());
    // Poll every 30 seconds
    const interval = setInterval(() => dispatch(fetchGlobalImpact()), 30_000);
    return () => clearInterval(interval);
  }, [dispatch]);

  return (
    <div className="glass-card p-6 text-center relative overflow-hidden">
      {/* Pulsing ring */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-64 h-64 rounded-full border border-neon opacity-5 animate-ping" style={{ animationDuration: '3s' }} />
      </div>

      <div className="flex items-center justify-center gap-2 mb-4">
        <Globe2 className="text-neon" size={20} />
        <span className="section-header">Global CO₂ Logged</span>
      </div>

      <div className="stat-number mb-2">
        <AnimatedNumber target={globalImpact.totalCarbon} />
        <span className="text-xl ml-2 font-mono text-neon-dim">kg</span>
      </div>

      <div className="flex justify-center gap-8 mt-4">
        <div>
          <div className="text-2xl font-orbitron font-bold text-neon">
            {globalImpact.totalActivities.toLocaleString()}
          </div>
          <div className="text-xs text-neon-dim opacity-70 font-mono mt-1">Activities Logged</div>
        </div>
        <div className="w-px bg-neon opacity-20" />
        <div>
          <div className="text-2xl font-orbitron font-bold text-neon">
            {globalImpact.totalUsers.toLocaleString()}
          </div>
          <div className="text-xs text-neon-dim opacity-70 font-mono mt-1">Eco Warriors</div>
        </div>
      </div>

      <div className="mt-4 text-xs text-neon opacity-40 font-mono">
        ● LIVE — refreshes every 30s
      </div>
    </div>
  );
}
