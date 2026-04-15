import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateMonthlyGoal, logoutUser } from '../features/userSlice';
import { User, Target, Zap, Flame, Award, LogOut, Edit3, Check, TrendingUp } from 'lucide-react';

const LEVEL_BADGES = [
  { level: 1, min: 0,    badge: 'Seedling',  emoji: '🌱', desc: 'Beginning your eco journey'   },
  { level: 2, min: 100,  badge: 'Sapling',   emoji: '🌿', desc: 'Growing your green impact'    },
  { level: 3, min: 300,  badge: 'Redwood',   emoji: '🌳', desc: 'A force for climate action'   },
  { level: 4, min: 600,  badge: 'Ancient',   emoji: '🌲', desc: 'Powerful eco champion'         },
  { level: 5, min: 1000, badge: 'Guardian',  emoji: '🌍', desc: 'Guardian of the planet'        },
];

export default function Profile() {
  const dispatch = useDispatch();
  const { user, totalXP, level, badge, badgeEmoji, currentStreak, longestStreak, monthlyGoal, totalCarbonLogged } = useSelector((s) => s.user);

  const [editGoal, setEditGoal] = useState(false);
  const [goalInput, setGoalInput] = useState(String(monthlyGoal));

  const handleSaveGoal = () => {
    const g = parseFloat(goalInput);
    if (g >= 1) { dispatch(updateMonthlyGoal(g)); setEditGoal(false); }
  };
  const handleLogout = () => dispatch(logoutUser());

  // XP to next level
  const currentLevelBadge = LEVEL_BADGES.find(b => b.level === level);
  const nextLevelBadge    = LEVEL_BADGES.find(b => b.level === level + 1);
  const xpToNext          = nextLevelBadge ? nextLevelBadge.min - totalXP : 0;
  const levelProgress     = nextLevelBadge
    ? ((totalXP - (currentLevelBadge?.min || 0)) / (nextLevelBadge.min - (currentLevelBadge?.min || 0))) * 100
    : 100;

  return (
    <div className="eco-page" style={{ maxWidth: 640, margin: '0 auto' }}>

      {/* ── Page Header ─────────────────────────────── */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontFamily:'Poppins,sans-serif', fontSize:'0.7rem', fontWeight:600, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--eco-muted)', marginBottom:4 }}>Account</div>
        <h1 style={{ fontFamily:'Poppins,sans-serif', fontWeight:800, fontSize:'1.8rem', color:'var(--eco-text)', margin:0, lineHeight:1.2 }}>My Profile</h1>
        <p style={{ fontFamily:'Poppins,sans-serif', fontSize:'0.875rem', color:'var(--eco-muted)', margin:'4px 0 0' }}>Track your eco journey and stats</p>
      </div>

      {/* ── Profile Card ──────────────────────────────── */}
      <div className="eco-card-elevated" style={{ padding:'20px', marginBottom:16, display:'flex', alignItems:'center', gap:16, position:'relative', overflow:'hidden' }}>
        {/* Subtle glow */}
        <div style={{ position:'absolute', top:-40, right:-40, width:120, height:120, borderRadius:'50%', background:'radial-gradient(circle, rgba(0,191,111,0.08) 0%, transparent 70%)', pointerEvents:'none' }}/>

        {/* Avatar */}
        <div style={{ width:64, height:64, borderRadius:'50%', border:'2px solid rgba(0,191,111,0.5)', background:'rgba(0,191,111,0.1)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, overflow:'hidden' }}>
          {user?.avatar
            ? <img src={user.avatar} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }}/>
            : <span style={{ fontFamily:'Poppins,sans-serif', fontWeight:700, fontSize:'1.5rem', color:'var(--eco-green)' }}>{user?.name?.[0]?.toUpperCase() || '?'}</span>
          }
        </div>

        {/* Info */}
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ fontFamily:'Poppins,sans-serif', fontWeight:700, fontSize:'1.1rem', color:'var(--eco-text)', marginBottom:2 }}>{user?.name}</div>
          <div style={{ fontFamily:'Poppins,sans-serif', fontSize:'0.78rem', color:'var(--eco-muted)', marginBottom:10, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{user?.email}</div>
          <div style={{ display:'flex', gap:8 }}>
            <span style={{ fontFamily:'Poppins,sans-serif', fontSize:'0.72rem', fontWeight:600, background:'rgba(0,191,111,0.15)', color:'var(--eco-green)', border:'1px solid rgba(0,191,111,0.2)', borderRadius:99, padding:'3px 10px' }}>{badgeEmoji} {badge}</span>
            <span style={{ fontFamily:'Poppins,sans-serif', fontSize:'0.72rem', fontWeight:600, background:'rgba(0,191,111,0.08)', color:'var(--eco-text)', border:'1px solid var(--eco-border)', borderRadius:99, padding:'3px 10px' }}>Lvl {level}</span>
          </div>
        </div>
      </div>

      {/* ── Stats Grid ─────────────────────────────────── */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:12, marginBottom:16 }}>
        {[
          { icon: Zap,     label: 'Total XP',       value: totalXP.toLocaleString(),        unit: 'XP',   color: '#FACC15', bg: 'rgba(250,204,21,0.1)'   },
          { icon: Flame,   label: 'Current Streak',  value: currentStreak,                   unit: 'days', color: '#FB923C', bg: 'rgba(251,146,60,0.1)'   },
          { icon: Award,   label: 'Longest Streak',  value: longestStreak,                   unit: 'days', color: '#A78BFA', bg: 'rgba(167,139,250,0.1)'  },
          { icon: TrendingUp, label: 'CO₂ Logged',   value: totalCarbonLogged.toFixed(2),    unit: 'kg',   color: '#00BF6F', bg: 'rgba(0,191,111,0.1)'    },
        ].map(({ icon:Icon, label, value, unit, color, bg }) => (
          <div key={label} className="eco-card" style={{ padding:'18px 16px' }}>
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:10 }}>
              <div style={{ width:28, height:28, borderRadius:8, background:bg, display:'flex', alignItems:'center', justifyContent:'center' }}>
                <Icon size={14} color={color}/>
              </div>
              <span style={{ fontFamily:'Poppins,sans-serif', fontSize:'0.7rem', fontWeight:600, letterSpacing:'0.05em', textTransform:'uppercase', color:'var(--eco-muted)' }}>{label}</span>
            </div>
            <div style={{ fontFamily:'Poppins,sans-serif', fontWeight:800, fontSize:'1.6rem', color:'var(--eco-text)', lineHeight:1 }}>
              {value}<span style={{ fontSize:'0.75rem', fontWeight:500, color:'var(--eco-muted)', marginLeft:4 }}>{unit}</span>
            </div>
          </div>
        ))}
      </div>

      {/* ── XP to next level ──────────────────────────── */}
      {nextLevelBadge && (
        <div className="eco-card" style={{ padding:'18px', marginBottom:16 }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
            <div>
              <div style={{ fontFamily:'Poppins,sans-serif', fontWeight:600, fontSize:'0.9rem', color:'var(--eco-text)' }}>Level Progress</div>
              <div style={{ fontFamily:'Poppins,sans-serif', fontSize:'0.72rem', color:'var(--eco-muted)', marginTop:2 }}>{xpToNext} XP to {nextLevelBadge.emoji} {nextLevelBadge.badge}</div>
            </div>
            <div style={{ fontFamily:'Poppins,sans-serif', fontWeight:700, fontSize:'0.9rem', color:'var(--eco-green)' }}>{Math.round(levelProgress)}%</div>
          </div>
          <div className="eco-progress-track">
            <div className="eco-progress-bar" style={{ width:`${levelProgress}%` }}/>
          </div>
          <div style={{ display:'flex', justifyContent:'space-between', fontFamily:'Poppins,sans-serif', fontSize:'0.65rem', color:'var(--eco-muted)', marginTop:6 }}>
            <span>{badgeEmoji} {badge}</span>
            <span>{nextLevelBadge.emoji} {nextLevelBadge.badge}</span>
          </div>
        </div>
      )}

      {/* ── Monthly Goal ───────────────────────────────── */}
      <div className="eco-card" style={{ padding:'18px', marginBottom:16 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:editGoal ? 14 : 12 }}>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <div style={{ width:28, height:28, borderRadius:8, background:'rgba(0,191,111,0.12)', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <Target size={14} color="#00BF6F"/>
            </div>
            <span style={{ fontFamily:'Poppins,sans-serif', fontWeight:600, fontSize:'0.9rem', color:'var(--eco-text)' }}>Monthly CO₂ Goal</span>
          </div>
          <button id="profile-edit-goal" onClick={() => { setEditGoal(!editGoal); setGoalInput(String(monthlyGoal)); }}
            style={{ background:'none', border:'none', cursor:'pointer', color:'var(--eco-muted)', padding:4, display:'flex' }}>
            <Edit3 size={15}/>
          </button>
        </div>
        {editGoal ? (
          <div style={{ display:'flex', gap:10 }}>
            <input id="profile-goal-input" type="number" min="1" step="1"
              className="eco-input" style={{ flex:1 }}
              value={goalInput} onChange={(e) => setGoalInput(e.target.value)} placeholder="kg CO₂ / month"/>
            <button onClick={handleSaveGoal} className="eco-btn-primary" style={{ padding:'0 16px', borderRadius:12 }}>
              <Check size={16}/>
            </button>
          </div>
        ) : (
          <div style={{ fontFamily:'Poppins,sans-serif', fontWeight:800, fontSize:'1.8rem', color:'var(--eco-text)' }}>
            {monthlyGoal}<span style={{ fontSize:'0.85rem', fontWeight:500, color:'var(--eco-muted)', marginLeft:6 }}>kg CO₂ / month</span>
          </div>
        )}
      </div>

      {/* ── Level Progression Map ─────────────────────── */}
      <div className="eco-card" style={{ overflow:'hidden', marginBottom:16 }}>
        <div style={{ padding:'18px 18px 12px' }}>
          <div style={{ fontFamily:'Poppins,sans-serif', fontWeight:600, fontSize:'0.9rem', color:'var(--eco-text)' }}>Level Progression</div>
        </div>
        {LEVEL_BADGES.map((lb, idx) => {
          const isUnlocked = totalXP >= lb.min;
          const isCurrent  = lb.level === level;
          return (
            <div key={lb.level} style={{
              display:'flex', alignItems:'center', gap:14, padding:'14px 18px',
              background: isCurrent ? 'rgba(0,191,111,0.07)' : 'transparent',
              borderTop: idx === 0 ? 'none' : '1px solid rgba(0,191,111,0.07)',
              opacity: isUnlocked ? 1 : 0.35,
            }}>
              <span style={{ fontSize:'1.6rem', filter: isUnlocked ? 'none' : 'grayscale(1)' }}>{lb.emoji}</span>
              <div style={{ flex:1 }}>
                <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                  <span style={{ fontFamily:'Poppins,sans-serif', fontWeight:600, fontSize:'0.9rem', color: isCurrent ? 'var(--eco-green)' : 'var(--eco-text)' }}>{lb.badge}</span>
                  {isCurrent && <span style={{ fontFamily:'Poppins,sans-serif', fontSize:'0.6rem', fontWeight:700, background:'rgba(0,191,111,0.15)', color:'var(--eco-green)', borderRadius:99, padding:'2px 8px' }}>CURRENT</span>}
                  {!isUnlocked && <span style={{ fontFamily:'Poppins,sans-serif', fontSize:'0.68rem', color:'var(--eco-muted)' }}>🔒 {lb.min} XP</span>}
                </div>
                <div style={{ fontFamily:'Poppins,sans-serif', fontSize:'0.72rem', color:'var(--eco-muted)', marginTop:2 }}>{lb.desc}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Logout ────────────────────────────────────── */}
      <button id="profile-logout" onClick={handleLogout}
        className="eco-btn-ghost"
        style={{ width:'100%', padding:'14px', display:'flex', alignItems:'center', justifyContent:'center', gap:8, color:'#F87171', border:'1px solid rgba(248,113,113,0.2)', borderRadius:14, marginBottom:8 }}>
        <LogOut size={16}/> Sign Out
      </button>
    </div>
  );
}
