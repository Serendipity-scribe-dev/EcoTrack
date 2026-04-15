/**
 * EcoInsights — replaces LogActivity
 * Shows personal eco habit analytics, daily eco tips carousel,
 * eco challenges, and a carbon saved calculator.
 */
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchActivities, fetchWeeklyStats } from '../features/activitySlice';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, Radar } from 'recharts';
import { Lightbulb, ArrowRight, Flame, TrendingDown, Award, RefreshCw, Leaf } from 'lucide-react';

/* ── Daily Eco Tips ─────────────────────────────────────── */
const ECO_TIPS = [
  { emoji:'🚲', tip:'Bike or walk for trips under 3 km. Saves up to 0.63 kg CO₂ per trip.', category:'Travel',   color:'#60A5FA' },
  { emoji:'🥗', tip:'One plant-based meal instead of beef saves ~2.5 kg CO₂ — equal to a 10 km car ride.', category:'Food', color:'#00BF6F' },
  { emoji:'💡', tip:'Switching to LED bulbs cuts your lighting energy use by 75%.', category:'Energy',   color:'#FACC15' },
  { emoji:'♻️', tip:'Every kg of recycled plastic saves about 1.5 kg CO₂ versus landfill.', category:'Waste', color:'#A78BFA' },
  { emoji:'👗', tip:'Buying secondhand clothes avoids ~10–15 kg CO₂ per item vs. new fast fashion.', category:'Shopping', color:'#FB923C' },
  { emoji:'🌳', tip:'One tree absorbs ~21 kg CO₂ per year. Plant one and offset a month of driving.', category:'Eco', color:'#34D399' },
  { emoji:'🚰', tip:'Reducing shower time by 2 minutes saves ~0.5 kg CO₂ per shower.', category:'Energy', color:'#FACC15' },
  { emoji:'🛒', tip:'Buying local produce cuts transport emissions by up to 50% compared to imported goods.', category:'Food', color:'#00BF6F' },
];

/* ── Eco Challenges ─────────────────────────────────────── */
const CHALLENGES = [
  { id:'c1', emoji:'🚴', title:'No-Car Week', desc:'Use only walking, cycling, or public transit for 7 days', xp:150, days:7, color:'#60A5FA' },
  { id:'c2', emoji:'🌱', title:'Plant-Based 5', desc:'Eat 5 plant-based meals this week — no beef or pork', xp:80, days:7, color:'#00BF6F' },
  { id:'c3', emoji:'💡', title:'Power Down', desc:'Reduce your home power usage by turning off standby devices', xp:60, days:3, color:'#FACC15' },
  { id:'c4', emoji:'🌳', title:'Tree Planter', desc:'Plant at least 1 tree this month', xp:200, days:30, color:'#34D399' },
];

