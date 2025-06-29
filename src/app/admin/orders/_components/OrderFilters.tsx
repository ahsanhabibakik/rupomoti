'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useDebounce } from '@/hooks/useDebounce';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon, Search } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { OrderStatus } from '@prisma/client';
import { DateRange } from 'react-day-picker';

export function OrderFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [searchTerm, setSearchTerm] = useState(searchParams?.get('search') || '');
  const [status, setStatus] = useState(searchParams?.get('status') || 'all');
  const [dateRange, setDateRange] = useState<DateRange | undefined>(() => {
    const from = searchParams?.get('from');
    const to = searchParams?.get('to');
    if (from && to) {
      return { from: parseISO(from), to: parseISO(to) };
    }
    return undefined;
  });

  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  useEffect(() => {
    const params = new URLSearchParams(searchParams?.toString() || '');
    params.set('page', '1');

    if (debouncedSearchTerm) {
      params.set('search', debouncedSearchTerm);
    } else {
      params.delete('search');
    }

    if (status && status !== 'all') {
      params.set('status', status);
    } else {
      params.delete('status');
    }

    if (dateRange?.from && dateRange?.to) {
        params.set('from', dateRange.from.toISOString());
        params.set('to', dateRange.to.toISOString());
    } else {
        params.delete('from');
        params.delete('to');
    }
    
    router.replace(`${pathname}?${params.toString()}`);
  }, [debouncedSearchTerm, status, dateRange, pathname, router, searchParams]);

  return (
    <div className="flex flex-col space-y-4 md:space-y-0 md:flex-row md:items-center md:gap-4">
      <div className="relative w-full md:w-auto md:min-w-[300px]">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by Order #, Customer, or Product..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-8"
        />
      </div>
      <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2 w-full md:w-auto md:items-center md:gap-2">
         <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {Object.values(OrderStatus).map(s => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
            </SelectContent>
        </Select>
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="outline" className="w-full sm:w-[280px] justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange?.from && dateRange?.to ? (
                        <span className="truncate">
                          {format(dateRange.from, 'MMM dd')} - {format(dateRange.to, 'MMM dd, y')}
                        </span>
                    ) : (
                        <span>Pick a date range</span>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={dateRange?.from}
                    selected={dateRange}
                    onSelect={setDateRange}
                    numberOfMonths={1}
                    className="md:hidden"
                />
                <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={dateRange?.from}
                    selected={dateRange}
                    onSelect={setDateRange}
                    numberOfMonths={2}
                    className="hidden md:block"
                />
            </PopoverContent>
        </Popover>
      </div>
    </div>
  );
} 