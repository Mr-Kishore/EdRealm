"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { 
  ArrowLeft, 
  Calendar, 
  MapPin, 
  User, 
  Phone, 
  Mail, 
  FileText, 
  Check, 
  Loader2, 
  AlertTriangle,
  Clock
} from "lucide-react";
import { toast } from "sonner";
import { CreateProjectSchema, type CreateProjectInput } from "@/lib/validations/project";
import { createProject, updateProject } from "@/actions/projects";
import type { Project } from "@/db/schema";

interface ProjectFormProps {
  initialData?: Project;
  isEditing?: boolean;
}

export function ProjectForm({ initialData, isEditing = false }: ProjectFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Format today's date in YYYY-MM-DD
  const todayStr = new Date().toISOString().split("T")[0];

  const defaultValues: CreateProjectInput = {
    projectName: initialData?.projectName || "",
    startDate: initialData?.startDate || todayStr,
    endDate: initialData?.endDate || todayStr,
    place: initialData?.place || "",
    contactPersonName: initialData?.contactPersonName || "",
    contactPersonPhone: initialData?.contactPersonPhone || "",
    contactPersonEmail: initialData?.contactPersonEmail || "",
    notes: initialData?.notes || "",
    statusOverride: initialData?.statusOverride || false,
    status: (initialData?.status as any) || "upcoming",
  };

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CreateProjectInput>({
    resolver: zodResolver(CreateProjectSchema) as any,
    defaultValues,
  });

  const watchStartDate = watch("startDate");
  const watchEndDate = watch("endDate");
  const watchStatusOverride = watch("statusOverride");

  // Calculate live duration
  let durationDays = 0;
  if (watchStartDate && watchEndDate) {
    const s = new Date(watchStartDate);
    const e = new Date(watchEndDate);
    if (!isNaN(s.getTime()) && !isNaN(e.getTime()) && e >= s) {
      durationDays = Math.round((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    }
  }

  const onSubmit = (data: CreateProjectInput) => {
    startTransition(async () => {
      try {
        if (isEditing && initialData) {
          const res = await updateProject(initialData.id, data);
          if (res.success) {
            toast.success("Project updated successfully!");
            router.push(`/projects/${initialData.id}`);
          }
        } else {
          const res = await createProject(data);
          if (res.success && res.project) {
            toast.success("Project created successfully!");
            router.push(`/projects/${res.project.id}`);
          }
        }
      } catch (err: any) {
        toast.error(err.message || "Failed to save project");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 max-w-4xl mx-auto pb-16">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href={isEditing && initialData ? `/projects/${initialData.id}` : "/projects"}
            className="p-2.5 rounded-full bg-white border border-slate-200 text-slate-600 hover:text-black hover:bg-slate-50 transition-colors shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {isEditing ? `Edit Project: ${initialData?.projectName}` : "Create New Project"}
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">
              {isEditing
                ? "Update timeline, venue location, client POC, or status overrides."
                : "Schedule training engagements, specify locations, and assign available trainers."}
            </p>
          </div>
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="px-6 py-2.5 rounded-full bg-slate-900 text-white font-semibold text-sm hover:bg-black transition-all shadow-md hover:shadow-lg disabled:opacity-50 flex items-center gap-2"
        >
          {isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Saving...</span>
            </>
          ) : (
            <>
              <Check className="w-4 h-4" />
              <span>{isEditing ? "Update Project" : "Create Project"}</span>
            </>
          )}
        </button>
      </div>

      {/* SECTION 1: Project Details */}
      <div className="bg-white/80 backdrop-blur-md rounded-3xl border border-white/60 p-6 sm:p-8 shadow-[0_4px_24px_rgba(15,23,42,0.04)] space-y-6">
        <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <span>Project Overview & Venue</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Project Name */}
          <div className="md:col-span-2 space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Project Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              {...register("projectName")}
              placeholder="e.g. Infosys Campus Recruitment Training (CRT) Batch 2026"
              className="w-full px-4 py-2.5 rounded-2xl bg-white border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            {errors.projectName && (
              <p className="text-xs text-rose-500">{errors.projectName.message}</p>
            )}
          </div>

          {/* Place / Venue */}
          <div className="md:col-span-2 space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span>Venue / Location <span className="text-rose-500">*</span></span>
            </label>
            <input
              type="text"
              {...register("place")}
              placeholder="e.g. RV College of Engineering, Mysore Road, Bangalore"
              className="w-full px-4 py-2.5 rounded-2xl bg-white border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            {errors.place && (
              <p className="text-xs text-rose-500">{errors.place.message}</p>
            )}
          </div>

          {/* Start Date */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>Start Date <span className="text-rose-500">*</span></span>
            </label>
            <input
              type="date"
              {...register("startDate")}
              className="w-full px-4 py-2.5 rounded-2xl bg-white border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            {errors.startDate && (
              <p className="text-xs text-rose-500">{errors.startDate.message}</p>
            )}
          </div>

          {/* End Date */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>End Date <span className="text-rose-500">*</span></span>
            </label>
            <input
              type="date"
              {...register("endDate")}
              className="w-full px-4 py-2.5 rounded-2xl bg-white border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            {errors.endDate && (
              <p className="text-xs text-rose-500">{errors.endDate.message}</p>
            )}
          </div>

          {/* Duration Indicator */}
          {durationDays > 0 && (
            <div className="md:col-span-2 p-3 rounded-2xl bg-indigo-50/70 border border-indigo-100 flex items-center gap-2 text-xs font-semibold text-indigo-700">
              <Clock className="w-4 h-4" />
              <span>
                Calculated Duration: {durationDays} day{durationDays > 1 ? "s" : ""}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* SECTION 2: Client Contact Person */}
      <div className="bg-white/80 backdrop-blur-md rounded-3xl border border-white/60 p-6 sm:p-8 shadow-[0_4px_24px_rgba(15,23,42,0.04)] space-y-6">
        <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <span>Client / College Point of Contact (POC)</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Contact Person Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-slate-400" />
              <span>Contact Name <span className="text-rose-500">*</span></span>
            </label>
            <input
              type="text"
              {...register("contactPersonName")}
              placeholder="e.g. Dr. Rajesh Kumar"
              className="w-full px-4 py-2.5 rounded-2xl bg-white border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            {errors.contactPersonName && (
              <p className="text-xs text-rose-500">{errors.contactPersonName.message}</p>
            )}
          </div>

          {/* Contact Phone */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-slate-400" />
              <span>Contact Phone <span className="text-rose-500">*</span></span>
            </label>
            <input
              type="text"
              {...register("contactPersonPhone")}
              placeholder="+91 9876543210"
              className="w-full px-4 py-2.5 rounded-2xl bg-white border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            {errors.contactPersonPhone && (
              <p className="text-xs text-rose-500">{errors.contactPersonPhone.message}</p>
            )}
          </div>

          {/* Contact Email */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              <span>Contact Email</span>
            </label>
            <input
              type="email"
              {...register("contactPersonEmail")}
              placeholder="placement@college.edu"
              className="w-full px-4 py-2.5 rounded-2xl bg-white border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            {errors.contactPersonEmail && (
              <p className="text-xs text-rose-500">{errors.contactPersonEmail.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* SECTION 3: Notes & Status Override */}
      <div className="bg-white/80 backdrop-blur-md rounded-3xl border border-white/60 p-6 sm:p-8 shadow-[0_4px_24px_rgba(15,23,42,0.04)] space-y-6">
        <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <span>Delivery Notes & Status Controls</span>
        </h2>

        <div className="space-y-5">
          {/* Notes */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Project Notes & Instructions
            </label>
            <textarea
              rows={3}
              {...register("notes")}
              placeholder="e.g. Labs with Python 3.12 installed. 60 students per batch. Trainer accommodation arranged at college guest house."
              className="w-full px-4 py-2.5 rounded-2xl bg-white border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Status Override Toggle */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                {...register("statusOverride")}
                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
              />
              <span className="text-sm font-semibold text-slate-800">
                Manual Status Override
              </span>
            </label>
            <p className="text-xs text-slate-500 pl-7">
              By default, project status updates automatically based on today's calendar date relative to start and end dates. Enable this to manually force a custom status.
            </p>

            {watchStatusOverride && (
              <div className="pl-7 pt-2 flex items-center gap-4">
                <span className="text-xs font-bold text-slate-700">Forced Status:</span>
                <div className="flex items-center gap-3">
                  {(["upcoming", "ongoing", "completed"] as const).map((st) => (
                    <label key={st} className="flex items-center gap-2 cursor-pointer text-xs font-semibold capitalize">
                      <input
                        type="radio"
                        value={st}
                        {...register("status")}
                        className="text-indigo-600 focus:ring-indigo-500"
                      />
                      <span>{st}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Submit footer */}
      <div className="flex items-center justify-end gap-3">
        <Link
          href={isEditing && initialData ? `/projects/${initialData.id}` : "/projects"}
          className="px-5 py-2.5 rounded-full bg-white border border-slate-200 text-slate-700 font-semibold text-sm hover:bg-slate-50 transition-colors"
        >
          Cancel
        </Link>
        <button
          type="submit"
          disabled={isPending}
          className="px-6 py-2.5 rounded-full bg-slate-900 text-white font-semibold text-sm hover:bg-black transition-all shadow-md hover:shadow-lg disabled:opacity-50 flex items-center gap-2"
        >
          {isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Saving...</span>
            </>
          ) : (
            <>
              <Check className="w-4 h-4" />
              <span>{isEditing ? "Update Project" : "Create Project"}</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
