"use client";

import Link from "next/link";
import Image from "next/image";
import { 
  Star, 
  MapPin, 
  Briefcase, 
  Phone, 
  MessageSquare, 
  FileText, 
  ExternalLink,
  Plane,
  Award
} from "lucide-react";
import { cn, formatExperience, getInitials } from "@/lib/utils";
import type { Trainer, TrainerSkill, MasterSubject, SkillCategory } from "@/db/schema";

export type TrainerWithRelations = Trainer & {
  skills: (TrainerSkill & {
    subject: MasterSubject & {
      category?: SkillCategory | null;
    };
  })[];
  geoTier?: number; // 1: Local, 2: Preferred, 3: Travel Anywhere, 4: Outstation
};

interface TrainerCardProps {
  trainer: TrainerWithRelations;
}

export function TrainerCard({ trainer }: TrainerCardProps) {
  const rating = parseFloat(trainer.cachedRating || "0");
  const reviewCount = trainer.cachedReviewsCount || 0;
  const initials = getInitials(trainer.fullName);

  // Clean WhatsApp number
  const cleanPhone = trainer.whatsapp.replace(/[^0-9]/g, "");
  const waUrl = `https://wa.me/${cleanPhone.startsWith("91") ? cleanPhone : `91${cleanPhone}`}`;

  return (
    <div className="glass-card flex flex-col justify-between p-6 rounded-3xl relative overflow-hidden group">
      {/* Top Header: Avatar, Info, Code */}
      <div>
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-center gap-3.5">
            {/* Avatar */}
            <div className="w-14 h-14 rounded-2xl overflow-hidden bg-gradient-to-br from-indigo-500/10 to-violet-500/10 border border-slate-200/80 flex items-center justify-center shrink-0 relative shadow-sm">
              {trainer.photoUrl ? (
                <Image
                  src={trainer.photoUrl}
                  alt={trainer.fullName}
                  width={56}
                  height={56}
                  unoptimized
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-base font-extrabold text-indigo-600 tracking-wider">
                  {initials}
                </span>
              )}
            </div>

            {/* Names & ID */}
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-lg text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
                  {trainer.fullName}
                </h3>
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="font-mono text-xs font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                  {trainer.trainerCode}
                </span>
                <span
                  className={cn(
                    "w-2 h-2 rounded-full",
                    trainer.isActive ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-slate-300"
                  )}
                  title={trainer.isActive ? "Active" : "Inactive"}
                />
              </div>
            </div>
          </div>

          {/* Overall Rating Pill */}
          <div className="flex flex-col items-end shrink-0">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 text-amber-700 rounded-full font-bold text-xs border border-amber-500/20">
              <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
              <span>{rating > 0 ? rating.toFixed(1) : "New"}</span>
            </div>
            {reviewCount > 0 && (
              <span className="text-[11px] text-slate-500 mt-1">
                {reviewCount} {reviewCount === 1 ? "review" : "reviews"}
              </span>
            )}
          </div>
        </div>

        {/* Location & Experience Badges */}
        <div className="flex flex-wrap items-center gap-2 mb-4 text-xs">
          <div className="inline-flex items-center gap-1 text-slate-600 bg-slate-100/80 px-2.5 py-1 rounded-lg">
            <MapPin className="w-3.5 h-3.5 text-slate-500" />
            <span>
              {trainer.currentCity}, {trainer.currentState}
            </span>
          </div>

          <div className="inline-flex items-center gap-1 text-slate-600 bg-slate-100/80 px-2.5 py-1 rounded-lg">
            <Briefcase className="w-3.5 h-3.5 text-slate-500" />
            <span>{formatExperience(trainer.totalExperience)} total</span>
          </div>

          {trainer.willingToTravelAnywhere && (
            <div className="inline-flex items-center gap-1 text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg font-medium">
              <Plane className="w-3.5 h-3.5" />
              <span>Pan-India</span>
            </div>
          )}
        </div>

        {/* Skills & Subject Tags */}
        <div className="space-y-1.5 mb-5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
            Core Expertise
          </span>
          <div className="flex flex-wrap gap-1.5">
            {trainer.skills && trainer.skills.length > 0 ? (
              trainer.skills.slice(0, 3).map((skill) => (
                <span
                  key={skill.id}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-indigo-50/70 text-indigo-700 border border-indigo-100/80"
                >
                  <Award className="w-3 h-3 opacity-70" />
                  <span>{skill.subject?.name}</span>
                  <span className="text-[10px] text-indigo-700/80 font-normal">
                    ({skill.expertiseLevel.slice(0, 3)})
                  </span>
                </span>
              ))
            ) : (
              <span className="text-xs text-slate-500 italic">No skills listed</span>
            )}
            {trainer.skills && trainer.skills.length > 3 && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold text-slate-500 bg-slate-100">
                +{trainer.skills.length - 3} more
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Footer Quick Actions */}
      <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
        {/* Contact shortcuts */}
        <div className="flex items-center gap-1.5">
          <a
            href={`tel:${trainer.phone}`}
            className="p-2 rounded-full text-slate-600 hover:text-black hover:bg-slate-100 transition-colors"
            title={`Call: ${trainer.phone}`}
          >
            <Phone className="w-4 h-4" />
          </a>
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-full text-emerald-600 hover:bg-emerald-50 transition-colors"
            title="Chat on WhatsApp"
          >
            <MessageSquare className="w-4 h-4" />
          </a>
          {trainer.resumeUrl && (
            <a
              href={trainer.resumeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-full text-indigo-600 hover:bg-indigo-50 transition-colors"
              title="Open Google Docs Resume"
            >
              <FileText className="w-4 h-4" />
            </a>
          )}
        </div>

        {/* View Profile Button */}
        <Link
          href={`/trainers/${trainer.id}`}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 text-white rounded-full text-xs font-bold shadow-sm transition-all duration-200 hover:bg-black hover:scale-105 active:scale-95"
        >
          <span>View Profile</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
