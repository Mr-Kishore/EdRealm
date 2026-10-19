"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Search, MapPin, SlidersHorizontal, RotateCcw, Award, Star, Plane } from "lucide-react";
import { useCallback, useTransition } from "react";
import type { SkillCategory, MasterSubject } from "@/db/schema";

interface TrainerFiltersProps {
  categories: (SkillCategory & { subjects: MasterSubject[] })[];
}

export function TrainerFilters({ categories }: TrainerFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const currentQ = searchParams.get("q") || "";
  const currentCity = searchParams.get("city") || "";
  const currentSubjectId = searchParams.get("subjectId") || "";
  const currentMode = searchParams.get("trainingMode") || "";
  const currentMinRating = searchParams.get("minRating") || "";
  const currentMinExp = searchParams.get("minExperience") || "";
  const currentTravel = searchParams.get("willingToTravel") === "true";
  const currentStatus = searchParams.get("status") || "active";

  const updateFilters = useCallback(
    (name: string, value: string | boolean | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value === null || value === "" || value === false) {
        params.delete(name);
      } else {
        params.set(name, String(value));
      }
      params.set("page", "1"); // Reset to page 1 on filter change
      startTransition(() => {
        router.push(`${pathname}?${params.toString()}`);
      });
    },
    [router, pathname, searchParams]
  );

  const resetFilters = () => {
    startTransition(() => {
      router.push(pathname);
    });
  };

  const hasActiveFilters =
    Boolean(currentQ) ||
    Boolean(currentCity) ||
    Boolean(currentSubjectId) ||
    Boolean(currentMode) ||
    Boolean(currentMinRating) ||
    Boolean(currentMinExp) ||
    currentTravel ||
    currentStatus !== "active";

  return (
    <div className="bg-white/80 backdrop-blur-md rounded-3xl border border-white/60 p-5 shadow-[0_4px_24px_rgba(15,23,42,0.04)] mb-8">
      {/* Top Search & City Bar */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 mb-4">
        {/* Keyword Search */}
        <div className="md:col-span-6 relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search by name, ID (TR-0001), phone, or keyword..."
            defaultValue={currentQ}
            onChange={(e) => updateFilters("q", e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-full text-sm bg-slate-50/80 border border-slate-200/80 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-500"
          />
        </div>

        {/* City Filter (Geo-Prioritization Trigger) */}
        <div className="md:col-span-4 relative">
          <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Filter city (e.g. Vijayawada, Hyderabad)..."
            defaultValue={currentCity}
            onChange={(e) => updateFilters("city", e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-full text-sm bg-slate-50/80 border border-slate-200/80 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-500"
          />
        </div>

        {/* Reset Action */}
        <div className="md:col-span-2 flex items-center justify-end">
          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Secondary Filter Row: Subject, Mode, Rating, Experience, Travel */}
      <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-slate-100 text-xs">
        {/* Subject Filter Dropdown */}
        <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-200/70">
          <Award className="w-3.5 h-3.5 text-slate-500" />
          <select
            value={currentSubjectId}
            onChange={(e) => updateFilters("subjectId", e.target.value)}
            className="bg-transparent font-medium text-slate-700 focus:outline-none text-xs cursor-pointer"
          >
            <option value="">All Subjects</option>
            {categories.map((cat) => (
              <optgroup key={cat.id} label={cat.name}>
                {cat.subjects.map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    {sub.name}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>

        {/* Training Mode Filter */}
        <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-200/70">
          <select
            value={currentMode}
            onChange={(e) => updateFilters("trainingMode", e.target.value)}
            className="bg-transparent font-medium text-slate-700 focus:outline-none text-xs cursor-pointer"
          >
            <option value="">All Modes</option>
            <option value="Offline">Offline</option>
            <option value="Online">Online</option>
            <option value="Hybrid">Hybrid</option>
          </select>
        </div>

        {/* Minimum Rating Filter */}
        <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-200/70">
          <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
          <select
            value={currentMinRating}
            onChange={(e) => updateFilters("minRating", e.target.value)}
            className="bg-transparent font-medium text-slate-700 focus:outline-none text-xs cursor-pointer"
          >
            <option value="">Any Rating</option>
            <option value="4.5">4.5+ Stars</option>
            <option value="4.0">4.0+ Stars</option>
            <option value="3.5">3.5+ Stars</option>
          </select>
        </div>

        {/* Minimum Experience Filter */}
        <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-200/70">
          <select
            value={currentMinExp}
            onChange={(e) => updateFilters("minExperience", e.target.value)}
            className="bg-transparent font-medium text-slate-700 focus:outline-none text-xs cursor-pointer"
          >
            <option value="">Any Experience</option>
            <option value="2">2+ Years</option>
            <option value="4">4+ Years</option>
            <option value="6">6+ Years</option>
            <option value="8">8+ Years</option>
          </select>
        </div>

        {/* Willing to Travel Anywhere Checkbox */}
        <label className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-200/70 cursor-pointer select-none hover:bg-slate-100 transition-colors">
          <input
            type="checkbox"
            checked={currentTravel}
            onChange={(e) => updateFilters("willingToTravel", e.target.checked)}
            className="rounded text-indigo-600 focus:ring-indigo-500"
          />
          <Plane className="w-3.5 h-3.5 text-indigo-600" />
          <span className="font-medium text-slate-700">Willing to Travel</span>
        </label>

        {/* Active / Inactive Status Filter */}
        <div className="ml-auto flex items-center bg-slate-100 p-0.5 rounded-full border border-slate-200">
          {(["active", "all", "inactive"] as const).map((status) => (
            <button
              key={status}
              onClick={() => updateFilters("status", status === "active" ? null : status)}
              className={`px-3 py-1 rounded-full text-[11px] font-bold capitalize transition-all ${
                currentStatus === status
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
