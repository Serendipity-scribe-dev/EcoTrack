import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loginWithGoogle } from '../features/userSlice';
import { fetchGlobalImpact } from '../features/activitySlice';
import { Leaf, ArrowRight, Users, Zap, TreePine, Globe2, ChevronDown, Bike, Utensils, BatteryCharging, Recycle, ShoppingBag } from 'lucide-react';

/* ── Floating Particle Canvas ─────────────────────────────── */
function ParticleCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let rafId;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const EMOJIS = ['🌿', '🍃', '🌱', '✨', '🌍', '💚'];
    const particles = Array.from({ length: 30 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: 10 + Math.random() * 16,
      speedX: (Math.random() - 0.5) * 0.4,
      speedY: -0.2 - Math.random() * 0.5,
      opacity: 0.1 + Math.random() * 0.35,
      emoji: EMOJIS[Math.floor(Math.random() * EMOJIS.length)],
    }));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        ctx.globalAlpha = p.opacity;
        ctx.font = `${p.size}px serif`;
        ctx.fillText(p.emoji, p.x, p.y);
        p.x += p.speedX;
        p.y += p.speedY;
        if (p.y < -30) p.y = canvas.height + 20;
        if (p.x < -30) p.x = canvas.width + 20;
        if (p.x > canvas.width + 30) p.x = -20;
      });
      ctx.globalAlpha = 1;
      rafId = requestAnimationFrame(draw);
    };
    draw();

    return () => { cancelAnimationFrame(rafId); window.removeEventListener('resize', resize); };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 1 }}
    />
  );
}

/* ── Animated Counter ─────────────────────────────────────── */
function AnimatedCount({ target, duration = 1800, suffix = '' }) {
  const [val, setVal] = useState(0);
  const ref = useRef(null);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      obs.disconnect();
      const start = performance.now();
      const step = (now) => {
        const p = Math.min((now - start) / duration, 1);
        setVal(Math.floor(p * target));
        if (p < 1) requestAnimationFrame(step);
        else setVal(target);
      };
      requestAnimationFrame(step);
    }, { threshold: 0.3 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [target, duration]);

  return <span ref={ref}>{val.toLocaleString()}{suffix}</span>;
}

/* ── Scroll-reveal wrapper ────────────────────────────────── */
function Reveal({ children, delay = 0 }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    el.style.opacity = '0';
    el.style.transform = 'translateY(32px)';
    el.style.transition = `opacity 0.7s ease ${delay}ms, transform 0.7s ease ${delay}ms`;
    const obs = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      el.style.opacity = '1';
      el.style.transform = 'translateY(0)';
      obs.disconnect();
    }, { threshold: 0.15 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [delay]);
  return <div ref={ref}>{children}</div>;
}

/* ── Category pill strip ─────────────────────────────────── */
const CATEGORY_PILLS = [
  { icon: Bike, label: 'Transport', color: '#60A5FA' },
  { icon: Utensils, label: 'Food', color: '#00BF6F' },
  { icon: BatteryCharging, label: 'Energy', color: '#FACC15' },
  { icon: Recycle, label: 'Waste', color: '#A78BFA' },
  { icon: ShoppingBag, label: 'Shopping', color: '#FB923C' },
  { icon: TreePine, label: 'Eco Projects', color: '#34D399' },
];

/* ── Google Logo SVG ─────────────────────────────────────── */
const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
);

/* ═══════════════════════════════════════════════════════════
   MAIN LANDING PAGE
   ═══════════════════════════════════════════════════════════ */
