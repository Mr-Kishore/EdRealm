import { AlertTriangle, ShieldX, CheckCircle } from "lucide-react";
import { getTrainerFeedbackContext } from "@/actions/feedback";
import { PublicFeedbackForm } from "@/components/feedback/PublicFeedbackForm";

export const dynamic = "force-dynamic";

interface PublicFeedbackPageProps {
  params: Promise<{ qr_token: string }>;
}

export default async function PublicFeedbackPage({ params }: PublicFeedbackPageProps) {
  const { qr_token } = await params;
  const context = await getTrainerFeedbackContext(qr_token);

  if (context.status === "not_found") {
    return (
      <div className="min-h-screen bg-[#FAFBFF] text-slate-900 flex flex-col items-center justify-center p-4">
        <div className="bg-white/90 backdrop-blur-md rounded-3xl border border-slate-200/80 p-8 max-w-md w-full text-center space-y-4 shadow-xl">
          <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center mx-auto">
            <ShieldX className="w-8 h-8" />
          </div>
          <h1 className="text-xl font-extrabold text-slate-900">
            Invalid or Expired QR Code
          </h1>
          <p className="text-xs text-slate-500">
            The scanned QR code is either invalid, revoked, or no longer associated with an active trainer standee.
          </p>
        </div>
      </div>
    );
  }

  if (context.status === "inactive") {
    return (
      <div className="min-h-screen bg-[#FAFBFF] text-slate-900 flex flex-col items-center justify-center p-4">
        <div className="bg-white/90 backdrop-blur-md rounded-3xl border border-slate-200/80 p-8 max-w-md w-full text-center space-y-4 shadow-xl">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-100 text-amber-600 flex items-center justify-center mx-auto">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h1 className="text-xl font-extrabold text-slate-900">
            Feedback Collection Inactive
          </h1>
          <p className="text-xs text-slate-500">
            Student feedback collection is currently paused for{" "}
            <strong className="text-slate-800">{context.trainerName}</strong> ({context.trainerCode}).
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFBFF] text-slate-900 flex flex-col">
      {/* Public Header */}
      <header className="border-b border-slate-200/60 bg-white/70 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-slate-900 flex items-center justify-center text-white font-extrabold text-xs shadow-xs">
              E
            </div>
            <span className="font-extrabold text-sm tracking-tight text-slate-900">
              EdRealm <span className="text-indigo-600 font-semibold text-xs ml-1">Feedback</span>
            </span>
          </div>

          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-700 text-[10px] font-bold">
            <CheckCircle className="w-3 h-3" />
            <span>Verified Standee</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-4 py-6 sm:py-10">
        <PublicFeedbackForm
          qrToken={qr_token}
          trainer={context.trainer}
          questions={context.questions}
          projects={context.projects}
          formConfig={context.formConfig}
        />
      </main>

      {/* Public Footer */}
      <footer className="border-t border-slate-100 py-6 text-center text-xs text-slate-400">
        <p>Powered by <strong className="text-slate-600">EdRealm</strong> &bull; Student Feedback System</p>
      </footer>
    </div>
  );
}
