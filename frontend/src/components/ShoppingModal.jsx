import { useState } from 'react';
import { X, ChevronDown, ChevronUp } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { logActivity } from '../features/activitySlice';

const SHOPPING_TYPES = [
  { id: 'secondhand',   label: 'Secondhand',       emoji: '🔄', eco: true,  desc: 'Pre-loved items'      },
  { id: 'local',        label: 'Local Product',     emoji: '🏪', eco: true,  desc: 'Supports local shops' },
  { id: 'sustainable',  label: 'Eco Brand',         emoji: '🌿', eco: true,  desc: 'Certified eco brand'  },
  { id: 'fast_fashion', label: 'Fast Fashion',      emoji: '👗', eco: false, desc: 'High carbon clothing' },
];

export default function ShoppingModal({ isOpen, onClose }) {
  const dispatch = useDispatch();
  const [selected, setSelected]   = useState('secondhand');
  const [quantity, setQuantity]   = useState(1);
  const [showDetails, setShowDetails] = useState(false);
  const [notes, setNotes]         = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess]     = useState(false);

  if (!isOpen) return null;

  const type   = SHOPPING_TYPES.find(t => t.id === selected);
  const isEco  = type?.eco;
  const saved  = isEco
    ? parseFloat((15 * quantity * 0.8).toFixed(2)) // avoided 80% of typical fast-fashion carbon
    : 0;

  const handleLog = async () => {
    setSubmitting(true);
    try {
      await dispatch(logActivity({
        category:    'Shopping',
        subType:      selected,
        value:        quantity,
        description: `${type.label} — ${quantity} item${quantity > 1 ? 's' : ''}`,
      })).unwrap();
      setSuccess(true);
      setTimeout(() => { setSuccess(false); onClose(); }, 1500);
    } catch { onClose(); } finally { setSubmitting(false); }
  };

  return (
    <div className="eco-modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="eco-modal">
        <div style={{ background:'linear-gradient(180deg,#160f0a 0%,var(--eco-surface) 100%)', padding:'28px 20px 20px', textAlign:'center', position:'relative' }}>
          <button onClick={onClose} style={{ position:'absolute',top:14,right:14,width:32,height:32,borderRadius:10,background:'rgba(0,0,0,0.3)',border:'1px solid rgba(255,255,255,0.08)',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',color:'var(--eco-muted)' }}><X size={16}/></button>
          <div style={{ fontFamily:'Poppins,sans-serif', fontWeight:600, fontSize:'1rem', color:'var(--eco-text)', marginBottom:4 }}>
            {isEco ? 'CO₂ Avoided' : 'Purchase Tracked'}
          </div>
          <div style={{ fontFamily:'Poppins,sans-serif', fontWeight:800, fontSize:'2.2rem', color: isEco ? 'var(--eco-green)' : '#FB923C', lineHeight:1.1 }}>
            {isEco ? saved.toFixed(2) : '—'}<span style={{ fontSize:'1.1rem', fontWeight:500, marginLeft:6 }}>{isEco ? 'kg CO₂eq' : 'tracked'}</span>
          </div>
          <div style={{ fontFamily:'Poppins,sans-serif', fontSize:'0.8rem', color:'var(--eco-muted)', marginTop:4 }}>by purchasing consciously</div>
        </div>
        <div style={{ padding:'0 20px 24px' }}>
          <div style={{ background:'rgba(0,0,0,0.2)', borderRadius:16, padding:16, marginTop:16, border:'1px solid rgba(0,191,111,0.1)' }}>
            <div style={{ fontFamily:'Poppins,sans-serif', fontWeight:600, fontSize:'1rem', color:'#FB923C', marginBottom:14 }}>Purchase type</div>
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              {SHOPPING_TYPES.map(t => {
                const active = selected === t.id;
                const color  = t.eco ? 'var(--eco-green)' : '#FB923C';
                return (
                  <button key={t.id} onClick={() => setSelected(t.id)} style={{
                    display:'flex', alignItems:'center', gap:12, padding:'12px 16px',
                    background: active ? (t.eco ? 'rgba(0,191,111,0.1)' : 'rgba(251,146,60,0.1)') : 'rgba(255,255,255,0.02)',
                    border: active ? `2px solid ${color}` : '1.5px solid rgba(255,255,255,0.06)',
                    borderRadius:12, cursor:'pointer', transition:'all 0.2s', textAlign:'left', width:'100%',
                  }}>
                    <span style={{ fontSize:'1.5rem', flexShrink:0 }}>{t.emoji}</span>
                    <div style={{ flex:1 }}>
                      <div style={{ fontFamily:'Poppins,sans-serif', fontSize:'0.875rem', fontWeight: active ? 600 : 400, color: active ? color : 'var(--eco-text)' }}>{t.label}</div>
                      <div style={{ fontFamily:'Poppins,sans-serif', fontSize:'0.7rem', color:'var(--eco-muted)' }}>{t.desc}</div>
                    </div>
                    {t.eco && <span style={{ fontSize:'0.6rem', color:'var(--eco-green)', background:'rgba(0,191,111,0.1)', borderRadius:4, padding:'2px 6px', flexShrink:0 }}>+25 XP</span>}
                  </button>
                );
              })}
            </div>
          </div>
          <div style={{ marginTop:18 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
              <span style={{ fontFamily:'Poppins,sans-serif', fontWeight:600, fontSize:'0.95rem', color:'var(--eco-text)' }}>Quantity</span>
              <span style={{ fontFamily:'Poppins,sans-serif', fontWeight:600, fontSize:'0.85rem', color:'var(--eco-text)', background:'var(--eco-surface2)', border:'1px solid var(--eco-border)', padding:'3px 12px', borderRadius:99 }}>{quantity} item{quantity > 1 ? 's' : ''}</span>
            </div>
            <input type="range" min={1} max={10} step={1} value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value))} className="eco-range"
              style={{ background:`linear-gradient(to right,#FB923C ${(quantity-1)/9*100}%,rgba(251,146,60,0.15) ${(quantity-1)/9*100}%)` }}/>
            <div style={{ display:'flex', justifyContent:'space-between', fontFamily:'Poppins,sans-serif', fontSize:'0.65rem', color:'var(--eco-muted)', marginTop:4 }}><span>1 item</span><span>10 items</span></div>
          </div>
          <div style={{ marginTop:16 }}>
            <button onClick={() => setShowDetails(v => !v)} style={{ display:'flex',alignItems:'center',justifyContent:'space-between',width:'100%',padding:'12px 16px',background:'rgba(0,0,0,0.2)',border:'1px solid rgba(0,191,111,0.1)',borderRadius:12,cursor:'pointer',fontFamily:'Poppins,sans-serif',fontWeight:500,fontSize:'0.875rem',color:'var(--eco-text)' }}>
              Provide Optional Details {showDetails ? <ChevronDown size={16} color="var(--eco-muted)"/> : <ChevronDown size={16} color="var(--eco-muted)"/>}
            </button>
            {showDetails && (
              <div style={{ padding:'14px 16px',background:'rgba(0,0,0,0.15)',border:'1px solid rgba(0,191,111,0.07)',borderTop:'none',borderRadius:'0 0 12px 12px' }}>
                <textarea value={notes} onChange={(e) => setNotes(e.target.value.slice(0,140))} placeholder="e.g. Bought a secondhand jacket…" rows={3} className="eco-input" style={{ resize:'none',fontFamily:'Poppins,sans-serif',fontSize:'0.85rem' }}/>
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
