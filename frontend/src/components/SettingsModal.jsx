import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { toggleSettingsModal } from '../store/uiSlice';
import { fetchSettings, saveSettings } from '../store/agentSlice';
import { Key, Cpu, X, Check, Sparkles, ShieldCheck } from 'lucide-react';

export const SettingsModal = () => {
  const dispatch = useDispatch();
  const isOpen = useSelector((state) => state.ui.isSettingsOpen);
  const settings = useSelector((state) => state.agent.settings);

  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState('gemma2-9b-it');
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    dispatch(fetchSettings());
  }, [dispatch]);

  useEffect(() => {
    if (settings) {
      setApiKey(settings.groq_api_key || '');
      setModel(settings.active_model || 'gemma2-9b-it');
    }
  }, [settings]);

  if (!isOpen) return null;

  const handleSave = async (e) => {
    e.preventDefault();
    await dispatch(saveSettings({
      groq_api_key: apiKey,
      active_model: model,
      auto_trigger_agent: true
    }));
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      dispatch(toggleSettingsModal(false));
    }, 1200);
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '520px', padding: '28px', position: 'relative' }}>
        
        <button
          onClick={() => dispatch(toggleSettingsModal(false))}
          style={{ position: 'absolute', right: '20px', top: '20px', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
        >
          <X size={20} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(99, 102, 241, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Key size={20} color="#818cf8" />
          </div>
          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#fff' }}>Groq LLM Configuration</h2>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Configure API Key & Model Settings</p>
          </div>
        </div>

        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: '600', color: '#cbd5e1', display: 'block', marginBottom: '6px' }}>
              Groq API Key (Optional / Provided Token)
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="gsk_..."
              className="input-field"
            />
            <p style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '4px' }}>
              Create a free key at <a href="https://console.groq.com/keys" target="_blank" rel="noreferrer" style={{ color: '#818cf8' }}>console.groq.com</a>. If omitted, built-in intelligent fallback model operates.
            </p>
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: '600', color: '#cbd5e1', display: 'block', marginBottom: '6px' }}>
              Target Model Selection
            </label>
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="input-field"
            >
              <option value="gemma2-9b-it">gemma2-9b-it (Mandatory Model)</option>
              <option value="llama-3.3-70b-versatile">llama-3.3-70b-versatile (Context Model)</option>
            </select>
          </div>

          <div style={{ padding: '12px', background: 'rgba(16, 185, 129, 0.08)', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.2)', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <ShieldCheck size={20} color="#34d399" />
            <p style={{ fontSize: '0.75rem', color: '#6ee7b7' }}>
              Offline Smart Heuristics Enabled: Complete system functions out-of-the-box even without an active key.
            </p>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
            <button type="button" onClick={() => dispatch(toggleSettingsModal(false))} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              {savedSuccess ? <Check size={16} /> : <Sparkles size={16} />}
              <span>{savedSuccess ? 'Saved!' : 'Save Settings'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
