"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  MapPin, 
  Calendar, 
  Clock, 
  User, 
  Phone, 
  Mail, 
  Edit, 
  Trash2, 
  CheckCircle2, 
  AlertCircle,
  Clock3,
  Loader2,
  FileText
} from "lucide-react";
import { toast } from "sonner";
import { formatDate } from "@/lib/utils";
import { overrideProjectStatus, deleteProject } from "@/actions/projects";
import type { Project } from "@/db/schema";

interface ProjectDashboardHeaderProps {
  project: Project;
}

export function ProjectDashboardHeader({ project }: ProjectDashboardHeaderProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const start = new Date(project.startDate);
  const end = new Date(project.endDate);
  const durationDays = Math.max(1, Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1);

  const handleStatusChange = (newStatus: "upcoming" | "ongoing" | "completed") => {
    startTransition(async () => {
      try {
        await overrideProjectStatus(project.id, newStatus, true);
        toast.success(`Project status manually overridden to ${newStatus}`);
      } catch (err: any) {
        toast.error("Failed to override project status");
      }
    });
  };

  const handleResetAutoStatus = () => {
    startTransition(async () => {
      try {
        await overrideProjectStatus(project.id, project.status as any, false);
        toast.success("Project status reset to automatic calendar calculation");
      } catch (err: any) {
        toast.error("Failed to reset project status");
      }
    });
  };

  const handleDelete = () => {
    startTransition(async () => {
      try {
        await deleteProject(project.id);
        toast.success("Project deleted successfully");
        router.push("/projects");
      } catch (err: any) {
        toast.error("Failed to delete project");
      }
    });
  };

  return (
    <div className="bg-white/80 backdrop-blur-md rounded-3xl border border-white/60 p-6 sm:p-8 shadow-[0_4px_24px_rgba(15,23,42,0.04)] space-y-6">
      {/* Top action row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/projects"
            className="p-2.5 rounded-full bg-white border border-slate-200 text-slate-600 hover:text-black hover:bg-slate-50 transition-colors shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Project Dashboard
              </span>
              {project.statusOverride && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
                  Manual Status Override
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {project.projectName}
            </h1>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          <Link
            href={`/projects/${project.id}/edit`}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors shadow-xs"
          >
            <Edit className="w-3.5 h-3.5" />
            <span>Edit</span>
          </Link>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-rose-200 hover:bg-rose-50 text-rose-600 text-xs font-bold transition-colors shadow-xs"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete</span>
          </button>
        </div>
      </div>

      {/* Primary Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
        {/* Schedule & Venue */}
        <div className="p-5 rounded-2xl bg-slate-50/70 border border-slate-100 space-y-3">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Venue & Location</div>
          <div className="flex items-start gap-2 text-sm font-semibold text-slate-800">
            <MapPin className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
            <span>{project.place}</span>
          </div>

          <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs text-slate-600">
            <div className="flex items-center gap-1.5 font-medium">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>{formatDate(project.startDate)} &rarr; {formatDate(project.endDate)}</span>
            </div>
            <span className="font-bold text-slate-700 bg-white px-2 py-0.5 rounded-full border border-slate-200 text-[11px]">
              {durationDays} {durationDays === 1 ? "day" : "days"}
            </span>
          </div>
        </div>

        {/* Client Contact Person */}
        <div className="p-5 rounded-2xl bg-slate-50/70 border border-slate-100 space-y-3">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Client / Institution POC</div>
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
            <User className="w-4 h-4 text-indigo-600 shrink-0" />
            <span>{project.contactPersonName}</span>
          </div>

          <div className="pt-2 border-t border-slate-200/60 flex flex-col gap-1 text-xs text-slate-600">
            <a
              href={`tel:${project.contactPersonPhone}`}
              className="inline-flex items-center gap-1.5 hover:text-indigo-600 font-medium"
            >
              <Phone className="w-3.5 h-3.5 text-slate-400" />
              <span>{project.contactPersonPhone}</span>
            </a>
            {project.contactPersonEmail && (
              <a
                href={`mailto:${project.contactPersonEmail}`}
                className="inline-flex items-center gap-1.5 hover:text-indigo-600 font-medium"
              >
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>{project.contactPersonEmail}</span>
              </a>
            )}
          </div>
        </div>

        {/* Status & Manual Control */}
        <div className="p-5 rounded-2xl bg-slate-50/70 border border-slate-100 space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Current Status</div>
            {project.statusOverride && (
              <button
                onClick={handleResetAutoStatus}
                disabled={isPending}
                className="text-[10px] font-semibold text-indigo-600 hover:underline"
              >
                Revert to Auto
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {(["upcoming", "ongoing", "completed"] as const).map((st) => {
              const isSelected = project.status === st;
              return (
                <button
                  key={st}
                  onClick={() => handleStatusChange(st)}
                  disabled={isPending}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${
                    isSelected
                      ? st === "ongoing"
                        ? "bg-emerald-600 text-white shadow-xs"
                        : st === "upcoming"
                        ? "bg-blue-600 text-white shadow-xs"
                        : "bg-slate-800 text-white shadow-xs"
                      : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                  }`}
                >
                  {st}
                </button>
              );
            })}
          </div>

          <p className="text-[11px] text-slate-500 pt-1">
            Clicking a status sets a manual override.
          </p>
        </div>
      </div>

      {/* Delivery Notes */}
      {project.notes && (
        <div className="p-4 rounded-2xl bg-slate-50/50 border border-slate-100 flex items-start gap-3 text-xs text-slate-600">
          <FileText className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-slate-700">Project Notes: </span>
            <span>{project.notes}</span>
          </div>
        </div>
      )}

      {/* Delete confirmation modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-100">
            <div className="w-10 h-10 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Delete Project?</h3>
              <p className="text-xs text-slate-500 mt-1">
                Are you sure you want to delete <strong className="font-semibold text-slate-800">{project.projectName}</strong>? This will remove the project from active schedules.
              </p>
            </div>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 rounded-full text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isPending}
                className="px-5 py-2 rounded-full bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 transition-colors shadow-xs"
              >
                {isPending ? "Deleting..." : "Yes, Delete Project"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
