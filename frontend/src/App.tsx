import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { DashboardLayout } from './layouts/DashboardLayout';
import { Dashboard } from './pages/Dashboard';
import { LiveDemo } from './pages/LiveDemo';
import { AttackSimulator } from './pages/AttackSimulator';
import { ProvenanceGraph } from './pages/ProvenanceGraph';
import { CapabilityManifests } from './pages/CapabilityManifests';
import { AuditLog } from './pages/AuditLog';
import { ToolExecution } from './pages/ToolExecution';
import { Settings } from './pages/Settings';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<DashboardLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="demo" element={<LiveDemo />} />
          <Route path="attacks" element={<AttackSimulator />} />
          <Route path="capabilities" element={<CapabilityManifests />} />
          <Route path="provenance" element={<ProvenanceGraph />} />
          <Route path="audit" element={<AuditLog />} />
          <Route path="tools" element={<ToolExecution />} />
          <Route path="settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
