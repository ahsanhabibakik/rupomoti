// Temporary bypass for admin components during Prisma to Mongoose migration
'use client'

export default function AdminDashboard() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h2 className="text-lg font-semibold text-yellow-800 mb-2">Migration in Progress</h2>
        <p className="text-yellow-700">
          The admin dashboard is being migrated from Prisma to Mongoose. 
          Basic functionality will be restored soon.
        </p>
        <p className="text-yellow-700 mt-2">
          Current status: Database successfully migrated to Mongoose. 
          Admin UI components are being updated.
        </p>
      </div>
    </div>
  )
}
