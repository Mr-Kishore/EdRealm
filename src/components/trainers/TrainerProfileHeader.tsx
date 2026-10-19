"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { 
  ArrowLeft, 
  MapPin, 
  Briefcase, 
  Phone, 
  MessageSquare, 
  Mail, 
  FileText, 
  Edit, 
  Trash2, 
  Plane,
  Star,
  ExternalLink,
  ShieldCheck,
  Power
} from "lucide-react";
import { toast } from "sonner";
import { formatExperience, getInitials } from "@/lib/utils";
import { toggleTrainerStatus } from "@/actions/trainers";
import { DeleteTrainerModal } from "./DeleteTrainerModal";
import type { Trainer } from "@/db/schema";

interface TrainerProfileHeaderProps {
  trainer: Trainer;
}

export function TrainerProfileHeader({ trainer }: TrainerProfileHeaderProps) {
  const [isActive, setIsActive] = useState(trainer.isActive);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const rating = parseFloat(trainer.cachedRating || "0");
  const reviewCount = trainer.cachedReviewsCount || 0;
  const initials = getInitials(trainer.fullName);

  const cleanPhone = trainer.whatsapp.replace(/[^0-9]/g, "");
  const waUrl = `https://wa.me/${cleanPhone.startsWith("91") ? cleanPhone : `91${cleanPhone}`}`;

  const handleToggleStatus = () => {
    const nextState = !isActive;
    setIsActive(nextState);
    startTransition(async () => {
      try {
        await toggleTrainerStatus(trainer.id, nextState);
        toast.success(
          nextState
            ? "Trainer profile activated! Visible for project assignments."
            : "Trainer deactivated. Hidden from default directory search."
        );
      } catch {
        setIsActive(!nextState);
        toast.error("Failed to update status");
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Back Navigation & Direct Actions */}
      <div className="flex items-center justify-between">
        <Link
          href="/trainers"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:text-black hover:bg-slate-50 transition-colors shadow-sm"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Directory</span>
        </Link>

        <div className="flex items-center gap-3">
          {/* Edit Profile */}
          <Link
            href={`/trainers/${trainer.id}/edit`}
            className="pill-button-secondary"
          >
            <Edit className="w-3.5 h-3.5" />
            <span>Edit Profile</span>
          </Link>

          {/* Delete Danger Zone */}
          <button
            type="button"
            onClick={() => setIsDeleteModalOpen(true)}
            className="p-2.5 rounded-full text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors border border-transparent hover:border-rose-200"
            title="Delete Trainer (Danger Zone)"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Profile Header Card */}
      <div className="bg-white/80 backdrop-blur-md rounded-3xl border border-white/60 p-6 sm:p-8 shadow-[0_4px_24px_rgba(15,23,42,0.04)]">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          {/* Left Avatar & Identity */}
          <div className="flex items-start gap-5">
            {/* Avatar */}
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl overflow-hidden bg-gradient-to-br from-indigo-500/10 to-violet-500/10 border-2 border-slate-200/80 flex items-center justify-center shrink-0 shadow-sm relative">
              {trainer.photoUrl ? (
                <img
                  src={trainer.photoUrl}
                  alt={trainer.fullName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-2xl sm:text-3xl font-extrabold text-indigo-600 tracking-wider">
                  {initials}
                </span>
              )}
            </div>

            {/* Name, Code, Badges */}
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  {trainer.fullName}
                </h1>
                <span className="font-mono text-xs font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
                  {trainer.trainerCode}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 pt-1">
                <span className="inline-flex items-center gap-1 font-medium text-slate-700">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>
                    {trainer.currentCity}, {trainer.currentState}, {trainer.country}
                  </span>
                </span>
                <span>•</span>
                <span className="inline-flex items-center gap-1 font-medium text-slate-700">
                  <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                  <span>{formatExperience(trainer.totalExperience)} total exp</span>
                </span>
              </div>

              {/* Training Modes Badges */}
              <div className="flex flex-wrap items-center gap-1.5 pt-2">
                {trainer.trainingModes.map((mode) => (
                  <span
                    key={mode}
                    className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200"
                  >
                    {mode}
                  </span>
                ))}

                {trainer.willingToTravelAnywhere && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                    <Plane className="w-3 h-3" />
                    <span>Willing to Travel Anywhere in India</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Right Status Switch & Overall Rating Box */}
          <div className="flex flex-col md:items-end justify-between gap-4 shrink-0">
            {/* Active Switch */}
            <div className="flex items-center gap-2.5 bg-slate-50 px-3.5 py-1.5 rounded-full border border-slate-200/80">
              <span className="text-xs font-bold text-slate-700">
                {isActive ? "Profile Active" : "Profile Deactivated"}
              </span>
              <button
                type="button"
                onClick={handleToggleStatus}
                disabled={isPending}
                className={`w-10 h-6 flex items-center rounded-full p-1 transition-colors duration-200 cursor-pointer ${
                  isActive ? "bg-emerald-500" : "bg-slate-300"
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${
                    isActive ? "translate-x-4" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {/* Overall Rating Box */}
            <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 px-4 py-2 rounded-2xl">
              <Star className="w-5 h-5 fill-amber-500 text-amber-500" />
              <div>
                <span className="font-extrabold text-base text-amber-800 leading-none">
                  {rating > 0 ? rating.toFixed(1) : "New"} / 5.0
                </span>
                <span className="text-[11px] text-amber-700/80 block mt-0.5">
                  {reviewCount} verified student {reviewCount === 1 ? "review" : "reviews"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Links & Document Quick Actions */}
        <div className="mt-6 pt-6 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            {/* Phone */}
            <a
              href={`tel:${trainer.phone}`}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition-colors"
            >
              <Phone className="w-3.5 h-3.5 text-slate-600" />
              <span>{trainer.phone}</span>
            </a>

            {/* WhatsApp */}
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold transition-colors"
            >
              <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
              <span>WhatsApp</span>
            </a>

            {/* Email */}
            <a
              href={`mailto:${trainer.email}`}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition-colors"
            >
              <Mail className="w-3.5 h-3.5 text-slate-600" />
              <span>{trainer.email}</span>
            </a>

            {/* LinkedIn */}
            {trainer.linkedinUrl && (
              <a
                href={trainer.linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-800 text-xs font-semibold transition-colors"
              >
                <svg className="w-3.5 h-3.5 fill-current text-blue-600" viewBox="0 0 24 24">
                  <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76a1.67 1.67 0 1 0 0-3.34 1.67 1.67 0 0 0 0 3.34m1.4 9.74V9.93H5.06v8.57h2.8z" />
                </svg>
                <span>LinkedIn Profile</span>
                <ExternalLink className="w-3 h-3 opacity-60" />
              </a>
            )}
          </div>

          {/* Google Docs Resume Quick Open */}
          {trainer.resumeUrl && (
            <a
              href={trainer.resumeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition-all shadow-xs"
            >
              <FileText className="w-4 h-4 text-indigo-600" />
              <span>Open Google Docs Resume</span>
              <ExternalLink className="w-3 h-3 opacity-70" />
            </a>
          )}
        </div>
      </div>

      {/* GitHub-style Safety Modal */}
      <DeleteTrainerModal
        trainerId={trainer.id}
        trainerCode={trainer.trainerCode}
        trainerName={trainer.fullName}
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
      />
    </div>
  );
}
