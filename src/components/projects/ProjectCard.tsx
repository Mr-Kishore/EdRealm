import Link from "next/link";
import Image from "next/image";
import { 
  Calendar, 
  MapPin, 
  User, 
  Phone, 
  ArrowRight, 
  Clock, 
  Users 
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import type { Project } from "@/db/schema";

export interface ProjectWithTrainers extends Project {
  assignedTrainers?: {
    trainer: {
      id: string;
      trainerCode: string;
      fullName: string;
      photoUrl: string | null;
      cachedRating?: string;
      phone?: string;
    };
  }[];
}

interface ProjectCardProps {
  project: ProjectWithTrainers;
}

export function ProjectCard({ project }: ProjectCardProps) {
  // Calculate duration in days
  const start = new Date(project.startDate);
  const end = new Date(project.endDate);
  const durationDays = Math.max(1, Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ongoing":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/80 shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Ongoing
          </span>
        );
      case "upcoming":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200/80 shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            Upcoming
          </span>
        );
      case "completed":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200/80 shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
            Completed
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="group relative bg-white/80 backdrop-blur-md rounded-3xl border border-white/60 p-6 shadow-[0_4px_24px_rgba(15,23,42,0.04)] hover:shadow-[0_12px_32px_rgba(15,23,42,0.08)] hover:border-slate-300/80 transition-all duration-300 flex flex-col justify-between">
      <div className="space-y-4">
        {/* Status & Duration */}
        <div className="flex items-center justify-between gap-2">
          {getStatusBadge(project.status)}
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 bg-slate-50 px-2.5 py-1 rounded-full border border-slate-100">
            <Clock className="w-3 h-3 text-slate-400" />
            {durationDays} {durationDays === 1 ? "day" : "days"}
          </span>
        </div>

        {/* Project Title */}
        <div>
          <Link
            href={`/projects/${project.id}`}
            className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1"
          >
            {project.projectName}
          </Link>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="line-clamp-1">{project.place}</span>
          </div>
        </div>

        {/* Schedule */}
        <div className="p-3 rounded-2xl bg-slate-50/70 border border-slate-100 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-indigo-500" />
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Schedule</div>
              <div className="font-semibold text-slate-700">
                {formatDate(project.startDate)} &rarr; {formatDate(project.endDate)}
              </div>
            </div>
          </div>
        </div>

        {/* Client Contact Person */}
        <div className="space-y-1">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Client Contact</div>
          <div className="flex items-center justify-between text-xs font-medium text-slate-700">
            <span className="flex items-center gap-1.5 truncate">
              <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              {project.contactPersonName}
            </span>
            <a
              href={`tel:${project.contactPersonPhone}`}
              className="text-slate-500 hover:text-indigo-600 inline-flex items-center gap-1"
            >
              <Phone className="w-3 h-3" />
              <span>{project.contactPersonPhone}</span>
            </a>
          </div>
        </div>

        {/* Assigned Trainers Summary */}
        <div className="pt-2 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-slate-400" />
              <span className="text-xs font-semibold text-slate-600">
                {project.assignedTrainers && project.assignedTrainers.length > 0
                  ? `${project.assignedTrainers.length} Trainer${project.assignedTrainers.length > 1 ? "s" : ""} Assigned`
                  : "No trainers assigned"}
              </span>
            </div>

            {/* Overlapping trainer avatar stack */}
            {project.assignedTrainers && project.assignedTrainers.length > 0 && (
              <div className="flex -space-x-2 overflow-hidden">
                {project.assignedTrainers.slice(0, 4).map((item) => (
                  <div
                    key={item.trainer.id}
                    title={item.trainer.fullName}
                    className="inline-block h-6 w-6 rounded-full ring-2 ring-white bg-indigo-100 text-[10px] font-bold text-indigo-700 flex items-center justify-center overflow-hidden"
                  >
                    {item.trainer.photoUrl ? (
                      <Image
                        src={item.trainer.photoUrl}
                        alt={item.trainer.fullName}
                        width={24}
                        height={24}
                        unoptimized
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      item.trainer.fullName
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .substring(0, 2)
                        .toUpperCase()
                    )}
                  </div>
                ))}
                {project.assignedTrainers.length > 4 && (
                  <div className="inline-flex h-6 w-6 rounded-full ring-2 ring-white bg-slate-100 text-[10px] font-bold text-slate-600 items-center justify-center">
                    +{project.assignedTrainers.length - 4}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-end">
        <Link
          href={`/projects/${project.id}`}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900 text-white text-xs font-semibold hover:bg-black transition-all shadow-xs group-hover:translate-x-0.5"
        >
          <span>Manage Project</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
