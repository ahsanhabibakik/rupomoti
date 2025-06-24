'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
import { toast } from 'sonner'
import { Switch } from '@/components/ui/switch'

const settingSchema = z.object({
  key: z.string(),
  value: z.any(),
});

type Setting = z.infer<typeof settingSchema>;

export default function SettingsPage() {
  const [settings, setSettings] = useState<Setting[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const form = useForm({
    resolver: zodResolver(z.object({})),
  });

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const fetchSettings = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/settings');
      if (response.ok) {
        const data = await response.json();
        setSettings(data);
        const defaultValues = data.reduce((acc, setting) => {
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
  };

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
      <h1 className="text-3xl font-bold">Site Settings</h1>
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
                        <FormLabel className="text-base">{setting.label || setting.key}</FormLabel>
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