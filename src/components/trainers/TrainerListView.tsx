"use client";

import Link from "next/link";
import Image from "next/image";
import { 
  Star, 
  MapPin, 
  Phone, 
  MessageSquare, 
  FileText, 
  Plane, 
  ArrowRight
} from "lucide-react";
import { formatExperience, getInitials } from "@/lib/utils";
import type { TrainerWithRelations } from "./TrainerCard";

interface TrainerListViewProps {
  trainers: TrainerWithRelations[];
}

export function TrainerListView({ trainers }: TrainerListViewProps) {
  return (
    <div className="bg-white/90 backdrop-blur-md rounded-3xl border border-white/60 shadow-[0_4px_24px_rgba(15,23,42,0.04)] overflow-hidden">
      {/* Desktop Table View */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <th className="py-4 pl-6 pr-4">Faculty Member</th>
              <th className="py-4 px-4">Location & Mobility</th>
              <th className="py-4 px-4">Experience & Modes</th>
              <th className="py-4 px-4">Verified Subjects</th>
              <th className="py-4 px-4 text-center">Student Rating</th>
              <th className="py-4 pl-4 pr-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {trainers.map((trainer) => {
              const rating = parseFloat(trainer.cachedRating || "0");
              const reviewCount = trainer.cachedReviewsCount || 0;
              const initials = getInitials(trainer.fullName);
              const cleanPhone = trainer.whatsapp.replace(/[^0-9]/g, "");
              const waUrl = `https://wa.me/${cleanPhone.startsWith("91") ? cleanPhone : `91${cleanPhone}`}`;

              return (
                <tr
                  key={trainer.id}
                  className="hover:bg-slate-50/80 transition-colors group"
                >
                  {/* Column 1: Trainer Identity */}
                  <td className="py-4 pl-6 pr-4">
                    <div className="flex items-center gap-3">
                      {/* Avatar */}
                      <div className="w-11 h-11 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center overflow-hidden shrink-0 shadow-xs">
                        {trainer.photoUrl ? (
                          <Image
                            src={trainer.photoUrl}
                            alt={trainer.fullName}
                            width={44}
                            height={44}
                            unoptimized
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-xs font-extrabold text-indigo-700 tracking-wider">
                            {initials}
                          </span>
                        )}
                      </div>

                      {/* Name & Code */}
                      <div>
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/trainers/${trainer.id}`}
                            className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors inline-flex items-center gap-1"
                          >
                            <span>{trainer.fullName}</span>
                          </Link>
                          <span
                            className={`w-2 h-2 rounded-full ${
                              trainer.isActive ? "bg-emerald-500" : "bg-slate-300"
                            }`}
                            title={trainer.isActive ? "Active Profile" : "Inactive"}
                          />
                        </div>

                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="font-mono text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200/60">
                            {trainer.trainerCode}
                          </span>
                          {trainer.geoTier && trainer.geoTier === 1 && (
                            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                              Local Match
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Column 2: Location & Travel */}
                  <td className="py-4 px-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{trainer.currentCity}, {trainer.currentState}</span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {trainer.willingToTravelAnywhere ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">
                            <Plane className="w-3 h-3" />
                            <span>Pan-India</span>
                          </span>
                        ) : trainer.preferredLocations && trainer.preferredLocations.length > 0 ? (
                          <span className="text-[10px] text-slate-500">
                            {trainer.preferredLocations.slice(0, 2).join(", ")}
                            {trainer.preferredLocations.length > 2 && ` +${trainer.preferredLocations.length - 2}`}
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-400">Local Only</span>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Column 3: Experience & Modes */}
                  <td className="py-4 px-4">
                    <div className="space-y-1">
                      <div className="text-xs font-bold text-slate-800">
                        {formatExperience(trainer.totalExperience)} total
                        <span className="text-slate-400 font-normal ml-1">
                          ({formatExperience(trainer.trainingExperience)} teaching)
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-1">
                        {trainer.trainingModes && trainer.trainingModes.map((mode) => (
                          <span
                            key={mode}
                            className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600"
                          >
                            {mode}
                          </span>
                        ))}
                      </div>
                    </div>
                  </td>

                  {/* Column 4: Verified Core Subjects */}
                  <td className="py-4 px-4 max-w-[220px]">
                    {trainer.skills && trainer.skills.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {trainer.skills.slice(0, 2).map((s) => (
                          <span
                            key={s.id}
                            className="text-[11px] font-medium px-2 py-0.5 rounded-lg bg-indigo-50/70 text-indigo-800 border border-indigo-100 truncate max-w-[150px]"
                            title={s.subject?.name}
                          >
                            {s.subject?.name}
                          </span>
                        ))}
                        {trainer.skills.length > 2 && (
                          <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded-md self-center">
                            +{trainer.skills.length - 2}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400 italic">No skills listed</span>
                    )}
                  </td>

                  {/* Column 5: Rating */}
                  <td className="py-4 px-4 text-center">
                    {rating > 0 ? (
                      <div className="inline-flex flex-col items-center">
                        <span className="inline-flex items-center gap-1 text-xs font-extrabold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200/80">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          <span>{rating.toFixed(1)}</span>
                        </span>
                        <span className="text-[10px] text-slate-400 mt-0.5">
                          {reviewCount} {reviewCount === 1 ? "review" : "reviews"}
                        </span>
                      </div>
                    ) : (
                      <span className="text-[11px] text-slate-400 italic">No reviews</span>
                    )}
                  </td>

                  {/* Column 6: Quick Actions */}
                  <td className="py-4 pl-4 pr-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {/* Call */}
                      <a
                        href={`tel:${trainer.phone}`}
                        title={`Call ${trainer.phone}`}
                        className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                      >
                        <Phone className="w-3.5 h-3.5" />
                      </a>

                      {/* WhatsApp */}
                      <a
                        href={waUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Chat on WhatsApp"
                        className="p-2 rounded-xl text-emerald-600 hover:bg-emerald-50 transition-colors"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                      </a>

                      {/* Resume */}
                      {trainer.resumeUrl && (
                        <a
                          href={trainer.resumeUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Open Google Docs Resume"
                          className="p-2 rounded-xl text-indigo-600 hover:bg-indigo-50 transition-colors"
                        >
                          <FileText className="w-3.5 h-3.5" />
                        </a>
                      )}

                      {/* View Profile Button */}
                      <Link
                        href={`/trainers/${trainer.id}`}
                        className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-slate-900 text-white text-xs font-bold hover:bg-black transition-all shadow-xs group-hover:translate-x-0.5 ml-1"
                      >
                        <span>Profile</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Dense List View (for screens < 1024px) */}
      <div className="lg:hidden divide-y divide-slate-100">
        {trainers.map((trainer) => {
          const rating = parseFloat(trainer.cachedRating || "0");
          const initials = getInitials(trainer.fullName);
          const cleanPhone = trainer.whatsapp.replace(/[^0-9]/g, "");
          const waUrl = `https://wa.me/${cleanPhone.startsWith("91") ? cleanPhone : `91${cleanPhone}`}`;

          return (
            <div key={trainer.id} className="p-4 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0">
                    {trainer.photoUrl ? (
                      <Image
                        src={trainer.photoUrl}
                        alt={trainer.fullName}
                        width={40}
                        height={40}
                        unoptimized
                        className="w-full h-full object-cover rounded-xl"
                      />
                    ) : (
                      <span className="text-xs font-extrabold text-indigo-700">
                        {initials}
                      </span>
                    )}
                  </div>
                  <div>
                    <Link
                      href={`/trainers/${trainer.id}`}
                      className="font-bold text-sm text-slate-900 hover:text-indigo-600"
                    >
                      {trainer.fullName}
                    </Link>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                      <span className="font-mono text-[10px] bg-slate-100 px-1.5 py-0.2 rounded text-slate-600">
                        {trainer.trainerCode}
                      </span>
                      <span>&bull;</span>
                      <span>{trainer.currentCity}</span>
                    </div>
                  </div>
                </div>

                {rating > 0 && (
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    <span>{rating.toFixed(1)}</span>
                  </span>
                )}
              </div>

              {/* Skills */}
              {trainer.skills && trainer.skills.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {trainer.skills.map((s) => (
                    <span
                      key={s.id}
                      className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-700"
                    >
                      {s.subject?.name}
                    </span>
                  ))}
                </div>
              )}

              {/* Actions Footer */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                <div className="flex items-center gap-3">
                  <a href={`tel:${trainer.phone}`} className="text-slate-600 hover:text-indigo-600 flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5" />
                    <span>Call</span>
                  </a>
                  <a href={waUrl} target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:underline flex items-center gap-1">
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </a>
                </div>

                <Link
                  href={`/trainers/${trainer.id}`}
                  className="px-3.5 py-1 rounded-full bg-slate-900 text-white font-bold text-xs"
                >
                  View Profile
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
