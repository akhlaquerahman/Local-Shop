export interface Wallet {
  id: string;
  userId: string;
  balance: number;
  currency: string;
  status: 'active' | 'frozen';
  updatedAt: string;
}

export type TransactionType = 'credit' | 'debit';
export type TransactionCategory = 
  | 'order_payment' 
  | 'order_refund' 
  | 'payout' 
  | 'delivery_earning' 
  | 'referral_bonus' 
  | 'commission';

export interface Transaction {
  id: string;
  walletId: string;
  amount: number;
  type: TransactionType;
  category: TransactionCategory;
  description: string;
  referenceId?: string; // Order ID or Payout ID
  status: 'pending' | 'completed' | 'failed';
  createdAt: string;
}

export interface Payout {
  id: string;
  sellerId: string;
  shopId: string;
  shopName: string;
  amount: number;
  status: 'pending' | 'approved' | 'rejected';
  bankDetails: {
    accountNumber: string;
    bankName: string;
    holderName: string;
  };
  requestedAt: string;
  processedAt?: string;
  rejectionReason?: string;
  transactionId?: string;
}
