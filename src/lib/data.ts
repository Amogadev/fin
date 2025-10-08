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

const user1Loans: Loan[] = [
  {
    id: 'loan101',
    userId: 'user001',
    amountRequested: 5000,
    interest: 500,
    principal: 4500,
    totalOwed: 5000,
    amountRepaid: 1000,
    status: 'Overdue',
    loanType: 'EMI',
    paymentFrequency: 'Monthly',
    createdAt: '2023-10-15T10:00:00Z',
    transactions: [
      { id: 'txn1', loanId: 'loan101', type: 'Disbursement', amount: 4500, date: '2023-10-15T10:00:00Z'},
      { id: 'txn2', loanId: 'loan101', type: 'Repayment', amount: 500, date: '2023-11-15T10:00:00Z'},
      { id: 'txn3', loanId: 'loan101', type: 'Repayment', amount: 500, date: '2023-12-15T10:00:00Z'},
    ],
  },
  {
    id: 'loan102',
    userId: 'user001',
    amountRequested: 2000,
    interest: 200,
    principal: 1800,
    totalOwed: 2000,
    amountRepaid: 2000,
    status: 'Paid',
    loanType: 'Loan',
    paymentFrequency: 'Yearly',
    createdAt: '2023-05-20T14:30:00Z',
    transactions: [
        { id: 'txn4', loanId: 'loan102', type: 'Disbursement', amount: 1800, date: '2023-05-20T14:30:00Z'},
        { id: 'txn5', loanId: 'loan102', type: 'Repayment', amount: 2000, date: '2024-01-10T11:00:00Z'},
    ],
  },
];

const mockUsers: User[] = [
  {
    id: 'user001',
    name: 'Anjali Sharma',
    contact: '',
    idProof: '',
    faceImageUrl: 'https://picsum.photos/seed/user001/400/400',
    faceImageBase64: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==',
    createdAt: '2023-10-15T09:00:00Z',
    loans: user1Loans,
  },
  {
    id: 'user002',
    name: 'Rohan Verma',
    contact: '',
    idProof: '',
    faceImageUrl: 'https://picsum.photos/seed/user002/400/400',
    faceImageBase64: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
    createdAt: '2023-11-01T11:20:00Z',
    loans: [],
  },
  {
    id: 'user003',
    name: 'Priya Singh',
    contact: '',
    idProof: '',
    faceImageUrl: 'https://picsum.photos/seed/user003/400/400',
    faceImageBase64: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
    createdAt: '2024-01-20T16:45:00Z',
    loans: [
        {
            id: 'loan103',
            userId: 'user003',
            amountRequested: 10000,
            interest: 1000,
            principal: 9000,
            totalOwed: 10000,
            amountRepaid: 2500,
            status: 'Active',
            loanType: 'EMI',
            paymentFrequency: 'Weekly',
            createdAt: '2024-01-20T17:00:00Z',
            transactions: [
                { id: 'txn6', loanId: 'loan103', type: 'Disbursement', amount: 9000, date: '2024-01-20T17:00:00Z'},
                { id: 'txn7', loanId: 'loan103', type: 'Repayment', amount: 2500, date: '2024-02-20T17:00:00Z'},
            ],
          },
    ],
  },
];

const mockVault: Vault = {
  balance: 0,
  totalLoansGiven: 0,
  totalInterestEarned: 0,
};

export type TransactionWithUser = Transaction & {
    userId: string;
    userName: string;
};

export const getVaultData = async (): Promise<Vault> => {
  return Promise.resolve(mockVault);
};

export const getUsers = async (): Promise<User[]> => {
  // Check for new loans in localStorage and add them to the corresponding user
  if (typeof window !== 'undefined') {
    const tempLoansJson = localStorage.getItem('temp_new_loans');
    if (tempLoansJson) {
      const tempLoans = JSON.parse(tempLoansJson);
      mockUsers.forEach(user => {
        if (tempLoans[user.id]) {
          const existingLoanIds = new Set(user.loans.map(l => l.id));
          const newLoans = tempLoans[user.id].filter((l: Loan) => !existingLoanIds.has(l.id));
          user.loans = [...user.loans, ...newLoans];
        }
      });
    }
  }
  return Promise.resolve(mockUsers);
};

export const getUserById = async (id: string): Promise<User | undefined> => {
  // This combines static mock data with dynamically added users from localStorage
  let allUsers = [...mockUsers];
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
  }

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
