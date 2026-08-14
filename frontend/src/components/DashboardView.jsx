import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchComplaints, setSelectedComplaint, setFilters } from '../store/complaintSlice';
import { fetchAnalytics } from '../store/analyticsSlice';
import { triggerAgentWorkflow } from '../store/agentSlice';
import { setActiveTab } from '../store/uiSlice';
import { 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  FileText, 
  Filter, 
  Play, 
  ShieldAlert, 
  ArrowRight,
  Pill,
  Factory
} from 'lucide-react';

export const DashboardView = () => {
  const dispatch = useDispatch();
  const { items: complaints, loading, filters } = useSelector((state) => state.complaints);
  const { data: analytics } = useSelector((state) => state.analytics);

  useEffect(() => {
    dispatch(fetchComplaints(filters));
    dispatch(fetchAnalytics());
  }, [dispatch, filters]);

  const handleRunAgent = (e, complaintId) => {
    e.stopPropagation();
    dispatch(triggerAgentWorkflow({ complaint_id: complaintId }));
    dispatch(setActiveTab('agent_studio'));
  };

  const handleViewDossier = (complaint) => {
    dispatch(setSelectedComplaint(complaint));
    dispatch(setActiveTab('dossier'));
  };

  const metrics = analytics?.metrics || {
    total_complaints: complaints.length,
    critical_complaints: complaints.filter(c => c.severity === 'CRITICAL').length,
    open_capas: 2,
    avg_resolution_days: 4.2,
    compliance_rate: '99.4%'
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1600px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Top Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
        
        <div className="glass-panel" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(99, 102, 241, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FileText size={24} color="#818cf8" />
          </div>
          <div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '500' }}>Total Complaints</p>
            <h3 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#ffffff', lineHeight: 1.1 }}>{metrics.total_complaints}</h3>
            <span style={{ fontSize: '0.7rem', color: '#34d399' }}>Logged in QMS</span>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(239, 68, 68, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <AlertTriangle size={24} color="#fca5a5" />
          </div>
          <div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '500' }}>Critical Triage</p>
            <h3 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#fca5a5', lineHeight: 1.1 }}>{metrics.critical_complaints}</h3>
            <span style={{ fontSize: '0.7rem', color: '#f87171' }}>Requires Urgent QA Action</span>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(245, 158, 11, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ShieldAlert size={24} color="#fcd34d" />
          </div>
          <div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '500' }}>Active CAPA Actions</p>
            <h3 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#fcd34d', lineHeight: 1.1 }}>{metrics.open_capas}</h3>
            <span style={{ fontSize: '0.7rem', color: '#fbbf24' }}>Corrective & Preventive</span>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CheckCircle2 size={24} color="#6ee7b7" />
          </div>
          <div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '500' }}>21 CFR Compliance Rate</p>
            <h3 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#6ee7b7', lineHeight: 1.1 }}>{metrics.compliance_rate}</h3>
            <span style={{ fontSize: '0.7rem', color: '#34d399' }}>Audit Ready</span>
          </div>
        </div>

      </div>

      {/* Main Content Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: '24px' }}>
        
        {/* Complaints Table */}
        <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h2 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#fff' }}>Customer Complaints Dossier Registry</h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Pharma API & FDF Product Line Quality Records</p>
            </div>

            {/* Filters */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              
              <select 
                value={filters.severity} 
                onChange={(e) => dispatch(setFilters({ severity: e.target.value }))}
                className="input-field" 
                style={{ width: 'auto', padding: '6px 12px', fontSize: '0.8rem' }}
              >
                <option value="ALL">All Severities</option>
                <option value="CRITICAL">Critical</option>
                <option value="MAJOR">Major</option>
                <option value="MINOR">Minor</option>
              </select>

              <select 
                value={filters.product_type} 
                onChange={(e) => dispatch(setFilters({ product_type: e.target.value }))}
                className="input-field" 
                style={{ width: 'auto', padding: '6px 12px', fontSize: '0.8rem' }}
              >
                <option value="ALL">All Product Types</option>
                <option value="FDF">FDF (Finished Dosage)</option>
                <option value="API">API (Active Ingredient)</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-dim)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  <th style={{ padding: '12px 16px' }}>Complaint #</th>
                  <th style={{ padding: '12px 16px' }}>Title & Product</th>
                  <th style={{ padding: '12px 16px' }}>Batch #</th>
                  <th style={{ padding: '12px 16px' }}>Severity</th>
                  <th style={{ padding: '12px 16px' }}>Status</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {complaints.map((c) => (
                  <tr 
                    key={c.id} 
                    onClick={() => handleViewDossier(c)}
                    style={{ 
                      borderBottom: '1px solid rgba(255,255,255,0.04)', 
                      cursor: 'pointer',
                      transition: 'background 0.2s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: '14px 16px', fontWeight: '700', color: '#cbd5e1' }}>
                      {c.complaint_number}
                    </td>

                    <td style={{ padding: '14px 16px' }}>
                      <p style={{ fontWeight: '600', color: '#ffffff', fontSize: '0.875rem', marginBottom: '2px' }}>
                        {c.title}
                      </p>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {c.product?.product_type === 'API' ? <Factory size={13} color="#818cf8" /> : <Pill size={13} color="#34d399" />}
                        {c.product?.name || 'Pharma Product'}
                      </span>
                    </td>

                    <td style={{ padding: '14px 16px', color: '#94a3b8', fontFamily: 'monospace', fontSize: '0.8rem' }}>
                      {c.batch_number || 'N/A'}
                    </td>

                    <td style={{ padding: '14px 16px' }}>
                      <span className={`badge badge-${c.severity.toLowerCase()}`}>
                        {c.severity}
                      </span>
                    </td>

                    <td style={{ padding: '14px 16px' }}>
                      <span className="badge badge-purple" style={{ fontSize: '0.7rem' }}>
                        {c.status}
                      </span>
                    </td>

                    <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '8px' }}>
                        <button
                          onClick={(e) => handleRunAgent(e, c.id)}
                          className="btn-primary"
                          style={{ padding: '6px 12px', fontSize: '0.75rem' }}
                        >
                          <Play size={13} />
                          <span>Run Agent</span>
                        </button>
                        <button
                          onClick={() => handleViewDossier(c)}
                          className="btn-secondary"
                          style={{ padding: '6px 10px', fontSize: '0.75rem' }}
                        >
                          <ArrowRight size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>

        {/* Right Quality Insights Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* API vs FDF Distribution */}
          <div className="glass-panel" style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: '700', color: '#fff', marginBottom: '14px' }}>
              Product Category Split
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '4px' }}>
                  <span style={{ color: '#e2e8f0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Pill size={14} color="#10b981" /> Finished Dosage Form (FDF)
                  </span>
                  <span style={{ fontWeight: '700', color: '#10b981' }}>67%</span>
                </div>
                <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.06)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: '67%', height: '100%', background: '#10b981', borderRadius: '4px' }} />
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '4px' }}>
                  <span style={{ color: '#e2e8f0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Factory size={14} color="#6366f1" /> Active Ingredient (API)
                  </span>
                  <span style={{ fontWeight: '700', color: '#6366f1' }}>33%</span>
                </div>
                <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.06)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: '33%', height: '100%', background: '#6366f1', borderRadius: '4px' }} />
                </div>
              </div>
            </div>
          </div>

          {/* Root Cause Pareto Category */}
          <div className="glass-panel" style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: '700', color: '#fff', marginBottom: '14px' }}>
              Top Defect Categories
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {analytics?.root_cause_categories?.map((cat, idx) => (
                <div key={idx} style={{ padding: '10px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.04)' }}>
                  <p style={{ fontSize: '0.8rem', color: '#e2e8f0', fontWeight: '500' }}>{cat.category}</p>
                  <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    Impact Frequency: <strong style={{ color: '#818cf8' }}>{cat.percentage}%</strong>
                  </p>
                </div>
              )) || (
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Loading root cause data...</p>
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