/* ── Quick Calculator ───────────────────────────────────── */
function CarbonCalc() {
  const [mode, setMode]     = useState('car');
  const [distance, setDist] = useState(20);
  const factors = { car:0.21, bus:0.089, bicycle:0, train:0.041, walking:0 };
  const saved   = parseFloat(((factors.car - factors[mode]) * distance).toFixed(2));
  const modes   = [
    { id:'bicycle', emoji:'🚲', label:'Bike'  },
    { id:'walking', emoji:'🚶', label:'Walk'  },
    { id:'train',   emoji:'🚆', label:'Train' },
    { id:'bus',     emoji:'🚌', label:'Bus'   },
  ];

  return (
    <div className="eco-card-elevated" style={{ padding:'22px' }}>
      <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:18 }}>
        <div style={{ width:30, height:30, borderRadius:8, background:'rgba(0,191,111,0.12)', display:'flex', alignItems:'center', justifyContent:'center' }}>
          <TrendingDown size={15} color="#00BF6F"/>
        </div>
        <div>
          <div style={{ fontFamily:'Poppins,sans-serif', fontWeight:700, fontSize:'0.95rem', color:'var(--eco-text)' }}>CO₂ Savings Calculator</div>
          <div style={{ fontFamily:'Poppins,sans-serif', fontSize:'0.7rem', color:'var(--eco-muted)' }}>vs driving by car</div>
        </div>
      </div>

      {/* Mode buttons */}
      <div style={{ display:'flex', gap:8, marginBottom:18, overflowX:'auto', paddingBottom:4 }}>
        {modes.map(m => (
          <button key={m.id} onClick={() => setMode(m.id)} style={{
            display:'flex', flexDirection:'column', alignItems:'center', gap:4, padding:'10px 14px',
            background: mode === m.id ? 'rgba(0,191,111,0.15)' : 'rgba(255,255,255,0.03)',
            border: mode === m.id ? '1.5px solid var(--eco-green)' : '1.5px solid rgba(0,191,111,0.1)',
            borderRadius:12, cursor:'pointer', flexShrink:0, minWidth:64,
          }}>
            <span style={{ fontSize:'1.4rem' }}>{m.emoji}</span>
            <span style={{ fontFamily:'Poppins,sans-serif', fontSize:'0.65rem', fontWeight: mode === m.id ? 600 : 400, color: mode === m.id ? 'var(--eco-green)' : 'var(--eco-muted)' }}>{m.label}</span>
          </button>
        ))}
      </div>

      {/* Distance slider */}
      <div style={{ marginBottom:16 }}>
        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8 }}>
          <span style={{ fontFamily:'Poppins,sans-serif', fontSize:'0.8rem', fontWeight:600, color:'var(--eco-text)' }}>Trip distance</span>
          <span style={{ fontFamily:'Poppins,sans-serif', fontSize:'0.8rem', fontWeight:700, color:'var(--eco-green)', background:'rgba(0,191,111,0.1)', padding:'2px 10px', borderRadius:99 }}>{distance} km</span>
        </div>
        <input type="range" min={1} max={100} value={distance} onChange={e => setDist(+e.target.value)}
          className="eco-range"
          style={{ background:`linear-gradient(to right,var(--eco-green) ${(distance-1)/99*100}%,rgba(0,191,111,0.15) ${(distance-1)/99*100}%)` }}/>
      </div>

      {/* Result */}
      <div style={{ background: saved > 0 ? 'rgba(0,191,111,0.07)' : 'rgba(255,255,255,0.02)', border:`1px solid ${saved > 0 ? 'rgba(0,191,111,0.2)' : 'rgba(0,191,111,0.08)'}`, borderRadius:14, padding:'14px 16px', textAlign:'center' }}>
        <div style={{ fontFamily:'Poppins,sans-serif', fontWeight:800, fontSize:'2rem', color: saved > 0 ? 'var(--eco-green)' : 'var(--eco-muted)' }}>
          {saved > 0 ? `${saved} kg` : '0 kg'}<span style={{ fontSize:'0.8rem', fontWeight:500, marginLeft:6, color:'var(--eco-muted)' }}>CO₂ saved</span>
        </div>
        <div style={{ fontFamily:'Poppins,sans-serif', fontSize:'0.75rem', color:'var(--eco-muted)', marginTop:4 }}>
          {saved > 0
            ? `🌳 Equivalent to what ${Math.round(saved / 1.75)} tree(s) fix in a month`
            : 'Choose an eco mode above to see your savings'}
        </div>
      </div>
    </div>
  );
}

