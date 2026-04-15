import { Trash2, Leaf, Car, Zap, Bike, ShoppingBag, Recycle } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { deleteActivity } from '../features/activitySlice';

const CATEGORY_CONFIG = {
  Transport:  { icon: Car,         color: '#60A5FA', bg: 'rgba(96,165,250,0.12)'  },
  Diet:       { icon: Leaf,        color: '#00BF6F', bg: 'rgba(0,191,111,0.12)'   },
  Power:      { icon: Zap,         color: '#FACC15', bg: 'rgba(250,204,21,0.12)'  },
  Waste:      { icon: Recycle,     color: '#A78BFA', bg: 'rgba(167,139,250,0.12)' },
  Shopping:   { icon: ShoppingBag, color: '#FB923C', bg: 'rgba(251,146,60,0.12)'  },
  Travel:     { icon: Bike,        color: '#34D399', bg: 'rgba(52,211,153,0.12)'  },
};

function formatDate(ts) {
  return new Date(ts).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

export default function ActivityCard({ activity }) {
  const dispatch = useDispatch();
  const cfg  = CATEGORY_CONFIG[activity.category] || CATEGORY_CONFIG.Diet;
  const Icon = cfg.icon;

  const handleDelete = () => {
    if (window.confirm('Remove this activity?')) {
      dispatch(deleteActivity(activity._id));
    }
  };

  return (
    <div
      className="eco-card group"
      style={{
        padding: '14px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        cursor: 'default',
      }}
    >
      {/* Category icon */}
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: 12,
          background: cfg.bg,
          border: `1px solid ${cfg.color}30`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <Icon size={18} color={cfg.color} />
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <span
            style={{
              fontFamily: 'Poppins, sans-serif',
              fontWeight: 600,
              fontSize: '0.875rem',
              color: 'var(--eco-text)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {activity.description}
          </span>
          <span
            style={{
              padding: '2px 10px',
              borderRadius: 99,
              background: cfg.bg,
              color: cfg.color,
              fontFamily: 'Poppins, sans-serif',
              fontSize: '0.68rem',
              fontWeight: 600,
              flexShrink: 0,
            }}
          >
            {activity.category}
          </span>
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            marginTop: 3,
            fontFamily: 'Poppins, sans-serif',
            fontSize: '0.75rem',
            color: 'var(--eco-muted)',
          }}
        >
          <span>{activity.value} {activity.unit}</span>
          <span>·</span>
          <span>{formatDate(activity.timestamp)}</span>
        </div>
      </div>

      {/* Right side */}
      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        <div
          style={{
            fontFamily: 'Poppins, sans-serif',
            fontWeight: 700,
            fontSize: '0.9rem',
            color: 'var(--eco-text)',
          }}
        >
          {activity.carbonScore.toFixed(2)}
          <span style={{ fontSize: '0.72rem', fontWeight: 400, color: 'var(--eco-muted)', marginLeft: 3 }}>
            kg CO₂
          </span>
        </div>
        <div
          style={{
            fontFamily: 'Poppins, sans-serif',
            fontSize: '0.72rem',
            color: 'var(--eco-green)',
            marginTop: 2,
          }}
        >
          +{activity.xpEarned} XP
        </div>
      </div>

      {/* Delete */}
      <button
        onClick={handleDelete}
        title="Delete activity"
        style={{
          opacity: 0,
          color: '#F87171',
          padding: 4,
          borderRadius: 6,
          border: 'none',
          background: 'transparent',
          cursor: 'pointer',
          transition: 'opacity 0.2s',
          flexShrink: 0,
        }}
        className="group-hover:opacity-100"
      >
        <Trash2 size={15} />
      </button>
    </div>
  );
}