export default function LandingPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, loading, error } = useSelector(s => s.user);
  const { globalImpact } = useSelector(s => s.activity);

  useEffect(() => {
    if (isAuthenticated) navigate('/dashboard');
    dispatch(fetchGlobalImpact());
  }, [isAuthenticated, navigate, dispatch]);

  const handleLogin = () => dispatch(loginWithGoogle());

  const scrollRef = useRef(null);
  const scrollDown = () => scrollRef.current?.scrollIntoView({ behavior: 'smooth' });

  return (
    <div style={{ background: '#060d06', minHeight: '100vh', overflowX: 'hidden', fontFamily: 'Poppins,sans-serif' }}>

      {/* ══════════════════════════════════════════════
          NAVBAR
         ══════════════════════════════════════════════ */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
        padding: '0 24px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        height: 64,
        background: 'rgba(6,13,6,0.85)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(0,191,111,0.1)',
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 32, height: 32, borderRadius: 10, background: 'rgba(0,191,111,0.15)', border: '1px solid rgba(0,191,111,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Leaf size={16} color="#00BF6F" />
          </div>
          <a href="/LandingPage"><span style={{ fontWeight: 800, fontSize: '1.15rem', color: '#E8F5E9', letterSpacing: '-0.02em' }}>EcoTrack</span></a>
        </div>

        {/* SDG pill */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ padding: '4px 14px', borderRadius: 99, border: '1px solid rgba(0,191,111,0.25)', background: 'rgba(0,191,111,0.08)', fontFamily: 'Poppins,sans-serif', fontWeight: 600, fontSize: '0.72rem', color: '#00BF6F', letterSpacing: '0.04em' }}>
            🌍 SDG 13 · Climate Action
          </span>
          <button id="nav-signin" onClick={handleLogin} disabled={loading}
            className="eco-btn-primary"
            style={{ padding: '9px 20px', fontSize: '0.82rem', borderRadius: 99 }}>
            {loading ? '…' : 'Sign In'}
          </button>
        </div>
      </nav>

      {/* ══════════════════════════════════════════════
          HERO SECTION
         ══════════════════════════════════════════════ */}
      <section style={{
        position: 'relative', minHeight: '100vh',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        overflow: 'hidden', paddingTop: 64,
      }}>
        {/* Full-bleed hero image */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 0,
          backgroundImage: 'url(/hero_bg.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center 30%',
        }}>
          {/* Multi-layer gradient overlay for depth */}
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(6,13,6,0.55) 0%, rgba(6,13,6,0.3) 40%, rgba(6,13,6,0.8) 80%, #060d06 100%)' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 40%, rgba(0,191,111,0.08) 0%, transparent 70%)' }} />
        </div>

        {/* Floating emoji particles */}
        <ParticleCanvas />

        {/* Hero Content */}
        <div style={{ position: 'relative', zIndex: 2, textAlign: 'center', padding: '0 20px', maxWidth: 780, width: '100%' }}>

          {/* Live status pill */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 24,
            padding: '7px 18px', borderRadius: 99,
            background: 'rgba(0,191,111,0.1)', border: '1px solid rgba(0,191,111,0.25)',
            backdropFilter: 'blur(12px)',
            animation: 'fadeInDown 0.8s ease',
          }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#00BF6F', animation: 'pulse 2s infinite' }} />
            <span style={{ fontWeight: 600, fontSize: '0.75rem', color: '#00BF6F', letterSpacing: '0.06em' }}>
              {globalImpact.totalUsers || 0} Eco Warriors Fighting Climate Change Right Now
            </span>
          </div>

          {/* Big headline */}
          <h1 style={{
            fontWeight: 900, lineHeight: 1.05,
            fontSize: 'clamp(2.8rem, 8vw, 5.5rem)',
            color: '#E8F5E9',
            margin: '0 0 8px',
            letterSpacing: '-0.03em',
            animation: 'fadeInUp 0.9s ease 0.1s both',
          }}>
            Make Every<br />
            <span style={{ color: '#00BF6F', display: 'inline-block', animation: 'fadeInUp 0.9s ease 0.2s both' }}>Action Count</span>
          </h1>

          {/* Subheadline */}
          <p style={{
            fontSize: 'clamp(1rem, 2.5vw, 1.25rem)',
            color: 'rgba(232,245,233,0.7)',
            maxWidth: 520, margin: '16px auto 36px',
            lineHeight: 1.65, fontWeight: 400,
            animation: 'fadeInUp 0.9s ease 0.3s both',
          }}>
            Track your carbon footprint, earn XP for eco habits, and join thousands building a cooler planet — one daily action at a time.
          </p>

          {/* Category pills */}
          <div style={{
            display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center',
            marginBottom: 36,
            animation: 'fadeInUp 0.9s ease 0.35s both',
          }}>
            {CATEGORY_PILLS.map(({ icon: Icon, label, color }) => (
              <div key={label} style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '6px 14px', borderRadius: 99,
                background: 'rgba(255,255,255,0.05)', border: `1px solid ${color}30`,
                backdropFilter: 'blur(8px)',
              }}>
                <Icon size={12} color={color} />
                <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'rgba(232,245,233,0.75)' }}>{label}</span>
              </div>
            ))}
          </div>

          {/* CTA Buttons */}
          <div style={{
            display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap',
            animation: 'fadeInUp 0.9s ease 0.45s both',
          }}>
            <button
              id="landing-google-signin"
              onClick={handleLogin}
              disabled={loading}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '15px 32px', borderRadius: 99,
                background: '#E8F5E9',
                fontFamily: 'Poppins,sans-serif', fontWeight: 700, fontSize: '0.95rem',
                color: '#060d06', border: 'none', cursor: 'pointer',
                boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                transition: 'transform 0.2s, box-shadow 0.2s',
              }}
              onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.5)'; }}
              onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.4)'; }}
            >
              {loading ? '⏳ Signing in…' : <><GoogleIcon /> Continue with Google</>}
            </button>

            <button onClick={scrollDown} style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '15px 28px', borderRadius: 99,
              background: 'rgba(0,191,111,0.1)', border: '1.5px solid rgba(0,191,111,0.35)',
              fontFamily: 'Poppins,sans-serif', fontWeight: 600, fontSize: '0.9rem', color: '#00BF6F',
              cursor: 'pointer', backdropFilter: 'blur(12px)',
              transition: 'background 0.2s',
            }}
              onMouseOver={e => e.currentTarget.style.background = 'rgba(0,191,111,0.18)'}
              onMouseOut={e => e.currentTarget.style.background = 'rgba(0,191,111,0.1)'}
            >
              See How It Works <ArrowRight size={16} />
            </button>
          </div>

          {error && <p style={{ color: '#F87171', marginTop: 12, fontSize: '0.82rem' }}>{error}</p>}
        </div>

        {/* Scroll indicator */}
        <div onClick={scrollDown} style={{
          position: 'absolute', bottom: 60, left: '50%', transform: 'translateX(-50%)',
          zIndex: 4, cursor: 'pointer', animation: 'bounce 2s infinite',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
        }}>
          <span style={{ fontFamily: 'Poppins,sans-serif', fontSize: '0.65rem', color: 'rgba(232,245,233,0.4)', fontWeight: 500 }}>SCROLL</span>
          <ChevronDown size={20} color="rgba(232,245,233,0.3)" />
        </div>

        {/* Glassy stats bar at bottom of hero */}
        <div ref={scrollRef} style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 3,
          background: 'linear-gradient(180deg, transparent 0%, rgba(6,13,6,0.95) 100%)',
          padding: '40px 24px 0',
        }}>
          <div style={{
            maxWidth: 800, margin: '0 auto',
            display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: 16,
            padding: '10px 0 0',
            borderTop: '1px solid rgba(0,191,111,0.12)',
          }}>
            {[
              { label: 'kg CO₂ Tracked', value: globalImpact.totalCarbon || 0, suffix: '' },
              { label: 'Activities Logged', value: globalImpact.totalActivities || 0, suffix: '' },
              { label: 'Global Warriors', value: globalImpact.totalUsers || 0, suffix: '+' },
            ].map(({ label, value, suffix }) => (
              <div key={label} style={{ textAlign: 'center' }}>
                <div style={{ fontWeight: 800, fontSize: 'clamp(1.4rem, 4vw, 2rem)', color: '#00BF6F', lineHeight: 1 }}>
                  <AnimatedCount target={value} suffix={suffix} />
                </div>
                <div style={{ fontFamily: 'Poppins,sans-serif', fontSize: '0.72rem', color: 'rgba(232,245,233,0.45)', fontWeight: 500, marginTop: 4 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          HOW IT WORKS — 3 STEPS
         ══════════════════════════════════════════════ */}
      <section style={{ padding: '100px 24px 80px', maxWidth: 1000, margin: '0 auto' }}>
        <Reveal>
          <div style={{ textAlign: 'center', marginBottom: 60 }}>
            <div style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 600, fontSize: '0.72rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: '#00BF6F', marginBottom: 12 }}>Simple & Powerful</div>
            <h2 style={{ fontWeight: 800, fontSize: 'clamp(1.8rem, 5vw, 3rem)', color: '#E8F5E9', margin: 0, letterSpacing: '-0.02em' }}>How EcoTrack Works</h2>
          </div>
        </Reveal>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 24 }}>
          {[
            {
              step: '01', emoji: '📱', title: 'Log Daily Actions',
              desc: 'Tap any category — travel, food, energy, waste, shopping — and log it in seconds. Beautiful modals guide you through.',
              color: '#00BF6F',
            },
            {
              step: '02', emoji: '📊', title: 'See Your Impact',
              desc: 'Real-time CO₂ calculations using IPCC emission factors. Watch your savings grow on a stunning arc-progress dashboard.',
              color: '#60A5FA',
            },
            {
              step: '03', emoji: '🏆', title: 'Level Up & Compete',
              desc: 'Earn Eco-XP, climb from Seedling to Guardian, and compete on the global leaderboard with eco warriors worldwide.',
              color: '#FACC15',
            },
          ].map((item, i) => (
            <Reveal key={item.step} delay={i * 120}>
              <div style={{
                background: 'rgba(255,255,255,0.028)', border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: 20, padding: '28px 24px',
                backdropFilter: 'blur(12px)',
                transition: 'transform 0.25s, border-color 0.25s',
                cursor: 'default',
              }}
                onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.borderColor = `${item.color}40`; }}
                onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'; }}
              >
                {/* Step number */}
                <div style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 800, fontSize: '0.68rem', color: item.color, letterSpacing: '0.1em', marginBottom: 14 }}>STEP {item.step}</div>
                {/* Emoji icon */}
                <div style={{ width: 52, height: 52, borderRadius: 14, background: `${item.color}14`, border: `1px solid ${item.color}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.6rem', marginBottom: 18 }}>
                  {item.emoji}
                </div>
                <h3 style={{ fontWeight: 700, fontSize: '1.1rem', color: '#E8F5E9', margin: '0 0 10px' }}>{item.title}</h3>
                <p style={{ fontFamily: 'Poppins,sans-serif', fontSize: '0.875rem', color: 'rgba(232,245,233,0.55)', lineHeight: 1.65, margin: 0 }}>{item.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          IMPACT CATEGORIES SECTION
         ══════════════════════════════════════════════ */}
      <section style={{ padding: '0 24px 100px' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <Reveal>
            <div style={{ textAlign: 'center', marginBottom: 48 }}>
              <div style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 600, fontSize: '0.72rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: '#00BF6F', marginBottom: 12 }}>6 Categories of Action</div>
              <h2 style={{ fontWeight: 800, fontSize: 'clamp(1.8rem, 5vw, 3rem)', color: '#E8F5E9', margin: 0, letterSpacing: '-0.02em' }}>Every Choice Matters</h2>
            </div>
          </Reveal>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 16 }}>
            {[
              { emoji: '🚲', label: 'Travel', desc: 'Switch to green transport', color: '#60A5FA', bg: '/cat_travel.png' },
              { emoji: '🥗', label: 'Food', desc: 'Eat plant-forward meals', color: '#00BF6F', bg: '/cat_food.png' },
              { emoji: '⚡', label: 'Energy', desc: 'Go solar & save power', color: '#FACC15', bg: '/cat_energy.png' },
              { emoji: '♻️', label: 'Waste', desc: 'Recycle & compost more', color: '#A78BFA', bg: '/cat_waste.png' },
              { emoji: '🛒', label: 'Shopping', desc: 'Conscious purchasing', color: '#FB923C', bg: '/cat_shopping.png' },
              { emoji: '🌳', label: 'Eco Projects', desc: 'Plant trees & donate', color: '#34D399', bg: '/cat_eco.png' },
            ].map((cat, i) => (
              <Reveal key={cat.label} delay={i * 80}>
                <div style={{
                  borderRadius: 16, overflow: 'hidden',
                  aspectRatio: '1/1.15',
                  position: 'relative', cursor: 'default',
                  transition: 'transform 0.25s',
                }}
                  onMouseOver={e => e.currentTarget.style.transform = 'scale(1.04)'}
                  onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
                >
                  {/* Category image */}
                  <img src={cat.bg} alt={cat.label} style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }} />
                  {/* Dark overlay */}
                  <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(180deg, rgba(6,13,6,0) 30%, rgba(6,13,6,0.85) 100%)` }} />
                  {/* Content */}
                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '12px 12px 14px' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#fff', marginBottom: 2 }}>{cat.label}</div>
                    <div style={{ fontFamily: 'Poppins,sans-serif', fontSize: '0.65rem', color: `${cat.color}`, fontWeight: 500 }}>{cat.desc}</div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          COMMUNITY SECTION (full bleed image)
         ══════════════════════════════════════════════ */}
      <section style={{ position: 'relative', margin: '0 0 0', overflow: 'hidden', minHeight: 100, display: 'flex', alignItems: 'center', flexDirection: 'column', justifyContent: 'center' }}>
        <img src="/community.png" alt="Community" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(6,13,6,0.9) 0%, rgba(6,13,6,0.6) 50%, rgba(0,191,111,0.15) 100%)' }} />
        <div style={{ position: 'relative', zIndex: 1, padding: '80px 24px', maxWidth: 600, marginLeft: 'auto', marginRight: 'auto', textAlign: 'center' }}>

          <Reveal>
            <div style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 600, fontSize: '0.72rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: '#00BF6F', marginBottom: 14 }}>Join the Movement</div>
            <h2 style={{ fontWeight: 800, fontSize: 'clamp(1.8rem, 5vw, 3rem)', color: '#E8F5E9', margin: '0 0 16px', letterSpacing: '-0.02em', lineHeight: 1.15 }}>
              Lead the Change.<br />
              <span style={{ color: '#00BF6F' }}>Share & Inspire</span> Others.
            </h2>
            <p style={{ fontFamily: 'Poppins,sans-serif', fontSize: '1rem', color: 'rgba(232,245,233,0.65)', lineHeight: 1.7, margin: '0 0 32px' }}>
              EcoTrack connects you with a global community making real climate action their everyday habit. Every log is a vote for a cooler planet.
            </p>
            <div style={{ display: 'flex', gap: 24, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 36 }}>
              {[
                { icon: Users, label: 'Community', value: 'Global' },
                { icon: TreePine, label: 'Trees equivalent', value: 'Growing' },
                { icon: Globe2, label: 'SDG 13 Impact', value: 'Real' },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(0,191,111,0.15)', border: '1px solid rgba(0,191,111,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon size={16} color="#00BF6F" />
                  </div>
                  <div>
                    <div style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 700, fontSize: '0.85rem', color: '#E8F5E9' }}>{value}</div>
                    <div style={{ fontFamily: 'Poppins,sans-serif', fontSize: '0.65rem', color: 'rgba(232,245,233,0.45)' }}>{label}</div>
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={handleLogin}
              disabled={loading}
              className="eco-btn-primary"
              style={{ padding: '16px 40px', fontSize: '1rem', fontWeight: 700, borderRadius: 99, boxShadow: '0 8px 32px rgba(0,191,111,0.4)' }}
            >
              {loading ? '…' : <><Zap size={16} /> Start Tracking Free</>}
            </button>
          </Reveal>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          LEVEL BADGES SHOWCASE
         ══════════════════════════════════════════════ */}
      <section style={{ padding: '100px 24px', maxWidth: 800, margin: '0 auto' }}>
        <Reveal>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <div style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 600, fontSize: '0.72rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: '#00BF6F', marginBottom: 12 }}>Gamified Progress</div>
            <h2 style={{ fontWeight: 800, fontSize: 'clamp(1.8rem, 5vw, 3rem)', color: '#E8F5E9', margin: 0, letterSpacing: '-0.02em' }}>Your Eco Journey</h2>
            <p style={{ fontFamily: 'Poppins,sans-serif', fontSize: '0.95rem', color: 'rgba(232,245,233,0.5)', marginTop: 12 }}>Level up as you build greener habits over time</p>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: 0, overflowX: 'auto', padding: '0 0 8px' }}>
            {[
              { emoji: '🌱', label: 'Seedling', xp: '0 XP', color: '#6B8068' },
              { emoji: '🌿', label: 'Sapling', xp: '100 XP', color: '#00BF6F' },
              { emoji: '🌳', label: 'Redwood', xp: '300 XP', color: '#34D399' },
              { emoji: '🌲', label: 'Ancient', xp: '600 XP', color: '#60A5FA' },
              { emoji: '🌍', label: 'Guardian', xp: '1000 XP', color: '#FACC15' },
            ].map((level, i, arr) => (
              <div key={level.label} style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ textAlign: 'center', padding: '0 8px', minWidth: 80 }}>
                  <div style={{ fontSize: '2.2rem', marginBottom: 8 }}>{level.emoji}</div>
                  <div style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 700, fontSize: '0.78rem', color: '#E8F5E9' }}>{level.label}</div>
                  <div style={{ fontFamily: 'Poppins,sans-serif', fontSize: '0.65rem', color: level.color, marginTop: 2 }}>{level.xp}</div>
                </div>
                {i < arr.length - 1 && (
                  <div style={{ width: 28, height: 2, background: 'linear-gradient(90deg, rgba(0,191,111,0.3), rgba(0,191,111,0.1))', flexShrink: 0 }} />
                )}
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      {/* ══════════════════════════════════════════════
          FINAL CTA BAND
         ══════════════════════════════════════════════ */}
      <section style={{
        margin: '0 24px 80px', borderRadius: 24,
        padding: '52px 32px',
        background: 'linear-gradient(135deg, rgba(0,191,111,0.12) 0%, rgba(0,191,111,0.04) 100%)',
        border: '1px solid rgba(0,191,111,0.2)',
        textAlign: 'center',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Decorative circles */}
        <div style={{ position: 'absolute', top: -60, right: -60, width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,191,111,0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -80, left: -40, width: 240, height: 240, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,191,111,0.07) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <Reveal>
          <div style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 600, fontSize: '0.72rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: '#00BF6F', marginBottom: 16 }}>Free to Join</div>
          <h2 style={{ fontWeight: 800, fontSize: 'clamp(1.8rem, 5vw, 2.8rem)', color: '#E8F5E9', margin: '0 0 16px', letterSpacing: '-0.02em' }}>
            Your carbon story starts today.
          </h2>
          <p style={{ fontFamily: 'Poppins,sans-serif', fontSize: '1rem', color: 'rgba(232,245,233,0.55)', maxWidth: 480, margin: '0 auto 32px', lineHeight: 1.7 }}>
            Join the EcoTrack community. Log your first action in 30 seconds and see exactly how much CO₂ you can save this month.
          </p>
          <button
            onClick={handleLogin}
            disabled={loading}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 10,
              padding: '16px 40px', borderRadius: 99, border: 'none', cursor: 'pointer',
              background: '#E8F5E9', color: '#060d06',
              fontFamily: 'Poppins,sans-serif', fontWeight: 800, fontSize: '1rem',
              boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
              transition: 'transform 0.2s, box-shadow 0.2s',
            }}
            onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.4)'; }}
            onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.3)'; }}
          >
            <GoogleIcon /> {loading ? 'Signing in…' : 'Get Started — It\'s Free'}
          </button>
        </Reveal>
      </section>

      {/* ══════════════════════════════════════════════
          FOOTER
         ══════════════════════════════════════════════ */}
      <footer style={{
        borderTop: '1px solid rgba(0,191,111,0.08)',
        padding: '24px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Leaf size={14} color="#00BF6F" />
          <span style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 700, fontSize: '0.85rem', color: '#E8F5E9' }}>EcoTrack</span>
        </div>
        <span style={{ fontFamily: 'Poppins,sans-serif', fontSize: '0.72rem', color: 'rgba(232,245,233,0.3)' }}>
          © {new Date().getFullYear()} · Built for SDG 13 · Climate Action
        </span>
        <span style={{ fontFamily: 'Poppins,sans-serif', fontSize: '0.72rem', color: 'rgba(0,191,111,0.5)', fontWeight: 500 }}>🌍 Powered by real IPCC data</span>
      </footer>

      {/* CSS animations via style tag */}
      <style>{`
        @keyframes fadeInDown {
          from { opacity:0; transform:translateY(-16px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes fadeInUp {
          from { opacity:0; transform:translateY(24px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes pulse {
          0%,100% { opacity:1; transform:scale(1); }
          50%      { opacity:0.5; transform:scale(0.85); }
        }
        @keyframes bounce {
          0%,100% { transform:translateX(-50%) translateY(0); }
          50%      { transform:translateX(-50%) translateY(6px); }
        }
      `}</style>
    </div>
  );
}
