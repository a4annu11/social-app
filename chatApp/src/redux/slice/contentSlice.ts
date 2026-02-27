import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Post {
  _id: string;
  isLiked?: boolean;
  isSaved?: boolean;
  likesCount?: number;
  commentsCount?: number;
  [key: string]: any;
}

interface ContentState {
  initializing: boolean;
  baseUrl: string | null;
  feedData: Post[];
  userPosts?: Post[];
}

const initialState: ContentState = {
  initializing: true,
  baseUrl: null,
  feedData: [],
  userPosts: [],
};

const contentSlice = createSlice({
  name: 'content',
  initialState,
  reducers: {
    setInitializing: (state, action: PayloadAction<boolean>) => {
      state.initializing = action.payload;
    },

    setBaseUrl: (state, action: PayloadAction<string>) => {
      state.baseUrl = action.payload;
    },

    setFeedData: (state, action: PayloadAction<Post[]>) => {
      state.feedData = action.payload;
    },
    setUserPosts: (state, action: PayloadAction<Post[]>) => {
      state.userPosts = action.payload;
    },

    updatePostById: (
      state,
      action: PayloadAction<{ postId: string; updates: Partial<Post> }>,
    ) => {
      const { postId, updates } = action.payload;

      const index = state.feedData.findIndex(p => p._id === postId);

      if (index !== -1) {
        state.feedData[index] = {
          ...state.feedData[index],
          ...updates,
        };
      }
    },
    updateUserPostById: (
      state,
      action: PayloadAction<{ postId: string; updates: Partial<Post> }>,
    ) => {
      const { postId, updates } = action.payload;

      const index = state.userPosts.findIndex(p => p._id === postId);

      if (index !== -1) {
        state.userPosts[index] = {
          ...state.userPosts[index],
          ...updates,
        };
      }
    },

    removePostById: (state, action: PayloadAction<string>) => {
      state.feedData = state.feedData.filter(
        post => post._id !== action.payload,
      );
      state.userPosts = state.userPosts.filter(
        post => post._id !== action.payload,
      );
    },
  },
});

export const {
  setInitializing,
  setBaseUrl,
  setFeedData,
  updatePostById,
  removePostById,
  setUserPosts,
  updateUserPostById,
} = contentSlice.actions;

export default contentSlice.reducer;
