"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { 
  Users, 
  UserPlus, 
  Trash2, 
  Star, 
  Phone, 
  MessageSquare, 
  ExternalLink,
  MapPin,
  Loader2
} from "lucide-react";
import { toast } from "sonner";
import { removeTrainerFromProject } from "@/actions/projects";
import { AssignTrainerModal } from "./AssignTrainerModal";
import type { Project, ProjectTrainer, Trainer, TrainerSkill, MasterSubject, SkillCategory } from "@/db/schema";

type TrainerWithRelations = Trainer & {
  skills: (TrainerSkill & {
    subject: MasterSubject & {
      category?: SkillCategory | null;
    };
  })[];
};

export interface AssignedTrainersSectionProps {
  project: Project & {
    assignedTrainers?: (ProjectTrainer & {
      trainer: TrainerWithRelations;
    })[];
  };
}

export function AssignedTrainersSection({ project }: AssignedTrainersSectionProps) {
  const router = useRouter();
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const handleRemove = (trainerId: string, trainerName: string) => {
    if (!confirm(`Are you sure you want to remove ${trainerName} from this project?`)) {
      return;
    }

    setRemovingId(trainerId);
    startTransition(async () => {
      try {
        await removeTrainerFromProject(project.id, trainerId);
        toast.success(`${trainerName} removed from project`);
        router.refresh();
      } catch {
        toast.error("Failed to remove trainer");
      } finally {
        setRemovingId(null);
      }
    });
  };

  return (
    <div className="bg-white/80 backdrop-blur-md rounded-3xl border border-white/60 p-6 sm:p-8 shadow-[0_4px_24px_rgba(15,23,42,0.04)] space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100/80 text-indigo-700 text-xs font-bold mb-2">
            <Users className="w-3.5 h-3.5" />
            <span>Assigned Faculty Team</span>
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Assigned Trainers ({project.assignedTrainers?.length || 0})
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Trainers assigned to lead curriculum sessions for this institution.
          </p>
        </div>

        <button
          onClick={() => setIsAssignModalOpen(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-slate-900 text-white font-semibold text-xs hover:bg-black transition-all shadow-md hover:shadow-lg"
        >
          <UserPlus className="w-4 h-4" />
          <span>Assign Trainer</span>
        </button>
      </div>

      {/* Trainers Table / List */}
      {project.assignedTrainers && project.assignedTrainers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {project.assignedTrainers.map((item) => {
            const t = item.trainer;
            const isRemoving = removingId === t.id;

            return (
              <div
                key={item.id}
                className="p-5 rounded-2xl bg-slate-50/70 border border-slate-200/80 space-y-4 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    {/* Avatar */}
                    <div className="h-12 w-12 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center overflow-hidden shrink-0">
                      {t.photoUrl ? (
                        <Image
                          src={t.photoUrl}
                          alt={t.fullName}
                          width={48}
                          height={48}
                          unoptimized
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="text-sm font-bold text-indigo-700">
                          {t.fullName
                            .split(" ")
                            .map((n: string) => n[0])
                            .join("")
                            .substring(0, 2)
                            .toUpperCase()}
                        </span>
                      )}
                    </div>

                    {/* Details */}
                    <div>
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/trainers/${t.id}`}
                          className="text-base font-bold text-slate-900 hover:text-indigo-600 transition-colors inline-flex items-center gap-1 group"
                        >
                          <span>{t.fullName}</span>
                          <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </Link>
                        <span className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 font-semibold">
                          {t.trainerCode}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-indigo-100/70 text-indigo-800">
                          {item.roleInProject || "Trainer"}
                        </span>
                        {parseFloat(t.cachedRating) > 0 && (
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-600">
                            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                            {parseFloat(t.cachedRating).toFixed(1)}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-2">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{t.currentCity}, {t.currentState}</span>
                      </div>
                    </div>
                  </div>

                  {/* Remove action */}
                  <button
                    onClick={() => handleRemove(t.id, t.fullName)}
                    disabled={isRemoving}
                    title="Remove from project"
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                  >
                    {isRemoving ? (
                      <Loader2 className="w-4 h-4 animate-spin text-rose-600" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </div>

                {/* Primary Skills Tags */}
                {t.skills && t.skills.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-200/60">
                    {t.skills.slice(0, 4).map((s) => (
                      <span
                        key={s.id}
                        className="text-[11px] font-medium px-2 py-0.5 rounded-lg bg-white border border-slate-200 text-slate-700"
                      >
                        {s.subject?.name}
                      </span>
                    ))}
                    {t.skills.length > 4 && (
                      <span className="text-[10px] text-slate-400 self-center">
                        +{t.skills.length - 4} more
                      </span>
                    )}
                  </div>
                )}

                {/* Contact Links */}
                <div className="flex items-center gap-2 pt-1">
                  <a
                    href={`tel:${t.phone}`}
                    className="flex-1 py-1.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold inline-flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5 text-slate-500" />
                    <span>Call</span>
                  </a>
                  <a
                    href={`https://wa.me/${t.whatsapp.replace(/[^0-9]/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold inline-flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                    <span>WhatsApp</span>
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-12 border-2 border-dashed border-slate-200 rounded-3xl text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 mx-auto flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
          <div className="max-w-sm mx-auto">
            <h3 className="text-base font-bold text-slate-900">No Trainers Assigned Yet</h3>
            <p className="text-xs text-slate-500 mt-1">
              Select verified faculty members from your trainer roster to deliver this project.
            </p>
          </div>
          <button
            onClick={() => setIsAssignModalOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-slate-900 text-white font-semibold text-xs hover:bg-black transition-all shadow-md"
          >
            <UserPlus className="w-4 h-4" />
            <span>Assign First Trainer</span>
          </button>
        </div>
      )}

      {/* Assign Modal */}
      <AssignTrainerModal
        projectId={project.id}
        projectName={project.projectName}
        projectDates={{
          startDate: project.startDate,
          endDate: project.endDate,
        }}
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        onAssigned={() => router.refresh()}
      />
    </div>
  );
}
