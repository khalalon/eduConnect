import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { Message } from '../../types';

interface MessageState {
  messages: Message[];
  loading: boolean;
  error: string | null;
  unreadCount: number;
  currentConversation: {
    partnerId: string;
    messages: Message[];
  } | null;
}

// Initial state
const initialState: MessageState = {
  messages: [],
  loading: false,
  error: null,
  unreadCount: 0,
  currentConversation: null,
};

// Create the message slice
const messageSlice = createSlice({
  name: 'message',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentConversation: (state, action: PayloadAction<{ partnerId: string; messages: Message[] } | null>) => {
      state.currentConversation = action.payload;
    },
    addMessage: (state, action: PayloadAction<Message>) => {
      state.messages.push(action.payload);
      
      // If this message is for the current conversation, add it there too
      if (state.currentConversation && 
          (state.currentConversation.partnerId === action.payload.senderId || 
           state.currentConversation.partnerId === action.payload.receiverId)) {
        state.currentConversation.messages.push(action.payload);
      }
      
      // Increment unread count if the message is not from the current user
      if (!action.payload.read && action.payload.receiverId === 'currentUserId') { // Replace with actual current user ID logic
        state.unreadCount += 1;
      }
    },
    markAsRead: (state, action: PayloadAction<string[]>) => {
      // Mark messages as read by ID
      state.messages = state.messages.map(message => 
        action.payload.includes(message.id) 
          ? { ...message, read: true } 
          : message
      );
      
      // Update unread count
      state.unreadCount = state.messages.filter(m => !m.read && m.receiverId === 'currentUserId').length;
      
      // Update current conversation if needed
      if (state.currentConversation) {
        state.currentConversation.messages = state.currentConversation.messages.map(message => 
          action.payload.includes(message.id) 
            ? { ...message, read: true } 
            : message
        );
      }
    },
  },
  extraReducers: (builder) => {
    // Add extra reducers for async thunks here when implemented
    // Example:
    // builder
    //   .addCase(fetchMessages.pending, (state) => {
    //     state.loading = true;
    //     state.error = null;
    //   })
    //   .addCase(fetchMessages.fulfilled, (state, action) => {
    //     state.loading = false;
    //     state.messages = action.payload;
    //     state.unreadCount = action.payload.filter(m => !m.read && m.receiverId === 'currentUserId').length;
    //   })
    //   .addCase(fetchMessages.rejected, (state, action) => {
    //     state.loading = false;
    //     state.error = action.payload as string;
    //   });
  },
});

export const { clearError, setCurrentConversation, addMessage, markAsRead } = messageSlice.actions;
export default messageSlice.reducer;