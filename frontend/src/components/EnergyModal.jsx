import { useState } from 'react';
import { X, ChevronDown, ChevronUp } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { logActivity } from '../features/activitySlice';

// subType keys match backend EMISSION_FACTORS.Power
const ENERGY_TYPES = [
  { id: 'solar',      label: 'Solar Energy', emoji: '☀️', eco: true,  desc: 'Generated from solar' },
  { id: 'led_switch', label: 'LED Lighting', emoji: '💡', eco: true,  desc: 'Switched to LED bulbs' },
  { id: 'electricity',label: 'Electricity',  emoji: '⚡',  eco: false, desc: 'Grid electricity used'  },
  { id: 'gas',        label: 'Natural Gas',  emoji: '🔥', eco: false, desc: 'Heating / cooking'       },
];

const UNITS = { solar:'kWh', led_switch:'hr', electricity:'kWh', gas:'m³' };
const FACTOR_DISPLAY = { solar:'0 kg/kWh', led_switch:'-0.05 kg/hr', electricity:'0.233 kg/kWh', gas:'2.04 kg/m³' };

export default function EnergyModal({ isOpen, onClose }) {
  const dispatch = useDispatch();
  const [selected, setSelected] = useState('solar');
  const [amount, setAmount]     = useState(5);
  const [showDetails, setShowDetails] = useState(false);
  const [notes, setNotes]       = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess]   = useState(false);

  if (!isOpen) return null;

  const type  = ENERGY_TYPES.find(t => t.id === selected);
  const unit  = UNITS[selected];
  // For eco types, show savings; for others show emissions
  const factors = { solar:0, led_switch:-0.05, electricity:0.233, gas:2.04 };
  const carbon  = parseFloat(Math.abs(factors[selected] * amount).toFixed(2));
  const isEco   = type?.eco;

  const handleLog = async () => {
    setSubmitting(true);
    try {
      await dispatch(logActivity({
        category:    'Power',
        subType:      selected,
        value:        amount,
        description: `${type.label} — ${amount} ${unit}`,
      })).unwrap();
      setSuccess(true);
      setTimeout(() => { setSuccess(false); onClose(); }, 1500);
    } catch { onClose(); } finally { setSubmitting(false); }
  };

  return (
    <div className="eco-modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="eco-modal">

        {/* Header */}
        <div style={{ background:'linear-gradient(180deg,#14110a 0%,var(--eco-surface) 100%)', padding:'28px 20px 20px', textAlign:'center', position:'relative' }}>
          <button onClick={onClose} style={{ position:'absolute',top:14,right:14,width:32,height:32,borderRadius:10,background:'rgba(0,0,0,0.3)',border:'1px solid rgba(255,255,255,0.08)',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',color:'var(--eco-muted)' }}><X size={16}/></button>
          <div style={{ fontFamily:'Poppins,sans-serif', fontWeight:600, fontSize:'1rem', color:'var(--eco-text)', marginBottom:4 }}>
            {isEco ? 'Energy Saved' : 'Energy Tracked'}
          </div>
          <div style={{ fontFamily:'Poppins,sans-serif', fontWeight:800, fontSize:'2.2rem', color: isEco ? 'var(--eco-green)' : '#FACC15', lineHeight:1.1 }}>
            {carbon.toFixed(2)}<span style={{ fontSize:'1.1rem', fontWeight:500, marginLeft:6 }}>kg CO₂{isEco ? ' saved' : ''}</span>
          </div>
          <div style={{ fontFamily:'Poppins,sans-serif', fontSize:'0.8rem', color:'var(--eco-muted)', marginTop:4 }}>
            by {isEco ? 'using clean energy' : 'tracking your energy usage'}
          </div>
        </div>

        {/* Body */}
        <div style={{ padding:'0 20px 24px' }}>

          {/* Energy type selector */}
          <div style={{ background:'rgba(0,0,0,0.2)', borderRadius:16, padding:16, marginTop:16, border:'1px solid rgba(0,191,111,0.1)' }}>
            <div style={{ fontFamily:'Poppins,sans-serif', fontWeight:600, fontSize:'1rem', color:'#FACC15', marginBottom:14 }}>
              Choose energy type
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:10 }}>
              {ENERGY_TYPES.map((t) => {
                const active = selected === t.id;
                return (
                  <button key={t.id} onClick={() => setSelected(t.id)} style={{
                    display:'flex', alignItems:'center', gap:10, padding:'12px 14px',
                    background: active ? 'rgba(250,204,21,0.1)' : 'transparent',
                    border: active ? '2px solid #FACC15' : '1.5px solid rgba(255,255,255,0.06)',
                    borderRadius:12, cursor:'pointer', transition:'all 0.2s', textAlign:'left',
                  }}>
                    <span style={{ fontSize:'1.6rem', flexShrink:0 }}>{t.emoji}</span>
                    <div>
                      <div style={{ fontFamily:'Poppins,sans-serif', fontSize:'0.8rem', fontWeight: active ? 600 : 400, color: active ? '#FACC15' : 'var(--eco-text)' }}>{t.label}</div>
                      <div style={{ fontFamily:'Poppins,sans-serif', fontSize:'0.65rem', color:'var(--eco-muted)' }}>{t.desc}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Amount slider */}
          <div style={{ marginTop:18 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
              <span style={{ fontFamily:'Poppins,sans-serif', fontWeight:600, fontSize:'0.95rem', color:'var(--eco-text)' }}>Amount</span>
              <span style={{ fontFamily:'Poppins,sans-serif', fontWeight:600, fontSize:'0.85rem', color:'var(--eco-text)', background:'var(--eco-surface2)', border:'1px solid var(--eco-border)', padding:'3px 12px', borderRadius:99 }}>{amount} {unit}</span>
            </div>
            <input type="range" min={1} max={100} step={1} value={amount}
              onChange={(e) => setAmount(parseInt(e.target.value))} className="eco-range"
              style={{ background:`linear-gradient(to right,#FACC15 ${(amount-1)/99*100}%,rgba(250,204,21,0.15) ${(amount-1)/99*100}%)` }}
            />
            <div style={{ display:'flex', justifyContent:'space-between', fontFamily:'Poppins,sans-serif', fontSize:'0.65rem', color:'var(--eco-muted)', marginTop:4 }}>
              <span>1 {unit}</span><span>100 {unit}</span>
            </div>
            <div style={{ fontFamily:'Poppins,sans-serif', fontSize:'0.7rem', color:'var(--eco-muted)', marginTop:6, textAlign:'center' }}>
              Factor: {FACTOR_DISPLAY[selected]}
            </div>
          </div>

          {/* Optional details */}
          <div style={{ marginTop:16 }}>
            <button onClick={() => setShowDetails(v => !v)} style={{ display:'flex',alignItems:'center',justifyContent:'space-between',width:'100%',padding:'12px 16px',background:'rgba(0,0,0,0.2)',border:'1px solid rgba(0,191,111,0.1)',borderRadius:12,cursor:'pointer',fontFamily:'Poppins,sans-serif',fontWeight:500,fontSize:'0.875rem',color:'var(--eco-text)' }}>
              Provide Optional Details
              {showDetails ? <ChevronUp size={16} color="var(--eco-muted)"/> : <ChevronDown size={16} color="var(--eco-muted)"/>}
            </button>
            {showDetails && (
              <div style={{ padding:'14px 16px',background:'rgba(0,0,0,0.15)',border:'1px solid rgba(0,191,111,0.07)',borderTop:'none',borderRadius:'0 0 12px 12px' }}>
                <textarea value={notes} onChange={(e) => setNotes(e.target.value.slice(0,140))}
                  placeholder="e.g. Installed solar panels on roof…" rows={3} className="eco-input"
                  style={{ resize:'none', fontFamily:'Poppins,sans-serif', fontSize:'0.85rem' }}/>
                <div style={{ textAlign:'right',fontFamily:'Poppins,sans-serif',fontSize:'0.68rem',color:'var(--eco-muted)',marginTop:4 }}>{notes.length}/140</div>
              </div>
            )}
          </div>

          <button onClick={handleLog} disabled={submitting || success} className="eco-btn-primary"
            style={{ width:'100%', marginTop:20, fontSize:'1rem', fontWeight:700 }}>
            {success ? '✅ Logged!' : submitting ? 'Logging…' : 'Log Action'}
          </button>
        </div>
      </div>
    </div>
  );
}
