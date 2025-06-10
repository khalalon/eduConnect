import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';

// Define types for content state
interface Content {
  id: string;
  title: string;
  description: string;
  type: string;
  url?: string;
  createdAt: string;
  updatedAt: string;
}

interface ContentState {
  items: Content[];
  loading: boolean;
  error: string | null;
  currentContent: Content | null;
}

// Initial state
const initialState: ContentState = {
  items: [],
  loading: false,
  error: null,
  currentContent: null,
};

// Create the content slice
const contentSlice = createSlice({
  name: 'content',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentContent: (state, action: PayloadAction<Content | null>) => {
      state.currentContent = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Add extra reducers for async thunks here when implemented
    // Example:
    // builder
    //   .addCase(fetchContent.pending, (state) => {
    //     state.loading = true;
    //     state.error = null;
    //   })
    //   .addCase(fetchContent.fulfilled, (state, action) => {
    //     state.loading = false;
    //     state.items = action.payload;
    //   })
    //   .addCase(fetchContent.rejected, (state, action) => {
    //     state.loading = false;
    //     state.error = action.payload as string;
    //   });
  },
});

export const { clearError, setCurrentContent } = contentSlice.actions;
export default contentSlice.reducer;