# **App Name**: VaultWise

## Core Features:

- Main Vault Dashboard: Display total available balance, loans given, and interest earned from the Firestore database.
- User Registration & Verification: Collect personal info (name, contact, ID) and capture face image using the camera, storing both in Firestore Storage. Generates unique LoanId for the user
- Loan/EMI Application: Form to input loan amount, type (Loan/EMI), and payment frequency. Calculates interest (10% on loans) and updates vault balance in Firestore.
- Transaction History: Records all user loan details and updates the data in Firestore, acting as an audit tool for transactions.
- Repayment Module: Allows users to repay loans/EMIs, updating vault balance and transaction history in Firestore.
- Admin Panel: Admin tool to manage users, view transactions, and update vault balance, all sourced from Firestore.
- Facial Match: An ai-powered tool that will compare the Loan Applicant's selfie to the images stored in firestore

## Style Guidelines:

- Primary color: Deep blue (#3F51B5) for trust and security.
- Background color: Light blue (#E3F2FD), a very pale tint of the primary color, for a calm, professional feel.
- Accent color: Violet (#7E57C2), an analogous color, but in this case bright and saturated for visibility of calls to action.
- Headline font: 'Space Grotesk', a sans-serif font.
- Body font: 'Inter', a sans-serif font.
- Code font: 'Source Code Pro' for displaying code snippets.
- Use simple, professional icons for dashboard elements and actions.
- Subtle transitions and animations for user interactions and data updates.