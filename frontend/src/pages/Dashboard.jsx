import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchActivities, fetchCategoryBreakdown } from '../features/activitySlice';
import { useNavigate } from 'react-router-dom';

import TargetArcCard      from '../components/TargetArcCard';
import XPProgressBar      from '../components/XPProgressBar';
import StreakCounter      from '../components/StreakCounter';
import WeeklyChart        from '../components/WeeklyChart';
import ActivityCard       from '../components/ActivityCard';
import ClimateActionGrid  from '../components/ClimateActionGrid';
import FoodLogModal       from '../components/FoodLogModal';
import TravelModal        from '../components/TravelModal';
import EnergyModal        from '../components/EnergyModal';
import WasteModal         from '../components/WasteModal';
import ShoppingModal      from '../components/ShoppingModal';
import EcoProjectModal    from '../components/EcoProjectModal';

import { PlusCircle, Leaf, Zap, Target } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

const CATEGORY_COLORS = {
  Transport: '#60A5FA',
  Diet:      '#00BF6F',
  Power:     '#FACC15',
  Waste:     '#A78BFA',
  Shopping:  '#FB923C',
};

const CustomPieTooltip = ({ active, payload }) => {
  if (active && payload?.length) {
    return (
      <div
        style={{
          background: 'var(--eco-surface2)',
          border: '1px solid var(--eco-border-s)',
          borderRadius: 10,
          padding: '8px 12px',
          fontFamily: 'Poppins, sans-serif',
          fontSize: '0.78rem',
          color: 'var(--eco-text)',
          boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
        }}
      >
        <strong>{payload[0].name}</strong>: {payload[0].value} kg
      </div>
    );
  }
  return null;
};

