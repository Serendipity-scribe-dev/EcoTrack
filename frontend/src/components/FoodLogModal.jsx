import { useState } from 'react';
import { X, Check, ChevronDown, ChevronUp, Calendar } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { logActivity } from '../features/activitySlice';

// subType keys must match EMISSION_FACTORS on the backend
const FOOD_TYPES = [
  { id: 'chicken', label: 'Poultry', emoji: '🍗', factor: 6.9  },
  { id: 'fish',    label: 'Fish',    emoji: '🐟', factor: 6.1  },
  { id: 'pork',    label: 'Pork',    emoji: '🥩', factor: 12.0 },
  { id: 'beef',    label: 'Beef',    emoji: '🥩', factor: 27.0 },
];

const REDUCTION_OPTIONS = [
  { value: 'reduced',   label: 'Reduced consumption (see disclaimer in Help)' },
  { value: 'avoided',   label: 'Avoided entirely'                              },
  { value: 'swapped',   label: 'Swapped for plant-based alternative'           },
];

export default function FoodLogModal({ isOpen, onClose }) {
  const dispatch = useDispatch();

  const [selectedFood, setSelectedFood] = useState('chicken');
  const [reduction, setReduction]       = useState('reduced');
  const [weight, setWeight]             = useState(0.5);
  const [showDetails, setShowDetails]   = useState(false);
  const [notes, setNotes]               = useState('');
  const [submitting, setSubmitting]     = useState(false);
  const [success, setSuccess]           = useState(false);

  if (!isOpen) return null;

  const food      = FOOD_TYPES.find(f => f.id === selectedFood);
  // Savings = emissions that would have been produced × 50% reduction assumption
  const savedKg   = parseFloat((food.factor * weight * 0.5).toFixed(2));

  const handleLog = async () => {
    setSubmitting(true);
    try {
      const reductionLabel = REDUCTION_OPTIONS.find(r => r.value === reduction)?.label;
      await dispatch(logActivity({
        category:    'Diet',
        subType:      selectedFood,          // ← required by backend
        value:        weight,
        description: `${food.label} — ${reductionLabel}`,
      })).unwrap();
      setSuccess(true);
      setTimeout(() => { setSuccess(false); onClose(); }, 1500);
    } catch {
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="eco-modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="eco-modal">

        {/* Header — dark gradient strip */}
        <div style={{
          background: 'linear-gradient(180deg, #0a1f10 0%, var(--eco-surface) 100%)',
          padding: '28px 20px 20px',
          textAlign: 'center',
          position: 'relative',
        }}>
          <button onClick={onClose} style={{
            position:'absolute', top:14, right:14,
            width:32, height:32, borderRadius:10,
            background:'rgba(0,0,0,0.3)', border:'1px solid rgba(255,255,255,0.08)',
            display:'flex', alignItems:'center', justifyContent:'center',
            cursor:'pointer', color:'var(--eco-muted)',
          }}><X size={16}/></button>

          <div style={{ fontFamily:'Poppins,sans-serif', fontWeight:600, fontSize:'1rem', color:'var(--eco-text)', marginBottom:4 }}>
            You Saved
          </div>
          <div style={{ fontFamily:'Poppins,sans-serif', fontWeight:800, fontSize:'2.2rem', color:'var(--eco-green)', lineHeight:1.1 }}>
            {savedKg.toFixed(2)}<span style={{ fontSize:'1.1rem', fontWeight:500, marginLeft:6 }}>kg CO₂eq</span>
          </div>
          <div style={{ fontFamily:'Poppins,sans-serif', fontSize:'0.8rem', color:'var(--eco-muted)', marginTop:4 }}>
            by reducing consumption of high emission food
          </div>
        </div>

        {/* Body */}
        <div style={{ padding:'0 20px 24px' }}>

          {/* Food type selector */}
          <div style={{ background:'rgba(0,0,0,0.2)', borderRadius:16, padding:16, marginTop:16, border:'1px solid rgba(0,191,111,0.1)' }}>
            <div style={{ fontFamily:'Poppins,sans-serif', fontWeight:600, fontSize:'1rem', color:'var(--eco-green)', marginBottom:14 }}>
              High emission foods
            </div>
            <div style={{ display:'flex', gap:12 }}>
              {FOOD_TYPES.map((f) => {
                const active = selectedFood === f.id;
                return (
                  <button key={f.id} onClick={() => setSelectedFood(f.id)} style={{
                    flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:6,
                    background:'transparent', border:'none', cursor:'pointer', position:'relative',
                  }}>
                    <div style={{
                      width:64, height:64, borderRadius:14,
                      background:'rgba(0,191,111,0.08)',
                      border: active ? '2.5px solid var(--eco-green)' : '1.5px solid rgba(0,191,111,0.15)',
                      display:'flex', alignItems:'center', justifyContent:'center',
                      fontSize:'2rem',
                      transition:'border 0.2s, transform 0.15s',
                      transform: active ? 'scale(1.05)' : 'scale(1)',
                    }}>
                      {f.emoji}
                      {active && (
                        <div style={{ position:'absolute', top:0, right:0, width:20, height:20, borderRadius:'50%', background:'var(--eco-green)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                          <Check size={12} color="#fff" strokeWidth={3}/>
                        </div>
                      )}
                    </div>
                    <span style={{
                      fontFamily:'Poppins,sans-serif', fontSize:'0.72rem',
                      fontWeight: active ? 600 : 400,
                      color: active ? 'var(--eco-green)' : 'var(--eco-muted)',
                      borderBottom: active ? '1.5px solid var(--eco-green)' : '1.5px solid transparent',
                      paddingBottom:1,
                    }}>{f.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Reduction dropdown */}
          <div style={{ marginTop:14 }}>
            <select value={reduction} onChange={(e) => setReduction(e.target.value)} className="eco-input" style={{ cursor:'pointer' }}>
              {REDUCTION_OPTIONS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
          </div>

          {/* Weight slider */}
          <div style={{ marginTop:18 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
              <span style={{ fontFamily:'Poppins,sans-serif', fontWeight:600, fontSize:'0.95rem', color:'var(--eco-text)' }}>Weight</span>
              <span style={{ fontFamily:'Poppins,sans-serif', fontWeight:600, fontSize:'0.85rem', color:'var(--eco-text)', background:'var(--eco-surface2)', border:'1px solid var(--eco-border)', padding:'3px 12px', borderRadius:99 }}>{weight.toFixed(1)} kg</span>
            </div>
            <input type="range" min={0.1} max={5} step={0.1} value={weight}
              onChange={(e) => setWeight(parseFloat(e.target.value))} className="eco-range"
              style={{ background:`linear-gradient(to right, var(--eco-green) ${((weight-0.1)/4.9)*100}%, rgba(0,191,111,0.15) ${((weight-0.1)/4.9)*100}%)` }}
            />
            <div style={{ display:'flex', justifyContent:'space-between', fontFamily:'Poppins,sans-serif', fontSize:'0.65rem', color:'var(--eco-muted)', marginTop:4 }}>
              <span>0.1 kg</span><span>5.0 kg</span>
            </div>
          </div>

          {/* Optional details */}
          <div style={{ marginTop:16 }}>
            <button onClick={() => setShowDetails(v => !v)} style={{
              display:'flex', alignItems:'center', justifyContent:'space-between', width:'100%',
              padding:'12px 16px', background:'rgba(0,0,0,0.2)', border:'1px solid rgba(0,191,111,0.1)',
              borderRadius:12, cursor:'pointer', fontFamily:'Poppins,sans-serif', fontWeight:500,
              fontSize:'0.875rem', color:'var(--eco-text)',
            }}>
              Provide Optional Details
              {showDetails ? <ChevronUp size={16} color="var(--eco-muted)"/> : <ChevronDown size={16} color="var(--eco-muted)"/>}
            </button>
            {showDetails && (
              <div style={{ padding:'14px 16px', background:'rgba(0,0,0,0.15)', border:'1px solid rgba(0,191,111,0.07)', borderTop:'none', borderRadius:'0 0 12px 12px' }}>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
                  <span style={{ fontFamily:'Poppins,sans-serif', fontWeight:600, fontSize:'0.875rem', color:'var(--eco-text)' }}>Savings date</span>
                  <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                    <span style={{ fontFamily:'Poppins,sans-serif', fontSize:'0.85rem', color:'var(--eco-muted)' }}>
                      {new Date().toLocaleDateString('en-US', { day:'numeric', month:'short', year:'numeric' })}
                    </span>
                    <Calendar size={16} color="var(--eco-green)"/>
                  </div>
                </div>
                <textarea value={notes} onChange={(e) => setNotes(e.target.value.slice(0, 140))}
                  placeholder="Enter Custom Notes" rows={3} className="eco-input"
                  style={{ resize:'none', fontFamily:'Poppins,sans-serif', fontSize:'0.85rem' }}
                />
                <div style={{ textAlign:'right', fontFamily:'Poppins,sans-serif', fontSize:'0.68rem', color:'var(--eco-muted)', marginTop:4 }}>{notes.length}/140</div>
              </div>
            )}
          </div>

          <button id="food-modal-log-action" onClick={handleLog} disabled={submitting || success}
            className="eco-btn-primary" style={{ width:'100%', marginTop:20, fontSize:'1rem', fontWeight:700 }}>
            {success ? '✅ Logged!' : submitting ? 'Logging…' : 'Log Action'}
          </button>
        </div>
      </div>
    </div>
  );
}
