import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const API_BASE = 'http://localhost:8000/api/v1';

export const fetchComplaints = createAsyncThunk(
  'complaints/fetchComplaints',
  async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.status && filters.status !== 'ALL') params.append('status', filters.status);
    if (filters.severity && filters.severity !== 'ALL') params.append('severity', filters.severity);
    if (filters.product_type && filters.product_type !== 'ALL') params.append('product_type', filters.product_type);

    const res = await fetch(`${API_BASE}/complaints?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch complaints');
    return await res.json();
  }
);

export const fetchComplaintById = createAsyncThunk(
  'complaints/fetchComplaintById',
  async (id) => {
    const res = await fetch(`${API_BASE}/complaints/${id}`);
    if (!res.ok) throw new Error('Failed to fetch complaint dossier');
    return await res.json();
  }
);

export const createComplaint = createAsyncThunk(
  'complaints/createComplaint',
  async (complaintData) => {
    const res = await fetch(`${API_BASE}/complaints`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(complaintData)
    });
    if (!res.ok) throw new Error('Failed to register complaint');
    return await res.json();
  }
);

export const uploadComplaintDocument = createAsyncThunk(
  'complaints/uploadComplaintDocument',
  async ({ file, customer_name }) => {
    const formData = new FormData();
    formData.append('file', file);
    if (customer_name) formData.append('customer_name', customer_name);

    const res = await fetch(`${API_BASE}/complaints/upload`, {
      method: 'POST',
      body: formData
    });
    if (!res.ok) throw new Error('Document ingestion failed');
    return await res.json();
  }
);

const complaintSlice = createSlice({
  name: 'complaints',
  initialState: {
    items: [],
    selectedComplaint: null,
    loading: false,
    error: null,
    filters: {
      status: 'ALL',
      severity: 'ALL',
      product_type: 'ALL'
    }
  },
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    setSelectedComplaint: (state, action) => {
      state.selectedComplaint = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchComplaints.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchComplaints.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
        if (action.payload.length > 0 && !state.selectedComplaint) {
          state.selectedComplaint = action.payload[0];
        }
      })
      .addCase(fetchComplaints.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(fetchComplaintById.fulfilled, (state, action) => {
        state.selectedComplaint = action.payload;
      })
      .addCase(createComplaint.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
        state.selectedComplaint = action.payload;
      })
      .addCase(uploadComplaintDocument.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
        state.selectedComplaint = action.payload;
      });
  }
});

export const { setFilters, setSelectedComplaint } = complaintSlice.actions;
export default complaintSlice.reducer;
