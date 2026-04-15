import { ChevronRight } from 'lucide-react';

const CATEGORIES = [
  {
    id:    'travel',
    label: 'Travelled responsibly',
    img:   '/cat_travel.png',
    color: '#60A5FA',
  },
  {
    id:    'energy',
    label: 'Saved Energy',
    img:   '/cat_energy.png',
    color: '#FACC15',
  },
  {
    id:    'food',
    label: 'Ate Sustainably',
    img:   '/cat_food.png',
    color: '#00BF6F',
  },
  {
    id:    'waste',
    label: 'Managed Waste',
    img:   '/cat_waste.png',
    color: '#A78BFA',
  },
  {
    id:    'shopping',
    label: 'Purchased consciously',
    img:   '/cat_shopping.png',
    color: '#FB923C',
  },
  {
    id:    'eco',
    label: 'Invested in Eco Projects',
    img:   '/cat_eco.png',
    color: '#34D399',
  },
];

export default function ClimateActionGrid({ onCategoryClick }) {
  return (
    <div className="eco-card" style={{ overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ padding: '20px 20px 12px' }}>
        <div
          style={{
            fontFamily: 'Poppins, sans-serif',
            fontSize: '0.7rem',
            fontWeight: 600,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: 'var(--eco-muted)',
            marginBottom: 6,
          }}
        >
          Take Action
        </div>
        <div
          style={{
            fontFamily: 'Poppins, sans-serif',
            fontSize: '1rem',
            fontWeight: 600,
            color: 'var(--eco-text)',
          }}
        >
          Choose a category to take your next climate action!
        </div>
      </div>

      {/* Category rows */}
      <div>
        {CATEGORIES.map((cat, idx) => (
          <button
            key={cat.id}
            id={`climate-action-${cat.id}`}
            onClick={() => onCategoryClick(cat.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              width: '100%',
              padding: '14px 20px',
              background: 'transparent',
              border: 'none',
              borderTop: idx === 0 ? 'none' : '1px solid rgba(0,191,111,0.07)',
              cursor: 'pointer',
              gap: 14,
              textAlign: 'left',
              transition: 'background 0.2s ease',
            }}
            onMouseOver={(e) => (e.currentTarget.style.background = 'rgba(0,191,111,0.04)')}
            onMouseOut={(e)  => (e.currentTarget.style.background = 'transparent')}
          >
            {/* Thumbnail */}
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: 14,
                overflow: 'hidden',
                flexShrink: 0,
                border: `1px solid ${cat.color}25`,
              }}
            >
              <img
                src={cat.img}
                alt={cat.label}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>

            {/* Label */}
            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontFamily: 'Poppins, sans-serif',
                  fontWeight: 600,
                  fontSize: '0.95rem',
                  color: 'var(--eco-text)',
                  lineHeight: 1.3,
                }}
              >
                {cat.label}
              </div>
              <div
                style={{
                  fontFamily: 'Poppins, sans-serif',
                  fontSize: '0.72rem',
                  color: cat.color,
                  marginTop: 3,
                  opacity: 0.8,
                }}
              >
                Tap to log activity
              </div>
            </div>

            {/* Arrow */}
            <ChevronRight
              size={18}
              color="var(--eco-muted)"
              style={{ flexShrink: 0, opacity: 0.5 }}
            />
          </button>
        ))}
      </div>
    </div>
  );
}
