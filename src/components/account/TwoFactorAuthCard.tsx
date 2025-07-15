import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Shield, Mail, CheckCircle, AlertCircle, Clock } from 'lucide-react'
import { showToast } from '@/lib/toast'

interface TwoFactorStatus {
  enabled: boolean
  method: string
}

export function TwoFactorAuthCard() {
  const [status, setStatus] = useState<TwoFactorStatus>({
    enabled: false,
    method: 'email'
  })
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [step, setStep] = useState<'status' | 'verify'>('status')
  const [verificationCode, setVerificationCode] = useState('')
  const [countdown, setCountdown] = useState(0)

  useEffect(() => {
    fetchStatus()
  }, [])

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  const fetchStatus = async () => {
    try {
      const response = await fetch('/api/account/two-factor')
      if (response.ok) {
        const data = await response.json()
        setStatus(data)
      }
    } catch (error) {
      console.error('Failed to fetch 2FA status:', error)
    } finally {
      setInitialLoading(false)
    }
  }

  const handleEnable = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/account/two-factor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'enable' }),
      })

      if (response.ok) {
        const data = await response.json()
        if (data.step === 'verify') {
          setStep('verify')
          setCountdown(600) // 10 minutes
          showToast.success('Verification code sent to your email!')
        }
      } else {
        const error = await response.json()
        showToast.error(error.error || 'Failed to enable 2FA')
      }
    } catch (error) {
      console.error('Failed to enable 2FA:', error)
      showToast.error('Failed to enable 2FA')
    } finally {
      setLoading(false)
    }
  }

  const handleVerify = async () => {
    if (!verificationCode) {
      showToast.error('Please enter the verification code')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/account/two-factor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          action: 'verify', 
          verificationCode 
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setStatus({ enabled: true, method: 'email' })
        setStep('status')
        setVerificationCode('')
        setCountdown(0)
        showToast.success('Two-factor authentication enabled successfully!')
      } else {
        const error = await response.json()
        showToast.error(error.error || 'Invalid verification code')
      }
    } catch (error) {
      console.error('Failed to verify 2FA:', error)
      showToast.error('Failed to verify code')
    } finally {
      setLoading(false)
    }
  }

  const handleDisable = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/account/two-factor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'disable' }),
      })

      if (response.ok) {
        setStatus({ enabled: false, method: 'email' })
        showToast.success('Two-factor authentication disabled')
      } else {
        const error = await response.json()
        showToast.error(error.error || 'Failed to disable 2FA')
      }
    } catch (error) {
      console.error('Failed to disable 2FA:', error)
      showToast.error('Failed to disable 2FA')
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (initialLoading) {
    return (
      <Card className="border-pearl-essence-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-pearl-essence-900">
            <Shield className="w-5 h-5" />
            Two-Factor Authentication
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-pearl-essence-200 rounded w-3/4"></div>
            <div className="h-4 bg-pearl-essence-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-pearl-essence-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-pearl-essence-900">
          <Shield className="w-5 h-5" />
          Two-Factor Authentication
        </CardTitle>
        <p className="text-sm text-pearl-essence-600">
          Add an extra layer of security to your account
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {step === 'status' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${status.enabled ? 'bg-green-500' : 'bg-gray-300'}`} />
                <div>
                  <p className="text-sm font-medium text-pearl-essence-900">
                    Email Authentication
                  </p>
                  <p className="text-sm text-pearl-essence-600">
                    {status.enabled 
                      ? 'Verification codes will be sent to your email' 
                      : 'Get verification codes via email for secure login'
                    }
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {status.enabled && (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                )}
                <Mail className="w-4 h-4 text-pearl-essence-500" />
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-pearl-essence-200">
              <div>
                <p className="text-sm font-medium text-pearl-essence-900">
                  Status: {status.enabled ? 'Enabled' : 'Disabled'}
                </p>
                <p className="text-sm text-pearl-essence-600">
                  {status.enabled 
                    ? 'Your account is protected with 2FA' 
                    : 'Enable 2FA to secure your account'
                  }
                </p>
              </div>
              <Button
                onClick={status.enabled ? handleDisable : handleEnable}
                disabled={loading}
                variant={status.enabled ? 'destructive' : 'default'}
                className={status.enabled ? '' : 'bg-pearl-essence-600 hover:bg-pearl-essence-700'}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    {status.enabled ? 'Disabling...' : 'Enabling...'}
                  </div>
                ) : (
                  status.enabled ? 'Disable' : 'Enable'
                )}
              </Button>
            </div>
          </div>
        )}

        {step === 'verify' && (
          <div className="space-y-4">
            <div className="text-center">
              <div className="w-16 h-16 bg-pearl-essence-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8 text-pearl-essence-600" />
              </div>
              <h3 className="text-lg font-medium text-pearl-essence-900 mb-2">
                Check Your Email
              </h3>
              <p className="text-sm text-pearl-essence-600 mb-4">
                We&apos;ve sent a 6-digit verification code to your email address. 
                Please enter it below to complete setup.
              </p>
              
              {countdown > 0 && (
                <div className="flex items-center justify-center gap-2 text-sm text-pearl-essence-600 mb-4">
                  <Clock className="w-4 h-4" />
                  <span>Code expires in {formatTime(countdown)}</span>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="verificationCode" className="text-sm font-medium text-pearl-essence-900">
                  Verification Code
                </Label>
                <Input
                  id="verificationCode"
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="Enter 6-digit code"
                  className="text-center text-2xl tracking-widest"
                  maxLength={6}
                  disabled={loading}
                />
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => {
                    setStep('status')
                    setVerificationCode('')
                    setCountdown(0)
                  }}
                  variant="outline"
                  className="flex-1"
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleVerify}
                  disabled={loading || verificationCode.length !== 6}
                  className="flex-1 bg-pearl-essence-600 hover:bg-pearl-essence-700"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Verifying...
                    </div>
                  ) : (
                    'Verify & Enable'
                  )}
                </Button>
              </div>

              <Button
                onClick={handleEnable}
                variant="ghost"
                size="sm"
                className="w-full text-pearl-essence-600 hover:text-pearl-essence-700"
                disabled={loading || countdown > 0}
              >
                {countdown > 0 ? `Resend code in ${formatTime(countdown)}` : 'Resend code'}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
