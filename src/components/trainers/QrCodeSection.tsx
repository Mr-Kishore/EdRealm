"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { 
  QrCode, 
  Copy, 
  Download, 
  Printer, 
  RefreshCw, 
  Check, 
  ExternalLink,
  ShieldAlert,
  Loader2
} from "lucide-react";
import { toast } from "sonner";
import { toggleQrActive, regenerateQrToken } from "@/actions/trainers";

interface QrCodeSectionProps {
  trainerId: string;
  trainerCode: string;
  trainerName: string;
  qrToken: string;
  qrActive: boolean;
}

export function QrCodeSection({
  trainerId,
  trainerCode,
  trainerName,
  qrToken,
  qrActive: initialQrActive,
}: QrCodeSectionProps) {
  const [qrActive, setQrActive] = useState(initialQrActive);
  const [copied, setCopied] = useState(false);
  const [isPending, startTransition] = useTransition();

  const appUrl =
    typeof window !== "undefined"
      ? window.location.origin
      : process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const feedbackUrl = `${appUrl}/feedback/${qrToken}`;
  const qrImageApi = `/api/trainers/${trainerId}/qr`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(feedbackUrl);
      setCopied(true);
      toast.success("Feedback link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy link");
    }
  };

  const handleToggleQr = (checked: boolean) => {
    setQrActive(checked);
    startTransition(async () => {
      try {
        await toggleQrActive(trainerId, checked);
        toast.success(
          checked
            ? "Feedback enabled! Students can now submit reviews."
            : "Feedback disabled. Form submissions are temporarily closed."
        );
      } catch {
        setQrActive(!checked);
        toast.error("Failed to update QR status");
      }
    });
  };

  const handleRegenerate = () => {
    if (
      !confirm(
        "Are you sure you want to regenerate this QR code? The existing QR code and link will stop working immediately."
      )
    ) {
      return;
    }

    startTransition(async () => {
      try {
        await regenerateQrToken(trainerId);
        toast.success("QR code regenerated successfully!");
      } catch {
        toast.error("Failed to regenerate QR code");
      }
    });
  };

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>EdRealm Standee - ${trainerName} (${trainerCode})</title>
          <style>
            body {
              font-family: 'Inter', -apple-system, sans-serif;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              padding: 40px;
              text-align: center;
            }
            .card {
              border: 2px solid #000;
              border-radius: 24px;
              padding: 40px;
              max-width: 400px;
              box-shadow: 0 10px 30px rgba(0,0,0,0.1);
            }
            .logo { font-size: 24px; font-weight: 800; margin-bottom: 8px; }
            .tagline { font-size: 12px; color: #6366f1; text-transform: uppercase; letter-spacing: 2px; font-weight: 700; }
            .qr { margin: 30px 0; }
            .trainer { font-size: 20px; font-weight: 800; margin-bottom: 4px; }
            .code { font-family: monospace; font-size: 14px; color: #64748b; font-weight: bold; }
            .instr { font-size: 13px; color: #475569; margin-top: 20px; line-height: 1.5; }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="logo">EdRealm</div>
            <div class="tagline">Student Feedback Desk</div>
            <div class="qr">
              <img src="${qrImageApi}?format=png&size=300" width="260" height="260" alt="QR Code" />
            </div>
            <div class="trainer">${trainerName}</div>
            <div class="code">${trainerCode}</div>
            <p class="instr">
              Please scan this QR code with your mobile camera to share your valuable session feedback.
            </p>
          </div>
          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="bg-white/80 backdrop-blur-md rounded-3xl border border-white/60 p-6 sm:p-8 shadow-[0_4px_24px_rgba(15,23,42,0.04)]">
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100/80 text-indigo-700 text-xs font-bold mb-2">
            <QrCode className="w-3.5 h-3.5" />
            <span>Permanent Trainer QR Code</span>
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Unique Student Feedback System
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Decoupled from projects. Students scan this QR code to submit real-time ratings directly to this trainer profile.
          </p>
        </div>

        {/* Master Active Toggle */}
        <div className="flex items-center gap-3 shrink-0 bg-slate-50 px-4 py-2 rounded-2xl border border-slate-200/80">
          <div className="flex flex-col text-right">
            <span className="text-xs font-bold text-slate-800">
              {qrActive ? "Accepting Feedback" : "Feedback Closed"}
            </span>
            <span className="text-[10px] text-slate-500">
              {qrActive ? "QR form is live" : "Form is disabled"}
            </span>
          </div>
          <input
            type="checkbox"
            checked={qrActive}
            disabled={isPending}
            onChange={(e) => handleToggleQr(e.target.checked)}
            className="w-5 h-5 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center pt-2">
        {/* QR Code Visual Card */}
        <div className="md:col-span-5 flex flex-col items-center">
          <div className="p-6 bg-white rounded-3xl border-2 border-slate-100 shadow-[0_10px_30px_rgba(0,0,0,0.05)] relative group">
            <Image
              src={`${qrImageApi}?format=svg&size=300`}
              alt={`QR for ${trainerName}`}
              width={208}
              height={208}
              unoptimized
              className={`w-52 h-52 object-contain transition-opacity ${
                !qrActive ? "opacity-30 grayscale" : "opacity-100"
              }`}
            />
            {!qrActive && (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-4 bg-white/70 backdrop-blur-xs rounded-3xl text-center">
                <ShieldAlert className="w-8 h-8 text-rose-500 mb-2" />
                <span className="text-xs font-extrabold text-rose-600">
                  Submissions Disabled
                </span>
                <span className="text-[10px] text-slate-500 mt-0.5">
                  Toggle switch above to re-open form
                </span>
              </div>
            )}
          </div>
          <span className="text-xs font-mono font-bold text-slate-600 mt-3">
            {trainerCode} • {trainerName}
          </span>
        </div>

        {/* QR Actions & Permanent Permalink */}
        <div className="md:col-span-7 space-y-5">
          {/* Permanent URL Slug Bar */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Permanent Feedback URL
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={feedbackUrl}
                className="w-full px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-700 select-all"
              />
              <button
                type="button"
                onClick={copyToClipboard}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 inline-flex items-center gap-1.5 transition-colors shrink-0"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? "Copied" : "Copy"}</span>
              </button>
              <a
                href={feedbackUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl text-slate-700 transition-colors shrink-0"
                title="Preview Mobile Form"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Download & Print Buttons */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              Export & Standee Assets
            </label>
            <div className="flex flex-wrap gap-2.5">
              {/* Download SVG */}
              <a
                href={`${qrImageApi}?format=svg&download=true`}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-800 shadow-sm hover:bg-slate-50 transition-all hover:scale-105 active:scale-95"
              >
                <Download className="w-3.5 h-3.5 text-indigo-600" />
                <span>Vector SVG (Print Ready)</span>
              </a>

              {/* Download PNG */}
              <a
                href={`${qrImageApi}?format=png&download=true&size=1024`}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-800 shadow-sm hover:bg-slate-50 transition-all hover:scale-105 active:scale-95"
              >
                <Download className="w-3.5 h-3.5 text-indigo-600" />
                <span>High-Res PNG</span>
              </a>

              {/* Print Standee Card */}
              <button
                type="button"
                onClick={handlePrint}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold shadow-sm hover:bg-black transition-all hover:scale-105 active:scale-95"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Desk Standee</span>
              </button>
            </div>
          </div>

          {/* Regenerate Token Danger Option */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">
              Need to rotate or invalidate this QR code?
            </span>
            <button
              type="button"
              disabled={isPending}
              onClick={handleRegenerate}
              className="inline-flex items-center gap-1.5 text-rose-600 hover:text-rose-700 font-bold hover:underline"
            >
              {isPending ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <RefreshCw className="w-3.5 h-3.5" />
              )}
              <span>Regenerate QR Token</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
