import { NavLink } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser } from '../features/userSlice';
import { LayoutDashboard, BarChart2, Trophy, User, LogOut, Leaf, Zap } from 'lucide-react';

const NAV_LINKS = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Home' },
  { to: '/log', icon: BarChart2, label: 'Insights' },
  { to: '/leaderboard', icon: Trophy, label: 'Leaderboard' },
  { to: '/profile', icon: User, label: 'Profile' },
];

export default function TopNav() {
  const dispatch = useDispatch();
  const { user, totalXP, level, badgeEmoji } = useSelector((s) => s.user);

  const handleLogout = () => dispatch(logoutUser());

  return (
    <header
      className="hidden md:flex items-center justify-between px-8 py-4 sticky top-0 z-50"
      style={{
        background: 'rgba(8,12,8,0.97)',
        borderBottom: '1px solid rgba(0,191,111,0.12)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
      }}
    >
      {/* Logo */}
      <div className="flex items-center gap-2.5">
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center"
          style={{ background: 'rgba(0,191,111,0.15)' }}
        >
          <Leaf size={16} color="#00BF6F" />
        </div>
        <span
          className="font-poppins font-700 tracking-tight text-lg"
          style={{ color: 'var(--eco-text)', fontWeight: 700 }}
        >
          <a href='/LandingPage'>Eco<span style={{ color: 'var(--eco-green)' }}>Track</span></a>
        </span>
        <span className="eco-badge ml-1">SDG 13</span>
      </div>

      {/* Nav Links */}
      <nav className="flex items-center gap-1">
        {NAV_LINKS.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            id={`top-nav-${label.toLowerCase().replace(' ', '-')}`}
            className={({ isActive }) =>
              `flex items-center gap-2 px-4 py-2 rounded-xl font-poppins text-sm font-medium transition-all duration-200
               ${isActive
                ? 'text-eco-green bg-eco-green/10'
                : 'text-eco-muted hover:text-eco-text hover:bg-white/5'
              }`
            }
            style={({ isActive }) => ({
              color: isActive ? 'var(--eco-green)' : 'var(--eco-muted)',
              background: isActive ? 'rgba(0,191,111,0.1)' : 'transparent',
              fontFamily: 'Poppins, sans-serif',
              fontSize: '0.875rem',
              fontWeight: 500,
            })}
          >
            {({ isActive }) => (
              <>
                <Icon size={15} strokeWidth={isActive ? 2.5 : 1.8} />
                {label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Right: user chip + logout */}
      <div className="flex items-center gap-3">
        {/* XP chip */}
        <div
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl"
          style={{
            background: 'var(--eco-surface2)',
            border: '1px solid var(--eco-border)',
            fontFamily: 'Poppins, sans-serif',
            fontSize: '0.8rem',
            fontWeight: 600,
            color: 'var(--eco-green)',
          }}
        >
          <Zap size={13} />
          Lvl {level} · {totalXP} XP
        </div>

        {/* Avatar */}
        {user?.avatar ? (
          <img
            src={user.avatar}
            alt={user.name}
            className="w-8 h-8 rounded-full"
            style={{ border: '2px solid rgba(0,191,111,0.4)' }}
          />
        ) : (
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold"
            style={{
              background: 'rgba(0,191,111,0.15)',
              border: '2px solid rgba(0,191,111,0.3)',
              color: 'var(--eco-green)',
              fontFamily: 'Poppins, sans-serif',
            }}
          >
            {user?.name?.[0]?.toUpperCase() || '?'}
          </div>
        )}

        {/* Logout */}
        <button
          onClick={handleLogout}
          id="top-nav-logout"
          title="Logout"
          style={{ color: 'var(--eco-muted)', transition: 'color 0.2s' }}
          onMouseOver={(e) => (e.currentTarget.style.color = 'var(--eco-text)')}
          onMouseOut={(e) => (e.currentTarget.style.color = 'var(--eco-muted)')}
        >
          <LogOut size={16} />
        </button>
      </div>
    </header>
  );
}
