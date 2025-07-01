'use client'

export const dynamic = 'force-dynamic';

import { useState, useEffect, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
import { toast } from 'sonner'
import { Switch } from '@/components/ui/switch'
import SafeSuperAdminThemeManager from '@/components/admin/SafeSuperAdminThemeManager'
import { Settings, Palette, Shield } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

// Admin settings page
const settingSchema = z.object({
  key: z.string(),
  value: z.any(),
});

type Setting = z.infer<typeof settingSchema>;

export default function SettingsPage() {
  const { data: session } = useSession()
  const [settings, setSettings] = useState<Setting[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const isSuperAdmin = session?.user?.role === 'SUPER_ADMIN'

  const form = useForm({
    resolver: zodResolver(z.object({})),
  });

  const fetchSettings = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/settings');
      if (response.ok) {
        const data = await response.json();
        setSettings(data);
        const defaultValues = data.reduce((acc: any, setting: any) => {
          acc[setting.key] = setting.value;
          return acc;
        }, {});
        form.reset(defaultValues);
      } else {
        toast.error('Failed to fetch settings.');
      }
    } catch (error) {
      toast.error('An error occurred while fetching settings.');
      console.error(error);
    }
    setIsLoading(false);
  }, [form]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const onSubmit = async (data: any) => {
    try {
      const response = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        toast.success('Settings updated successfully!');
        fetchSettings();
      } else {
        toast.error('Failed to update settings.');
      }
    } catch (error) {
      toast.error('An error occurred while updating settings.');
      console.error(error);
    }
  };

  if (isLoading) {
    return <div>Loading settings...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Settings className="h-8 w-8" />
            Site Settings
          </h1>
          <p className="text-muted-foreground">
            Manage your application settings and preferences
          </p>
        </div>
        {isSuperAdmin && (
          <Badge variant="secondary" className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0">
            <Shield className="h-3 w-3 mr-1" />
            Super Admin
          </Badge>
        )}
      </div>

      {/* Theme Color Management - Only for Super Admin */}
      {isSuperAdmin && (
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5 text-purple-500" />
              Theme Color Management
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Customize the global theme colors for the admin dashboard. Changes require 2FA verification in production.
            </p>
          </CardHeader>
          <CardContent>
            <SafeSuperAdminThemeManager />
          </CardContent>
        </Card>
      )}

      {/* General Settings */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {settings.map((setting) => (
                <FormField
                  key={setting.key}
                  control={form.control}
                  name={setting.key}
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">{(setting as any).label || setting.key}</FormLabel>
                      </div>
                      <FormControl>
                        <Input {...field} className="w-auto" />
                      </FormControl>
                    </FormItem>
                  )}
                />
              ))}
            </CardContent>
          </Card>

          <Button type="submit">Save Changes</Button>
        </form>
      </Form>
    </div>
  )
}