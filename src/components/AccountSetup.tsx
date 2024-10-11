import React, { useState } from 'react';
import { Account } from '../types';

interface AccountSetupProps {
  onSetupComplete: (accounts: Account[]) => void;
}

const AccountSetup: React.FC<AccountSetupProps> = ({ onSetupComplete }) => {
  const [accounts, setAccounts] = useState<Account[]>([
    { id: '1', name: 'Income', bsb: '', accountNumber: '', bankName: '', type: 'income' },
    { id: '2', name: 'GST', bsb: '', accountNumber: '', bankName: '', type: 'core' },
    { id: '3', name: 'Profit', bsb: '', accountNumber: '', bankName: '', type: 'vault' },
    { id: '4', name: 'Tax', bsb: '', accountNumber: '', bankName: '', type: 'vault' },
    { id: '5', name: "Owner's Pay", bsb: '', accountNumber: '', bankName: '', type: 'core' },
    { id: '6', name: 'Expenses', bsb: '', accountNumber: '', bankName: '', type: 'core' },
  ]);

  const handleInputChange = (id: string, field: keyof Account, value: string) => {
    setAccounts(accounts.map(account =>
      account.id === id ? { ...account, [field]: value } : account
    ));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (accounts.every(account => account.bsb && account.accountNumber && account.bankName)) {
      onSetupComplete(accounts);
    } else {
      alert('Please fill in all fields for each account.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {accounts.map(account => (
        <div key={account.id} className={`p-4 rounded-lg ${
          account.type === 'income' ? 'bg-green-50' :
          account.type === 'core' ? 'bg-blue-50' :
          'bg-purple-50'
        }`}>
          <h3 className="text-lg font-semibold mb-2">{account.name} Account</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="text"
              placeholder="BSB"
              value={account.bsb}
              onChange={(e) => handleInputChange(account.id, 'bsb', e.target.value)}
              className="input-field"
            />
            <input
              type="text"
              placeholder="Account Number"
              value={account.accountNumber}
              onChange={(e) => handleInputChange(account.id, 'accountNumber', e.target.value)}
              className="input-field"
            />
            <input
              type="text"
              placeholder="Bank Name"
              value={account.bankName}
              onChange={(e) => handleInputChange(account.id, 'bankName', e.target.value)}
              className="input-field"
            />
          </div>
        </div>
      ))}
      <button type="submit" className="btn-primary w-full">
        Complete Setup
      </button>
    </form>
  );
};

export default AccountSetup;