/* ── Tip Card ───────────────────────────────────────────── */
function TipCarousel() {
  const [idx, setIdx] = useState(() => Math.floor(Math.random() * ECO_TIPS.length));
  const tip = ECO_TIPS[idx];
  const next = () => setIdx(i => (i + 1) % ECO_TIPS.length);

  return (
    <div className="eco-card" style={{ padding:'20px', overflow:'hidden', position:'relative' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:14 }}>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <div style={{ width:30, height:30, borderRadius:8, background:'rgba(0,191,111,0.12)', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <Lightbulb size={15} color="#00BF6F"/>
          </div>
          <div>
            <div style={{ fontFamily:'Poppins,sans-serif', fontWeight:700, fontSize:'0.9rem', color:'var(--eco-text)' }}>Daily Eco Tip</div>
            <div style={{ fontFamily:'Poppins,sans-serif', fontSize:'0.65rem', fontWeight:500, color:tip.color, marginTop:1 }}>{tip.category}</div>
          </div>
        </div>
        <button onClick={next} style={{ background:'rgba(0,191,111,0.08)', border:'1px solid rgba(0,191,111,0.15)', borderRadius:8, padding:'6px 10px', cursor:'pointer', display:'flex', alignItems:'center', gap:4 }}>
          <RefreshCw size={12} color="var(--eco-green)"/>
          <span style={{ fontFamily:'Poppins,sans-serif', fontSize:'0.65rem', color:'var(--eco-green)', fontWeight:600 }}>Next tip</span>
        </button>
      </div>

      <div style={{ display:'flex', gap:12, alignItems:'flex-start' }}>
        <div style={{ width:48, height:48, borderRadius:12, background:`${tip.color}14`, border:`1px solid ${tip.color}25`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.6rem', flexShrink:0 }}>
          {tip.emoji}
        </div>
        <p style={{ fontFamily:'Poppins,sans-serif', fontSize:'0.875rem', color:'var(--eco-text)', lineHeight:1.65, margin:0, flex:1 }}>
          {tip.tip}
        </p>
      </div>

      {/* Tip counter dots */}
      <div style={{ display:'flex', gap:5, justifyContent:'center', marginTop:14 }}>
        {ECO_TIPS.map((_, i) => (
          <div key={i} onClick={() => setIdx(i)} style={{
            width: i === idx ? 18 : 6, height:6, borderRadius:99, cursor:'pointer',
            background: i === idx ? 'var(--eco-green)' : 'rgba(0,191,111,0.2)',
            transition:'all 0.3s',
          }}/>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════════════════════ */
export default function EcoInsights() {
  const dispatch = useDispatch();
  const { activities, weeklyStats } = useSelector(s => s.activity);
  const { totalXP, level, badge, badgeEmoji, currentStreak, monthlyGoal } = useSelector(s => s.user);

  const [joinedChallenges, setJoinedChallenges] = useState([]);

  useEffect(() => {
    dispatch(fetchActivities());
    dispatch(fetchWeeklyStats());
  }, [dispatch]);

  // Category breakdown for radar
  const catCounts = {};
  activities.forEach(a => { catCounts[a.category] = (catCounts[a.category] || 0) + 1; });
  const radarData = ['Transport','Diet','Power','Waste','Shopping','Eco'].map(cat => ({
    cat, value: catCounts[cat] || 0,
  }));
  const maxVal = Math.max(...radarData.map(d => d.value), 1);
  const radarNorm = radarData.map(d => ({ ...d, value: Math.round((d.value / maxVal) * 100) }));

  // Weekly trend (use weeklyStats if available, else mock)
  const chartData = weeklyStats.length
    ? weeklyStats.map(d => ({ day: d.day || d.date?.slice(0,3), kg: parseFloat((d.carbon || d.totalCarbon || 0).toFixed(2)) }))
    : ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(day => ({ day, kg: 0 }));

  // Streak color
  const streakColor = currentStreak >= 7 ? '#FACC15' : currentStreak >= 3 ? '#FB923C' : '#00BF6F';

  const toggleChallenge = (id) => {
    setJoinedChallenges(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  return (
    <div className="eco-page" style={{ maxWidth:780, margin:'0 auto' }}>

      {/* ── Header ──────────────────────────────────────── */}
      <div style={{ marginBottom:28 }}>
        <div style={{ fontFamily:'Poppins,sans-serif', fontSize:'0.7rem', fontWeight:600, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--eco-muted)', marginBottom:4 }}>Your Impact</div>
        <h1 style={{ fontFamily:'Poppins,sans-serif', fontWeight:800, fontSize:'1.8rem', color:'var(--eco-text)', margin:0, lineHeight:1.2 }}>Eco Insights 🌿</h1>
        <p style={{ fontFamily:'Poppins,sans-serif', fontSize:'0.875rem', color:'var(--eco-muted)', margin:'4px 0 0' }}>Understand your habits, get smart tips, and take on challenges</p>
      </div>

      {/* ── Quick Stats Row ──────────────────────────────── */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12, marginBottom:20 }}>
        {[
          { emoji:'⚡', value:`${totalXP}`, unit:'XP', label:'Total EcoXP', color:'#FACC15' },
          { emoji:'🔥', value:currentStreak, unit:'days', label:'Streak', color:streakColor },
          { emoji:'📋', value:activities.length, unit:'logs', label:'Logged', color:'#60A5FA' },
        ].map(({ emoji, value, unit, label, color }) => (
          <div key={label} className="eco-card" style={{ padding:'14px 12px', textAlign:'center' }}>
            <div style={{ fontSize:'1.3rem', marginBottom:6 }}>{emoji}</div>
            <div style={{ fontFamily:'Poppins,sans-serif', fontWeight:800, fontSize:'1.4rem', color, lineHeight:1 }}>{value}</div>
            <div style={{ fontFamily:'Poppins,sans-serif', fontSize:'0.65rem', color:'var(--eco-muted)', marginTop:3 }}>{label}</div>
          </div>
        ))}
      </div>

      {/* ── Tip Carousel ────────────────────────────────── */}
      <div style={{ marginBottom:20 }}>
        <TipCarousel/>
      </div>

      {/* ── CO₂ Calculator ──────────────────────────────── */}
      <div style={{ marginBottom:20 }}>
        <CarbonCalc/>
      </div>

      {/* ── Weekly CO₂ Trend ─────────────────────────────── */}
      <div className="eco-card" style={{ padding:'20px', marginBottom:20 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
          <div>
            <div style={{ fontFamily:'Poppins,sans-serif', fontWeight:700, fontSize:'0.95rem', color:'var(--eco-text)' }}>Weekly Carbon Trend</div>
            <div style={{ fontFamily:'Poppins,sans-serif', fontSize:'0.7rem', color:'var(--eco-muted)', marginTop:2 }}>kg CO₂ logged per day</div>
          </div>
          <span style={{ fontFamily:'Poppins,sans-serif', fontSize:'0.7rem', fontWeight:600, background:'rgba(0,191,111,0.1)', color:'var(--eco-green)', padding:'3px 10px', borderRadius:99 }}>This Week</span>
        </div>
        <ResponsiveContainer width="100%" height={160}>
          <AreaChart data={chartData} margin={{ top:5, right:5, left:-28, bottom:0 }}>
            <defs>
              <linearGradient id="insightGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#00BF6F" stopOpacity={0.4}/>
                <stop offset="100%" stopColor="#00BF6F" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <XAxis dataKey="day" tick={{ fontFamily:'Poppins,sans-serif', fontSize:10, fill:'#6B8068' }} axisLine={false} tickLine={false}/>
            <YAxis tick={{ fontFamily:'Poppins,sans-serif', fontSize:10, fill:'#6B8068' }} axisLine={false} tickLine={false}/>
            <Tooltip
              contentStyle={{ background:'var(--eco-surface2)', border:'1px solid var(--eco-border-s)', borderRadius:10, fontFamily:'Poppins,sans-serif', fontSize:'0.78rem', color:'var(--eco-text)' }}
              cursor={{ stroke:'rgba(0,191,111,0.2)', strokeWidth:2 }}
            />
            <Area type="monotone" dataKey="kg" stroke="#00BF6F" strokeWidth={2.5} fill="url(#insightGrad)"/>
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* ── Category Radar ───────────────────────────────── */}
      {activities.length > 0 && (
        <div className="eco-card" style={{ padding:'20px', marginBottom:20 }}>
          <div style={{ fontFamily:'Poppins,sans-serif', fontWeight:700, fontSize:'0.95rem', color:'var(--eco-text)', marginBottom:4 }}>Activity Balance</div>
          <div style={{ fontFamily:'Poppins,sans-serif', fontSize:'0.7rem', color:'var(--eco-muted)', marginBottom:16 }}>Which categories you log most</div>
          <ResponsiveContainer width="100%" height={200}>
            <RadarChart data={radarNorm} cx="50%" cy="50%" outerRadius={75}>
              <PolarGrid stroke="rgba(0,191,111,0.1)"/>
              <PolarAngleAxis dataKey="cat" tick={{ fontFamily:'Poppins,sans-serif', fontSize:10, fill:'var(--eco-muted)' }}/>
              <Radar name="Usage" dataKey="value" stroke="#00BF6F" fill="#00BF6F" fillOpacity={0.18} strokeWidth={2}/>
            </RadarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* ── Eco Challenges ───────────────────────────────── */}
      <div>
        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:16 }}>
          <div style={{ width:30, height:30, borderRadius:8, background:'rgba(0,191,111,0.12)', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <Award size={15} color="#00BF6F"/>
          </div>
          <div>
            <div style={{ fontFamily:'Poppins,sans-serif', fontWeight:700, fontSize:'0.95rem', color:'var(--eco-text)' }}>Eco Challenges</div>
            <div style={{ fontFamily:'Poppins,sans-serif', fontSize:'0.7rem', color:'var(--eco-muted)' }}>Push your green habits further</div>
          </div>
        </div>

        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          {CHALLENGES.map(c => {
            const joined = joinedChallenges.includes(c.id);
            return (
              <div key={c.id} className="eco-card" style={{ padding:'16px 18px', display:'flex', alignItems:'center', gap:14, border: joined ? `1px solid ${c.color}40` : '1px solid var(--eco-border)' }}>
                <div style={{ width:48, height:48, borderRadius:14, background:`${c.color}14`, border:`1px solid ${c.color}25`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.5rem', flexShrink:0 }}>
                  {c.emoji}
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontFamily:'Poppins,sans-serif', fontWeight:700, fontSize:'0.9rem', color:'var(--eco-text)' }}>{c.title}</div>
                  <div style={{ fontFamily:'Poppins,sans-serif', fontSize:'0.72rem', color:'var(--eco-muted)', marginTop:2, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{c.desc}</div>
                  <div style={{ display:'flex', gap:8, marginTop:6 }}>
                    <span style={{ fontFamily:'Poppins,sans-serif', fontSize:'0.65rem', fontWeight:600, color:c.color, background:`${c.color}10`, padding:'2px 8px', borderRadius:99 }}>+{c.xp} XP</span>
                    <span style={{ fontFamily:'Poppins,sans-serif', fontSize:'0.65rem', color:'var(--eco-muted)', background:'rgba(0,0,0,0.2)', padding:'2px 8px', borderRadius:99 }}>{c.days} days</span>
                  </div>
                </div>
                <button onClick={() => toggleChallenge(c.id)} style={{
                  padding:'8px 16px', borderRadius:99, flexShrink:0, cursor:'pointer',
                  fontFamily:'Poppins,sans-serif', fontSize:'0.78rem', fontWeight:700,
                  background: joined ? `${c.color}` : 'transparent',
                  border: joined ? `1.5px solid ${c.color}` : `1.5px solid ${c.color}50`,
                  color: joined ? '#fff' : c.color,
                  transition:'all 0.2s',
                }}>
                  {joined ? '✓ Joined' : 'Join'}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Level Badge showcase ─────────────────────────── */}
      <div className="eco-card" style={{ padding:'20px', marginTop:20, textAlign:'center' }}>
        <div style={{ fontFamily:'Poppins,sans-serif', fontWeight:700, fontSize:'0.95rem', color:'var(--eco-text)', marginBottom:4 }}>Your Eco Level</div>
        <div style={{ fontFamily:'Poppins,sans-serif', fontSize:'0.7rem', color:'var(--eco-muted)', marginBottom:16 }}>Keep logging to level up</div>
        <div style={{ fontSize:'3rem', marginBottom:8 }}>{badgeEmoji}</div>
        <div style={{ fontFamily:'Poppins,sans-serif', fontWeight:800, fontSize:'1.3rem', color:'var(--eco-green)', marginBottom:4 }}>{badge}</div>
        <div style={{ fontFamily:'Poppins,sans-serif', fontSize:'0.78rem', color:'var(--eco-muted)', marginBottom:16 }}>Level {level} · {totalXP} XP earned</div>
        <div style={{ display:'flex', justifyContent:'center', gap:12 }}>
          {['🌱','🌿','🌳','🌲','🌍'].map((em, i) => (
            <div key={i} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:4, opacity: i + 1 <= level ? 1 : 0.25 }}>
              <span style={{ fontSize:'1.4rem' }}>{em}</span>
              <div style={{ width:6, height:6, borderRadius:'50%', background: i + 1 <= level ? 'var(--eco-green)' : 'rgba(0,191,111,0.2)' }}/>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
