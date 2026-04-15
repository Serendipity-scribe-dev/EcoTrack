import { useState } from 'react';
import { X, ChevronDown, ChevronUp } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { logActivity } from '../features/activitySlice';

// subType keys match backend EMISSION_FACTORS.Transport
const TRANSPORT_MODES = [
  { id: 'bicycle', label: 'Bicycle',      emoji: '🚲', eco: true  },
  { id: 'walking', label: 'Walking',      emoji: '🚶', eco: true  },
  { id: 'ev',      label: 'Electric Car', emoji: '⚡',  eco: true  },
  { id: 'train',   label: 'Train',        emoji: '🚆', eco: true  },
  { id: 'bus',     label: 'Bus',          emoji: '🚌', eco: false },
  { id: 'car',     label: 'Car',          emoji: '🚗', eco: false },
  { id: 'flight',  label: 'Flight',       emoji: '✈️', eco: false },
];

const FACTORS = { bicycle:0, walking:0, ev:0.053, train:0.041, bus:0.089, car:0.21, flight:0.255 };

export default function TravelModal({ isOpen, onClose }) {
  const dispatch = useDispatch();
  const [selectedMode, setSelectedMode] = useState('bicycle');
  const [distance, setDistance]         = useState(5);
  const [showDetails, setShowDetails]   = useState(false);
  const [notes, setNotes]               = useState('');
  const [submitting, setSubmitting]     = useState(false);
  const [success, setSuccess]           = useState(false);

  if (!isOpen) return null;

  const mode    = TRANSPORT_MODES.find(m => m.id === selectedMode);
  const savedKg = parseFloat((FACTORS.car * distance - FACTORS[selectedMode] * distance).toFixed(2));
  const isEco   = mode?.eco;

  const handleLog = async () => {
    setSubmitting(true);
    try {
      await dispatch(logActivity({
        category:    'Transport',
        subType:      selectedMode,
        value:        distance,
        description: `${mode.label} — ${distance} km`,
      })).unwrap();
      setSuccess(true);
      setTimeout(() => { setSuccess(false); onClose(); }, 1500);
    } catch { onClose(); } finally { setSubmitting(false); }
  };

  return (
    <div className="eco-modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="eco-modal">

        {/* Header */}
        <div style={{ background:'linear-gradient(180deg,#0a1520 0%,var(--eco-surface) 100%)', padding:'28px 20px 20px', textAlign:'center', position:'relative' }}>
          <button onClick={onClose} style={{ position:'absolute',top:14,right:14,width:32,height:32,borderRadius:10,background:'rgba(0,0,0,0.3)',border:'1px solid rgba(255,255,255,0.08)',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',color:'var(--eco-muted)' }}><X size={16}/></button>
          <div style={{ fontFamily:'Poppins,sans-serif', fontWeight:600, fontSize:'1rem', color:'var(--eco-text)', marginBottom:4 }}>CO₂ Avoided</div>
          <div style={{ fontFamily:'Poppins,sans-serif', fontWeight:800, fontSize:'2.2rem', color: isEco ? 'var(--eco-green)' : '#FB923C', lineHeight:1.1 }}>
            {Math.max(0, savedKg).toFixed(2)}<span style={{ fontSize:'1.1rem', fontWeight:500, marginLeft:6 }}>kg CO₂eq</span>
          </div>
          <div style={{ fontFamily:'Poppins,sans-serif', fontSize:'0.8rem', color:'var(--eco-muted)', marginTop:4 }}>
            by travelling responsibly
          </div>
        </div>

        {/* Body */}
        <div style={{ padding:'0 20px 24px' }}>

          {/* Mode selector grid */}
          <div style={{ background:'rgba(0,0,0,0.2)', borderRadius:16, padding:16, marginTop:16, border:'1px solid rgba(0,191,111,0.1)' }}>
            <div style={{ fontFamily:'Poppins,sans-serif', fontWeight:600, fontSize:'1rem', color:'#60A5FA', marginBottom:14 }}>
              Choose your travel mode
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:10 }}>
              {TRANSPORT_MODES.map((m) => {
                const active = selectedMode === m.id;
                return (
                  <button key={m.id} onClick={() => setSelectedMode(m.id)} style={{
                    display:'flex', flexDirection:'column', alignItems:'center', gap:6, padding:'10px 4px',
                    background: active ? 'rgba(0,191,111,0.1)' : 'transparent',
                    border: active ? '2px solid var(--eco-green)' : '1.5px solid rgba(255,255,255,0.06)',
                    borderRadius:12, cursor:'pointer', transition:'all 0.2s',
                  }}>
                    <span style={{ fontSize:'1.6rem' }}>{m.emoji}</span>
                    <span style={{ fontFamily:'Poppins,sans-serif', fontSize:'0.65rem', fontWeight: active ? 600 : 400, color: active ? 'var(--eco-green)' : 'var(--eco-muted)' }}>{m.label}</span>
                    {m.eco && <span style={{ fontSize:'0.5rem', color:'var(--eco-green)', background:'rgba(0,191,111,0.1)', borderRadius:4, padding:'1px 5px' }}>ECO</span>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Distance slider */}
          <div style={{ marginTop:18 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
              <span style={{ fontFamily:'Poppins,sans-serif', fontWeight:600, fontSize:'0.95rem', color:'var(--eco-text)' }}>Distance</span>
              <span style={{ fontFamily:'Poppins,sans-serif', fontWeight:600, fontSize:'0.85rem', color:'var(--eco-text)', background:'var(--eco-surface2)', border:'1px solid var(--eco-border)', padding:'3px 12px', borderRadius:99 }}>{distance} km</span>
            </div>
            <input type="range" min={1} max={100} step={1} value={distance}
              onChange={(e) => setDistance(parseInt(e.target.value))} className="eco-range"
              style={{ background:`linear-gradient(to right,var(--eco-green) ${(distance-1)/99*100}%,rgba(0,191,111,0.15) ${(distance-1)/99*100}%)` }}
            />
            <div style={{ display:'flex', justifyContent:'space-between', fontFamily:'Poppins,sans-serif', fontSize:'0.65rem', color:'var(--eco-muted)', marginTop:4 }}>
              <span>1 km</span><span>100 km</span>
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
                  placeholder="e.g. Cycled to office instead of driving…" rows={3} className="eco-input"
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
