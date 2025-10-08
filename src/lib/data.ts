
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

const mockUsers: User[] = [];

const mockVault: Vault = {
  balance: 100000,
  totalLoansGiven: 0,
  totalInterestEarned: 0,
};

export type TransactionWithUser = Transaction & {
    userId: string;
    userName: string;
};

export const getVaultData = async (): Promise<Vault> => {
  // In a real app, fetch this from a database.
  // For this demo, we'll simulate it and aggregate data from users.
  const users = await getUsers();
  let totalLoansGiven = 0;
  let totalInterestEarned = 0;
  let totalRepaid = 0;

  users.forEach(user => {
    user.loans.forEach(loan => {
      totalLoansGiven += loan.principal;
      totalRepaid += loan.amountRepaid;
      // Simplified interest calculation for demo
      if (loan.amountRepaid > loan.principal) {
          totalInterestEarned += (loan.amountRepaid - loan.principal);
      }
    });
  });

  // Initial balance minus loans given out plus repayments received
  const currentBalance = mockVault.balance - totalLoansGiven + totalRepaid;

  return Promise.resolve({
      balance: currentBalance,
      totalLoansGiven,
      totalInterestEarned
  });
};

export const getUsers = async (): Promise<User[]> => {
  let allUsers = [...mockUsers];
  // Check for new loans in localStorage and add them to the corresponding user
  if (typeof window !== 'undefined') {
    const tempUserJson = localStorage.getItem('temp_new_user');
    if (tempUserJson) {
        const tempUser = JSON.parse(tempUserJson);
        if (!allUsers.find(u => u.id === tempUser.id)) {
            allUsers.push({
                ...tempUser,
                createdAt: new Date().toISOString(),
                loans: [],
            });
        }
    }

    allUsers.forEach(user => {
      const tempLoansJson = localStorage.getItem('temp_new_loans');
      if (tempLoansJson) {
        const tempLoans = JSON.parse(tempLoansJson);
        if (tempLoans[user.id]) {
          const existingLoanIds = new Set(user.loans.map(l => l.id));
          const newLoans = tempLoans[user.id].filter((l: Loan) => !existingLoanIds.has(l.id));
          user.loans = [...user.loans, ...newLoans];
        }
      }
    });
  }
  return Promise.resolve(allUsers);
};

export const getUserById = async (id: string): Promise<User | undefined> => {
  // This combines static mock data with dynamically added users from localStorage
  const allUsers = await getUsers();
  const user = allUsers.find(u => u.id === id);

  if (user && typeof window !== 'undefined') {
    const tempLoansJson = localStorage.getItem('temp_new_loans');
    if (tempLoansJson) {
        const tempLoans = JSON.parse(tempLoansJson);
        if (tempLoans[id]) {
            const existingLoanIds = new Set(user.loans.map(l => l.id));
            const newLoans = tempLoans[id].filter((l: Loan) => !existingLoanIds.has(l.id));
            user.loans = [...user.loans, ...newLoans];
        }
    }
  }

  return Promise.resolve(user);
};

export const getAllTransactions = async (): Promise<TransactionWithUser[]> => {
    const allUsers = await getUsers();
    const allTxs = allUsers.flatMap(user => 
        user.loans.flatMap(loan => 
            loan.transactions.map(tx => ({
                ...tx,
                userId: user.id,
                userName: user.name,
            }))
        )
    );
    return Promise.resolve(allTxs.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
}
