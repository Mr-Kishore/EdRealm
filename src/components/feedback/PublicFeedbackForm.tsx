"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { 
  Star, 
  CheckCircle2, 
  Loader2, 
  School, 
  Send,
  MessageSquare
} from "lucide-react";
import { toast } from "sonner";
import { submitStudentFeedback } from "@/actions/feedback";
import type { FeedbackQuestion, Trainer, TrainerSkill, MasterSubject } from "@/db/schema";

interface PublicFeedbackFormProps {
  qrToken: string;
  trainer: Trainer & {
    skills: (TrainerSkill & {
      subject: MasterSubject;
    })[];
  };
  questions: FeedbackQuestion[];
  projects: {
    id: string;
    projectName: string;
    place: string;
    status: string;
  }[];
  formConfig?: {
    formTitle?: string;
    formSubtitle?: string;
    improvementPrompt?: string;
    appreciationPrompt?: string;
    thankYouHeading?: string;
    thankYouMessage?: string;
  };
}

const RATING_LABELS: Record<number, string> = {
  1: "Needs Improvement",
  2: "Fair",
  3: "Good",
  4: "Very Good",
  5: "Excellent",
};

export function PublicFeedbackForm({
  qrToken,
  trainer,
  questions,
  projects,
  formConfig,
}: PublicFeedbackFormProps) {
  const [renderedAt] = useState<number>(() => Date.now());
  const [isPending, startTransition] = useTransition();
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Form State
  const [projectId, setProjectId] = useState<string>(projects[0]?.id || "");
  const [studentId, setStudentId] = useState("");
  const [studentName, setStudentName] = useState("");
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [hoveredRatings, setHoveredRatings] = useState<Record<string, number>>({});
  const [improvementAreas, setImprovementAreas] = useState("");
  const [additionalComments, setAdditionalComments] = useState("");

  // Honeypot field
  const [faxNumberHoneypot, setFaxNumberHoneypot] = useState("");

  const handleStarClick = (questionId: string, rating: number) => {
    setRatings((prev) => ({ ...prev, [questionId]: rating }));
  };

  const handleStarHover = (questionId: string, rating: number) => {
    setHoveredRatings((prev) => ({ ...prev, [questionId]: rating }));
  };

  const handleStarLeave = (questionId: string) => {
    setHoveredRatings((prev) => {
      const next = { ...prev };
      delete next[questionId];
      return next;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!studentId.trim()) {
      toast.error("Please enter your Student Roll Number / ID");
      return;
    }

    // Check all required questions are rated
    for (const q of questions) {
      if (q.isRequired && !ratings[q.id]) {
        toast.error(`Please provide a rating for: "${q.questionText}"`);
        return;
      }
    }

    startTransition(async () => {
      try {
        await submitStudentFeedback({
          qrToken,
          trainerId: trainer.id,
          projectId: projectId || undefined,
          studentName: studentName.trim() || undefined,
          studentId: studentId.trim().toUpperCase(),
          improvementAreas: improvementAreas.trim() || undefined,
          additionalComments: additionalComments.trim() || undefined,
          ratings,
          faxNumberHoneypot,
          renderedAt,
        });

        setIsSubmitted(true);
        toast.success("Thank you! Your feedback has been recorded.");
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to submit feedback";
        toast.error(message);
      }
    });
  };

  if (isSubmitted) {
    return (
      <div className="max-w-xl mx-auto py-12 px-4 text-center space-y-6 animate-in fade-in zoom-in-95">
        <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {formConfig?.thankYouHeading || "Feedback Submitted!"}
          </h2>
          <p className="text-sm text-slate-600 max-w-md mx-auto">
            {formConfig?.thankYouMessage ? (
              formConfig.thankYouMessage
            ) : (
              <>Thank you for rating <strong className="text-slate-900">{trainer.fullName}</strong>. Your honest evaluation directly empowers high-quality training standards at EdRealm.</>
            )}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs max-w-sm mx-auto text-xs text-slate-500">
          Roll Number: <strong className="text-slate-800 font-mono">{studentId.toUpperCase()}</strong>
          <br />
          Recorded at: {new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-8 pb-16">
      {/* Invisible Honeypot */}
      <input
        type="text"
        name="fax_number"
        value={faxNumberHoneypot}
        onChange={(e) => setFaxNumberHoneypot(e.target.value)}
        tabIndex={-1}
        autoComplete="off"
        className="hidden"
        style={{ display: "none" }}
      />

      {/* Trainer Card Header */}
      <div className="bg-white/90 backdrop-blur-md rounded-3xl border border-white/60 p-6 sm:p-8 shadow-[0_4px_24px_rgba(15,23,42,0.04)] space-y-4">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center overflow-hidden shrink-0">
            {trainer.photoUrl ? (
              <Image
                src={trainer.photoUrl}
                alt={trainer.fullName}
                width={64}
                height={64}
                unoptimized
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-lg font-bold text-indigo-700">
                {trainer.fullName
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .substring(0, 2)
                  .toUpperCase()}
              </span>
            )}
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
                {formConfig?.formTitle || "Official Trainer Evaluation"}
              </span>
              <span className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                {trainer.trainerCode}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
              {trainer.fullName}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              {formConfig?.formSubtitle || "Please take 1 minute to share your honest class experience."}
            </p>
          </div>
        </div>

        {/* Subjects taught preview */}
        {trainer.skills && trainer.skills.length > 0 && (
          <div className="pt-3 border-t border-slate-100 flex flex-wrap gap-1.5">
            {trainer.skills.map((s) => (
              <span
                key={s.id}
                className="text-xs font-medium px-2.5 py-1 rounded-xl bg-slate-50 border border-slate-200/80 text-slate-700"
              >
                {s.subject?.name}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Section 1: Student & Batch Details */}
      <div className="bg-white/80 backdrop-blur-md rounded-3xl border border-white/60 p-6 sm:p-8 shadow-[0_4px_24px_rgba(15,23,42,0.04)] space-y-5">
        <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <span>Your Student Identification</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Roll Number (Mandatory) */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Student Roll Number / College ID <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value.toUpperCase())}
              placeholder="e.g. 1RV22CS045"
              required
              className="w-full px-4 py-2.5 rounded-2xl bg-white border border-slate-200 text-sm font-mono text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <p className="text-[11px] text-slate-400">
              Used strictly to ensure one verified evaluation per student daily.
            </p>
          </div>

          {/* Student Name (Optional) */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Student Name <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <input
              type="text"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              placeholder="e.g. Ananya Sharma"
              className="w-full px-4 py-2.5 rounded-2xl bg-white border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Project / Engagement Selector */}
          {projects.length > 0 && (
            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <School className="w-3.5 h-3.5 text-slate-400" />
                <span>Training Program / Campus</span>
              </label>
              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl bg-white border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.projectName} ({p.place})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Section 2: 7 Dynamic Rating Criteria */}
      <div className="bg-white/80 backdrop-blur-md rounded-3xl border border-white/60 p-6 sm:p-8 shadow-[0_4px_24px_rgba(15,23,42,0.04)] space-y-6">
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight">
            Evaluation Criteria
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Rate each aspect from 1 (Needs Improvement) to 5 (Excellent).
          </p>
        </div>

        <div className="divide-y divide-slate-100 space-y-6 pt-2">
          {questions.map((q, idx) => {
            const currentRating = ratings[q.id] || 0;
            const hovered = hoveredRatings[q.id] || 0;
            const activeStarScore = hovered || currentRating;

            return (
              <div key={q.id} className={idx > 0 ? "pt-6" : ""}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Criteria {idx + 1}
                    </span>
                    <h3 className="text-sm sm:text-base font-bold text-slate-900">
                      {q.questionText}
                      {q.isRequired && <span className="text-rose-500 ml-1">*</span>}
                    </h3>
                  </div>

                  {/* 5-Star Interactive Selector */}
                  <div className="flex items-center gap-2">
                    <div
                      className="flex items-center gap-1 bg-slate-50 p-2 rounded-2xl border border-slate-200/80"
                      onMouseLeave={() => handleStarLeave(q.id)}
                    >
                      {[1, 2, 3, 4, 5].map((star) => {
                        const isFilled = star <= activeStarScore;
                        return (
                          <button
                            type="button"
                            key={star}
                            onClick={() => handleStarClick(q.id, star)}
                            onMouseEnter={() => handleStarHover(q.id, star)}
                            className="p-1 hover:scale-110 active:scale-95 transition-transform"
                            aria-label={`Rate ${star} stars`}
                          >
                            <Star
                              className={`w-6 h-6 transition-colors ${
                                isFilled
                                  ? "text-amber-400 fill-amber-400"
                                  : "text-slate-300 fill-slate-100"
                              }`}
                            />
                          </button>
                        );
                      })}
                    </div>

                    {/* Rating Label Indicator */}
                    <div className="w-28 text-left">
                      {activeStarScore > 0 ? (
                        <span className="text-xs font-bold text-slate-700">
                          {RATING_LABELS[activeStarScore]}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400 italic">Tap to rate</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Section 3: Qualitative Feedback */}
      <div className="bg-white/80 backdrop-blur-md rounded-3xl border border-white/60 p-6 sm:p-8 shadow-[0_4px_24px_rgba(15,23,42,0.04)] space-y-5">
        <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-indigo-600" />
          <span>Qualitative Comments & Suggestions</span>
        </h2>

        {/* Improvement Areas */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            {formConfig?.improvementPrompt || "What could the trainer improve on?"}
          </label>
          <textarea
            rows={2}
            value={improvementAreas}
            onChange={(e) => setImprovementAreas(e.target.value)}
            placeholder="e.g. Could explain edge cases in Dynamic Programming in more detail..."
            className="w-full px-4 py-2.5 rounded-2xl bg-white border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Additional Comments */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            {formConfig?.appreciationPrompt || "General Feedback / Appreciation"}
          </label>
          <textarea
            rows={2}
            value={additionalComments}
            onChange={(e) => setAdditionalComments(e.target.value)}
            placeholder="e.g. Great enthusiasm and practical live coding examples! Really helpful session."
            className="w-full px-4 py-2.5 rounded-2xl bg-white border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Submit Button */}
      <div className="text-center pt-2">
        <button
          type="submit"
          disabled={isPending}
          className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-slate-900 text-white font-bold text-sm hover:bg-black transition-all shadow-lg hover:shadow-xl disabled:opacity-50 inline-flex items-center justify-center gap-2"
        >
          {isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Submitting Feedback...</span>
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              <span>Submit Verified Feedback</span>
            </>
          )}
        </button>
        <p className="text-[11px] text-slate-400 mt-2">
          Protected by EdRealm anti-spam & duplicate submission verification.
        </p>
      </div>
    </form>
  );
}
