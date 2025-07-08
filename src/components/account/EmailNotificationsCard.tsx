import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Mail, CheckCircle, AlertCircle } from 'lucide-react'
import { showToast } from '@/lib/toast'

interface EmailNotificationSettings {
  orderUpdates: boolean
  promotionalEmails: boolean
  newsletter: boolean
}

export function EmailNotificationsCard() {
  const [settings, setSettings] = useState<EmailNotificationSettings>({
    orderUpdates: true,
    promotionalEmails: false,
    newsletter: false
  })
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/account/email-notifications')
      if (response.ok) {
        const data = await response.json()
        setSettings(data)
      }
    } catch (error) {
      console.error('Failed to fetch email settings:', error)
    } finally {
      setInitialLoading(false)
    }
  }

  const updateSettings = async (newSettings: EmailNotificationSettings) => {
    setLoading(true)
    try {
      const response = await fetch('/api/account/email-notifications', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newSettings),
      })

      if (response.ok) {
        setSettings(newSettings)
        showToast.success('Email notification preferences updated successfully!')
      } else {
        const error = await response.json()
        showToast.error(error.error || 'Failed to update settings')
      }
    } catch (error) {
      console.error('Failed to update email settings:', error)
      showToast.error('Failed to update settings')
    } finally {
      setLoading(false)
    }
  }

  const handleToggle = (key: keyof EmailNotificationSettings) => {
    const newSettings = {
      ...settings,
      [key]: !settings[key]
    }
    updateSettings(newSettings)
  }

  if (initialLoading) {
    return (
      <Card className="border-pearl-essence-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-pearl-essence-900">
            <Mail className="w-5 h-5" />
            Email Notifications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-pearl-essence-200 rounded w-3/4"></div>
            <div className="h-4 bg-pearl-essence-200 rounded w-1/2"></div>
            <div className="h-4 bg-pearl-essence-200 rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-pearl-essence-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-pearl-essence-900">
          <Mail className="w-5 h-5" />
          Email Notifications
        </CardTitle>
        <p className="text-sm text-pearl-essence-600">
          Manage which emails you receive from us
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          {/* Order Updates */}
          <div className="flex items-center justify-between space-x-2">
            <div className="space-y-0.5 flex-1">
              <Label className="text-sm font-medium text-pearl-essence-900">
                Order Updates
              </Label>
              <p className="text-sm text-pearl-essence-600">
                Receive updates about your orders and delivery status
              </p>
            </div>
            <Switch
              checked={settings.orderUpdates}
              onCheckedChange={() => handleToggle('orderUpdates')}
              disabled={loading}
            />
          </div>

          {/* Promotional Emails */}
          <div className="flex items-center justify-between space-x-2">
            <div className="space-y-0.5 flex-1">
              <Label className="text-sm font-medium text-pearl-essence-900">
                Promotional Emails
              </Label>
              <p className="text-sm text-pearl-essence-600">
                Get notified about sales, discounts, and special offers
              </p>
            </div>
            <Switch
              checked={settings.promotionalEmails}
              onCheckedChange={() => handleToggle('promotionalEmails')}
              disabled={loading}
            />
          </div>

          {/* Newsletter */}
          <div className="flex items-center justify-between space-x-2">
            <div className="space-y-0.5 flex-1">
              <Label className="text-sm font-medium text-pearl-essence-900">
                Newsletter
              </Label>
              <p className="text-sm text-pearl-essence-600">
                Weekly newsletter with new arrivals and style tips
              </p>
            </div>
            <Switch
              checked={settings.newsletter}
              onCheckedChange={() => handleToggle('newsletter')}
              disabled={loading}
            />
          </div>
        </div>

        {loading && (
          <div className="flex items-center gap-2 text-sm text-pearl-essence-600">
            <div className="w-4 h-4 border-2 border-pearl-essence-300 border-t-pearl-essence-600 rounded-full animate-spin"></div>
            Updating preferences...
          </div>
        )}
      </CardContent>
    </Card>
  )
}
