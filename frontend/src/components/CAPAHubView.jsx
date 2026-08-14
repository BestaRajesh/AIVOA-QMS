import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchCAPAs, createCAPA, updateCAPAStatus, setFilterStatus } from '../store/capaSlice';
import { 
  ShieldCheck, 
  PlusCircle, 
  User, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  FileCheck
} from 'lucide-react';

export const CAPAHubView = () => {
  const dispatch = useDispatch();
  const { items: capas, loading, filterStatus } = useSelector((state) => state.capa);
  const selectedComplaint = useSelector((state) => state.complaints.selectedComplaint);

  const [showModal, setShowModal] = useState(false);
  const [newCapa, setNewCapa] = useState({
    complaint_id: selectedComplaint?.id || 1,
    capa_type: 'CORRECTIVE',
    title: '',
    description: '',
    owner: '',
    target_date: '2026-08-30',
    effectiveness_criteria: ''
  });

  useEffect(() => {
    dispatch(fetchCAPAs(filterStatus));
  }, [dispatch, filterStatus]);

  const handleCreateCAPA = async (e) => {
    e.preventDefault();
    await dispatch(createCAPA({
      ...newCapa,
      complaint_id: selectedComplaint?.id || 1
    }));
    setShowModal(false);
    setNewCapa({
      complaint_id: 1,
      capa_type: 'CORRECTIVE',
      title: '',
      description: '',
      owner: '',
      target_date: '2026-08-30',
      effectiveness_criteria: ''
    });
  };

  const handleStatusToggle = (capaId, currentStatus) => {
    const nextStatus = currentStatus === 'OPEN' ? 'IN_PROGRESS' : (currentStatus === 'IN_PROGRESS' ? 'COMPLETED' : 'VERIFIED');
    dispatch(updateCAPAStatus({ capa_id: capaId, status: nextStatus }));
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1600px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Header */}
      <div className="glass-panel" style={{ padding: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ShieldCheck size={24} color="#6ee7b7" />
          </div>
          <div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#fff' }}>
              CAPA Hub (Corrective & Preventive Action Management)
            </h1>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Closed-loop QMS CAPA tracking and effectiveness verification under ICH Q10 guidelines.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <select
            value={filterStatus}
            onChange={(e) => dispatch(setFilterStatus(e.target.value))}
            className="input-field"
            style={{ width: 'auto', padding: '8px 14px', fontSize: '0.8rem' }}
          >
            <option value="ALL">All CAPA Statuses</option>
            <option value="OPEN">Open</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
            <option value="VERIFIED">Verified Effective</option>
          </select>

          <button onClick={() => setShowModal(true)} className="btn-primary" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
            <PlusCircle size={16} />
            <span>Create New CAPA</span>
          </button>
        </div>
      </div>

      {/* CAPA Items Table */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-dim)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                <th style={{ padding: '12px 16px' }}>CAPA #</th>
                <th style={{ padding: '12px 16px' }}>Type & Title</th>
                <th style={{ padding: '12px 16px' }}>Owner</th>
                <th style={{ padding: '12px 16px' }}>Target Date</th>
                <th style={{ padding: '12px 16px' }}>Status</th>
                <th style={{ padding: '12px 16px', textAlign: 'right' }}>Advance Status</th>
              </tr>
            </thead>
            <tbody>
              {capas.map((capa) => (
                <tr key={capa.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  
                  <td style={{ padding: '16px', fontWeight: '700', color: '#cbd5e1', fontFamily: 'monospace' }}>
                    {capa.capa_number}
                  </td>

                  <td style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span className={`badge ${capa.capa_type === 'CORRECTIVE' ? 'badge-critical' : 'badge-purple'}`} style={{ fontSize: '0.65rem' }}>
                        {capa.capa_type}
                      </span>
                      <span style={{ fontWeight: '600', color: '#ffffff' }}>{capa.title}</span>
                    </div>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{capa.description}</p>
                  </td>

                  <td style={{ padding: '16px', color: '#e2e8f0', fontSize: '0.8rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <User size={14} color="#818cf8" />
                      <span>{capa.owner}</span>
                    </div>
                  </td>

                  <td style={{ padding: '16px', color: '#94a3b8', fontSize: '0.8rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Calendar size={14} color="#06b6d4" />
                      <span>{capa.target_date}</span>
                    </div>
                  </td>

                  <td style={{ padding: '16px' }}>
                    <span className={`badge ${capa.status === 'VERIFIED' ? 'badge-success' : 'badge-major'}`}>
                      {capa.status}
                    </span>
                  </td>

                  <td style={{ padding: '16px', textAlign: 'right' }}>
                    <button
                      onClick={() => handleStatusToggle(capa.id, capa.status)}
                      className="btn-secondary"
                      style={{ padding: '6px 12px', fontSize: '0.75rem' }}
                    >
                      <CheckCircle2 size={13} />
                      <span>Advance Phase</span>
                    </button>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '600px', padding: '24px' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#fff', marginBottom: '16px' }}>
              Create New QMS CAPA Record
            </h2>

            <form onSubmit={handleCreateCAPA} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              
              <div>
                <label style={{ fontSize: '0.8rem', color: '#cbd5e1', display: 'block', marginBottom: '4px' }}>CAPA Action Type</label>
                <select
                  value={newCapa.capa_type}
                  onChange={(e) => setNewCapa({ ...newCapa, capa_type: e.target.value })}
                  className="input-field"
                >
                  <option value="CORRECTIVE">Corrective Action (CA)</option>
                  <option value="PREVENTIVE">Preventive Action (PA)</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: '#cbd5e1', display: 'block', marginBottom: '4px' }}>Action Title *</label>
                <input
                  type="text"
                  required
                  value={newCapa.title}
                  onChange={(e) => setNewCapa({ ...newCapa, title: e.target.value })}
                  placeholder="e.g. Update SOP-MFG-042 and mandate LOD testing"
                  className="input-field"
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: '#cbd5e1', display: 'block', marginBottom: '4px' }}>Assigned Owner *</label>
                <input
                  type="text"
                  required
                  value={newCapa.owner}
                  onChange={(e) => setNewCapa({ ...newCapa, owner: e.target.value })}
                  placeholder="e.g. Quality Assurance Manager"
                  className="input-field"
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: '#cbd5e1', display: 'block', marginBottom: '4px' }}>Target Completion Date</label>
                <input
                  type="date"
                  value={newCapa.target_date}
                  onChange={(e) => setNewCapa({ ...newCapa, target_date: e.target.value })}
                  className="input-field"
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: '#cbd5e1', display: 'block', marginBottom: '4px' }}>Action Description</label>
                <textarea
                  rows={3}
                  value={newCapa.description}
                  onChange={(e) => setNewCapa({ ...newCapa, description: e.target.value })}
                  placeholder="Detailed execution steps..."
                  className="input-field"
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary">Save CAPA Record</button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
