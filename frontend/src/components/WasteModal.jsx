import { useState } from 'react';
import { X, ChevronDown, ChevronUp } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { logActivity } from '../features/activitySlice';

const WASTE_TYPES = [
  { id: 'recycled',  label: 'Recycled',          emoji: '♻️', eco: true,  color: '#34D399' },
  { id: 'composted', label: 'Composted',          emoji: '🌱', eco: true,  color: '#34D399' },
  { id: 'reduced',   label: 'Reduced Packaging',  emoji: '📦', eco: true,  color: '#34D399' },
  { id: 'landfill',  label: 'Landfill',           emoji: '🗑️', eco: false, color: '#F87171' },
];

export default function WasteModal({ isOpen, onClose }) {
  const dispatch = useDispatch();
  const [selected, setSelected] = useState('recycled');
  const [amount, setAmount]     = useState(1);
  const [showDetails, setShowDetails] = useState(false);
  const [notes, setNotes]       = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess]   = useState(false);

  if (!isOpen) return null;

  const type  = WASTE_TYPES.find(t => t.id === selected);
  const saved = selected === 'landfill' ? 0 : parseFloat((0.57 * amount).toFixed(2)); // landfill factor = 0.57 kg/kg

  const handleLog = async () => {
    setSubmitting(true);
    try {
      await dispatch(logActivity({
        category:    'Waste',
        subType:      selected,
        value:        amount,
        description: `${type.label} — ${amount} kg`,
      })).unwrap();
      setSuccess(true);
      setTimeout(() => { setSuccess(false); onClose(); }, 1500);
    } catch { onClose(); } finally { setSubmitting(false); }
  };

  return (
    <div className="eco-modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="eco-modal">
        <div style={{ background:'linear-gradient(180deg,#0f160f 0%,var(--eco-surface) 100%)', padding:'28px 20px 20px', textAlign:'center', position:'relative' }}>
          <button onClick={onClose} style={{ position:'absolute',top:14,right:14,width:32,height:32,borderRadius:10,background:'rgba(0,0,0,0.3)',border:'1px solid rgba(255,255,255,0.08)',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',color:'var(--eco-muted)' }}><X size={16}/></button>
          <div style={{ fontFamily:'Poppins,sans-serif', fontWeight:600, fontSize:'1rem', color:'var(--eco-text)', marginBottom:4 }}>
            {type?.eco ? 'CO₂ Saved' : 'Waste Tracked'}
          </div>
          <div style={{ fontFamily:'Poppins,sans-serif', fontWeight:800, fontSize:'2.2rem', color: type?.eco ? '#A78BFA' : '#F87171', lineHeight:1.1 }}>
            {saved.toFixed(2)}<span style={{ fontSize:'1.1rem', fontWeight:500, marginLeft:6 }}>kg CO₂eq</span>
          </div>
          <div style={{ fontFamily:'Poppins,sans-serif', fontSize:'0.8rem', color:'var(--eco-muted)', marginTop:4 }}>by managing waste responsibly</div>
        </div>
        <div style={{ padding:'0 20px 24px' }}>
          <div style={{ background:'rgba(0,0,0,0.2)', borderRadius:16, padding:16, marginTop:16, border:'1px solid rgba(0,191,111,0.1)' }}>
            <div style={{ fontFamily:'Poppins,sans-serif', fontWeight:600, fontSize:'1rem', color:'#A78BFA', marginBottom:14 }}>Waste type</div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:10 }}>
              {WASTE_TYPES.map(t => {
                const active = selected === t.id;
                return (
                  <button key={t.id} onClick={() => setSelected(t.id)} style={{
                    display:'flex', alignItems:'center', gap:10, padding:'12px 14px',
                    background: active ? `${t.color}18` : 'transparent',
                    border: active ? `2px solid ${t.color}` : '1.5px solid rgba(255,255,255,0.06)',
                    borderRadius:12, cursor:'pointer', transition:'all 0.2s', textAlign:'left',
                  }}>
                    <span style={{ fontSize:'1.5rem' }}>{t.emoji}</span>
                    <span style={{ fontFamily:'Poppins,sans-serif', fontSize:'0.82rem', fontWeight: active ? 600 : 400, color: active ? t.color : 'var(--eco-text)' }}>{t.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
          <div style={{ marginTop:18 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
              <span style={{ fontFamily:'Poppins,sans-serif', fontWeight:600, fontSize:'0.95rem', color:'var(--eco-text)' }}>Amount</span>
              <span style={{ fontFamily:'Poppins,sans-serif', fontWeight:600, fontSize:'0.85rem', color:'var(--eco-text)', background:'var(--eco-surface2)', border:'1px solid var(--eco-border)', padding:'3px 12px', borderRadius:99 }}>{amount} kg</span>
            </div>
            <input type="range" min={0.1} max={20} step={0.1} value={amount}
              onChange={(e) => setAmount(parseFloat(e.target.value))} className="eco-range"
              style={{ background:`linear-gradient(to right,#A78BFA ${(amount-0.1)/19.9*100}%,rgba(167,139,250,0.15) ${(amount-0.1)/19.9*100}%)` }}/>
            <div style={{ display:'flex', justifyContent:'space-between', fontFamily:'Poppins,sans-serif', fontSize:'0.65rem', color:'var(--eco-muted)', marginTop:4 }}><span>0.1 kg</span><span>20 kg</span></div>
          </div>
          <div style={{ marginTop:16 }}>
            <button onClick={() => setShowDetails(v => !v)} style={{ display:'flex',alignItems:'center',justifyContent:'space-between',width:'100%',padding:'12px 16px',background:'rgba(0,0,0,0.2)',border:'1px solid rgba(0,191,111,0.1)',borderRadius:12,cursor:'pointer',fontFamily:'Poppins,sans-serif',fontWeight:500,fontSize:'0.875rem',color:'var(--eco-text)' }}>
              Provide Optional Details {showDetails ? <ChevronUp size={16} color="var(--eco-muted)"/> : <ChevronDown size={16} color="var(--eco-muted)"/>}
            </button>
            {showDetails && (
              <div style={{ padding:'14px 16px',background:'rgba(0,0,0,0.15)',border:'1px solid rgba(0,191,111,0.07)',borderTop:'none',borderRadius:'0 0 12px 12px' }}>
                <textarea value={notes} onChange={(e) => setNotes(e.target.value.slice(0,140))} placeholder="e.g. Sorted recycling bins…" rows={3} className="eco-input" style={{ resize:'none',fontFamily:'Poppins,sans-serif',fontSize:'0.85rem' }}/>
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
