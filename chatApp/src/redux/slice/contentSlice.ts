import {createSlice} from '@reduxjs/toolkit';

const initialState: any = {
     initializing: true,
  baseUrl: null,
  homeListData: [],
};

const contentSlice: any = createSlice({
  name: 'content',
  initialState,
  reducers: {
     setInitializing: (state: any, action: any) => {
      state.initializing = action.payload;
    },
    setBaseUrl: (state: any, action: any) => {
      state.baseUrl = action.payload;
    },
}
});

export const {
  setBaseUrl,
  setInitializing,
} = contentSlice.actions;

export default contentSlice.reducer;
