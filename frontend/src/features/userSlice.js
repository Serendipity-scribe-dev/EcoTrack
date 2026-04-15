import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { signInWithPopup, signOut } from 'firebase/auth';
import { auth, googleProvider } from '../firebase';
import api from '../services/api';

// ── Thunks ────────────────────────────────────────────────────



// Step 1 & 2 combined — popup handles everything in one shot
export const loginWithGoogle = createAsyncThunk(
  'user/loginWithGoogle',
  async (_, { rejectWithValue }) => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const token = await result.user.getIdToken();

      const { data } = await api.post('/auth/sync', {}, {
        headers: { Authorization: `Bearer ${token}` },
      });

      localStorage.setItem('ecotrack_token', token);
      return { ...data, token };
    } catch (err) {
      console.error('Google sign-in error:', err);
      return rejectWithValue(err.message);
    }
  }
);

// Step 2: Called on app mount — handles the result after Google redirects back


export const logoutUser = createAsyncThunk(
  'user/logout',
  async () => {
    await signOut(auth);
    localStorage.removeItem('ecotrack_token');
  }
);

export const refreshUser = createAsyncThunk(
  'user/refresh',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('ecotrack_token');
      if (!token) throw new Error('No token');
      const { data } = await api.get('/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      return data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const updateMonthlyGoal = createAsyncThunk(
  'user/updateGoal',
  async (goal, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('ecotrack_token');
      const { data } = await api.patch('/auth/goal', { monthlyGoal: goal }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return data.monthlyGoal;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// ── Initial State ──────────────────────────────────────────────

const LEVEL_BADGES = {
  1: { badge: 'Seedling', emoji: '🌱' },
  2: { badge: 'Sapling', emoji: '🌿' },
  3: { badge: 'Redwood', emoji: '🌳' },
  4: { badge: 'Ancient', emoji: '🌲' },
  5: { badge: 'Guardian', emoji: '🌍' },
};

const initialState = {
  user: null,           // MongoDB user doc
  token: localStorage.getItem('ecotrack_token') || null,
  totalXP: 0,
  level: 1,
  badge: 'Seedling',
  badgeEmoji: '🌱',
  currentStreak: 0,
  longestStreak: 0,
  monthlyGoal: 100,
  totalCarbonLogged: 0,
  loading: false,
  error: null,
  isAuthenticated: false,
};

// ── Slice ─────────────────────────────────────────────────────

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUserFromFirebase: (state, action) => {
      const d = action.payload;
      state.user = d;
      state.totalXP = d.totalXP ?? 0;
      state.level = d.level ?? 1;
      state.badge = d.badge ?? 'Seedling';
      state.badgeEmoji = LEVEL_BADGES[d.level]?.emoji ?? '🌱';
      state.currentStreak = d.currentStreak ?? 0;
      state.longestStreak = d.longestStreak ?? 0;
      state.monthlyGoal = d.monthlyGoal ?? 100;
      state.totalCarbonLogged = d.totalCarbonLogged ?? 0;
      state.isAuthenticated = true;
    },

    updateUserStats: (state, action) => {
      const { totalXP, level, badge, currentStreak, longestStreak } = action.payload;
      state.totalXP = totalXP;
      state.level = level;
      state.badge = badge;
      state.badgeEmoji = LEVEL_BADGES[level]?.emoji ?? '🌱';
      state.currentStreak = currentStreak;
      state.longestStreak = longestStreak;
    },

    incrementCarbonLogged: (state, action) => {
      state.totalCarbonLogged += action.payload;
    },

    clearError: (state) => { state.error = null; },
  },

  extraReducers: (builder) => {
    // loginWithGoogle — just triggers redirect, shows loading spinner
    builder
      .addCase(loginWithGoogle.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(loginWithGoogle.fulfilled, (state) => { state.loading = true; }) // keep loading during redirect
      .addCase(loginWithGoogle.rejected, (state, action) => { state.loading = false; state.error = action.payload; });

    // handleRedirectResult — processes result after Google redirects back
    // const applyUserData = (state, action) => {
    //   if (!action.payload) return; // null = no redirect was pending
    //   state.loading = false;
    //   const d = action.payload;
    //   state.token = d.token;
    //   state.user = d;
    //   state.totalXP = d.totalXP ?? 0;
    //   state.level = d.level ?? 1;
    //   state.badge = d.badge ?? 'Seedling';
    //   state.badgeEmoji = LEVEL_BADGES[d.level]?.emoji ?? '🌱';
    //   state.currentStreak = d.currentStreak ?? 0;
    //   state.longestStreak = d.longestStreak ?? 0;
    //   state.monthlyGoal = d.monthlyGoal ?? 100;
    //   state.totalCarbonLogged = d.totalCarbonLogged ?? 0;
    //   state.isAuthenticated = true;
    // };
    // builder
    //   .addCase(handleRedirectResult.pending, (state) => { state.loading = true; state.error = null; })
    //   .addCase(handleRedirectResult.fulfilled, applyUserData)
    //   .addCase(handleRedirectResult.rejected, (state, action) => { state.loading = false; state.error = action.payload; });

    // logoutUser
    builder.addCase(logoutUser.fulfilled, () => ({
      ...initialState,
      token: null,
    }));

    // refreshUser
    builder
      .addCase(refreshUser.fulfilled, (state, action) => {
        const d = action.payload;
        state.user = d;
        state.totalXP = d.totalXP ?? 0;
        state.level = d.level ?? 1;
        state.badge = d.badge ?? 'Seedling';
        state.badgeEmoji = LEVEL_BADGES[d.level]?.emoji ?? '🌱';
        state.currentStreak = d.currentStreak ?? 0;
        state.longestStreak = d.longestStreak ?? 0;
        state.monthlyGoal = d.monthlyGoal ?? 100;
        state.totalCarbonLogged = d.totalCarbonLogged ?? 0;
        state.isAuthenticated = true;
      })
      .addCase(refreshUser.rejected, (state) => {
        state.isAuthenticated = false;
        state.token = null;
      });

    // updateMonthlyGoal
    builder.addCase(updateMonthlyGoal.fulfilled, (state, action) => {
      state.monthlyGoal = action.payload;
    });
  },
});

export const { setUserFromFirebase, updateUserStats, incrementCarbonLogged, clearError } = userSlice.actions;
export const LEVEL_BADGES_MAP = LEVEL_BADGES;

export default userSlice.reducer;
