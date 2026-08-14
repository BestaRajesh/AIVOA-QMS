import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { createComplaint, uploadComplaintDocument } from '../store/complaintSlice';
import { triggerAgentWorkflow } from '../store/agentSlice';
import { setActiveTab } from '../store/uiSlice';
import { 
  FileUp, 
  PlusCircle, 
  Sparkles, 
  FileText, 
  Building, 
  Pill, 
  AlertTriangle,
  UploadCloud,
  CheckCircle,
  FileCheck
} from 'lucide-react';

export const IntakeView = () => {
  const dispatch = useDispatch();

  const [activeSubTab, setActiveSubTab] = useState('upload'); // 'upload' | 'manual'
  
  // Manual Form State
  const [formData, setFormData] = useState({
    title: '',
    customer_name: '',
    customer_type: 'Hospital / Pharmacy',
    intake_channel: 'PORTAL',
    product_id: 1,
    batch_number: '',
    severity: 'CRITICAL',
    description: ''
  });

  // File Upload State
  const [file, setFile] = useState(null);
  const [customerNameUpload, setCustomerNameUpload] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    const resultAction = await dispatch(createComplaint(formData));
    if (createComplaint.fulfilled.match(resultAction)) {
      const newComplaint = resultAction.payload;
      dispatch(triggerAgentWorkflow({ complaint_id: newComplaint.id }));
      dispatch(setActiveTab('agent_studio'));
    }
  };

  const handleFileUploadSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;

    setIsUploading(true);
    const resultAction = await dispatch(uploadComplaintDocument({ 
      file, 
      customer_name: customerNameUpload || 'Document Ingestion Portal' 
    }));
    setIsUploading(false);

    if (uploadComplaintDocument.fulfilled.match(resultAction)) {
      const newComplaint = resultAction.payload;
      dispatch(triggerAgentWorkflow({ complaint_id: newComplaint.id }));
      dispatch(setActiveTab('agent_studio'));
    }
  };

  const loadSampleDocument = (sampleType) => {
    if (sampleType === 'paracetamol') {
      setFormData({
        title: 'Paracetamol 500mg Dissolution Rate Failure at Stability Day 30',
        customer_name: 'Apex Health System Pharmacy',
        customer_type: 'Hospital Purchaser',
        intake_channel: 'EMAIL',
        product_id: 1,
        batch_number: 'BATCH-PAR-2026-081',
        severity: 'CRITICAL',
        description: 'Dissolution testing at Q=45 min yielded 71.2% (USP specification >= 80%). Multiple hospital units reported delayed therapeutic fever control in patients.'
      });
    } else if (sampleType === 'metformin') {
      setFormData({
        title: 'Metformin Hydrochloride API Lot BATCH-MET-API-2026-04 Yellow Tint & Thermal Odor',
        customer_name: 'Global BioPharma Formulations Ltd',
        customer_type: 'API B2B Customer',
        intake_channel: 'PDF',
        product_id: 2,
        batch_number: 'BATCH-MET-API-2026-04',
        severity: 'MAJOR',
        description: 'Customer reported yellowish tint and thermal degradation odor during receiving inspection. Specification requires white crystalline powder.'
      });
    } else if (sampleType === 'ceftriaxone') {
      setFormData({
        title: 'Ceftriaxone Injection 1g Batch BATCH-CEF-2026-102 Micro-Crack Hairline Defect',
        customer_name: 'National Medical Wholesale',
        customer_type: 'Distributor',
        intake_channel: 'PORTAL',
        product_id: 3,
        batch_number: 'BATCH-CEF-2026-102',
        severity: 'CRITICAL',
        description: 'Discovered hairline glass cracks in 14 vials of Ceftriaxone Sodium 1g sterile injection during outer carton unpacking.'
      });
    }
    setActiveSubTab('manual');
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Sub-Tab Navigation Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#ffffff' }}>Pharma Complaint Intake & Ingestion</h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Log customer complaints via AI document parsing or standardized QMS intake form.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px', background: 'rgba(15, 23, 42, 0.8)', padding: '4px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
          <button
            onClick={() => setActiveSubTab('upload')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              borderRadius: '6px',
              fontSize: '0.85rem',
              fontWeight: '600',
              color: activeSubTab === 'upload' ? '#ffffff' : 'var(--text-muted)',
              background: activeSubTab === 'upload' ? 'var(--primary)' : 'transparent',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            <UploadCloud size={16} />
            <span>Document / PDF Ingest</span>
          </button>

          <button
            onClick={() => setActiveSubTab('manual')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              borderRadius: '6px',
              fontSize: '0.85rem',
              fontWeight: '600',
              color: activeSubTab === 'manual' ? '#ffffff' : 'var(--text-muted)',
              background: activeSubTab === 'manual' ? 'var(--primary)' : 'transparent',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            <PlusCircle size={16} />
            <span>Standard Intake Form</span>
          </button>
        </div>
      </div>

      {/* Quick Sample Presets Banner */}
      <div className="glass-panel" style={{ padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(99, 102, 241, 0.08)', borderColor: 'rgba(99, 102, 241, 0.2)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Sparkles size={20} color="#818cf8" />
          <div>
            <p style={{ fontSize: '0.875rem', fontWeight: '700', color: '#ffffff' }}>Demo Case Presets (API & FDF Quality Defects)</p>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Load a pre-configured realistic pharma complaint to test the AI Agent workflow.</p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={() => loadSampleDocument('paracetamol')} className="btn-secondary" style={{ fontSize: '0.75rem', padding: '6px 10px' }}>
            Paracetamol Tablet Dissolution
          </button>
          <button onClick={() => loadSampleDocument('metformin')} className="btn-secondary" style={{ fontSize: '0.75rem', padding: '6px 10px' }}>
            Metformin API Discoloration
          </button>
          <button onClick={() => loadSampleDocument('ceftriaxone')} className="btn-secondary" style={{ fontSize: '0.75rem', padding: '6px 10px' }}>
            Ceftriaxone Vial Micro-Crack
          </button>
        </div>
      </div>

      {/* Intake SubTab Content */}
      {activeSubTab === 'upload' ? (
        
        <div className="glass-panel" style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(99, 102, 241, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <FileUp size={32} color="#818cf8" />
            </div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#fff', marginBottom: '6px' }}>
              Upload Customer Complaint Email / PDF Document
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              The AI Agent will automatically parse the document, extract batch numbers, identify product lines (API vs FDF), and initiate instant LangGraph triage.
            </p>
          </div>

          <form onSubmit={handleFileUploadSubmit} style={{ maxWidth: '600px', margin: '0 auto', width: '100%', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: '600', color: '#cbd5e1', display: 'block', marginBottom: '6px' }}>
                Customer / Health System Name
              </label>
              <input
                type="text"
                value={customerNameUpload}
                onChange={(e) => setCustomerNameUpload(e.target.value)}
                placeholder="e.g. Johns Hopkins Hospital Pharmacy / BioPharma Partner"
                className="input-field"
              />
            </div>

            <div style={{ border: '2px dashed rgba(99, 102, 241, 0.3)', borderRadius: '12px', padding: '24px', textAlign: 'center', background: 'rgba(15, 23, 42, 0.4)' }}>
              <input
                type="file"
                accept=".pdf,.txt,.doc,.docx"
                onChange={(e) => setFile(e.target.files[0])}
                id="file-upload"
                style={{ display: 'none' }}
              />
              <label htmlFor="file-upload" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                <FileCheck size={28} color={file ? '#10b981' : '#818cf8'} />
                <span style={{ fontSize: '0.875rem', fontWeight: '600', color: file ? '#10b981' : '#e2e8f0' }}>
                  {file ? file.name : 'Click to select PDF or Text document'}
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Supports PDF complaint reports, customer email exports (.txt), or lab COA documents
                </span>
              </label>
            </div>

            <button type="submit" disabled={!file || isUploading} className="btn-primary" style={{ padding: '12px', fontSize: '0.9rem' }}>
              <Sparkles size={18} />
              <span>{isUploading ? 'Parsing & Initiating AI Triage...' : 'Upload & Trigger LangGraph Agent'}</span>
            </button>
          </form>
        </div>

      ) : (

        /* Manual Form */
        <div className="glass-panel" style={{ padding: '32px' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: '700', color: '#fff', marginBottom: '20px' }}>
            Register New Pharmaceutical Quality Complaint
          </h2>

          <form onSubmit={handleManualSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            
            <div style={{ gridColumn: 'span 2' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: '600', color: '#cbd5e1', display: 'block', marginBottom: '6px' }}>
                Complaint Title / Brief Defect Summary *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Paracetamol 500mg Batch BATCH-PAR-2026-081 Dissolution Failure"
                className="input-field"
              />
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: '600', color: '#cbd5e1', display: 'block', marginBottom: '6px' }}>
                Complainant / Customer Name *
              </label>
              <input
                type="text"
                required
                value={formData.customer_name}
                onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                placeholder="e.g. Apex Health System Pharmacy"
                className="input-field"
              />
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: '600', color: '#cbd5e1', display: 'block', marginBottom: '6px' }}>
                Customer Type
              </label>
              <select
                value={formData.customer_type}
                onChange={(e) => setFormData({ ...formData, customer_type: e.target.value })}
                className="input-field"
              >
                <option value="Hospital Purchaser">Hospital / Health System</option>
                <option value="API B2B Customer">API Formulation B2B Partner</option>
                <option value="Wholesale Distributor">Wholesale Distributor</option>
                <option value="Retail Pharmacy">Retail Pharmacy</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: '600', color: '#cbd5e1', display: 'block', marginBottom: '6px' }}>
                Target Product *
              </label>
              <select
                value={formData.product_id}
                onChange={(e) => setFormData({ ...formData, product_id: parseInt(e.target.value) })}
                className="input-field"
              >
                <option value={1}>Paracetamol 500mg Tablets (FDF)</option>
                <option value={2}>Metformin Hydrochloride Pure API (API)</option>
                <option value={3}>Ceftriaxone Sodium 1g Sterile Injection (FDF)</option>
                <option value={4}>Atorvastatin Calcium API (API)</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: '600', color: '#cbd5e1', display: 'block', marginBottom: '6px' }}>
                Batch / Lot Number *
              </label>
              <input
                type="text"
                required
                value={formData.batch_number}
                onChange={(e) => setFormData({ ...formData, batch_number: e.target.value })}
                placeholder="e.g. BATCH-PAR-2026-081"
                className="input-field"
              />
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: '600', color: '#cbd5e1', display: 'block', marginBottom: '6px' }}>
                Initial Severity Triage
              </label>
              <select
                value={formData.severity}
                onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
                className="input-field"
              >
                <option value="CRITICAL">CRITICAL (High Patient Hazard / Dissolution / Sterility)</option>
                <option value="MAJOR">MAJOR (API Organoleptic Impurity / Color)</option>
                <option value="MINOR">MINOR (Packaging Label Cosmetology)</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: '600', color: '#cbd5e1', display: 'block', marginBottom: '6px' }}>
                Intake Source Channel
              </label>
              <select
                value={formData.intake_channel}
                onChange={(e) => setFormData({ ...formData, intake_channel: e.target.value })}
                className="input-field"
              >
                <option value="EMAIL">Email Report</option>
                <option value="PORTAL">QMS Portal</option>
                <option value="PDF">Lab PDF Document</option>
              </select>
            </div>

            <div style={{ gridColumn: 'span 2' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: '600', color: '#cbd5e1', display: 'block', marginBottom: '6px' }}>
                Detailed Quality Complaint Description *
              </label>
              <textarea
                required
                rows={5}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe non-conformance, stability test failure values, pharmacopeial limits exceeded..."
                className="input-field"
              />
            </div>

            <div style={{ gridColumn: 'span 2', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button type="submit" className="btn-primary" style={{ padding: '10px 24px' }}>
                <Sparkles size={18} />
                <span>Submit & Trigger AI Agent</span>
              </button>
            </div>

          </form>
        </div>

      )}

    </div>
  );
};
