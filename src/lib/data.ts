
export type User = {
  id: string;
  name: string;
  contact: string;
  idProof: string;
  faceImageUrl: string;
  faceImageBase64: string;
  createdAt: string;
  loans: Loan[];
};

export type Loan = {
  id: string;
  userId: string;
  amountRequested: number;
  interest: number;
  principal: number;
  totalOwed: number;
  amountRepaid: number;
  status: 'Active' | 'Paid' | 'Overdue';
  loanType: 'Loan' | 'EMI';
  paymentFrequency: 'Daily' | 'Weekly' | 'Monthly' | 'Yearly';
  createdAt: string;
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
  totalLoansGiven: number;
  totalInterestEarned: number;
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

function mergeData(users: User[], allLoans: Record<string, Loan[]>): User[] {
    return users.map(user => {
        const userLoans = allLoans[user.id] || [];
        const existingLoanIds = new Set(user.loans.map(l => l.id));
        const newLoans = userLoans.filter((l: Loan) => !existingLoanIds.has(l.id));
        return {
            ...user,
            loans: [...user.loans, ...newLoans]
        };
    });
}


export const getVaultData = async (): Promise<Vault> => {
  const users = await getUsers();
  
  let totalLoansGiven = 0;
  let totalRepaid = 0;

  users.forEach(user => {
    user.loans.forEach(loan => {
      totalLoansGiven += loan.principal;
      loan.transactions.forEach(tx => {
        if(tx.type === 'Repayment') {
            totalRepaid += tx.amount;
        }
      })
    });
  });
  
  const interestEarned = users.flatMap(u => u.loans).reduce((acc, loan) => {
    // A more accurate way to calculate earned interest based on repayments
    const repaidTowardsPrincipal = Math.min(loan.amountRepaid, loan.principal);
    const repaidTowardsInterest = Math.max(0, loan.amountRepaid - repaidTowardsPrincipal);
    return acc + repaidTowardsInterest;
  }, 0);

  const currentBalance = initialVaultState.balance - totalLoansGiven + totalRepaid;

  return Promise.resolve({
      balance: currentBalance,
      totalLoansGiven,
      totalInterestEarned: interestEarned,
  });
};

export const getUsers = async (): Promise<User[]> => {
  if (typeof window === 'undefined') return [];

  const storedUsers = getStoredUsers();
  const storedLoans = getStoredLoans();

  const mergedUsers = storedUsers.map(user => {
      const userLoans = storedLoans[user.id] || [];
      return { ...user, loans: userLoans };
  });

  return Promise.resolve(mergedUsers);
};

export const getUserById = async (id: string): Promise<User | undefined> => {
  const allUsers = await getUsers();
  return Promise.resolve(allUsers.find(u => u.id === id));
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
