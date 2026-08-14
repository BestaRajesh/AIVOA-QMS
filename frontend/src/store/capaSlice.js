import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const API_BASE = 'http://localhost:8000/api/v1';

export const fetchCAPAs = createAsyncThunk(
  'capa/fetchCAPAs',
  async (status = 'ALL') => {
    const res = await fetch(`${API_BASE}/capas?status=${status}`);
    if (!res.ok) throw new Error('Failed to fetch CAPA items');
    return await res.json();
  }
);

export const createCAPA = createAsyncThunk(
  'capa/createCAPA',
  async (capaData) => {
    const res = await fetch(`${API_BASE}/capas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(capaData)
    });
    if (!res.ok) throw new Error('Failed to create CAPA');
    return await res.json();
  }
);

export const updateCAPAStatus = createAsyncThunk(
  'capa/updateStatus',
  async ({ capa_id, status }) => {
    const res = await fetch(`${API_BASE}/capas/${capa_id}/status?status=${status}`, {
      method: 'PUT'
    });
    if (!res.ok) throw new Error('Failed to update CAPA status');
    return await res.json();
  }
);

const capaSlice = createSlice({
  name: 'capa',
  initialState: {
    items: [],
    loading: false,
    error: null,
    filterStatus: 'ALL'
  },
  reducers: {
    setFilterStatus: (state, action) => {
      state.filterStatus = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCAPAs.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCAPAs.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(createCAPA.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })
      .addCase(updateCAPAStatus.fulfilled, (state, action) => {
        const idx = state.items.findIndex(item => item.id === action.payload.id);
        if (idx !== -1) {
          state.items[idx].status = action.payload.new_status;
        }
      });
  }
});

export const { setFilterStatus } = capaSlice.actions;
export default capaSlice.reducer;
