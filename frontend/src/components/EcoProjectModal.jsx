import { useState } from 'react';
import { X, ChevronDown, ChevronUp } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { logActivity } from '../features/activitySlice';

const ECO_TYPES = [
  { id: 'tree_plant',   label: 'Plant a Tree',    emoji: '🌳', unit: 'trees', desc: 'Trees planted', max: 20, step: 1  },
  { id: 'donation',     label: 'Eco Donation',     emoji: '💚', unit: 'USD',   desc: 'Donated to eco cause', max: 500, step: 10 },
  { id: 'volunteering', label: 'Volunteering',     emoji: '🌍', unit: 'hours', desc: 'Hours volunteered', max: 24, step: 1  },
  { id: 'offset',       label: 'Carbon Offset',    emoji: '⚖️', unit: 'kg',    desc: 'Carbon offset purchased', max: 100, step: 1 },
];

export default function EcoProjectModal({ isOpen, onClose }) {
  const dispatch = useDispatch();
  const [selected, setSelected]   = useState('tree_plant');
  const [amount, setAmount]       = useState(1);
  const [showDetails, setShowDetails] = useState(false);
  const [notes, setNotes]         = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess]     = useState(false);

  if (!isOpen) return null;

  const type = ECO_TYPES.find(t => t.id === selected);
  // Each tree absorbs ~21 kg CO₂/yr
  const impact = selected === 'tree_plant'
    ? parseFloat((amount * 21).toFixed(1))
    : selected === 'offset'
    ? amount
    : 0;
  const impactLabel = selected === 'tree_plant' ? `${impact} kg CO₂/yr` : selected === 'offset' ? `${impact} kg CO₂` : `+${amount * 25} XP`;

  const handleLog = async () => {
    setSubmitting(true);
    try {
      await dispatch(logActivity({
        category:    'Eco',
        subType:      selected,
        value:        amount,
        description: `${type.label} — ${amount} ${type.unit}`,
      })).unwrap();
      setSuccess(true);
      setTimeout(() => { setSuccess(false); onClose(); }, 1500);
    } catch { onClose(); } finally { setSubmitting(false); }
  };

  return (
    <div className="eco-modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="eco-modal">
        <div style={{ background:'linear-gradient(180deg,#081508 0%,var(--eco-surface) 100%)', padding:'28px 20px 20px', textAlign:'center', position:'relative' }}>
          <button onClick={onClose} style={{ position:'absolute',top:14,right:14,width:32,height:32,borderRadius:10,background:'rgba(0,0,0,0.3)',border:'1px solid rgba(255,255,255,0.08)',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',color:'var(--eco-muted)' }}><X size={16}/></button>
          <div style={{ fontFamily:'Poppins,sans-serif', fontWeight:600, fontSize:'1rem', color:'var(--eco-text)', marginBottom:4 }}>Climate Impact</div>
          <div style={{ fontFamily:'Poppins,sans-serif', fontWeight:800, fontSize:'2.2rem', color:'#34D399', lineHeight:1.1 }}>
            {impactLabel}
          </div>
          <div style={{ fontFamily:'Poppins,sans-serif', fontSize:'0.8rem', color:'var(--eco-muted)', marginTop:4 }}>by investing in eco projects</div>
        </div>
        <div style={{ padding:'0 20px 24px' }}>
          <div style={{ background:'rgba(0,0,0,0.2)', borderRadius:16, padding:16, marginTop:16, border:'1px solid rgba(0,191,111,0.1)' }}>
            <div style={{ fontFamily:'Poppins,sans-serif', fontWeight:600, fontSize:'1rem', color:'#34D399', marginBottom:14 }}>Choose your action</div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:10 }}>
              {ECO_TYPES.map(t => {
                const active = selected === t.id;
                return (
                  <button key={t.id} onClick={() => { setSelected(t.id); setAmount(1); }} style={{
                    display:'flex', flexDirection:'column', alignItems:'center', gap:6, padding:'14px 10px',
                    background: active ? 'rgba(52,211,153,0.1)' : 'transparent',
                    border: active ? '2px solid #34D399' : '1.5px solid rgba(255,255,255,0.06)',
                    borderRadius:12, cursor:'pointer', transition:'all 0.2s', textAlign:'center',
                  }}>
                    <span style={{ fontSize:'2rem' }}>{t.emoji}</span>
                    <div>
                      <div style={{ fontFamily:'Poppins,sans-serif', fontSize:'0.8rem', fontWeight: active ? 600 : 400, color: active ? '#34D399' : 'var(--eco-text)' }}>{t.label}</div>
                      <div style={{ fontFamily:'Poppins,sans-serif', fontSize:'0.65rem', color:'var(--eco-muted)' }}>{t.desc}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
          <div style={{ marginTop:18 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
              <span style={{ fontFamily:'Poppins,sans-serif', fontWeight:600, fontSize:'0.95rem', color:'var(--eco-text)' }}>{type.label}</span>
              <span style={{ fontFamily:'Poppins,sans-serif', fontWeight:600, fontSize:'0.85rem', color:'var(--eco-text)', background:'var(--eco-surface2)', border:'1px solid var(--eco-border)', padding:'3px 12px', borderRadius:99 }}>{amount} {type.unit}</span>
            </div>
            <input type="range" min={type.step} max={type.max} step={type.step} value={amount}
              onChange={(e) => setAmount(parseFloat(e.target.value))} className="eco-range"
              style={{ background:`linear-gradient(to right,#34D399 ${((amount-type.step)/(type.max-type.step))*100}%,rgba(52,211,153,0.15) ${((amount-type.step)/(type.max-type.step))*100}%)` }}/>
            <div style={{ display:'flex', justifyContent:'space-between', fontFamily:'Poppins,sans-serif', fontSize:'0.65rem', color:'var(--eco-muted)', marginTop:4 }}>
              <span>{type.step} {type.unit}</span><span>{type.max} {type.unit}</span>
            </div>
          </div>
          <div style={{ marginTop:16 }}>
            <button onClick={() => setShowDetails(v => !v)} style={{ display:'flex',alignItems:'center',justifyContent:'space-between',width:'100%',padding:'12px 16px',background:'rgba(0,0,0,0.2)',border:'1px solid rgba(0,191,111,0.1)',borderRadius:12,cursor:'pointer',fontFamily:'Poppins,sans-serif',fontWeight:500,fontSize:'0.875rem',color:'var(--eco-text)' }}>
              Provide Optional Details {showDetails ? <ChevronUp size={16} color="var(--eco-muted)"/> : <ChevronDown size={16} color="var(--eco-muted)"/>}
            </button>
            {showDetails && (
              <div style={{ padding:'14px 16px',background:'rgba(0,0,0,0.15)',border:'1px solid rgba(0,191,111,0.07)',borderTop:'none',borderRadius:'0 0 12px 12px' }}>
                <textarea value={notes} onChange={(e) => setNotes(e.target.value.slice(0,140))} placeholder="e.g. Planted trees in my garden…" rows={3} className="eco-input" style={{ resize:'none',fontFamily:'Poppins,sans-serif',fontSize:'0.85rem' }}/>
                <div style={{ textAlign:'right',fontFamily:'Poppins,sans-serif',fontSize:'0.68rem',color:'var(--eco-muted)',marginTop:4 }}>{notes.length}/140</div>
              </div>
            )}
          </div>
          <button onClick={handleLog} disabled={submitting || success} className="eco-btn-primary" style={{ width:'100%', marginTop:20, fontSize:'1rem', fontWeight:700 }}>
            {success ? '✅ Logged!' : submitting ? 'Logging…' : 'Log Action'}
          </button>
        </div>
      </div>
    </div>
  );
}
