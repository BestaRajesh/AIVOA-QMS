import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setActiveTab, toggleSettingsModal } from '../store/uiSlice';
import { 
  Activity, 
  FileText, 
  GitBranch, 
  Search, 
  ShieldCheck, 
  Settings, 
  Cpu, 
  CheckCircle2,
  Sparkles
} from 'lucide-react';

export const Header = () => {
  const dispatch = useDispatch();
  const activeTab = useSelector((state) => state.ui.activeTab);
  const settings = useSelector((state) => state.agent.settings);
  const isAgentRunning = useSelector((state) => state.agent.isRunning);

  const tabs = [
    { id: 'dashboard', label: 'QMS Dashboard', icon: Activity },
    { id: 'intake', label: 'Intake & AI Ingest', icon: FileText },
    { id: 'agent_studio', label: 'LangGraph Agent Studio', icon: GitBranch, badge: 'AI Node Graph' },
    { id: 'dossier', label: 'RCA & Dossier Inspector', icon: Search },
    { id: 'capa', label: 'CAPA Hub', icon: ShieldCheck }
  ];

  return (
    <header className="glass-panel" style={{ borderRadius: 0, borderTop: 'none', borderLeft: 'none', borderRight: 'none', padding: '12px 24px', position: 'sticky', top: 0, zIndex: 50 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', maxWidth: '1600px', margin: '0 auto' }}>
        
        {/* Brand Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ 
            width: '38px', 
            height: '38px', 
            borderRadius: '10px', 
            background: 'linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            boxShadow: '0 0 15px rgba(99, 102, 241, 0.4)'
          }}>
            <Sparkles size={20} color="#ffffff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontWeight: '800', fontSize: '1.25rem', letterSpacing: '-0.02em', background: 'linear-gradient(90deg, #ffffff 0%, #cbd5e1 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                AIVOA.AI
              </span>
              <span className="badge badge-purple" style={{ fontSize: '0.65rem' }}>Pharma QMS v1.0</span>
            </div>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              AI-Powered Customer Complaint Management (API & FDF)
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(15, 23, 42, 0.6)', padding: '4px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
          {tabs.map((t) => {
            const Icon = t.icon;
            const isActive = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => dispatch(setActiveTab(t.id))}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 14px',
                  borderRadius: '7px',
                  fontSize: '0.825rem',
                  fontWeight: isActive ? '600' : '500',
                  color: isActive ? '#ffffff' : 'var(--text-muted)',
                  background: isActive ? 'var(--primary)' : 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: isActive ? '0 0 12px var(--primary-glow)' : 'none'
                }}
              >
                <Icon size={16} color={isActive ? '#ffffff' : 'var(--text-muted)'} />
                <span>{t.label}</span>
                {t.badge && (
                  <span style={{ 
                    fontSize: '0.6rem', 
                    padding: '2px 5px', 
                    borderRadius: '4px', 
                    background: isActive ? 'rgba(255,255,255,0.2)' : 'rgba(99, 102, 241, 0.2)', 
                    color: isActive ? '#fff' : '#a5b4fc' 
                  }}>
                    {t.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* LLM Status & Settings Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          
          {/* Active Model Indicator */}
          <div 
            onClick={() => dispatch(toggleSettingsModal(true))}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px', 
              padding: '6px 12px', 
              background: 'rgba(255, 255, 255, 0.04)', 
              border: '1px solid var(--border-color)', 
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            <Cpu size={15} color={settings.has_custom_key ? '#10b981' : '#06b6d4'} />
            <div style={{ textAlign: 'left' }}>
              <p style={{ fontSize: '0.7rem', color: 'var(--text-dim)', lineHeight: 1 }}>Groq LLM</p>
              <p style={{ fontSize: '0.78rem', fontWeight: '600', color: '#e2e8f0', lineHeight: 1.2 }}>
                {settings.active_model || 'gemma2-9b-it'}
              </p>
            </div>
            <span style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: isAgentRunning ? '#f59e0b' : (settings.has_custom_key ? '#10b981' : '#06b6d4'),
              boxShadow: `0 0 8px ${isAgentRunning ? '#f59e0b' : '#10b981'}`
            }} />
          </div>

          {/* Settings Gear */}
          <button
            onClick={() => dispatch(toggleSettingsModal(true))}
            className="btn-secondary"
            style={{ padding: '8px', borderRadius: '8px' }}
            title="Groq LLM Settings"
          >
            <Settings size={18} />
          </button>
        </div>

      </div>
    </header>
  );
};
