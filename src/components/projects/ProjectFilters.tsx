"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Search, X, Filter } from "lucide-react";

interface ProjectStats {
  total: number;
  upcoming: number;
  ongoing: number;
  completed: number;
}

interface ProjectFiltersProps {
  stats: ProjectStats;
}

export function ProjectFilters({ stats }: ProjectFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const currentStatus = searchParams.get("status") || "all";
  const [searchTerm, setSearchTerm] = useState(searchParams.get("q") || "");
  const [placeTerm, setPlaceTerm] = useState(searchParams.get("place") || "");

  const updateFilters = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value.trim()) {
      params.set(key, value.trim());
    } else {
      params.delete(key);
    }
    // Reset to page 1 on filter change
    params.delete("page");

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (searchTerm.trim()) {
      params.set("q", searchTerm.trim());
    } else {
      params.delete("q");
    }
    if (placeTerm.trim()) {
      params.set("place", placeTerm.trim());
    } else {
      params.delete("place");
    }
    params.delete("page");

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  const clearAllFilters = () => {
    setSearchTerm("");
    setPlaceTerm("");
    startTransition(() => {
      router.push(pathname);
    });
  };

  const hasActiveFilters = !!(
    (searchParams.get("status") && searchParams.get("status") !== "all") ||
    searchParams.get("q") ||
    searchParams.get("place")
  );

  return (
    <div className="space-y-4">
      {/* Status Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => updateFilters("status", "all")}
          className={`px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
            currentStatus === "all"
              ? "bg-slate-900 text-white shadow-sm"
              : "bg-white/80 text-slate-600 hover:text-slate-900 border border-slate-200/80"
          }`}
        >
          <span>All Projects</span>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] ${
              currentStatus === "all" ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
            }`}
          >
            {stats.total}
          </span>
        </button>

        <button
          onClick={() => updateFilters("status", "upcoming")}
          className={`px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
            currentStatus === "upcoming"
              ? "bg-blue-600 text-white shadow-sm"
              : "bg-white/80 text-slate-600 hover:text-blue-600 border border-slate-200/80"
          }`}
        >
          <span>Upcoming</span>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] ${
              currentStatus === "upcoming" ? "bg-white/20 text-white" : "bg-blue-50 text-blue-700"
            }`}
          >
            {stats.upcoming}
          </span>
        </button>

        <button
          onClick={() => updateFilters("status", "ongoing")}
          className={`px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
            currentStatus === "ongoing"
              ? "bg-emerald-600 text-white shadow-sm"
              : "bg-white/80 text-slate-600 hover:text-emerald-600 border border-slate-200/80"
          }`}
        >
          <span>Ongoing</span>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] ${
              currentStatus === "ongoing" ? "bg-white/20 text-white" : "bg-emerald-50 text-emerald-700"
            }`}
          >
            {stats.ongoing}
          </span>
        </button>

        <button
          onClick={() => updateFilters("status", "completed")}
          className={`px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
            currentStatus === "completed"
              ? "bg-slate-700 text-white shadow-sm"
              : "bg-white/80 text-slate-600 hover:text-slate-900 border border-slate-200/80"
          }`}
        >
          <span>Completed</span>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] ${
              currentStatus === "completed" ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
            }`}
          >
            {stats.completed}
          </span>
        </button>

        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            className="px-3 py-1.5 rounded-full text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors ml-auto flex items-center gap-1 shrink-0"
          >
            <X className="w-3.5 h-3.5" />
            <span>Reset Filters</span>
          </button>
        )}
      </div>

      {/* Search Bar Inputs */}
      <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by project name, client person, or phone..."
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white/90 border border-slate-200/80 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-xs"
          />
        </div>

        <div className="relative sm:w-64">
          <input
            type="text"
            value={placeTerm}
            onChange={(e) => setPlaceTerm(e.target.value)}
            placeholder="Filter by location/place..."
            className="w-full px-4 py-2.5 rounded-2xl bg-white/90 border border-slate-200/80 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-xs"
          />
        </div>

        <button
          type="submit"
          className="px-5 py-2.5 rounded-2xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition-colors shadow-xs shrink-0 flex items-center justify-center gap-2"
        >
          <Filter className="w-4 h-4" />
          <span>Apply</span>
        </button>
      </form>
    </div>
  );
}
