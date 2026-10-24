import { notFound } from "next/navigation";
import Link from "next/link";
import { 
  Award, 
  FolderKanban, 
  CheckCircle2, 
  Layers, 
  Calendar 
} from "lucide-react";
import { getTrainerById } from "@/actions/trainers";
import { Navbar } from "@/components/navigation/Navbar";
import { TrainerProfileHeader } from "@/components/trainers/TrainerProfileHeader";
import { QrCodeSection } from "@/components/trainers/QrCodeSection";
import { FeedbackStreamSection, type FeedbackStreamSectionProps } from "@/components/trainers/FeedbackStreamSection";
import { formatExperience } from "@/lib/utils";

export const dynamic = "force-dynamic";

interface TrainerProfilePageProps {
  params: Promise<{ id: string }>;
}

export default async function TrainerProfilePage({ params }: TrainerProfilePageProps) {
  const { id } = await params;
  const trainer = await getTrainerById(id);

  if (!trainer) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[#FAFBFF] text-slate-900 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8 sm:px-8 space-y-8">
        {/* Header Component */}
        <TrainerProfileHeader trainer={trainer} />

        {/* SECTION 1: Subject Expertise & Skills */}
        <div className="bg-white/80 backdrop-blur-md rounded-3xl border border-white/60 p-6 sm:p-8 shadow-[0_4px_24px_rgba(15,23,42,0.04)] space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100/80 text-indigo-700 text-xs font-bold mb-2">
                <Award className="w-3.5 h-3.5" />
                <span>Verified Curriculum Skills</span>
              </div>
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                Subject Expertise & Capabilities
              </h2>
            </div>
          </div>

          {trainer.skills && trainer.skills.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {trainer.skills.map((skill) => (
                <div
                  key={skill.id}
                  className="p-5 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-3 relative group hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 block">
                        {skill.subject?.category?.name || "General"}
                      </span>
                      <h3 className="font-extrabold text-base text-slate-900 leading-snug">
                        {skill.subject?.name}
                      </h3>
                    </div>

                    <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-white text-slate-800 border border-slate-200 shadow-2xs">
                      {skill.expertiseLevel}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600">
                    <span className="font-medium bg-white px-2 py-0.5 rounded border border-slate-200/60">
                      {skill.trainerType}
                    </span>
                    <span>•</span>
                    <span className="font-medium">
                      {formatExperience(skill.subjectExperience)} teaching exp
                    </span>
                  </div>

                  {/* Capabilities Badges */}
                  <div className="pt-2 border-t border-slate-200/60 flex flex-wrap gap-2 text-[11px]">
                    {skill.canHandleLargeBatches && (
                      <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-medium">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>Large Batches (100+)</span>
                      </span>
                    )}

                    {skill.canConductMockInterviews && (
                      <span className="inline-flex items-center gap-1 text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded font-medium">
                        <CheckCircle2 className="w-3 h-3 text-indigo-600" />
                        <span>Mock Interviews</span>
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center rounded-2xl bg-slate-50 border border-dashed border-slate-200">
              <Layers className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-700">No Skills Recorded</p>
              <p className="text-xs text-slate-400 mt-0.5">
                Edit this profile to tag subject expertise and syllabus capabilities.
              </p>
            </div>
          )}
        </div>

        {/* SECTION 2: Permanent Feedback QR Code & Standee System */}
        <QrCodeSection
          trainerId={trainer.id}
          trainerCode={trainer.trainerCode}
          trainerName={trainer.fullName}
          qrToken={trainer.qrToken}
          qrActive={trainer.qrActive}
        />

        {/* SECTION 3: Ratings & Performance Evaluation */}
        <FeedbackStreamSection
          cachedRating={trainer.cachedRating}
          cachedReviewsCount={trainer.cachedReviewsCount}
          cachedCriteriaScores={trainer.cachedCriteriaScores as Record<string, unknown>}
          feedbackResponses={trainer.feedbackResponses as unknown as FeedbackStreamSectionProps["feedbackResponses"]}
        />

        {/* SECTION 4: Project Deployments */}
        <div className="bg-white/80 backdrop-blur-md rounded-3xl border border-white/60 p-6 sm:p-8 shadow-[0_4px_24px_rgba(15,23,42,0.04)] space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold mb-2">
                <FolderKanban className="w-3.5 h-3.5 text-slate-500" />
                <span>Project Engagements</span>
              </div>
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                Assigned Training Drives ({trainer.projectAssignments?.length || 0})
              </h2>
            </div>
          </div>

          {trainer.projectAssignments && trainer.projectAssignments.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {trainer.projectAssignments.map((assignment) => {
                const proj = assignment.project;
                return (
                  <Link
                    key={assignment.id}
                    href={`/projects/${proj.id}`}
                    className="p-5 rounded-2xl bg-slate-50/80 border border-slate-200/80 hover:bg-slate-50 hover:border-indigo-300 transition-all block group"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="text-xs font-bold text-indigo-600 block">
                          {proj.place}
                        </span>
                        <h4 className="font-extrabold text-base text-slate-900 group-hover:text-indigo-600 transition-colors">
                          {proj.projectName}
                        </h4>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase bg-white border border-slate-200 text-slate-700">
                        {proj.status}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-slate-500 mt-3 pt-3 border-t border-slate-200/60">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>
                        {proj.startDate} to {proj.endDate}
                      </span>
                      <span>•</span>
                      <span className="font-semibold text-slate-700">
                        Role: {assignment.roleInProject}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="p-8 text-center rounded-2xl bg-slate-50 border border-dashed border-slate-200">
              <FolderKanban className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-700">No Current Project Assignments</p>
              <p className="text-xs text-slate-400 mt-0.5">
                This trainer is currently available for upcoming offline and online training drives.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
