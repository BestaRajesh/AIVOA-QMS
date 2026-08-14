import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { triggerAgentWorkflow } from '../store/agentSlice';
import { setActiveTab } from '../store/uiSlice';
import { 
  FileText, 
  GitBranch, 
  Database, 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle, 
  Pill, 
  Factory, 
  User, 
  Calendar,
  Sparkles,
  ArrowRight,
  ChevronRight
} from 'lucide-react';

export const ComplaintDossierView = () => {
  const dispatch = useDispatch();
  const complaint = useSelector((state) => state.complaints.selectedComplaint);

  const [activeDossierTab, setActiveDossierTab] = useState('rca'); // 'rca' | 'traceability' | 'regulatory'

  if (!complaint) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
        <p>No complaint selected. Please choose a complaint from the QMS Dashboard.</p>
      </div>
    );
  }

  const ishikawa = complaint.ishikawa_data || {
    Man: ["Operator binder addition speed variation"],
    Machine: ["Compression roller pressure drift"],
    Material: ["Microcrystalline Cellulose binder moisture spike"],
    Method: ["Fluid bed drying time reduced by 10 mins"],
    Measurement: ["USP dissolution bath RPM verified"],
    Environment: ["Humidity spike in compression room"]
  };

  const fiveWhys = complaint.five_whys_data || [
    { step: 1, question: "Why did dissolution fail?", answer: "Tablet disintegration was prolonged." },
    { step: 2, question: "Why was disintegration prolonged?", answer: "Tablet matrix density was too high due to high compression." },
    { step: 3, question: "Why was high compression applied?", answer: "Operator raised pressure to stop granule capping." },
    { step: 4, question: "Why were granules capping?", answer: "Excess moisture retained from shortened drying cycle." },
    { step: 5, question: "Why was drying cycle shortened?", answer: "SOP-MFG-042 lacked mandatory Loss-On-Drying (LOD) check requirement." }
  ];

  const trace = complaint.traceability_data || {
    line_id: "Compression Line 3",
    api_lot: "LOT-MET-API-994",
    manufacture_date: "2026-06-15",
    yield_percentage: 98.4,
    deviation_flag: true,
    known_deviations: "Compression force fluctuation recorded."
  };

  const reg = complaint.regulatory_assessment || {
    regulatory_framework: "FDA 21 CFR 211.198 / EU GMP Annex 16",
    reportability: "REPORTABLE - Field Alert Report (FAR) recommended",
    risk_level: "Class II Hazard Risk"
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1600px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Dossier Header Banner */}
      <div className="glass-panel" style={{ padding: '24px', borderLeft: complaint.severity === 'CRITICAL' ? '4px solid #ef4444' : '4px solid #f59e0b' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <span className="badge badge-purple" style={{ fontSize: '0.75rem' }}>{complaint.complaint_number}</span>
              <span className={`badge badge-${complaint.severity.toLowerCase()}`}>{complaint.severity} SEVERITY</span>
              <span className="badge badge-success">{complaint.status}</span>
            </div>
            <h1 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#ffffff', marginBottom: '6px' }}>
              {complaint.title}
            </h1>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
              <span>Complainant: <strong style={{ color: '#e2e8f0' }}>{complaint.customer_name}</strong></span>
              <span>•</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                {complaint.product?.product_type === 'API' ? <Factory size={14} color="#818cf8" /> : <Pill size={14} color="#34d399" />}
                Product: <strong style={{ color: '#e2e8f0' }}>{complaint.product?.name || 'Pharma Batch'}</strong>
              </span>
              <span>•</span>
              <span>Batch #: <strong style={{ color: '#38bdf8', fontFamily: 'monospace' }}>{complaint.batch_number || 'N/A'}</strong></span>
            </p>
          </div>

          <button
            onClick={() => {
              dispatch(triggerAgentWorkflow({ complaint_id: complaint.id }));
              dispatch(setActiveTab('agent_studio'));
            }}
            className="btn-primary"
            style={{ padding: '10px 18px' }}
          >
            <Sparkles size={16} />
            <span>Re-Run AI Agent</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '10px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
        <button
          onClick={() => setActiveDossierTab('rca')}
          className="btn-secondary"
          style={{
            background: activeDossierTab === 'rca' ? 'var(--primary)' : 'transparent',
            borderColor: activeDossierTab === 'rca' ? 'var(--primary)' : 'var(--border-color)',
            color: activeDossierTab === 'rca' ? '#fff' : 'var(--text-muted)'
          }}
        >
          <GitBranch size={16} />
          <span>Root Cause Analysis (Fishbone & 5-Whys)</span>
        </button>

        <button
          onClick={() => setActiveDossierTab('traceability')}
          className="btn-secondary"
          style={{
            background: activeDossierTab === 'traceability' ? 'var(--primary)' : 'transparent',
            borderColor: activeDossierTab === 'traceability' ? 'var(--primary)' : 'var(--border-color)',
            color: activeDossierTab === 'traceability' ? '#fff' : 'var(--text-muted)'
          }}
        >
          <Database size={16} />
          <span>Batch Genealogic Traceability</span>
        </button>

        <button
          onClick={() => setActiveDossierTab('regulatory')}
          className="btn-secondary"
          style={{
            background: activeDossierTab === 'regulatory' ? 'var(--primary)' : 'transparent',
            borderColor: activeDossierTab === 'regulatory' ? 'var(--primary)' : 'var(--border-color)',
            color: activeDossierTab === 'regulatory' ? '#fff' : 'var(--text-muted)'
          }}
        >
          <ShieldAlert size={16} />
          <span>21 CFR 211.198 Regulatory Report</span>
        </button>
      </div>

      {/* RCA Tab Content */}
      {activeDossierTab === 'rca' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* 6M Ishikawa Fishbone Diagram */}
          <div className="glass-panel" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <div>
                <h2 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#fff' }}>
                  Ishikawa 6-M Fishbone Diagram
                </h2>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Categorized quality risk contributors across Man, Machine, Material, Method, Measurement, Environment.
                </p>
              </div>
              <span className="badge badge-purple">AI Root Cause Synthesis</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
              {Object.entries(ishikawa).map(([cat, items]) => (
                <div key={cat} style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '16px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                  <h3 style={{ fontSize: '0.875rem', fontWeight: '700', color: '#818cf8', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {cat}
                  </h3>
                  <ul style={{ listStyleType: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {Array.isArray(items) ? items.map((it, idx) => (
                      <li key={idx} style={{ fontSize: '0.8rem', color: '#e2e8f0', display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                        <ChevronRight size={14} color="#06b6d4" style={{ flexShrink: 0, marginTop: '3px' }} />
                        <span>{it}</span>
                      </li>
                    )) : <li style={{ fontSize: '0.8rem', color: '#e2e8f0' }}>{String(items)}</li>}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* 5-Whys Root Cause Chain Tree */}
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#fff', marginBottom: '20px' }}>
              5-Whys Root Cause Decomposition Chain
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {fiveWhys.map((w, idx) => (
                <div 
                  key={idx}
                  style={{ 
                    padding: '14px 18px', 
                    borderRadius: '10px', 
                    background: idx === 4 ? 'rgba(239, 68, 68, 0.12)' : 'rgba(255, 255, 255, 0.03)',
                    border: idx === 4 ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid var(--border-color)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: '800', color: idx === 4 ? '#fca5a5' : '#818cf8' }}>
                      WHY #{w.step || idx + 1}:
                    </span>
                    <span style={{ fontSize: '0.875rem', fontWeight: '600', color: '#ffffff' }}>
                      {w.question}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.825rem', color: '#cbd5e1', paddingLeft: '24px' }}>
                    ➔ {w.answer}
                  </p>
                  {idx === 4 && (
                    <span style={{ marginTop: '6px', marginLeft: '24px', fontSize: '0.72rem', color: '#fca5a5', fontWeight: '700', textTransform: 'uppercase' }}>
                      ROOT CAUSE IDENTIFIED: Inadequate In-Process Quality Controls in Manufacturing SOP
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* Traceability Tab Content */}
      {activeDossierTab === 'traceability' && (
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#fff' }}>
            Batch Manufacturing Record (BMR) Genealogic Genealogy
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            
            <div style={{ padding: '16px', background: 'rgba(15, 23, 42, 0.6)', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Target Batch Number</p>
              <h4 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#38bdf8', fontFamily: 'monospace' }}>
                {trace.batch_number || complaint.batch_number}
              </h4>
            </div>

            <div style={{ padding: '16px', background: 'rgba(15, 23, 42, 0.6)', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Manufacturing Line / Unit</p>
              <h4 style={{ fontSize: '1rem', fontWeight: '700', color: '#fff' }}>
                {trace.line_id || 'Compression Press Line 3'}
              </h4>
            </div>

            <div style={{ padding: '16px', background: 'rgba(15, 23, 42, 0.6)', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>API Active Lot Number</p>
              <h4 style={{ fontSize: '1rem', fontWeight: '700', color: '#c084fc', fontFamily: 'monospace' }}>
                {trace.api_lot || 'LOT-MET-API-994'}
              </h4>
            </div>

            <div style={{ padding: '16px', background: 'rgba(15, 23, 42, 0.6)', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Recorded BMR Yield %</p>
              <h4 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#34d399' }}>
                {trace.yield_percentage || 98.4}%
              </h4>
            </div>

          </div>

          <div style={{ padding: '16px', background: 'rgba(245, 158, 11, 0.1)', borderRadius: '10px', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <AlertTriangle size={18} color="#fcd34d" />
              <h4 style={{ fontSize: '0.9rem', fontWeight: '700', color: '#fcd34d' }}>Historical Production Deviations</h4>
            </div>
            <p style={{ fontSize: '0.825rem', color: '#fef08a' }}>
              {trace.known_deviations || 'Compression force fluctuation noted during sub-lot run.'}
            </p>
          </div>
        </div>
      )}

      {/* Regulatory Tab Content */}
      {activeDossierTab === 'regulatory' && (
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#fff' }}>
            FDA 21 CFR 211.198 Regulatory Compliance Assessment
          </h2>

          <div style={{ padding: '20px', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '10px', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Regulatory Reportability Determination</p>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#fca5a5', marginTop: '4px' }}>
              {reg.reportability || 'REPORTABLE - Field Alert Report (FAR) Required'}
            </h3>
            <p style={{ fontSize: '0.8rem', color: '#cbd5e1', marginTop: '8px' }}>
              Governing Rule: FDA 21 CFR 211.198 (Written records of complaint) & EU GMP Annex 16. Out-of-Specification (OOS) dissolution on distributed batches triggers mandatory QA notification.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div style={{ padding: '16px', background: 'rgba(15, 23, 42, 0.6)', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Risk Classification</p>
              <p style={{ fontSize: '1rem', fontWeight: '700', color: '#fff', marginTop: '4px' }}>
                {reg.risk_level || 'Class II Hazard Risk'}
              </p>
            </div>

            <div style={{ padding: '16px', background: 'rgba(15, 23, 42, 0.6)', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Regulatory Framework</p>
              <p style={{ fontSize: '1rem', fontWeight: '700', color: '#818cf8', marginTop: '4px' }}>
                {reg.regulatory_framework || 'FDA 21 CFR 211.198'}
              </p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
