'use client';

import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useDebounce } from "@/hooks/useDebounce";
import { useEffect, useState } from "react";

export function SearchForm({ initialSearch }: { initialSearch: string }) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [searchTerm, setSearchTerm] = useState(initialSearch);
    const debouncedSearchTerm = useDebounce(searchTerm, 500);

    useEffect(() => {
        const params = new URLSearchParams(searchParams);
        if (debouncedSearchTerm) {
            params.set("search", debouncedSearchTerm);
        } else {
            params.delete("search");
        }
        params.set("page", "1"); // Reset to first page on new search
        router.replace(`${pathname}?${params.toString()}`);
    }, [debouncedSearchTerm, pathname, router, searchParams]);

    return (
        <div className="relative w-full max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
                placeholder="Search by Order #, Customer, or Product..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
            />
        </div>
    );
} 