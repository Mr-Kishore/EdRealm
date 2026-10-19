import Link from "next/link";
import { 
  Users, 
  FolderKanban, 
  QrCode, 
  Star, 
  Sparkles, 
  BookOpen, 
  ArrowRight, 
  Plus, 
  Calendar, 
  MapPin, 
  MessageSquareQuote,
  Clock,
  TrendingUp,
  Award,
  CheckCircle2
} from "lucide-react";
import { getDashboardData } from "@/actions/dashboard";
import { Navbar } from "@/components/navigation/Navbar";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const { metrics, activeProjects, topTrainers, recentFeedback } = await getDashboardData();

  return (
    <div className="min-h-screen bg-[#FAFBFF] text-slate-900 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8 sm:px-8 space-y-8">
        {/* Welcome Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100/80 text-indigo-700 text-xs font-bold mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Operations Command Center</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Dashboard Overview
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Real-time faculty deployment, project timelines, and verified student feedback.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/trainers/new"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-slate-900 text-white font-semibold text-xs hover:bg-black transition-all shadow-md hover:shadow-lg"
            >
              <Plus className="w-4 h-4" />
              <span>Add Trainer</span>
            </Link>
            <Link
              href="/projects/new"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white border border-slate-200 text-slate-700 font-semibold text-xs hover:bg-slate-50 transition-all shadow-xs"
            >
              <Plus className="w-4 h-4 text-indigo-600" />
              <span>Create Project</span>
            </Link>
          </div>
        </div>

        {/* Summary Metric Cards (Top 3) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* 1. Active Trainers */}
          <Link
            href="/trainers"
            className="group p-6 rounded-3xl bg-white/80 backdrop-blur-md border border-white/60 shadow-[0_4px_24px_rgba(15,23,42,0.04)] hover:shadow-[0_12px_32px_rgba(15,23,42,0.08)] hover:border-slate-300/80 transition-all space-y-4"
          >
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 group-hover:scale-105 transition-transform">
                <Users className="w-6 h-6" />
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                {metrics.activeTrainers}
              </div>
              <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mt-1">
                Active Faculty Members
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Out of {metrics.totalTrainers} total registered trainers
              </p>
            </div>
          </Link>

          {/* 2. Active Projects */}
          <Link
            href="/projects"
            className="group p-6 rounded-3xl bg-white/80 backdrop-blur-md border border-white/60 shadow-[0_4px_24px_rgba(15,23,42,0.04)] hover:shadow-[0_12px_32px_rgba(15,23,42,0.08)] hover:border-slate-300/80 transition-all space-y-4"
          >
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 group-hover:scale-105 transition-transform">
                <FolderKanban className="w-6 h-6" />
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all" />
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                {metrics.ongoingProjects + metrics.upcomingProjects}
              </div>
              <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mt-1">
                Active Engagements
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {metrics.ongoingProjects} ongoing &bull; {metrics.upcomingProjects} upcoming ({metrics.totalProjects} total)
              </p>
            </div>
          </Link>

          {/* 3. QR Standees */}
          <div className="p-6 rounded-3xl bg-white/80 backdrop-blur-md border border-white/60 shadow-[0_4px_24px_rgba(15,23,42,0.04)] space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-violet-50 border border-violet-100 flex items-center justify-center text-violet-600">
                <QrCode className="w-6 h-6" />
              </div>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
                Live
              </span>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                {metrics.qrActiveTrainers}
              </div>
              <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mt-1">
                Active QR Standees
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Desk standees in circulation at partner institutions
              </p>
            </div>
          </div>
        </div>

        {/* Detailed Sections Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left: Active Engagements */}
          <div className="bg-white/80 backdrop-blur-md rounded-3xl border border-white/60 p-6 sm:p-8 shadow-[0_4px_24px_rgba(15,23,42,0.04)] space-y-5 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
                    <FolderKanban className="w-5 h-5 text-indigo-600" />
                    <span>Active Campus Engagements</span>
                  </h2>
                  <p className="text-xs text-slate-500">Upcoming and ongoing training deliverables</p>
                </div>
                <Link
                  href="/projects"
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                >
                  <span>View All</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {activeProjects.length > 0 ? (
                <div className="space-y-3">
                  {activeProjects.map((p) => (
                    <Link
                      key={p.id}
                      href={`/projects/${p.id}`}
                      className="block p-4 rounded-2xl bg-slate-50/70 border border-slate-200/80 hover:bg-slate-50 hover:border-indigo-200 transition-all space-y-2 group"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-bold text-sm text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
                          {p.projectName}
                        </h3>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold capitalize shrink-0 ${
                            p.status === "ongoing"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {p.status}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          <span className="truncate max-w-[180px]">{p.place}</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          <span>{formatDate(p.startDate)} &rarr; {formatDate(p.endDate)}</span>
                        </span>
                      </div>

                      {p.assignedTrainers && p.assignedTrainers.length > 0 && (
                        <div className="pt-2 border-t border-slate-200/60 flex items-center gap-2 text-[11px] text-slate-600">
                          <Users className="w-3 h-3 text-slate-400" />
                          <span>
                            {p.assignedTrainers.map((a) => a.trainer.fullName).join(", ")}
                          </span>
                        </div>
                      )}
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-slate-400 text-xs">
                  No upcoming or ongoing training projects scheduled.
                </div>
              )}
            </div>

            <Link
              href="/projects/new"
              className="mt-4 w-full py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold text-center block transition-colors"
            >
              + Create New Engagement
            </Link>
          </div>

          {/* Right: Top Rated Faculty */}
          <div className="bg-white/80 backdrop-blur-md rounded-3xl border border-white/60 p-6 sm:p-8 shadow-[0_4px_24px_rgba(15,23,42,0.04)] space-y-5 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
                    <Award className="w-5 h-5 text-indigo-600" />
                    <span>Top Rated Faculty</span>
                  </h2>
                  <p className="text-xs text-slate-500">Trainers with highest classroom satisfaction</p>
                </div>
                <Link
                  href="/trainers"
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                >
                  <span>Directory</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {topTrainers.length > 0 ? (
                <div className="space-y-3">
                  {topTrainers.map((t) => (
                    <Link
                      key={t.id}
                      href={`/trainers/${t.id}`}
                      className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50/70 border border-slate-200/80 hover:bg-slate-50 hover:border-indigo-200 transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center overflow-hidden shrink-0">
                          {t.photoUrl ? (
                            <img src={t.photoUrl} alt={t.fullName} className="h-full w-full object-cover" />
                          ) : (
                            <span className="text-xs font-bold text-indigo-700">
                              {t.fullName
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .substring(0, 2)
                                .toUpperCase()}
                            </span>
                          )}
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                              {t.fullName}
                            </span>
                            <span className="font-mono text-[10px] px-1.5 py-0.2 rounded-md bg-slate-200 text-slate-600">
                              {t.trainerCode}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                            <span>{t.currentCity}</span>
                            {t.skills && t.skills[0] && (
                              <span className="text-slate-400">&bull; {t.skills[0].subject?.name}</span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 font-bold text-xs text-amber-600">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span>{parseFloat(t.cachedRating) > 0 ? parseFloat(t.cachedRating).toFixed(1) : "N/A"}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-slate-400 text-xs">
                  No active trainers registered yet.
                </div>
              )}
            </div>

            <Link
              href="/trainers/new"
              className="mt-4 w-full py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold text-center block transition-colors"
            >
              + Onboard New Trainer
            </Link>
          </div>
        </div>

        {/* Live Student Feedback Stream */}
        {recentFeedback.length > 0 && (
          <div className="bg-white/80 backdrop-blur-md rounded-3xl border border-white/60 p-6 sm:p-8 shadow-[0_4px_24px_rgba(15,23,42,0.04)] space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
                  <MessageSquareQuote className="w-5 h-5 text-indigo-600" />
                  <span>Recent Classroom Feedback Submissions</span>
                </h2>
                <p className="text-xs text-slate-500">Live evaluations submitted by students via QR standees</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recentFeedback.map((fb) => (
                <div
                  key={fb.id}
                  className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/80 space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700">
                      Roll: {fb.studentId}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(fb.submittedAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                      })}
                    </span>
                  </div>

                  <div className="text-slate-700 font-semibold">
                    Faculty: <Link href={`/trainers/${fb.trainer.id}`} className="text-indigo-600 hover:underline">{fb.trainer.fullName}</Link>
                  </div>

                  {fb.additionalComments && (
                    <p className="text-slate-600 italic line-clamp-2 text-[11px] pt-1 border-t border-slate-200/60">
                      &ldquo;{fb.additionalComments}&rdquo;
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
