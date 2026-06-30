import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { LandingPage } from './components/LandingPage';
import { AuthPage } from './components/AuthPage';
import { DashboardView } from './components/DashboardView';
import { ReportIssueView } from './components/ReportIssueView';
import { InteractiveMapView } from './components/InteractiveMapView';
import { AIAssistantView } from './components/AIAssistantView';
import { LeaderboardView } from './components/LeaderboardView';
import { AdminPanelView } from './components/AdminPanelView';

const MainAppContent: React.FC = () => {
  const { activeTab, currentUser, authLoading } = useApp();

  // Show dynamic loader while resolving user session
  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs font-mono text-slate-400 font-bold uppercase tracking-widest animate-pulse">
            SpotFix Engine Initializing
          </span>
        </div>
      </div>
    );
  }

  // If user is at Landing page, let them view it without auth guards
  if (activeTab === 'landing') {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Navbar />
        <LandingPage />
      </div>
    );
  }

  // Auth Guard: If not signed in, show Auth Page
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Navbar />
        <AuthPage />
      </div>
    );
  }

  // Render active workspace tabs
  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView />;
      case 'report':
        return <ReportIssueView />;
      case 'map':
        return <InteractiveMapView />;
      case 'assistant':
        return <AIAssistantView />;
      case 'leaderboard':
        return <LeaderboardView />;
      case 'admin':
        return currentUser.role === 'admin' ? <AdminPanelView /> : <DashboardView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-800 selection:bg-blue-100 selection:text-blue-800">
      <Navbar />
      <main className="flex-1">
        {renderTabContent()}
      </main>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainAppContent />
    </AppProvider>
  );
}
