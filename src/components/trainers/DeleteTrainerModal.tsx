"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Trash2, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { deleteTrainer } from "@/actions/trainers";

interface DeleteTrainerModalProps {
  trainerId: string;
  trainerCode: string;
  trainerName: string;
  isOpen: boolean;
  onClose: () => void;
}

export function DeleteTrainerModal({
  trainerId,
  trainerCode,
  trainerName,
  isOpen,
  onClose,
}: DeleteTrainerModalProps) {
  const router = useRouter();
  const [confirmInput, setConfirmInput] = useState("");
  const [isPending, startTransition] = useTransition();

  if (!isOpen) return null;

  const expectedPhrase = `DELETE ${trainerCode}/${trainerName}`;
  const isMatch = confirmInput.trim() === expectedPhrase;

  const handleDelete = () => {
    if (!isMatch) return;

    startTransition(async () => {
      try {
        await deleteTrainer(trainerId, confirmInput);
        toast.success(`Trainer ${trainerCode} deleted successfully`);
        onClose();
        router.push("/trainers");
      } catch (err: any) {
        toast.error(err.message || "Failed to delete trainer");
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative animate-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={isPending}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-black hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Warning Icon & Heading */}
        <div className="flex items-center gap-3.5 mb-4 text-rose-600">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-6 h-6 text-rose-600" />
          </div>
          <div>
            <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Delete Trainer Profile
            </h3>
            <span className="text-xs font-bold text-rose-600 uppercase tracking-wider">
              Danger Zone Confirmation
            </span>
          </div>
        </div>

        {/* Explanatory Warning */}
        <p className="text-sm text-slate-600 mb-5 leading-relaxed">
          Are you sure you want to delete{" "}
          <strong className="text-slate-900">{trainerName}</strong> (
          <span className="font-mono">{trainerCode}</span>)? This will deactivate their
          QR feedback code and remove them from active search and project assignments.
        </p>

        {/* GitHub-style Type to Confirm Box */}
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 mb-6 space-y-2">
          <label className="block text-xs text-slate-600">
            To verify, please type{" "}
            <span className="font-mono font-bold text-slate-900 select-all bg-white px-2 py-0.5 rounded border border-slate-200">
              {expectedPhrase}
            </span>{" "}
            below:
          </label>
          <input
            type="text"
            value={confirmInput}
            onChange={(e) => setConfirmInput(e.target.value)}
            placeholder={expectedPhrase}
            disabled={isPending}
            className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-300 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all placeholder:text-slate-300"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="px-5 py-2.5 rounded-full text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={!isMatch || isPending}
            className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-bold text-white transition-all ${
              isMatch && !isPending
                ? "bg-rose-600 hover:bg-rose-700 shadow-md hover:scale-105 active:scale-95 cursor-pointer"
                : "bg-slate-300 cursor-not-allowed opacity-60"
            }`}
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Deleting...</span>
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                <span>I understand, delete this trainer</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
