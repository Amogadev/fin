
import { addDays, addMonths, addYears } from 'date-fns';

export type User = {
  id: string;
  name: string;
  contact: string;
  idProof: string;
  faceImageUrl: string;
  faceImageBase64: string;
  createdAt: string;
  loans: Loan[];
  registrationType: 'Loan' | 'Diwali Fund';
};

export type Loan = {
  id: string;
  userId: string;
  amountRequested: number;
  interest: number;
  principal: number; // This is the disbursed amount
  totalOwed: number; // This is the repayment amount
  amountRepaid: number;
  status: 'Active' | 'Paid' | 'Overdue';
  loanType: 'Loan' | 'EMI';
  paymentFrequency: 'Daily' | 'Weekly' | 'Monthly' | 'Yearly';
  createdAt: string;
  dueDate: string;
  transactions: Transaction[];
};

export type Transaction = {
  id: string;
  loanId: string;
  type: 'Disbursement' | 'Repayment';
  amount: number;
  date: string;
};

export type Vault = {
  balance: number;
  totalLoansGiven: number; // disbursed amount
  totalInterestEarned: number; // expected earnings
};

// Initial state for the vault. In a real app, this would come from a persistent store.
const initialVaultState: Vault = {
  balance: 100000,
  totalLoansGiven: 0,
  totalInterestEarned: 0,
};


export type TransactionWithUser = Transaction & {
    userId: string;
    userName: string;
};

function getStoredUsers(): User[] {
  if (typeof window === 'undefined') return [];
  const tempUsersJson = localStorage.getItem('temp_new_users');
  return tempUsersJson ? JSON.parse(tempUsersJson) : [];
}

function getStoredLoans(): Record<string, Loan[]> {
  if (typeof window === 'undefined') return {};
  const tempLoansJson = localStorage.getItem('temp_new_loans');
  return tempLoansJson ? JSON.parse(tempLoansJson) : {};
}

function checkAndUpdateLoanStatus(loan: Loan): Loan {
    if (loan.status === 'Paid') {
        return loan;
    }

    const today = new Date();
    today.setHours(0,0,0,0); // Normalize today's date
    const dueDate = new Date(loan.dueDate);
     dueDate.setHours(0,0,0,0); // Normalize due date

    if (today > dueDate) {
        return { ...loan, status: 'Overdue' };
    }

    return { ...loan, status: 'Active' };
}


function mergeData(users: User[], allLoans: Record<string, Loan[]>): User[] {
    return users.map(user => {
        const userLoans = (allLoans[user.id] || []).map(checkAndUpdateLoanStatus);
        const existingLoanIds = new Set(user.loans.map(l => l.id));
        const newLoans = userLoans.filter((l: Loan) => !existingLoanIds.has(l.id));
        
        const updatedExistingLoans = user.loans.map(checkAndUpdateLoanStatus);
        
        return {
            ...user,
            loans: [...updatedExistingLoans, ...newLoans]
        };
    });
}


export const getVaultData = async (): Promise<Vault> => {
  const users = await getUsers();
  
  let totalDisbursed = 0;
  let totalInterest = 0;
  let totalRepaid = 0;

  users.forEach(user => {
    user.loans.forEach(loan => {
      totalDisbursed += loan.principal;
      totalInterest += loan.interest;
      loan.transactions.forEach(tx => {
        if(tx.type === 'Repayment') {
            totalRepaid += tx.amount;
        }
      })
    });
  });
  
  const currentBalance = initialVaultState.balance - totalDisbursed + totalRepaid;

  return Promise.resolve({
      balance: currentBalance,
      totalLoansGiven: totalDisbursed,
      totalInterestEarned: totalInterest,
  });
};

export const getUsers = async (): Promise<User[]> => {
  if (typeof window === 'undefined') return [];

  const storedUsers = getStoredUsers();
  const storedLoans = getStoredLoans();

  const mergedUsers = storedUsers.map(user => {
      const userLoans = (storedLoans[user.id] || []).map(checkAndUpdateLoanStatus);
      return { ...user, loans: userLoans };
  });

  return Promise.resolve(mergedUsers);
};

export const getUserById = async (id: string): Promise<User | undefined> => {
  const allUsers = await getUsers();
  const user = allUsers.find(u => u.id === id);
  if (user) {
    user.loans = user.loans.map(checkAndUpdateLoanStatus);
  }
  return Promise.resolve(user);
};

export const getAllTransactions = async (): Promise<TransactionWithUser[]> => {
    const allUsers = await getUsers();
    const allTxs = allUsers.flatMap(user => {
        const userLoans = user.loans || [];
        return userLoans.flatMap(loan => 
            (loan.transactions || []).map(tx => ({
                ...tx,
                userId: user.id,
                userName: user.name,
            }))
        )
    });
    return Promise.resolve(allTxs.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
}

    