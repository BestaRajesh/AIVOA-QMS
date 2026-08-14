import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { triggerAgentWorkflow, setActiveNode } from '../store/agentSlice';
import { 
  Play, 
  GitBranch, 
  CheckCircle2, 
  AlertCircle, 
  Terminal, 
  Database, 
  Layers, 
  FileText, 
  ShieldCheck, 
  Sparkles,
  ArrowRight,
  Cpu
} from 'lucide-react';

export const AgentStudioView = () => {
  const dispatch = useDispatch();
  const selectedComplaint = useSelector((state) => state.complaints.selectedComplaint);
  const { isRunning, activeNode, executionLogs, lastResult, settings } = useSelector((state) => state.agent);

  const [selectedNodeDetails, setSelectedNodeDetails] = useState('triage');

  const nodes = [
    {
      id: 'triage',
      title: 'Node 1: Intake & Triage',
      icon: Layers,
      description: 'Categorizes defect severity and calculates patient safety risk score.',
      outputKey: 'triage_data',
      color: '#6366f1'
    },
    {
      id: 'traceability',
      title: 'Node 2: Batch Line Trace',
      icon: Database,
      description: 'Correlates BMR logs, API lot numbers, and compression/reactor lines.',
      outputKey: 'traceability_data',
      color: '#06b6d4'
    },
    {
      id: 'rca',
      title: 'Node 3: RCA 5-Whys & Fishbone',
      icon: GitBranch,
      description: 'Constructs 6-M Ishikawa diagram and 5-Whys cause-and-effect chain.',
      outputKey: 'ishikawa_data',
      color: '#a855f7'
    },
    {
      id: 'capa',
      title: 'Node 4: CAPA Generator',
      icon: FileText,
      description: 'Formulates targeted Corrective and Preventive Action plans.',
      outputKey: 'capa_recommendations',
      color: '#f59e0b'
    },
    {
      id: 'regulatory',
      title: 'Node 5: 21 CFR 211.198 Check',
      icon: ShieldCheck,
      description: 'Evaluates FDA 15-Day Adverse Event & 3-Day Field Alert Reportability.',
      outputKey: 'regulatory_assessment',
      color: '#10b981'
    }
  ];

  const handleRunWorkflow = () => {
    if (selectedComplaint) {
      dispatch(triggerAgentWorkflow({
        complaint_id: selectedComplaint.id,
        groq_api_key: settings.groq_api_key,
        model_name: settings.active_model
      }));
    }
  };

  const getOutputForNode = (nodeId) => {
    if (!selectedComplaint) return null;
    if (nodeId === 'triage') return selectedComplaint.ai_triage_data;
    if (nodeId === 'traceability') return selectedComplaint.traceability_data;
    if (nodeId === 'rca') return { ishikawa: selectedComplaint.ishikawa_data, five_whys: selectedComplaint.five_whys_data };
    if (nodeId === 'capa') return selectedComplaint.capa_recommendations;
    if (nodeId === 'regulatory') return selectedComplaint.regulatory_assessment;
    return null;
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1600px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Top Banner */}
      <div className="glass-panel" style={{ padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(168, 85, 247, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <GitBranch size={24} color="#c084fc" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#fff' }}>
                LangGraph Multi-Agent Orchestration Studio
              </h1>
              <span className="badge badge-purple" style={{ fontSize: '0.65rem' }}>
                <Cpu size={12} /> {settings.active_model || 'gemma2-9b-it'}
              </span>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Active Complaint Target: <strong style={{ color: '#ffffff' }}>{selectedComplaint ? `${selectedComplaint.complaint_number} - ${selectedComplaint.title}` : 'None Selected'}</strong>
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <button
            onClick={handleRunWorkflow}
            disabled={!selectedComplaint || isRunning}
            className="btn-primary"
            style={{ padding: '10px 20px', fontSize: '0.875rem' }}
          >
            {isRunning ? (
              <>
                <div className="animate-spin" style={{ width: '16px', height: '16px', border: '2px solid #fff', borderTopColor: 'transparent', borderRadius: '50%' }} />
                <span>Executing LangGraph State Graph...</span>
              </>
            ) : (
              <>
                <Play size={16} />
                <span>Execute Agent Graph</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Node Flow Visualizer */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <h2 style={{ fontSize: '0.95rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '20px' }}>
          LangGraph Workflow Node Topology
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px', position: 'relative' }}>
          {nodes.map((n, idx) => {
            const Icon = n.icon;
            const isCurrent = activeNode === n.id;
            const isSelected = selectedNodeDetails === n.id;
            const hasData = Boolean(getOutputForNode(n.id));

            return (
              <div
                key={n.id}
                onClick={() => setSelectedNodeDetails(n.id)}
                className={`glass-panel-interactive ${isCurrent ? 'node-running' : ''}`}
                style={{
                  padding: '16px',
                  borderColor: isSelected ? n.color : (hasData ? 'rgba(255,255,255,0.12)' : 'var(--border-color)'),
                  background: isSelected ? 'rgba(99, 102, 241, 0.12)' : 'var(--bg-glass)',
                  cursor: 'pointer',
                  position: 'relative'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: `${n.color}25`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon size={18} color={n.color} />
                  </div>

                  {hasData ? (
                    <CheckCircle2 size={16} color="#10b981" />
                  ) : (
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-dim)' }}>Step {idx + 1}</span>
                  )}
                </div>

                <h3 style={{ fontSize: '0.875rem', fontWeight: '700', color: '#fff', marginBottom: '4px' }}>
                  {n.title}
                </h3>

                <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', lineHeight: '1.3' }}>
                  {n.description}
                </p>

                {idx < 4 && (
                  <div style={{ position: 'absolute', right: '-12px', top: '50%', transform: 'translateY(-50%)', zIndex: 10 }}>
                    <ArrowRight size={14} color="var(--text-dim)" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Detail Inspector & Live Console Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        
        {/* Node Inspector Output */}
        <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={16} color="#818cf8" />
              <h3 style={{ fontSize: '0.95rem', fontWeight: '700', color: '#fff' }}>
                Inspector: {nodes.find(n => n.id === selectedNodeDetails)?.title}
              </h3>
            </div>
            <span className="badge badge-purple" style={{ fontSize: '0.65rem' }}>
              JSON Schema Output
            </span>
          </div>

          <pre style={{ 
            background: 'rgba(15, 23, 42, 0.9)', 
            padding: '14px', 
            borderRadius: '8px', 
            border: '1px solid var(--border-color)',
            color: '#38bdf8', 
            fontSize: '0.78rem',
            fontFamily: 'monospace',
            overflowX: 'auto',
            maxHeight: '380px'
          }}>
            {JSON.stringify(getOutputForNode(selectedNodeDetails) || { message: "Execute agent workflow to view live node output." }, null, 2)}
          </pre>
        </div>

        {/* Execution Terminal Logs */}
        <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Terminal size={16} color="#10b981" />
              <h3 style={{ fontSize: '0.95rem', fontWeight: '700', color: '#fff' }}>
                LangGraph Live Execution Stream
              </h3>
            </div>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
              {executionLogs.length} events logged
            </span>
          </div>

          <div style={{ 
            background: 'rgba(9, 13, 22, 0.95)', 
            padding: '14px', 
            borderRadius: '8px', 
            border: '1px solid var(--border-color)',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            fontFamily: 'monospace',
            fontSize: '0.75rem',
            maxHeight: '380px',
            overflowY: 'auto'
          }}>
            {executionLogs.length > 0 ? (
              executionLogs.map((log, idx) => (
                <div key={idx} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                  <span style={{ color: '#10b981' }}>[OK]</span>
                  <div>
                    <span style={{ color: '#c084fc', fontWeight: '600' }}>{log.node}:</span>{' '}
                    <span style={{ color: '#e2e8f0' }}>{log.detail}</span>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ color: 'var(--text-dim)', textAlign: 'center', padding: '20px' }}>
                Click "Execute Agent Graph" to view real-time state transition events.
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
