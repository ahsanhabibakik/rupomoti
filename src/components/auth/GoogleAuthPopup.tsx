'use client'

import { useState } from 'react'
import { signIn, getSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Chrome, Shield, Zap, Users } from 'lucide-react'
import Image from 'next/image'

interface GoogleAuthPopupProps {
  isOpen: boolean
  onClose: () => void
  redirectTo?: string
}

export default function GoogleAuthPopup({ isOpen, onClose, redirectTo = '/' }: GoogleAuthPopupProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true)
      const result = await signIn('google', {
        callbackUrl: redirectTo,
        redirect: false,
      })
      
      if (result?.ok) {
        onClose()
        // Use router push instead of window.location for better navigation
        window.location.href = redirectTo
      } else if (result?.error) {
        console.error('Sign-in failed:', result.error)
      }
    } catch (error) {
      console.error('Google sign-in error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <DialogTitle className="text-2xl font-bold">Welcome to Rupomoti</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Sign in to access your account and enjoy a personalized shopping experience
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Google Sign In Button */}
          <Button
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full h-12 bg-white hover:bg-gray-50 text-gray-900 border border-gray-300 shadow-sm"
            variant="outline"
          >
            {isLoading ? (
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
                <span>Signing in...</span>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Image
                  src="https://developers.google.com/identity/images/g-logo.png"
                  alt="Google"
                  width={20}
                  height={20}
                />
                <span className="font-medium">Continue with Google</span>
              </div>
            )}
          </Button>

          {/* Features */}
          <div className="grid grid-cols-1 gap-3">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                <Shield className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium">Secure & Safe</p>
                <p className="text-xs text-muted-foreground">Your data is protected</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                <Zap className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium">Quick Access</p>
                <p className="text-xs text-muted-foreground">Sign in with one click</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                <Users className="w-4 h-4 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium">Personalized Experience</p>
                <p className="text-xs text-muted-foreground">Tailored just for you</p>
              </div>
            </div>
          </div>

          {/* Alternative Sign In */}
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-3">
              Or continue with email
            </p>
            <Button 
              variant="ghost" 
              className="w-full"
              onClick={() => {
                onClose()
                window.location.href = '/signin'
              }}
            >
              Sign in with Email
            </Button>
          </div>

          {/* Terms */}
          <p className="text-xs text-muted-foreground text-center">
            By continuing, you agree to our{' '}
            <a href="/terms" className="underline hover:text-primary">Terms of Service</a>
            {' '}and{' '}
            <a href="/privacy" className="underline hover:text-primary">Privacy Policy</a>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
