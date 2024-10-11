import React, { useState } from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AccountSetup from './components/AccountSetup';
import AllocationTool from './components/AllocationTool';
import { Account } from './types';

function App() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [setupComplete, setSetupComplete] = useState(false);

  const handleAccountSetup = (setupAccounts: Account[]) => {
    setAccounts(setupAccounts);
    setSetupComplete(true);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-4xl">
        <h1 className="text-3xl font-bold mb-6 text-center text-blue-600">Profit First Allocation Tool</h1>
        {!setupComplete ? (
          <AccountSetup onSetupComplete={handleAccountSetup} />
        ) : (
          <AllocationTool accounts={accounts} />
        )}
      </div>
      <ToastContainer position="bottom-right" />
    </div>
  );
}

export default App;