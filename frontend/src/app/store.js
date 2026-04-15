import { configureStore } from '@reduxjs/toolkit';
import userReducer from '../features/userSlice';
import activityReducer from '../features/activitySlice';

export const store = configureStore({
  reducer: {
    user: userReducer,
    activity: activityReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }),
});

export default store;
