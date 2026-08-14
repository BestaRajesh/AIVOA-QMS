import React from 'react';
import { useSelector } from 'react-redux';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { IntakeView } from './components/IntakeView';
import { AgentStudioView } from './components/AgentStudioView';
import { ComplaintDossierView } from './components/ComplaintDossierView';
import { CAPAHubView } from './components/CAPAHubView';
import { SettingsModal } from './components/SettingsModal';

export function App() {
  const activeTab = useSelector((state) => state.ui.activeTab);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />

      <main style={{ flex: 1, paddingBottom: '40px' }}>
        {activeTab === 'dashboard' && <DashboardView />}
        {activeTab === 'intake' && <IntakeView />}
        {activeTab === 'agent_studio' && <AgentStudioView />}
        {activeTab === 'dossier' && <ComplaintDossierView />}
        {activeTab === 'capa' && <CAPAHubView />}
      </main>

      <SettingsModal />
    </div>
  );
}

export default App;
