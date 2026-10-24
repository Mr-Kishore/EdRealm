import { Star, MessageSquareQuote, User, Clock } from "lucide-react";
import type { FeedbackResponse, FeedbackAnswer, FeedbackQuestion } from "@/db/schema";

export interface FeedbackStreamSectionProps {
  cachedRating: string;
  cachedReviewsCount: number;
  cachedCriteriaScores: Record<string, unknown> | null | undefined;
  feedbackResponses: (FeedbackResponse & {
    answers: (FeedbackAnswer & {
      question: FeedbackQuestion;
    })[];
  })[];
}

export function FeedbackStreamSection({
  cachedRating,
  cachedReviewsCount,
  cachedCriteriaScores,
  feedbackResponses,
}: FeedbackStreamSectionProps) {
  const overallRating = parseFloat(cachedRating || "0");
  const reviewCount = cachedReviewsCount || 0;

  const criteriaLabels: Record<string, string> = {
    knowledge: "Subject Knowledge & Mastery",
    concept_clarity: "Concept Clarity & Teaching",
    problem_solving: "Problem-Solving & Examples",
    doubt_clarification: "Doubt Solving & Patience",
    communication: "Communication Skills",
    punctuality: "Punctuality & Discipline",
    overall_satisfaction: "Overall Satisfaction",
  };

  const scores = cachedCriteriaScores || {};

  return (
    <div className="bg-white/80 backdrop-blur-md rounded-3xl border border-white/60 p-6 sm:p-8 shadow-[0_4px_24px_rgba(15,23,42,0.04)] space-y-8">
      {/* Section Heading */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200/80 text-amber-800 text-xs font-bold mb-2">
          <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
          <span>Real-time Student Ratings & Feedback</span>
        </div>
        <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
          Performance & Teaching Evaluation
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Aggregated directly from verified student submissions scanned via this trainer&apos;s unique QR code.
        </p>
      </div>

      {/* Top Ratings Summary Card: Overall Score + 7 Criteria Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 p-6 rounded-3xl bg-slate-50/80 border border-slate-200/80 items-center">
        {/* Overall Score Box */}
        <div className="md:col-span-4 flex flex-col items-center justify-center text-center p-6 bg-white rounded-2xl border border-slate-100 shadow-sm">
          <span className="text-5xl font-extrabold text-slate-900 tracking-tight">
            {overallRating > 0 ? overallRating.toFixed(1) : "0.0"}
          </span>
          <div className="flex items-center gap-1 my-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-5 h-5 ${
                  star <= Math.round(overallRating)
                    ? "fill-amber-400 text-amber-400"
                    : "text-slate-200"
                }`}
              />
            ))}
          </div>
          <span className="text-xs font-bold text-slate-600">
            Out of 5.0 Stars
          </span>
          <span className="text-xs text-slate-400 mt-0.5">
            Based on {reviewCount} student {reviewCount === 1 ? "review" : "reviews"}
          </span>
        </div>

        {/* 7 Criteria Breakdown Bars */}
        <div className="md:col-span-8 space-y-3">
          <span className="text-xs font-extrabold uppercase tracking-wider text-slate-700 block mb-2">
            Criteria Breakdown
          </span>
          {Object.entries(criteriaLabels).map(([key, label]) => {
            const val = scores[key];
            let rawScore = overallRating;
            if (typeof val === "number") {
              rawScore = val;
            } else if (val && typeof val === "object" && "score" in val && typeof (val as { score: unknown }).score === "number") {
              rawScore = (val as { score: number }).score;
            } else if (typeof val === "string") {
              rawScore = parseFloat(val);
            }
            const score = isNaN(rawScore) ? 0 : rawScore;
            const percentage = Math.min(Math.max((score / 5) * 100, 0), 100);

            return (
              <div key={key} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700">{label}</span>
                  <span className="font-mono font-bold text-slate-900">
                    {score > 0 ? score.toFixed(1) : "—"} / 5.0
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-indigo-600 transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Reverse-Chronological Reviews Stream */}
      <div>
        <h3 className="text-base font-extrabold text-slate-900 mb-4 flex items-center gap-2">
          <MessageSquareQuote className="w-4 h-4 text-indigo-600" />
          <span>Student Submissions ({feedbackResponses.length})</span>
        </h3>

        {feedbackResponses.length === 0 ? (
          <div className="text-center py-12 p-6 rounded-2xl bg-slate-50 border border-dashed border-slate-200">
            <User className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-700">No Student Feedback Yet</p>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Once students scan the trainer&apos;s QR code during training drives, verified reviews will appear here automatically.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {feedbackResponses.map((res) => {
              const dateStr = new Date(res.submittedAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              });

              return (
                <div
                  key={res.id}
                  className="p-5 rounded-2xl bg-slate-50/70 border border-slate-200/70 space-y-3 transition-colors hover:bg-slate-50"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                        {res.studentName ? res.studentName[0].toUpperCase() : "S"}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-slate-900">
                            {res.studentName || "Student"}
                          </span>
                          <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-600">
                            Roll: {res.studentId}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <Clock className="w-3 h-3" />
                          <span>Submitted on {dateStr}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Individual Question Ratings Pill Row */}
                  {res.answers && res.answers.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {res.answers.map((ans) => (
                        <span
                          key={ans.id}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-white border border-slate-200 text-slate-700 shadow-2xs"
                        >
                          <span className="text-slate-500 font-normal">
                            {ans.question?.questionText ? ans.question.questionText.split(" ")[0] : "Criteria"}:
                          </span>
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                          <span>{ans.ratingValue}/5</span>
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Improvement suggestions */}
                  {res.improvementAreas && (
                    <div className="text-xs bg-white/80 p-3 rounded-xl border border-slate-200/80">
                      <span className="font-bold text-indigo-700 block mb-1">
                        Areas for Improvement:
                      </span>
                      <p className="text-slate-600 leading-relaxed">
                        {res.improvementAreas}
                      </p>
                    </div>
                  )}

                  {/* Comments */}
                  {res.additionalComments && (
                    <p className="text-xs text-slate-600 italic">
                      &quot;{res.additionalComments}&quot;
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
