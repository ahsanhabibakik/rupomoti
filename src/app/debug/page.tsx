'use client'

import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'

export default function DebugPage() {
  const { data: session, status } = useSession()
  const [serverSession, setServerSession] = useState<any>(null)

  useEffect(() => {
    fetch('/api/debug/session')
      .then(res => res.json())
      .then(data => setServerSession(data))
      .catch(err => console.error('Failed to fetch server session:', err))
  }, [])

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Session Debug</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-100 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-3">Client Session</h2>
          <p className="mb-2"><strong>Status:</strong> {status}</p>
          {session ? (
            <div>
              <p><strong>User ID:</strong> {session.user?.id}</p>
              <p><strong>Name:</strong> {session.user?.name}</p>
              <p><strong>Email:</strong> {session.user?.email}</p>
              <p><strong>Role:</strong> {session.user?.role}</p>
              <p><strong>Is Admin:</strong> {session.user?.isAdmin ? 'Yes' : 'No'}</p>
            </div>
          ) : (
            <p>No session</p>
          )}
          <details className="mt-4">
            <summary>Full Session Object</summary>
            <pre className="text-xs bg-white p-2 rounded mt-2 overflow-auto">
              {JSON.stringify(session, null, 2)}
            </pre>
          </details>
        </div>

        <div className="bg-gray-100 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-3">Server Session</h2>
          {serverSession ? (
            <div>
              <p><strong>Success:</strong> {serverSession.success ? 'Yes' : 'No'}</p>
              {serverSession.user && (
                <div>
                  <p><strong>User ID:</strong> {serverSession.user.id}</p>
                  <p><strong>Name:</strong> {serverSession.user.name}</p>
                  <p><strong>Email:</strong> {serverSession.user.email}</p>
                  <p><strong>Role:</strong> {serverSession.user.role}</p>
                  <p><strong>Is Admin:</strong> {serverSession.user.isAdmin ? 'Yes' : 'No'}</p>
                </div>
              )}
              <details className="mt-4">
                <summary>Full Server Response</summary>
                <pre className="text-xs bg-white p-2 rounded mt-2 overflow-auto">
                  {JSON.stringify(serverSession, null, 2)}
                </pre>
              </details>
            </div>
          ) : (
            <p>Loading server session...</p>
          )}
        </div>
      </div>
    </div>
  )
}
