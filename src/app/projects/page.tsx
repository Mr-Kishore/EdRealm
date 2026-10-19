import Link from "next/link";
import { Plus, FolderKanban, ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { getProjects, type ProjectFilters as ProjectFiltersType } from "@/actions/projects";
import { Navbar } from "@/components/navigation/Navbar";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { ProjectFilters } from "@/components/projects/ProjectFilters";

export const dynamic = "force-dynamic";

interface ProjectsPageProps {
  searchParams: Promise<{
    status?: "all" | "upcoming" | "ongoing" | "completed";
    q?: string;
    place?: string;
    page?: string;
  }>;
}

export default async function ProjectsPage({ searchParams }: ProjectsPageProps) {
  const params = await searchParams;

  const filters: ProjectFiltersType = {
    status: params.status,
    q: params.q,
    place: params.place,
    page: params.page ? parseInt(params.page, 10) : 1,
    limit: 12,
  };

  const { projects: projectList, total, totalPages, currentPage, stats } = await getProjects(filters);

  return (
    <div className="min-h-screen bg-[#FAFBFF] text-slate-900 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8 sm:px-8 space-y-8">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100/80 text-indigo-700 text-xs font-bold mb-2">
              <FolderKanban className="w-3.5 h-3.5" />
              <span>Institutional Engagements</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Training Projects
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Manage client colleges, project schedules, and faculty assignments.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/projects/new"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-slate-900 text-white font-semibold text-xs hover:bg-black transition-all shadow-md hover:shadow-lg"
            >
              <Plus className="w-4 h-4" />
              <span>Create Project</span>
            </Link>
          </div>
        </div>

        {/* Filters & Tabs */}
        <ProjectFilters stats={stats} />

        {/* Projects Grid */}
        {projectList.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projectList.map((project) => (
              <ProjectCard key={project.id} project={project as any} />
            ))}
          </div>
        ) : (
          <div className="bg-white/60 backdrop-blur-md rounded-3xl border border-white/60 p-12 text-center space-y-4 shadow-sm">
            <div className="w-16 h-16 rounded-3xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mx-auto">
              <FolderKanban className="w-8 h-8" />
            </div>
            <div className="max-w-md mx-auto">
              <h3 className="text-lg font-bold text-slate-900">No Projects Found</h3>
              <p className="text-xs text-slate-500 mt-1">
                No training projects match your current filters or search terms. Try clearing filters or create a new project.
              </p>
            </div>
            <Link
              href="/projects/new"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-slate-900 text-white font-semibold text-xs hover:bg-black transition-all shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>Create First Project</span>
            </Link>
          </div>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-200/60 pt-6">
            <p className="text-xs text-slate-500">
              Showing page <strong className="font-semibold text-slate-800">{currentPage}</strong> of{" "}
              <strong className="font-semibold text-slate-800">{totalPages}</strong> ({total} projects)
            </p>

            <div className="flex items-center gap-2">
              {currentPage > 1 && (
                <Link
                  href={`/projects?page=${currentPage - 1}${params.status ? `&status=${params.status}` : ""}${params.q ? `&q=${encodeURIComponent(params.q)}` : ""}${params.place ? `&place=${encodeURIComponent(params.place)}` : ""}`}
                  className="inline-flex items-center gap-1 px-4 py-2 rounded-full bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Previous</span>
                </Link>
              )}

              {currentPage < totalPages && (
                <Link
                  href={`/projects?page=${currentPage + 1}${params.status ? `&status=${params.status}` : ""}${params.q ? `&q=${encodeURIComponent(params.q)}` : ""}${params.place ? `&place=${encodeURIComponent(params.place)}` : ""}`}
                  className="inline-flex items-center gap-1 px-4 py-2 rounded-full bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
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
