import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { Subscription, PaymentStatus } from '../../types';

interface SubscriptionState {
  subscriptions: Subscription[];
  loading: boolean;
  error: string | null;
  currentSubscription: Subscription | null;
}

// Initial state
const initialState: SubscriptionState = {
  subscriptions: [],
  loading: false,
  error: null,
  currentSubscription: null,
};

// Create the subscription slice
const subscriptionSlice = createSlice({
  name: 'subscription',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentSubscription: (state, action: PayloadAction<Subscription | null>) => {
      state.currentSubscription = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Add extra reducers for async thunks here when implemented
    // Example:
    // builder
    //   .addCase(fetchSubscriptions.pending, (state) => {
    //     state.loading = true;
    //     state.error = null;
    //   })
    //   .addCase(fetchSubscriptions.fulfilled, (state, action) => {
    //     state.loading = false;
    //     state.subscriptions = action.payload;
    //   })
    //   .addCase(fetchSubscriptions.rejected, (state, action) => {
    //     state.loading = false;
    //     state.error = action.payload as string;
    //   });
  },
});

export const { clearError, setCurrentSubscription } = subscriptionSlice.actions;
export default subscriptionSlice.reducer;