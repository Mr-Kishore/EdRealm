import Link from "next/link";
import { Plus, Download, Users, ChevronLeft, ChevronRight } from "lucide-react";
import { getTrainers, type TrainerFilterOptions } from "@/actions/trainers";
import { getCatalogHierarchy } from "@/actions/catalog";
import { Navbar } from "@/components/navigation/Navbar";
import { TrainerListView } from "@/components/trainers/TrainerListView";
import { TrainerFilters } from "@/components/trainers/TrainerFilters";

export const dynamic = "force-dynamic";

interface TrainersPageProps {
  searchParams: Promise<{
    q?: string;
    city?: string;
    state?: string;
    subjectId?: string;
    trainingMode?: string;
    minExperience?: string;
    minRating?: string;
    willingToTravel?: string;
    status?: "active" | "inactive" | "all";
    page?: string;
  }>;
}

export default async function TrainersPage({ searchParams }: TrainersPageProps) {
  const params = await searchParams;

  const filters: TrainerFilterOptions = {
    q: params.q,
    city: params.city,
    state: params.state,
    subjectId: params.subjectId,
    trainingMode: params.trainingMode,
    minExperience: params.minExperience ? parseFloat(params.minExperience) : undefined,
    minRating: params.minRating ? parseFloat(params.minRating) : undefined,
    willingToTravel: params.willingToTravel === "true",
    status: params.status || "active",
    page: params.page ? parseInt(params.page, 10) : 1,
    limit: 25,
  };

  const [categories, { trainers, pagination }] = await Promise.all([
    getCatalogHierarchy(),
    getTrainers(filters),
  ]);

  // Build CSV export URL retaining current filters
  const exportQuery = new URLSearchParams();
  if (params.q) exportQuery.set("q", params.q);
  if (params.city) exportQuery.set("city", params.city);
  if (params.state) exportQuery.set("state", params.state);
  if (params.subjectId) exportQuery.set("subjectId", params.subjectId);
  if (params.trainingMode) exportQuery.set("trainingMode", params.trainingMode);
  if (params.minExperience) exportQuery.set("minExperience", params.minExperience);
  if (params.minRating) exportQuery.set("minRating", params.minRating);
  const exportUrl = `/api/trainers/export?${exportQuery.toString()}`;

  return (
    <div className="min-h-screen bg-[#FAFBFF] text-slate-900 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8 sm:px-8">
        {/* Page Top Title & Header Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100/80 text-indigo-700 text-xs font-bold mb-2">
              <Users className="w-3.5 h-3.5" />
              <span>{pagination.total} Verified Trainers in Database</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Trainer Directory & Search
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Find, evaluate, and assign expert trainers with geo-prioritized location discovery.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Export CSV Button */}
            <a
              href={exportUrl}
              className="pill-button-secondary"
              title="Download CSV spreadsheet of current search results"
            >
              <Download className="w-4 h-4 text-indigo-600" />
              <span>Export CSV</span>
            </a>

            {/* + Add Trainer Button */}
            <Link href="/trainers/new" className="pill-button">
              <Plus className="w-4 h-4" />
              <span>+ Add Trainer</span>
            </Link>
          </div>
        </div>

        {/* Multi-Filter Bar */}
        <TrainerFilters categories={categories} />

        {/* Trainer List (Table / Dense List) */}
        {trainers.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-white/70 border border-dashed border-slate-300">
            <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-lg font-extrabold text-slate-800">No Trainers Found</h3>
            <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
              We couldn&apos;t find any trainers matching your current filter criteria. Try resetting filters or add a new trainer.
            </p>
            <div className="flex items-center justify-center gap-3 mt-6">
              <Link href="/trainers" className="pill-button-secondary">
                <span>Reset All Filters</span>
              </Link>
              <Link href="/trainers/new" className="pill-button">
                <Plus className="w-4 h-4" />
                <span>Add First Trainer</span>
              </Link>
            </div>
          </div>
        ) : (
          <TrainerListView trainers={trainers as any} />
        )}

        {/* Pagination Controls */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between pt-10 border-t border-slate-200 mt-10">
            <span className="text-xs font-semibold text-slate-500">
              Showing page {pagination.page} of {pagination.totalPages} ({pagination.total} total)
            </span>

            <div className="flex items-center gap-2">
              {pagination.page > 1 && (
                <Link
                  href={`/trainers?page=${pagination.page - 1}`}
                  className="px-4 py-2 rounded-full border border-slate-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors inline-flex items-center gap-1"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Previous</span>
                </Link>
              )}
              {pagination.page < pagination.totalPages && (
                <Link
                  href={`/trainers?page=${pagination.page + 1}`}
                  className="px-4 py-2 rounded-full border border-slate-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors inline-flex items-center gap-1"
                >
                  <span>Next</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
