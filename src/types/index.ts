export type UserRole = "cfo" | "ceo" | "cxo" | "admin";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

export interface Wallet {
  userId: string;
  userName: string;
  allocated: number;
  companySpent: number;
  reimbursed: number;
  balance: number;
  proofPending: number;
}

export interface Expense {
  id: string;
  userId: string;
  userName: string;
  category: string;
  amount: number;
  source: "company" | "personal";
  proofUrl?: string;
  status: "pending" | "approved" | "rejected" | "proof_pending";
  submittedOn: Date;
  notes?: string;
  rejectionReason?: string;
}

export interface CompanyExpense {
  id: string;
  type: string;
  vendor: string;
  amount: number;
  date: Date;
  paymentRef: string;
  proofUrl?: string;
  notes?: string;
}

export interface WalletAllocation {
  id: string;
  userId: string;
  amount: number;
  purpose: string;
  date: Date;
  attachmentUrl?: string;
}