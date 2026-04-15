import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/api';
import { updateUserStats, incrementCarbonLogged } from './userSlice';

// ── Thunks ────────────────────────────────────────────────────

export const fetchActivities = createAsyncThunk(
  'activity/fetchAll',
  async ({ page = 1, limit = 20 } = {}, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('ecotrack_token');
      const { data } = await api.get(`/activities?page=${page}&limit=${limit}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || err.message);
    }
  }
);

export const logActivity = createAsyncThunk(
  'activity/log',
  async (payload, { dispatch, rejectWithValue }) => {
    try {
      const token = localStorage.getItem('ecotrack_token');
      const { data } = await api.post('/activities', payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Update user stats in Redux from response
      dispatch(updateUserStats(data.user));
      dispatch(incrementCarbonLogged(data.activity.carbonScore));

      return data.activity;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || err.message);
    }
  }
);

export const deleteActivity = createAsyncThunk(
  'activity/delete',
  async (activityId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('ecotrack_token');
      await api.delete(`/activities/${activityId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return activityId;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || err.message);
    }
  }
);

export const fetchWeeklyStats = createAsyncThunk(
  'activity/fetchWeekly',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('ecotrack_token');
      const { data } = await api.get('/stats/weekly', {
        headers: { Authorization: `Bearer ${token}` },
      });
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || err.message);
    }
  }
);

export const fetchGlobalImpact = createAsyncThunk(
  'activity/fetchGlobal',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/stats/global');
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || err.message);
    }
  }
);

export const fetchLeaderboard = createAsyncThunk(
  'activity/fetchLeaderboard',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/stats/leaderboard');
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || err.message);
    }
  }
);

export const fetchCategoryBreakdown = createAsyncThunk(
  'activity/fetchBreakdown',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('ecotrack_token');
      const { data } = await api.get('/stats/category-breakdown', {
        headers: { Authorization: `Bearer ${token}` },
      });
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || err.message);
    }
  }
);

// ── Initial State ──────────────────────────────────────────────

const initialState = {
  activities: [],
  weeklyStats: [],
  globalImpact: { totalCarbon: 0, totalActivities: 0, totalUsers: 0 },
  leaderboard: [],
  categoryBreakdown: [],
  total: 0,
  page: 1,
  loading: false,
  logLoading: false,
  error: null,
};

// ── Slice ─────────────────────────────────────────────────────

const activitySlice = createSlice({
  name: 'activity',
  initialState,
  reducers: {
    clearActivityError: (state) => { state.error = null; },
    resetActivities:    (state) => { Object.assign(state, initialState); },
  },

  extraReducers: (builder) => {
    // fetchActivities
    builder
      .addCase(fetchActivities.pending,   (state) => { state.loading = true; })
      .addCase(fetchActivities.fulfilled, (state, action) => {
        state.loading = false;
        state.activities = action.payload.activities;
        state.total      = action.payload.total;
        state.page       = action.payload.page;
      })
      .addCase(fetchActivities.rejected, (state, action) => {
        state.loading = false;
        state.error   = action.payload;
      });

    // logActivity
    builder
      .addCase(logActivity.pending,   (state) => { state.logLoading = true; state.error = null; })
      .addCase(logActivity.fulfilled, (state, action) => {
        state.logLoading = false;
        state.activities.unshift(action.payload);
        state.total += 1;
      })
      .addCase(logActivity.rejected, (state, action) => {
        state.logLoading = false;
        state.error = action.payload;
      });

    // deleteActivity
    builder.addCase(deleteActivity.fulfilled, (state, action) => {
      state.activities = state.activities.filter(a => a._id !== action.payload);
      state.total -= 1;
    });

    // fetchWeeklyStats
    builder
      .addCase(fetchWeeklyStats.pending,   (state) => { state.loading = true; })
      .addCase(fetchWeeklyStats.fulfilled, (state, action) => {
        state.loading = false;
        state.weeklyStats = action.payload;
      })
      .addCase(fetchWeeklyStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // fetchGlobalImpact
    builder.addCase(fetchGlobalImpact.fulfilled, (state, action) => {
      state.globalImpact = action.payload;
    });

    // fetchLeaderboard
    builder.addCase(fetchLeaderboard.fulfilled, (state, action) => {
      state.leaderboard = action.payload;
    });

    // fetchCategoryBreakdown
    builder.addCase(fetchCategoryBreakdown.fulfilled, (state, action) => {
      state.categoryBreakdown = action.payload;
    });
  },
});

export const { clearActivityError, resetActivities } = activitySlice.actions;
export default activitySlice.reducer;
