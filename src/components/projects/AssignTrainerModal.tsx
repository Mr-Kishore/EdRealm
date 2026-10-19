"use client";

import { useState, useEffect, useTransition } from "react";
import { 
  X, 
  Search, 
  AlertTriangle, 
  Check, 
  UserPlus, 
  Star, 
  MapPin, 
  Loader2,
  Calendar,
  ShieldAlert
} from "lucide-react";
import { toast } from "sonner";
import { 
  getTrainersForProjectAssignment, 
  assignTrainerToProject 
} from "@/actions/projects";
import { formatDate } from "@/lib/utils";

interface AssignTrainerModalProps {
  projectId: string;
  projectName: string;
  projectDates: {
    startDate: string;
    endDate: string;
  };
  isOpen: boolean;
  onClose: () => void;
  onAssigned: () => void;
}

export function AssignTrainerModal({
  projectId,
  projectName,
  projectDates,
  isOpen,
  onClose,
  onAssigned,
}: AssignTrainerModalProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [candidates, setCandidates] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [assigningId, setAssigningId] = useState<string | null>(null);
  const [roleMap, setRoleMap] = useState<Record<string, string>>({});
  const [confirmingConflictId, setConfirmingConflictId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!isOpen) return;

    let active = true;
    const fetchTrainers = async () => {
      setLoading(true);
      try {
        const results = await getTrainersForProjectAssignment(projectId, searchTerm);
        if (active) {
          setCandidates(results);
        }
      } catch (err: any) {
        toast.error("Failed to load candidate trainers");
      } finally {
        if (active) setLoading(false);
      }
    };

    const timer = setTimeout(fetchTrainers, 250);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [isOpen, projectId, searchTerm]);

  if (!isOpen) return null;

  const handleAssign = (trainer: any, force = false) => {
    if (trainer.hasConflict && !force) {
      setConfirmingConflictId(trainer.id);
      return;
    }

    setAssigningId(trainer.id);
    startTransition(async () => {
      try {
        const role = roleMap[trainer.id] || "Trainer";
        const res = await assignTrainerToProject({
          projectId,
          trainerId: trainer.id,
          roleInProject: role,
          force,
        });

        if (res.success) {
          toast.success(`${trainer.fullName} assigned to project successfully!`);
          setConfirmingConflictId(null);
          onAssigned();
          onClose();
        } else if (res.conflict) {
          setConfirmingConflictId(trainer.id);
          toast.warning(res.message);
        }
      } catch (err: any) {
        toast.error(err.message || "Failed to assign trainer");
      } finally {
        setAssigningId(null);
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-2xl w-full border border-slate-200/80 shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Assign Trainer to Project</h2>
            <p className="text-xs text-slate-500 mt-1">
              {projectName} ({formatDate(projectDates.startDate)} &rarr; {formatDate(projectDates.endDate)})
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-slate-100 bg-slate-50/50">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search active trainers by name, code, or city..."
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              autoFocus
            />
          </div>
        </div>

        {/* Trainer list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center text-slate-400 space-y-2">
              <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
              <p className="text-xs">Checking trainer availability & conflicts...</p>
            </div>
          ) : candidates.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-sm">
              No matching unassigned trainers found.
            </div>
          ) : (
            candidates.map((t) => {
              const isConfirming = confirmingConflictId === t.id;
              const isSubmitting = assigningId === t.id;

              return (
                <div
                  key={t.id}
                  className={`p-4 rounded-2xl border transition-all ${
                    t.hasConflict
                      ? "border-amber-200 bg-amber-50/30"
                      : "border-slate-200/80 bg-white hover:border-indigo-200"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      {/* Avatar */}
                      <div className="h-10 w-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden shrink-0">
                        {t.photoUrl ? (
                          <img
                            src={t.photoUrl}
                            alt={t.fullName}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <span className="text-xs font-bold text-slate-600">
                            {t.fullName
                              .split(" ")
                              .map((n: string) => n[0])
                              .join("")
                              .substring(0, 2)
                              .toUpperCase()}
                          </span>
                        )}
                      </div>

                      {/* Info */}
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-slate-900">
                            {t.fullName}
                          </span>
                          <span className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                            {t.trainerCode}
                          </span>
                          {parseFloat(t.cachedRating) > 0 && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-600">
                              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                              {parseFloat(t.cachedRating).toFixed(1)}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            {t.currentCity}
                          </span>
                          {t.willingToTravelAnywhere && (
                            <span className="text-indigo-600 font-medium text-[11px]">
                              &bull; Travels Anywhere
                            </span>
                          )}
                        </div>

                        {/* Skills preview */}
                        {t.skills && t.skills.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {t.skills.slice(0, 3).map((s: any) => (
                              <span
                                key={s.id}
                                className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium"
                              >
                                {s.subject?.name}
                              </span>
                            ))}
                            {t.skills.length > 3 && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded-full text-slate-400">
                                +{t.skills.length - 3}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action */}
                    <div className="flex flex-col items-end gap-2">
                      <input
                        type="text"
                        placeholder="Role (e.g. Lead Trainer)"
                        value={roleMap[t.id] || ""}
                        onChange={(e) =>
                          setRoleMap({ ...roleMap, [t.id]: e.target.value })
                        }
                        className="text-xs px-2.5 py-1 rounded-xl bg-slate-50 border border-slate-200 w-36 text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />

                      {!isConfirming ? (
                        <button
                          onClick={() => handleAssign(t, false)}
                          disabled={isSubmitting}
                          className="px-4 py-1.5 rounded-full bg-slate-900 text-white text-xs font-semibold hover:bg-black transition-colors disabled:opacity-50 flex items-center gap-1.5"
                        >
                          {isSubmitting ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <UserPlus className="w-3.5 h-3.5" />
                          )}
                          <span>Assign</span>
                        </button>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => setConfirmingConflictId(null)}
                            className="px-2.5 py-1 text-[11px] font-semibold text-slate-500 hover:text-slate-800"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleAssign(t, true)}
                            disabled={isSubmitting}
                            className="px-3.5 py-1.5 rounded-full bg-amber-600 text-white text-xs font-bold hover:bg-amber-700 transition-colors shadow-xs flex items-center gap-1"
                          >
                            {isSubmitting ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <ShieldAlert className="w-3.5 h-3.5" />
                            )}
                            <span>Assign Anyway</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Overlap Warning Box */}
                  {t.hasConflict && (
                    <div className="mt-3 p-3 rounded-xl bg-amber-100/70 border border-amber-200/90 text-xs text-amber-900 space-y-1">
                      <div className="font-bold flex items-center gap-1.5">
                        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                        <span>Schedule Overlap Conflict Detected:</span>
                      </div>
                      <div className="pl-5 space-y-1 text-[11px]">
                        {t.conflicts.map((c: any) => (
                          <div key={c.projectId}>
                            &bull; Committed to <strong className="font-semibold">{c.projectName}</strong> ({formatDate(c.startDate)} &rarr; {formatDate(c.endDate)}) in {c.place}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
