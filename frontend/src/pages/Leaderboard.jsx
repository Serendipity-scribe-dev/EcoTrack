import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchLeaderboard } from '../features/activitySlice';
import { Trophy, Medal, Crown, TreePine } from 'lucide-react';

const LEVEL_EMOJI = { 1:'🌱', 2:'🌿', 3:'🌳', 4:'🌲', 5:'🌍' };

const RANK_CONFIG = [
  { border:'#FACC15', bg:'rgba(250,204,21,0.06)', icon: Crown,  iconColor:'#FACC15' },
  { border:'#9CA3AF', bg:'rgba(156,163,175,0.05)', icon: Medal, iconColor:'#9CA3AF' },
  { border:'#FB923C', bg:'rgba(251,146,60,0.06)',  icon: Medal, iconColor:'#FB923C' },
];

export default function Leaderboard() {
  const dispatch  = useDispatch();
  const { leaderboard, loading } = useSelector((s) => s.activity);
  const { user } = useSelector((s) => s.user);

  useEffect(() => {
    dispatch(fetchLeaderboard());
  }, [dispatch]);

  return (
    <div className="eco-page" style={{ maxWidth: 640, margin: '0 auto' }}>

      {/* ── Header ──────────────────────────────────── */}
      <div style={{ textAlign:'center', marginBottom:28 }}>
        <div style={{ display:'flex', justifyContent:'center', marginBottom:14 }}>
          <div style={{ width:56, height:56, borderRadius:16, background:'rgba(250,204,21,0.1)', border:'1px solid rgba(250,204,21,0.2)', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <Trophy size={28} color="#FACC15"/>
          </div>
        </div>
        <div style={{ fontFamily:'Poppins,sans-serif', fontSize:'0.7rem', fontWeight:600, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--eco-muted)', marginBottom:6 }}>Global Rankings</div>
        <h1 style={{ fontFamily:'Poppins,sans-serif', fontWeight:800, fontSize:'1.8rem', color:'var(--eco-text)', margin:'0 0 6px' }}>Eco Leaderboard</h1>
        <p style={{ fontFamily:'Poppins,sans-serif', fontSize:'0.82rem', color:'var(--eco-muted)', margin:0 }}>Top eco warriors ranked by total XP</p>
      </div>

      {/* ── List ────────────────────────────────────── */}
      {loading ? (
        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          {[1,2,3,4,5].map(i => (
            <div key={i} className="eco-card" style={{ height:72, opacity:0.3 }}/>
          ))}
        </div>
      ) : leaderboard.length === 0 ? (
        <div className="eco-card" style={{ padding:'48px 20px', textAlign:'center' }}>
          <div style={{ fontSize:'2.5rem', marginBottom:10 }}>🌱</div>
          <div style={{ fontFamily:'Poppins,sans-serif', fontWeight:600, fontSize:'0.95rem', color:'var(--eco-muted)' }}>
            No warriors yet — be the first!
          </div>
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          {leaderboard.map((player, index) => {
            const rank      = index + 1;
            const isMe      = player.email === user?.email || player.name === user?.name;
            const rc        = RANK_CONFIG[index];
            const levelEmoji = LEVEL_EMOJI[player.level] || '🌱';

            return (
              <div
                key={player._id}
                id={`leaderboard-rank-${rank}`}
                className="eco-card"
                style={{
                  padding:'14px 16px',
                  display:'flex',
                  alignItems:'center',
                  gap:14,
                  border: rc ? `1px solid ${rc.border}40` : isMe ? '1px solid rgba(0,191,111,0.3)' : '1px solid var(--eco-border)',
                  background: rc ? rc.bg : isMe ? 'rgba(0,191,111,0.04)' : 'var(--eco-surface)',
                  transition:'transform 0.15s',
                }}
              >
                {/* Rank badge */}
                <div style={{ width:36, textAlign:'center', flexShrink:0 }}>
                  {rc ? (
                    <rc.icon size={20} color={rc.iconColor}/>
                  ) : (
                    <span style={{ fontFamily:'Poppins,sans-serif', fontWeight:700, fontSize:'0.9rem', color:'var(--eco-muted)' }}>
                      #{rank}
                    </span>
                  )}
                </div>

                {/* Avatar */}
                <div style={{ width:40, height:40, borderRadius:'50%', border: isMe ? '2px solid var(--eco-green)' : '1.5px solid var(--eco-border)', background:'rgba(0,191,111,0.08)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, overflow:'hidden' }}>
                  {player.avatar
                    ? <img src={player.avatar} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }}/>
                    : <span style={{ fontFamily:'Poppins,sans-serif', fontWeight:700, fontSize:'0.95rem', color:'var(--eco-green)' }}>{player.name?.[0]?.toUpperCase() || '?'}</span>
                  }
                </div>

                {/* Name & badge */}
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:6, flexWrap:'wrap' }}>
                    <span style={{ fontFamily:'Poppins,sans-serif', fontWeight:700, fontSize:'0.9rem', color:'var(--eco-text)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{player.name}</span>
                    {isMe && <span style={{ fontFamily:'Poppins,sans-serif', fontSize:'0.6rem', fontWeight:700, background:'rgba(0,191,111,0.15)', color:'var(--eco-green)', borderRadius:99, padding:'1px 8px' }}>YOU</span>}
                  </div>
                  <div style={{ fontFamily:'Poppins,sans-serif', fontSize:'0.7rem', color:'var(--eco-muted)', marginTop:2 }}>
                    {levelEmoji} {player.badge} · {player.currentStreak}🔥 streak
                  </div>
                </div>

                {/* XP */}
                <div style={{ textAlign:'right', flexShrink:0 }}>
                  <div style={{ fontFamily:'Poppins,sans-serif', fontWeight:800, fontSize:'1.05rem', color: rc ? rc.iconColor : isMe ? 'var(--eco-green)' : 'var(--eco-text)' }}>
                    {player.totalXP.toLocaleString()}
                  </div>
                  <div style={{ fontFamily:'Poppins,sans-serif', fontSize:'0.65rem', color:'var(--eco-muted)' }}>XP</div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Trees equivalent footer */}
      {leaderboard.length > 0 && (
        <div className="eco-card" style={{ marginTop:20, padding:'14px 16px', display:'flex', alignItems:'center', gap:10 }}>
          <TreePine size={18} color="#00BF6F"/>
          <span style={{ fontFamily:'Poppins,sans-serif', fontSize:'0.8rem', color:'var(--eco-muted)' }}>
            Combined impact: <strong style={{ color:'var(--eco-green)' }}>{leaderboard.length}</strong> eco warriors fighting climate change together 🌍
          </span>
        </div>
      )}
    </div>
  );
}