export default function Dashboard() {
  const dispatch  = useDispatch();
  const navigate  = useNavigate();

  const { activities, categoryBreakdown, loading } = useSelector((s) => s.activity);
  const { user, monthlyGoal, totalXP, level, currentStreak, badgeEmoji } = useSelector((s) => s.user);

  const [openModal, setOpenModal] = useState(null); // 'food' | 'travel' | 'energy' | 'waste' | 'shopping' | 'eco'

  const closeModal = () => setOpenModal(null);

  useEffect(() => {
    dispatch(fetchActivities());
    dispatch(fetchCategoryBreakdown());
  }, [dispatch]);

  // Monthly carbon from category breakdown
  const monthlyCarbon = categoryBreakdown.reduce((s, c) => s + c.carbon, 0);
  const goalProgress  = Math.min((monthlyCarbon / monthlyGoal) * 100, 100);

  const pieData = categoryBreakdown.map(c => ({
    name:  c.category,
    value: parseFloat(c.carbon.toFixed(2)),
    color: CATEGORY_COLORS[c.category] || '#00BF6F',
  }));

  // Cool Points = totalXP (gamification tie-in)
  const coolPoints    = totalXP;
  const actionsCount  = activities.length;

  const firstName = user?.name?.split(' ')[0] || 'Eco Warrior';
  const dateStr   = new Date().toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric',
  });

  const handleCategoryClick = (id) => {
    setOpenModal(id);
  };

  return (
    <div className="eco-page">

      {/* ── Hero Header ─────────────────────────── */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
          <div>
            <div
              style={{
                fontFamily: 'Poppins, sans-serif',
                fontSize: '0.7rem',
                fontWeight: 600,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: 'var(--eco-muted)',
                marginBottom: 4,
              }}
            >
              {dateStr}
            </div>
            <h1
              style={{
                fontFamily: 'Poppins, sans-serif',
                fontWeight: 800,
                fontSize: 'clamp(1.5rem, 5vw, 2rem)',
                color: 'var(--eco-text)',
                lineHeight: 1.2,
                margin: 0,
              }}
            >
              Welcome back, {firstName} 👋
            </h1>
            <p
              style={{
                fontFamily: 'Poppins, sans-serif',
                fontSize: '0.875rem',
                color: 'var(--eco-muted)',
                marginTop: 4,
                margin: '4px 0 0',
              }}
            >
              Let's make today count for the planet 🌿
            </p>
          </div>

          {/* Avatar + level badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ textAlign: 'right' }}>
              <div className="eco-badge" style={{ marginBottom: 4 }}>
                <Zap size={10} /> {totalXP} XP
              </div>
              <div
                style={{
                  fontFamily: 'Poppins, sans-serif',
                  fontSize: '0.72rem',
                  color: 'var(--eco-muted)',
                }}
              >
                {badgeEmoji} Level {level}
              </div>
            </div>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: '50%',
                background: 'rgba(0,191,111,0.15)',
                border: '2px solid rgba(0,191,111,0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: 'Poppins, sans-serif',
                fontWeight: 700,
                fontSize: '1.1rem',
                color: 'var(--eco-green)',
              }}
            >
              {user?.avatar
                ? <img src={user.avatar} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                : (user?.name?.[0]?.toUpperCase() || '?')
              }
            </div>
          </div>
        </div>
      </div>

      {/* ── Target Arc Card (hero) ───────────────── */}
      <div style={{ marginBottom: 20 }}>
        <TargetArcCard
          monthlyCarbon={monthlyCarbon}
          monthlyGoal={monthlyGoal}
          actionsCount={actionsCount}
          coolPoints={coolPoints}
        />
      </div>

      {/* ── Stats Row: Level + Streak + Category ── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 16,
          marginBottom: 20,
        }}
      >
        {/* XP / Level Arc */}
        <XPProgressBar />

        {/* Streak Card */}
        <StreakCounter />

        {/* Category Breakdown Card */}
        <div className="eco-card" style={{ padding: '20px' }}>
          <div
            style={{
              fontFamily: 'Poppins, sans-serif',
              fontSize: '0.7rem',
              fontWeight: 600,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: 'var(--eco-muted)',
              marginBottom: 12,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <Leaf size={12} color="var(--eco-green)" />
            This Month
          </div>

          {pieData.length === 0 ? (
            <div
              style={{
                height: 120,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                color: 'var(--eco-muted)',
                fontFamily: 'Poppins, sans-serif',
                fontSize: '0.8rem',
              }}
            >
              <Leaf size={28} style={{ opacity: 0.2 }} />
              No data yet
            </div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={110}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={28}
                    outerRadius={48}
                    dataKey="value"
                    paddingAngle={3}
                    startAngle={90}
                    endAngle={-270}
                  >
                    {pieData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} opacity={0.9} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomPieTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8 }}>
                {pieData.map((d) => (
                  <div
                    key={d.name}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      fontFamily: 'Poppins, sans-serif',
                      fontSize: '0.75rem',
                    }}
                  >
                    <div
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        background: d.color,
                        flexShrink: 0,
                      }}
                    />
                    <span style={{ color: 'var(--eco-muted)', flex: 1 }}>{d.name}</span>
                    <span style={{ color: 'var(--eco-text)', fontWeight: 600 }}>{d.value} kg</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── Monthly Goal Progress ─────────────────── */}
      <div className="eco-card" style={{ padding: '20px', marginBottom: 20 }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 12,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 10,
                background: 'rgba(0,191,111,0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Target size={14} color="#00BF6F" />
            </div>
            <div>
              <div
                style={{
                  fontFamily: 'Poppins, sans-serif',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  color: 'var(--eco-text)',
                }}
              >
                Monthly Goal
              </div>
              <div
                style={{
                  fontFamily: 'Poppins, sans-serif',
                  fontSize: '0.72rem',
                  color: 'var(--eco-muted)',
                }}
              >
                {goalProgress < 100
                  ? `${(monthlyGoal - monthlyCarbon).toFixed(1)} kg remaining`
                  : '⚠ Monthly limit reached!'}
              </div>
            </div>
          </div>
          <div>
            <span
              style={{
                fontFamily: 'Poppins, sans-serif',
                fontWeight: 800,
                fontSize: '1.4rem',
                color: goalProgress > 90 ? '#F87171' : 'var(--eco-green)',
              }}
            >
              {monthlyCarbon.toFixed(1)}
            </span>
            <span
              style={{
                fontFamily: 'Poppins, sans-serif',
                fontSize: '0.78rem',
                color: 'var(--eco-muted)',
                marginLeft: 4,
              }}
            >
              / {monthlyGoal} kg CO₂
            </span>
          </div>
        </div>
        <div className="eco-progress-track">
          <div
            className="eco-progress-bar"
            style={{
              width: `${goalProgress}%`,
              background: goalProgress > 90
                ? 'linear-gradient(90deg, #EF4444, #F97316)'
                : undefined,
            }}
          />
        </div>
      </div>

      {/* ── Emission Trend Chart ─────────────────── */}
      <div style={{ marginBottom: 20 }}>
        <WeeklyChart />
      </div>

      {/* ── Climate Action Grid ──────────────────── */}
      <div style={{ marginBottom: 20 }}>
        <ClimateActionGrid onCategoryClick={handleCategoryClick} />
      </div>

      {/* ── Recent Activity Log ──────────────────── */}
      <div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 14,
          }}
        >
          <div>
            <div
              style={{
                fontFamily: 'Poppins, sans-serif',
                fontWeight: 700,
                fontSize: '1rem',
                color: 'var(--eco-text)',
              }}
            >
              Recent Activity Log
            </div>
            <div
              style={{
                fontFamily: 'Poppins, sans-serif',
                fontSize: '0.72rem',
                color: 'var(--eco-muted)',
                marginTop: 2,
              }}
            >
              {actionsCount} total actions logged
            </div>
          </div>
          <button
            id="dashboard-log-activity"
            onClick={() => navigate('/log')}
            className="eco-btn-ghost"
            style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.82rem' }}
          >
            <PlusCircle size={14} />
            Log New
          </button>
        </div>

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="eco-card"
                style={{ height: 72, opacity: 0.3, animation: 'pulse 1.5s ease-in-out infinite' }}
              />
            ))}
          </div>
        ) : activities.length === 0 ? (
          <div
            className="eco-card"
            style={{
              padding: '40px 20px',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '2rem', marginBottom: 10 }}>🌱</div>
            <div
              style={{
                fontFamily: 'Poppins, sans-serif',
                fontWeight: 600,
                fontSize: '0.95rem',
                color: 'var(--eco-muted)',
                marginBottom: 14,
              }}
            >
              No activities logged yet
            </div>
            <button
              onClick={() => navigate('/log')}
              className="eco-btn-primary"
              style={{ padding: '10px 24px', fontSize: '0.875rem' }}
            >
              Log Your First Activity
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {activities.slice(0, 8).map((act) => (
              <ActivityCard key={act._id} activity={act} />
            ))}
          </div>
        )}
      </div>

      {/* ── All Activity Modals ───────────────── */}
      <FoodLogModal     isOpen={openModal === 'food'}     onClose={closeModal} />
      <TravelModal      isOpen={openModal === 'travel'}   onClose={closeModal} />
      <EnergyModal      isOpen={openModal === 'energy'}   onClose={closeModal} />
      <WasteModal       isOpen={openModal === 'waste'}    onClose={closeModal} />
      <ShoppingModal    isOpen={openModal === 'shopping'} onClose={closeModal} />
      <EcoProjectModal  isOpen={openModal === 'eco'}      onClose={closeModal} />
    </div>
  );
}
