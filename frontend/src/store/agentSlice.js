import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api/v1';

export const triggerAgentWorkflow = createAsyncThunk(
  'agent/triggerWorkflow',
  async ({ complaint_id, groq_api_key, model_name }) => {
    const res = await fetch(`${API_BASE}/agent/run`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ complaint_id, groq_api_key, model_name })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || 'Agent execution failed');
    }
    return await res.json();
  }
);

export const fetchSettings = createAsyncThunk(
  'agent/fetchSettings',
  async () => {
    const res = await fetch(`${API_BASE}/settings`);
    if (!res.ok) throw new Error('Failed to fetch settings');
    return await res.json();
  }
);

export const saveSettings = createAsyncThunk(
  'agent/saveSettings',
  async (settingsData) => {
    const res = await fetch(`${API_BASE}/settings`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settingsData)
    });
    if (!res.ok) throw new Error('Failed to update settings');
    return await res.json();
  }
);

const agentSlice = createSlice({
  name: 'agent',
  initialState: {
    isRunning: false,
    activeNode: null, // 'triage' | 'traceability' | 'rca' | 'capa' | 'regulatory' | null
    executionLogs: [],
    lastResult: null,
    error: null,
    settings: {
      groq_api_key: '',
      masked_api_key: '',
      active_model: 'gemma2-9b-it',
      auto_trigger_agent: true,
      has_custom_key: false
    }
  },
  reducers: {
    setActiveNode: (state, action) => {
      state.activeNode = action.payload;
    },
    clearLogs: (state) => {
      state.executionLogs = [];
      state.lastResult = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(triggerAgentWorkflow.pending, (state) => {
        state.isRunning = true;
        state.error = null;
        state.activeNode = 'triage';
      })
      .addCase(triggerAgentWorkflow.fulfilled, (state, action) => {
        state.isRunning = false;
        state.activeNode = null;
        state.lastResult = action.payload;
        state.executionLogs = action.payload.execution_logs || [];
      })
      .addCase(triggerAgentWorkflow.rejected, (state, action) => {
        state.isRunning = false;
        state.activeNode = null;
        state.error = action.error.message;
      })
      .addCase(fetchSettings.fulfilled, (state, action) => {
        state.settings = action.payload;
      })
      .addCase(saveSettings.fulfilled, (state, action) => {
        state.settings.active_model = action.payload.active_model;
      });
  }
});

export const { setActiveNode, clearLogs } = agentSlice.actions;
export default agentSlice.reducer;
