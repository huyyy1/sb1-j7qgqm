export interface Account {
  id: string;
  name: string;
  bsb: string;
  accountNumber: string;
  bankName: string;
  type: 'income' | 'core' | 'vault';
}

export interface AllocationPercentages {
  gst: number;
  serviceFee: number;
  baseRevenue: number;
  contractor: number;
  core: number;
  vault: number;
}

export interface TransactionHistory {
  id: string;
  date: string;
  fromAccount: string;
  toAccount: string;
  amount: number;
}

export interface Allocation {
  name: string;
  amount: number;
  percentage: number;
}