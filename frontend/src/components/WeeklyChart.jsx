import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchWeeklyStats } from '../features/activitySlice';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts';
import { TrendingUp } from 'lucide-react';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div
        style={{
          background: 'var(--eco-surface2)',
          border: '1px solid var(--eco-border-s)',
          borderRadius: 12,
          padding: '10px 14px',
          fontFamily: 'Poppins, sans-serif',
          boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
        }}
      >
        <p style={{ color: 'var(--eco-muted)', fontSize: '0.72rem', marginBottom: 4 }}>{label}</p>
        <p style={{ color: 'var(--eco-green)', fontWeight: 700, fontSize: '0.95rem' }}>
          {payload[0].value.toFixed(2)} kg CO₂
        </p>
        {payload[0].payload.activities > 0 && (
          <p style={{ color: 'var(--eco-muted)', fontSize: '0.72rem', marginTop: 2 }}>
            {payload[0].payload.activities} activities
          </p>
        )}
      </div>
    );
  }
  return null;
};

export default function WeeklyChart() {
  const dispatch = useDispatch();
  const { weeklyStats, loading } = useSelector((s) => s.activity);

  useEffect(() => {
    dispatch(fetchWeeklyStats());
  }, [dispatch]);

  const avgCarbon = weeklyStats.length > 0
    ? weeklyStats.reduce((s, d) => s + d.carbon, 0) / weeklyStats.length
    : 0;

  return (
    <div className="eco-card p-6">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: 'rgba(0,191,111,0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <TrendingUp size={16} color="#00BF6F" />
          </div>
          <div>
            <div
              style={{
                fontFamily: 'Poppins, sans-serif',
                fontWeight: 600,
                fontSize: '0.95rem',
                color: 'var(--eco-text)',
              }}
            >
              Emission Trend
            </div>
            <div
              style={{
                fontFamily: 'Poppins, sans-serif',
                fontSize: '0.72rem',
                color: 'var(--eco-muted)',
              }}
            >
              Last 7 days
            </div>
          </div>
        </div>
        <div
          style={{
            fontFamily: 'Poppins, sans-serif',
            fontSize: '0.8rem',
            fontWeight: 600,
            color: 'var(--eco-muted)',
            background: 'var(--eco-surface2)',
            padding: '4px 12px',
            borderRadius: 99,
            border: '1px solid var(--eco-border)',
          }}
        >
          avg {avgCarbon.toFixed(2)} kg/day
        </div>
      </div>

      {loading ? (
        <div
          style={{
            height: 200,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--eco-muted)',
            fontFamily: 'Poppins, sans-serif',
            fontSize: '0.875rem',
          }}
        >
          Loading chart…
        </div>
      ) : weeklyStats.length === 0 ? (
        <div
          style={{
            height: 200,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            color: 'var(--eco-muted)',
            fontFamily: 'Poppins, sans-serif',
            fontSize: '0.875rem',
          }}
        >
          <TrendingUp size={32} style={{ opacity: 0.3 }} />
          No data yet — log your first activity!
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={weeklyStats} margin={{ top: 8, right: 4, left: -24, bottom: 0 }}>
            <defs>
              <linearGradient id="ecoGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#00BF6F" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#00BF6F" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid
              stroke="rgba(0,191,111,0.07)"
              strokeDasharray="4 4"
              vertical={false}
            />
            <XAxis
              dataKey="day"
              tick={{ fill: 'var(--eco-muted)', fontSize: 11, fontFamily: 'Poppins, sans-serif' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: 'var(--eco-muted)', fontSize: 11, fontFamily: 'Poppins, sans-serif' }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              content={<CustomTooltip />}
              cursor={{ stroke: 'rgba(0,191,111,0.2)', strokeWidth: 1 }}
            />
            <Area
              type="monotoneX"
              dataKey="carbon"
              stroke="#00BF6F"
              strokeWidth={2.5}
              fill="url(#ecoGrad)"
              dot={{ fill: '#00BF6F', r: 4, strokeWidth: 0 }}
              activeDot={{ fill: '#fff', r: 6, stroke: '#00BF6F', strokeWidth: 2.5 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
