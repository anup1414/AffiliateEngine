import TransactionTable from '../TransactionTable'

export default function TransactionTableExample() {
  const mockTransactions = [
    {
      id: "1",
      date: "2025-11-08",
      description: "Referral earning from user @john_doe",
      amount: 2000,
      type: "earning" as const,
    },
    {
      id: "2",
      date: "2025-11-07",
      description: "Referral earning from user @jane_smith",
      amount: 2000,
      type: "earning" as const,
    },
    {
      id: "3",
      date: "2025-11-05",
      description: "Referral earning from user @mike_wilson",
      amount: 2000,
      type: "earning" as const,
    },
  ];

  return (
    <div className="p-6">
      <TransactionTable transactions={mockTransactions} />
    </div>
  )
}
