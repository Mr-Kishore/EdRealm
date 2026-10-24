import { getQrFormSettings } from "@/actions/settings";
import { Navbar } from "@/components/navigation/Navbar";
import { QrFormConfigurator } from "@/components/settings/QrFormConfigurator";
import { QrCode } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const { questions, config } = await getQrFormSettings();

  return (
    <div className="min-h-screen bg-[#FAFBFF] text-slate-900 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8 sm:px-8 space-y-8">
        {/* Header */}
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100/80 text-indigo-700 text-xs font-bold mb-2">
            <QrCode className="w-3.5 h-3.5" />
            <span>QR Standee & Student Feedback Setup</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            QR Feedback Form Settings
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Configure the evaluation criteria, titles, and feedback prompts displayed when students scan physical trainer desk standees.
          </p>
        </div>

        {/* Live Configurator & Mobile Mockup */}
        <QrFormConfigurator
          initialQuestions={questions}
          initialConfig={config}
        />
      </main>
    </div>
  );
}
