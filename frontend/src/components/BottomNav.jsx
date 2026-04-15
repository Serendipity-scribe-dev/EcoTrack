import { NavLink } from 'react-router-dom';
import { LayoutDashboard, BarChart2, Trophy, User } from 'lucide-react';

const NAV_ITEMS = [
  { to: '/dashboard',   icon: LayoutDashboard, label: 'Home'      },
  { to: '/log',         icon: BarChart2,        label: 'Insights'  },
  { to: '/leaderboard', icon: Trophy,            label: 'Leaderboard' },
  { to: '/profile',     icon: User,              label: 'Profile'   },
];

export default function BottomNav() {
  return (
    <nav className="bottom-nav md:hidden">
      <div className="flex items-stretch h-16">
        {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            id={`bottom-nav-${label.toLowerCase()}`}
            style={({ isActive }) => ({
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '3px',
              position: 'relative',
              transition: 'all 0.2s ease',
              color: isActive ? 'var(--eco-green)' : 'var(--eco-muted)',
              fontFamily: 'Poppins, sans-serif',
              textDecoration: 'none',
            })}
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <span
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: 32,
                      height: 2,
                      borderRadius: '0 0 4px 4px',
                      background: 'var(--eco-green)',
                      boxShadow: '0 0 8px rgba(0,191,111,0.5)',
                    }}
                  />
                )}
                <div
                  style={{
                    padding: '6px 14px',
                    borderRadius: 10,
                    background: isActive ? 'rgba(0,191,111,0.1)' : 'transparent',
                    transition: 'background 0.2s',
                  }}
                >
                  <Icon size={20} strokeWidth={isActive ? 2.5 : 1.8} />
                </div>
                <span
                  style={{
                    fontSize: '0.6rem',
                    fontWeight: isActive ? 600 : 400,
                    letterSpacing: '0.02em',
                  }}
                >
                  {label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
