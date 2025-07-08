'use client'

import * as React from 'react'
import { CalendarIcon } from 'lucide-react'
import { addDays, format } from 'date-fns'
import { DateRange } from 'react-day-picker'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

interface DateRangePickerProps {
  className?: string
  dateRange: DateRange | undefined
  onChange: (dateRange: DateRange | undefined) => void
  align?: 'start' | 'center' | 'end'
  presets?: {
    label: string
    dateRange: DateRange
  }[]
  maxDate?: Date
  minDate?: Date
  disabled?: boolean
  placeholder?: string
  calendarDaysToShow?: number
}

export function DateRangePicker({
  className,
  dateRange,
  onChange,
  align = 'start',
  presets,
  minDate,
  maxDate,
  disabled = false,
  placeholder = 'Select date range',
  calendarDaysToShow = 2,
}: DateRangePickerProps) {
  const [open, setOpen] = React.useState(false)

  const defaultPresets = [
    {
      label: 'Today',
      dateRange: {
        from: new Date(),
        to: new Date(),
      },
    },
    {
      label: 'Yesterday',
      dateRange: {
        from: addDays(new Date(), -1),
        to: addDays(new Date(), -1),
      },
    },
    {
      label: 'Last 7 days',
      dateRange: {
        from: addDays(new Date(), -6),
        to: new Date(),
      },
    },
    {
      label: 'Last 30 days',
      dateRange: {
        from: addDays(new Date(), -29),
        to: new Date(),
      },
    },
    {
      label: 'This month',
      dateRange: {
        from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        to: new Date(),
      },
    },
    {
      label: 'Last month',
      dateRange: {
        from: new Date(
          new Date().getFullYear(),
          new Date().getMonth() - 1,
          1
        ),
        to: new Date(
          new Date().getFullYear(),
          new Date().getMonth(),
          0
        ),
      },
    },
  ]

  // Use provided presets or fallback to defaults
  const finalPresets = presets || defaultPresets

  return (
    <div className={cn('grid gap-2', className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={'outline'}
            className={cn(
              'w-full md:w-auto justify-start text-left font-normal',
              !dateRange && 'text-muted-foreground'
            )}
            disabled={disabled}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {dateRange?.from ? (
              dateRange.to ? (
                <>
                  {format(dateRange.from, 'LLL dd, y')} -{' '}
                  {format(dateRange.to, 'LLL dd, y')}
                </>
              ) : (
                format(dateRange.from, 'LLL dd, y')
              )
            ) : (
              <span>{placeholder}</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align={align}>
          <div className="flex px-4 py-2">
            <div className="space-y-2.5">
              {finalPresets.map((preset) => (
                <Button
                  key={preset.label}
                  onClick={() => {
                    onChange(preset.dateRange)
                    setOpen(false)
                  }}
                  variant="ghost"
                  className="justify-start font-normal"
                >
                  {preset.label}
                </Button>
              ))}
            </div>
          </div>
          <div className="border-t p-4">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={dateRange?.from}
              selected={dateRange}
              onSelect={onChange}
              numberOfMonths={calendarDaysToShow}
              disabled={(date) => {
                if (minDate && date < minDate) return true
                if (maxDate && date > maxDate) return true
                return false
              }}
            />
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
