import AdminUsersTable from '../AdminUsersTable'

export default function AdminUsersTableExample() {
  const mockUsers = [
    {
      id: "1",
      name: "John Doe",
      email: "john@example.com",
      joinDate: "2025-11-01",
      status: "active" as const,
      earnings: 24000,
      referrals: 12,
    },
    {
      id: "2",
      name: "Jane Smith",
      email: "jane@example.com",
      joinDate: "2025-11-05",
      status: "active" as const,
      earnings: 8000,
      referrals: 4,
    },
    {
      id: "3",
      name: "Mike Wilson",
      email: "mike@example.com",
      joinDate: "2025-11-07",
      status: "pending" as const,
      earnings: 0,
      referrals: 0,
    },
  ];

  return (
    <div className="p-6">
      <AdminUsersTable users={mockUsers} />
    </div>
  )
}
