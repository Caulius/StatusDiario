import React, { useState } from 'react';
import { AppProvider } from './context/AppContext';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import ImportData from './components/ImportData';
import DailyProgram from './components/DailyProgram';
import DailyStatus from './components/DailyStatus';
import Registers from './components/Registers';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'import':
        return <ImportData />;
      case 'daily-program':
        return <DailyProgram />;
      case 'daily-status':
        return <DailyStatus />;
      case 'registers':
        return <Registers />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <AppProvider>
      <Layout activeTab={activeTab} onTabChange={setActiveTab}>
        {renderContent()}
      </Layout>
    </AppProvider>
  );
}

export default App;