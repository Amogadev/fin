
import { addDays, addMonths, addYears, subDays } from 'date-fns';

export type User = {
  id: string;
  name: string;
  contact: string;
  idProof: string;
  faceImageUrl: string;
  faceImageBase64?: string; // This is now optional
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
  loanType: 'Loan' | 'EMI' | 'Diwali Fund';
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
  diwaliFundUsers: number;
  totalDiwaliFundContributions: number;
};

export type LoanReport = {
    loanId: string;
    userName: string;
    startDate: string;
    disbursedAmount: number;
    remainingBalance: number;
};

export type DiwaliFundReport = {
    userId: string;
    userName: string;
    contributionAmount: number;
    frequency: 'Daily' | 'Weekly' | 'Monthly' | 'Yearly';
    endDate: string;
};

// Initial state for the vault. In a real app, this would come from a persistent store.
const initialVaultState: Vault = {
  balance: 100000,
  totalLoansGiven: 0,
  totalInterestEarned: 0,
  diwaliFundUsers: 0,
  totalDiwaliFundContributions: 0,
};


export type TransactionWithUser = Transaction & {
    userId: string;
    userName: string;
};

// --- DUMMY DATA INJECTION ---

const MOCK_USERS: User[] = [
    { id: 'user1', name: 'குமார்', contact: '+91 9876543210', idProof: 'ADHR1234', faceImageUrl: 'https://picsum.photos/seed/user1/128/128', createdAt: subDays(new Date(), 10).toISOString(), loans: [], registrationType: 'Loan' },
    { id: 'user2', name: 'பிரியா', contact: '+91 9876543211', idProof: 'ADHR1235', faceImageUrl: 'https://picsum.photos/seed/user2/128/128', createdAt: subDays(new Date(), 25).toISOString(), loans: [], registrationType: 'Loan' },
    { id: 'user3', name: 'அருண்', contact: '+91 9876543212', idProof: 'ADHR1236', faceImageUrl: 'https://picsum.photos/seed/user3/128/128', createdAt: subDays(new Date(), 40).toISOString(), loans: [], registrationType: 'Loan' },
    { id: 'user4', name: 'சந்தியா', contact: '+91 9876543213', idProof: 'ADHR1237', faceImageUrl: 'https://picsum.photos/seed/user4/128/128', createdAt: subDays(new Date(), 5).toISOString(), loans: [], registrationType: 'Diwali Fund' },
    { id: 'user5', name: 'விஜய்', contact: '+91 9876543214', idProof: 'ADHR1238', faceImageUrl: 'https://picsum.photos/seed/user5/128/128', createdAt: subDays(new Date(), 60).toISOString(), loans: [], registrationType: 'Loan' },
];

const MOCK_LOANS: Record<string, Loan[]> = {
    'user1': [{
        id: 'loan1', userId: 'user1', amountRequested: 10000, interest: 1000, principal: 9000, totalOwed: 10000, amountRepaid: 2000, status: 'Active', loanType: 'Loan', paymentFrequency: 'Monthly', createdAt: subDays(new Date(), 10).toISOString(), dueDate: addMonths(new Date(), 1).toISOString(),
        transactions: [{ id: 'txn1', loanId: 'loan1', type: 'Disbursement', amount: 9000, date: subDays(new Date(), 10).toISOString() }, { id: 'txn2', loanId: 'loan1', type: 'Repayment', amount: 2000, date: subDays(new Date(), 2).toISOString() }]
    }],
    'user2': [{
        id: 'loan2', userId: 'user2', amountRequested: 5000, interest: 500, principal: 4500, totalOwed: 5000, amountRepaid: 5000, status: 'Paid', loanType: 'EMI', paymentFrequency: 'Weekly', createdAt: subDays(new Date(), 25).toISOString(), dueDate: addDays(new Date(), 3).toISOString(),
        transactions: [{ id: 'txn3', loanId: 'loan2', type: 'Disbursement', amount: 4500, date: subDays(new Date(), 25).toISOString() }, { id: 'txn4', loanId: 'loan2', type: 'Repayment', amount: 5000, date: subDays(new Date(), 1).toISOString() }]
    }],
    'user3': [{
        id: 'loan3', userId: 'user3', amountRequested: 15000, interest: 1500, principal: 13500, totalOwed: 15000, amountRepaid: 5000, status: 'Overdue', loanType: 'Loan', paymentFrequency: 'Monthly', createdAt: subDays(new Date(), 40).toISOString(), dueDate: subDays(new Date(), 10).toISOString(),
        transactions: [{ id: 'txn5', loanId: 'loan3', type: 'Disbursement', amount: 13500, date: subDays(new Date(), 40).toISOString() }, { id: 'txn6', loanId: 'loan3', type: 'Repayment', amount: 5000, date: subDays(new Date(), 15).toISOString() }]
    }],
    'user4': [{
        id: 'diwali1', userId: 'user4', amountRequested: 12000, interest: 1200, principal: 0, totalOwed: 12000, amountRepaid: 1000, status: 'Active', loanType: 'Diwali Fund', paymentFrequency: 'Monthly', createdAt: subDays(new Date(), 5).toISOString(), dueDate: addMonths(new Date(), 1).toISOString(),
        transactions: [{ id: 'txn7', loanId: 'diwali1', type: 'Repayment', amount: 1000, date: subDays(new Date(), 5).toISOString() }]
    }],
};


