import { createSlice } from '@reduxjs/toolkit';

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    activeTab: 'dashboard', // 'dashboard' | 'intake' | 'agent_studio' | 'dossier' | 'capa'
    isSettingsOpen: false,
    toastMessage: null,
    toastType: 'info' // 'info' | 'success' | 'warning' | 'error'
  },
  reducers: {
    setActiveTab: (state, action) => {
      state.activeTab = action.payload;
    },
    toggleSettingsModal: (state, action) => {
      state.isSettingsOpen = action.payload !== undefined ? action.payload : !state.isSettingsOpen;
    },
    showToast: (state, action) => {
      state.toastMessage = action.payload.message;
      state.toastType = action.payload.type || 'info';
    },
    clearToast: (state) => {
      state.toastMessage = null;
    }
  }
});

export const { setActiveTab, toggleSettingsModal, showToast, clearToast } = uiSlice.actions;
export default uiSlice.reducer;
