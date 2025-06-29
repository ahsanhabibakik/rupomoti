'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface SuperAdminThemeManagerProps {
  className?: string
}

function SuperAdminThemeManager(props: SuperAdminThemeManagerProps = {}) {
  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle>Theme Management</CardTitle>
      </CardHeader>
      <CardContent>
        <p>SuperAdminThemeManager component is working!</p>
      </CardContent>
    </Card>
  )
}

export default SuperAdminThemeManager
