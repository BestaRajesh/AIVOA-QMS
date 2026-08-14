import { configureStore } from '@reduxjs/toolkit';
import complaintReducer from './complaintSlice';
import agentReducer from './agentSlice';
import capaReducer from './capaSlice';
import analyticsReducer from './analyticsSlice';
import uiReducer from './uiSlice';

export const store = configureStore({
  reducer: {
    complaints: complaintReducer,
    agent: agentReducer,
    capa: capaReducer,
    analytics: analyticsReducer,
    ui: uiReducer
  }
});