function injectDummyData() {
    if (typeof window !== 'undefined' && !localStorage.getItem('dummy_data_injected')) {
        localStorage.setItem('temp_new_users', JSON.stringify(MOCK_USERS));
        localStorage.setItem('temp_new_loans', JSON.stringify(MOCK_LOANS));
        localStorage.setItem('dummy_data_injected', 'true');
    }
}

// Call this once at the module level.
injectDummyData();

// ---------------------------


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
    if (loan.status === 'Paid' || loan.amountRepaid >= loan.totalOwed) {
        return { ...loan, status: 'Paid', amountRepaid: Math.min(loan.amountRepaid, loan.totalOwed) };
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
  let diwaliFundUsers = 0;
  let totalDiwaliFundContributions = 0;

  users.forEach(user => {
    let hasActiveDiwaliFund = false;
    (user.loans || []).forEach(loan => {
      if (loan.loanType === 'Diwali Fund') {
          if(loan.status === 'Active') {
            hasActiveDiwaliFund = true;
            totalDiwaliFundContributions += loan.amountRepaid;
          }
      } else {
        totalDisbursed += loan.principal;
        totalInterest += loan.interest;
        totalRepaid += loan.amountRepaid;
      }
    });
     if (hasActiveDiwaliFund) {
        diwaliFundUsers++;
    }
  });
  
  const currentBalance = initialVaultState.balance - totalDisbursed + totalRepaid;

  return Promise.resolve({
      balance: currentBalance,
      totalLoansGiven: totalDisbursed,
      totalInterestEarned: totalInterest,
      diwaliFundUsers,
      totalDiwaliFundContributions
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
    user.loans = user.loans.map(checkAndUpdateLoanStatus).sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
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

export const getLoanReports = async (): Promise<LoanReport[]> => {
    const allUsers = await getUsers();
    const loanReports: LoanReport[] = [];

    allUsers.forEach(user => {
        user.loans.forEach(loan => {
            if ((loan.loanType === 'Loan' || loan.loanType === 'EMI') && (loan.status === 'Active' || loan.status === 'Overdue')) {
                loanReports.push({
                    loanId: loan.id,
                    userName: user.name,
                    startDate: loan.createdAt,
                    disbursedAmount: loan.principal,
                    remainingBalance: loan.totalOwed - loan.amountRepaid,
                });
            }
        });
    });

    return Promise.resolve(loanReports);
}

export const getDiwaliFundReports = async (): Promise<DiwaliFundReport[]> => {
    const allUsers = await getUsers();
    const fundReports: DiwaliFundReport[] = [];

    allUsers.forEach(user => {
        const fund = user.loans.find(l => l.loanType === 'Diwali Fund');
        if (fund) {
            const firstContribution = fund.transactions.find(t => t.type === 'Repayment');
            fundReports.push({
                userId: user.id,
                userName: user.name,
                contributionAmount: firstContribution?.amount || 0,
                frequency: fund.paymentFrequency,
                endDate: new Date(new Date().getFullYear(), 10, 1).toISOString(), // Diwali Approx Nov 1st
            });
        }
    });

    return Promise.resolve(fundReports);
}
