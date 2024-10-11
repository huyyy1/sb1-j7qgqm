import React, { useState } from 'react';
import { Account, AllocationPercentages, TransactionHistory, Allocation } from '../types';
import { DollarSign, PieChart, ArrowRightCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import axios from 'axios';
import Modal from 'react-modal';

interface AllocationToolProps {
  accounts: Account[];
}

const AllocationTool: React.FC<AllocationToolProps> = ({ accounts }) => {
  const [income, setIncome] = useState<number>(0);
  const [percentages, setPercentages] = useState<AllocationPercentages>({
    gst: 10,
    serviceFee: 5,
    baseRevenue: 85,
    contractor: 70,
    core: 60,
    vault: 40,
  });
  const [balance, setBalance] = useState<number | null>(null);
  const [transactionHistory, setTransactionHistory] = useState<TransactionHistory[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [modalIsOpen, setModalIsOpen] = useState<boolean>(false);
  const [confirmationData, setConfirmationData] = useState<{ from: Account, to: Account, amount: number } | null>(null);

  const handlePercentageChange = (key: keyof AllocationPercentages, value: number) => {
    setPercentages(prev => ({ ...prev, [key]: value }));
  };

  const calculateAllocations = (): Allocation[] => {
    const gstAmount = income * (percentages.gst / 100);
    const serviceFeeAmount = income * (percentages.serviceFee / 100);
    const baseRevenueAmount = income * (percentages.baseRevenue / 100);
    const contractorAmount = baseRevenueAmount * (percentages.contractor / 100);
    const remainingRevenue = serviceFeeAmount;
    const coreAmount = remainingRevenue * (percentages.core / 100);
    const vaultAmount = remainingRevenue * (percentages.vault / 100);

    return [
      { name: 'GST', amount: gstAmount, percentage: percentages.gst },
      { name: 'Service Fee', amount: serviceFeeAmount, percentage: percentages.serviceFee },
      { name: 'Contractor', amount: contractorAmount, percentage: percentages.contractor },
      { name: 'Core', amount: coreAmount, percentage: percentages.core },
      { name: 'Vault', amount: vaultAmount, percentage: percentages.vault },
    ];
  };

  const checkBalance = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get('https://api.airwallex.com/api/v1/accounts/balance', {
        headers: { 'Authorization': 'Bearer YOUR_ACCESS_TOKEN' }
      });
      setBalance(response.data.available_balance);
      toast.success('Balance retrieved successfully');
    } catch (error) {
      console.error('Error checking balance:', error);
      toast.error('Failed to retrieve balance');
    } finally {
      setIsLoading(false);
    }
  };

  const initiateTransfer = (fromAccount: Account, toAccount: Account, amount: number) => {
    setConfirmationData({ from: fromAccount, to: toAccount, amount });
    setModalIsOpen(true);
  };

  const confirmTransfer = async () => {
    if (!confirmationData) return;
    setIsLoading(true);
    try {
      await axios.post('https://api.airwallex.com/api/v1/transfers', {
        from_account: confirmationData.from.accountNumber,
        to_account: confirmationData.to.accountNumber,
        amount: confirmationData.amount,
        currency: 'AUD'
      }, {
        headers: { 'Authorization': 'Bearer YOUR_ACCESS_TOKEN' }
      });

      const newTransaction: TransactionHistory = {
        id: Date.now().toString(),
        date: new Date().toISOString(),
        fromAccount: confirmationData.from.name,
        toAccount: confirmationData.to.name,
        amount: confirmationData.amount,
      };
      setTransactionHistory(prev => [...prev, newTransaction]);
      toast.success('Transfer completed successfully');
    } catch (error) {
      console.error('Error making transfer:', error);
      toast.error('Failed to complete transfer');
    } finally {
      setIsLoading(false);
      setModalIsOpen(false);
    }
  };

  const allocations = calculateAllocations();

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Income and Allocations</h2>
          <div className="flex items-center space-x-2">
            <DollarSign className="text-green-500" />
            <input
              type="number"
              value={income}
              onChange={(e) => setIncome(Number(e.target.value))}
              className="input-field"
              placeholder="Enter income amount"
            />
          </div>
          {Object.entries(percentages).map(([key, value]) => (
            <div key={key} className="flex items-center space-x-4">
              <label className="w-1/3">{key.charAt(0).toUpperCase() + key.slice(1)}:</label>
              <input
                type="range"
                min="0"
                max="100"
                value={value}
                onChange={(e) => handlePercentageChange(key as keyof AllocationPercentages, Number(e.target.value))}
                className="w-1/3"
              />
              <input
                type="number"
                value={value}
                onChange={(e) => handlePercentageChange(key as keyof AllocationPercentages, Number(e.target.value))}
                className="w-1/4 input-field"
              />
              <span>%</span>
            </div>
          ))}
        </div>
        <div>
          <h2 className="text-xl font-semibold mb-4">Allocation Summary</h2>
          {allocations.map((allocation, index) => (
            <div key={index} className="mb-2">
              <div className="flex justify-between items-center">
                <span>{allocation.name}</span>
                <span>${allocation.amount.toFixed(2)} ({allocation.percentage}%)</span>
              </div>
              <div className="progress-bar">
                <div
                  className="progress-bar-fill"
                  style={{
                    width: `${allocation.percentage}%`,
                    backgroundColor: ['#4CAF50', '#2196F3', '#FFC107', '#9C27B0', '#E91E63'][index % 5]
                  }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="flex justify-between items-center">
        <button onClick={checkBalance} className="btn-primary flex items-center">
          <PieChart className="mr-2" /> Check Balance
        </button>
        {balance !== null && (
          <div className="text-lg font-semibold">
            Balance: ${balance.toFixed(2)} AUD
          </div>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {accounts.map(account => (
          <div key={account.id} className={`p-4 rounded-lg ${
            account.type === 'income' ? 'bg-green-100' :
            account.type === 'core' ? 'bg-blue-100' :
            'bg-purple-100'
          }`}>
            <h3 className="font-semibold mb-2">{account.name}</h3>
            <button
              onClick={() => initiateTransfer(accounts[0], account, allocations.find(a => a.name.toLowerCase() === account.name.toLowerCase())?.amount || 0)}
              className="btn-secondary w-full flex items-center justify-center"
              disabled={account.type === 'income'}
            >
              <ArrowRightCircle className="mr-2" /> Transfer
            </button>
          </div>
        ))}
      </div>
      <div>
        <h2 className="text-xl font-semibold mb-4">Transaction History</h2>
        <ul className="space-y-2">
          {transactionHistory.map(transaction => (
            <li key={transaction.id} className="bg-gray-50 p-2 rounded">
              {transaction.date} - ${transaction.amount.toFixed(2)} from {transaction.fromAccount} to {transaction.toAccount}
            </li>
          ))}
        </ul>
      </div>
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={() => setModalIsOpen(false)}
        contentLabel="Transfer Confirmation"
        className="bg-white p-6 rounded-lg shadow-lg w-96 mx-auto mt-20"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
      >
        <h2 className="text-xl font-semibold mb-4">Confirm Transfer</h2>
        {confirmationData && (
          <p className="mb-4">
            Are you sure you want to transfer ${confirmationData.amount.toFixed(2)} from {confirmationData.from.name} to {confirmationData.to.name}?
          </p>
        )}
        <div className="flex justify-end space-x-4">
          <button onClick={() => setModalIsOpen(false)} className="btn-secondary">
            Cancel
          </button>
          <button onClick={confirmTransfer} className="btn-primary">
            Confirm
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default AllocationTool;