"use client";

import { useState, useTransition } from "react";
import { 
  Plus, 
  Trash2, 
  Check, 
  Loader2, 
  MoveUp, 
  MoveDown, 
  HelpCircle, 
  FileText, 
  Smartphone, 
  Save, 
  Star
} from "lucide-react";
import { toast } from "sonner";
import { 
  updateQrFormConfig, 
  createFeedbackQuestion, 
  toggleFeedbackQuestion, 
  reorderFeedbackQuestions, 
  deleteFeedbackQuestion,
  type QrFormConfig
} from "@/actions/settings";
import type { FeedbackQuestion } from "@/db/schema";

interface QrFormConfiguratorProps {
  initialQuestions: FeedbackQuestion[];
  initialConfig: QrFormConfig;
}

export function QrFormConfigurator({
  initialQuestions,
  initialConfig,
}: QrFormConfiguratorProps) {
  const [questions, setQuestions] = useState<FeedbackQuestion[]>(initialQuestions);
  const [config, setConfig] = useState<QrFormConfig>(initialConfig);
  const [isPending, startTransition] = useTransition();

  // New question form state
  const [newQuestionText, setNewQuestionText] = useState("");
  const [newIsRequired, setNewIsRequired] = useState(true);
  const [isAddingQuestion, setIsAddingQuestion] = useState(false);

  // Active Tab
  const [activeTab, setActiveTab] = useState<"questions" | "content">("questions");

  // Save Content Configuration
  const handleSaveConfig = () => {
    startTransition(async () => {
      try {
        const res = await updateQrFormConfig(config);
        if (res.success) {
          toast.success("QR Feedback Form details saved successfully!");
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to save form details";
        toast.error(message);
      }
    });
  };

  // Add Question
  const handleAddQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestionText.trim()) {
      toast.error("Please enter question text");
      return;
    }

    startTransition(async () => {
      try {
        const res = await createFeedbackQuestion({
          questionText: newQuestionText.trim(),
          isRequired: newIsRequired,
        });

        if (res.success && res.question) {
          setQuestions((prev) => [...prev, res.question]);
          setNewQuestionText("");
          setIsAddingQuestion(false);
          toast.success("New evaluation question added successfully!");
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to add question";
        toast.error(message);
      }
    });
  };

  // Toggle Active
  const handleToggleActive = (id: string, currentStatus: boolean) => {
    const nextStatus = !currentStatus;
    setQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, isActive: nextStatus } : q))
    );

    startTransition(async () => {
      try {
        await toggleFeedbackQuestion(id, nextStatus);
        toast.success(
          nextStatus
            ? "Question enabled on student QR review form"
            : "Question disabled from student QR review form"
        );
      } catch {
        // Rollback on error
        setQuestions((prev) =>
          prev.map((q) => (q.id === id ? { ...q, isActive: currentStatus } : q))
        );
        toast.error("Failed to toggle question status");
      }
    });
  };

  // Move Question Order (Up / Down)
  const handleMove = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= questions.length) return;

    const newQuestions = [...questions];
    const [moved] = newQuestions.splice(index, 1);
    newQuestions.splice(targetIndex, 0, moved);

    setQuestions(newQuestions);

    startTransition(async () => {
      try {
        await reorderFeedbackQuestions(newQuestions.map((q) => q.id));
        toast.success("Question order updated");
      } catch {
        toast.error("Failed to reorder questions");
      }
    });
  };

  // Delete Question
  const handleDelete = (id: string, text: string) => {
    if (!confirm(`Are you sure you want to remove the question: "${text}"?`)) {
      return;
    }

    startTransition(async () => {
      try {
        const res = await deleteFeedbackQuestion(id);
        if (res.success) {
          if (res.deactivated) {
            setQuestions((prev) =>
              prev.map((q) => (q.id === id ? { ...q, isActive: false } : q))
            );
            toast.info(res.message);
          } else {
            setQuestions((prev) => prev.filter((q) => q.id !== id));
            toast.success("Question deleted permanently");
          }
        }
      } catch {
        toast.error("Failed to delete question");
      }
    });
  };

  // Active Questions for Live Preview
  const activeQuestions = questions.filter((q) => q.isActive);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Left Column: Form Editor (7 cols) */}
      <div className="lg:col-span-7 space-y-6">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 p-1.5 rounded-full bg-slate-100/80 border border-slate-200/80 w-fit">
          <button
            onClick={() => setActiveTab("questions")}
            className={`px-5 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === "questions"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <HelpCircle className="w-4 h-4 text-indigo-600" />
            <span>Criteria Questions ({questions.length})</span>
          </button>
          <button
            onClick={() => setActiveTab("content")}
            className={`px-5 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === "content"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <FileText className="w-4 h-4 text-indigo-600" />
            <span>Header, Prompts & Gratitude</span>
          </button>
        </div>

        {/* TAB 1: Criteria Questions */}
        {activeTab === "questions" && (
          <div className="bg-white/90 backdrop-blur-md rounded-3xl border border-white/60 p-6 sm:p-8 shadow-[0_4px_24px_rgba(15,23,42,0.04)] space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                  QR Feedback Evaluation Criteria
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Questions rendered dynamically when students scan any trainer desk standee.
                </p>
              </div>

              <button
                onClick={() => setIsAddingQuestion(true)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900 text-white font-bold text-xs hover:bg-black transition-all shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Question</span>
              </button>
            </div>

            {/* Add Question Inline Box */}
            {isAddingQuestion && (
              <form
                onSubmit={handleAddQuestion}
                className="p-5 rounded-2xl bg-indigo-50/60 border border-indigo-200/80 space-y-4 animate-in fade-in"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-900">
                    Create New Evaluation Criteria
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsAddingQuestion(false)}
                    className="text-xs text-slate-400 hover:text-slate-700"
                  >
                    Cancel
                  </button>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">
                    Question Text
                  </label>
                  <input
                    type="text"
                    value={newQuestionText}
                    onChange={(e) => setNewQuestionText(e.target.value)}
                    placeholder="e.g. Real-Time Coding & Live Problem Solving"
                    autoFocus
                    className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                    <input
                      type="checkbox"
                      checked={newIsRequired}
                      onChange={(e) => setNewIsRequired(e.target.checked)}
                      className="rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>Mandatory for submission (Required)</span>
                  </label>

                  <button
                    type="submit"
                    disabled={isPending}
                    className="px-5 py-2 rounded-full bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 transition-colors shadow-xs flex items-center gap-1.5 disabled:opacity-50"
                  >
                    {isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                    <span>Save Criteria</span>
                  </button>
                </div>
              </form>
            )}

            {/* Questions List */}
            <div className="space-y-3">
              {questions.map((q, idx) => (
                <div
                  key={q.id}
                  className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-4 ${
                    q.isActive
                      ? "bg-slate-50/70 border-slate-200/80 hover:bg-slate-50"
                      : "bg-slate-100/50 border-slate-200 opacity-60"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {/* Position and arrows */}
                    <div className="flex flex-col items-center gap-0.5 shrink-0">
                      <button
                        onClick={() => handleMove(idx, "up")}
                        disabled={idx === 0 || isPending}
                        className="p-1 rounded text-slate-400 hover:text-slate-700 disabled:opacity-20 transition-colors"
                        title="Move Up"
                      >
                        <MoveUp className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-[11px] font-mono font-bold text-slate-600">
                        {idx + 1}
                      </span>
                      <button
                        onClick={() => handleMove(idx, "down")}
                        disabled={idx === questions.length - 1 || isPending}
                        className="p-1 rounded text-slate-400 hover:text-slate-700 disabled:opacity-20 transition-colors"
                        title="Move Down"
                      >
                        <MoveDown className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Question details */}
                    <div>
                      <div className="font-bold text-sm text-slate-900 flex items-center gap-2">
                        <span>{q.questionText}</span>
                        {q.isRequired && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200/80 text-slate-700">
                            Required
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-1 font-mono">
                        <span>key: {q.questionKey}</span>
                        <span>&bull;</span>
                        <span>1 to 5 Stars</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Actions: Toggle Active & Delete */}
                  <div className="flex items-center gap-3 shrink-0">
                    <button
                      onClick={() => handleToggleActive(q.id, q.isActive)}
                      disabled={isPending}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                        q.isActive
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200/80"
                          : "bg-slate-200 text-slate-600 border border-slate-300"
                      }`}
                      title="Toggle active status on student QR form"
                    >
                      <span
                        className={`w-2 h-2 rounded-full ${
                          q.isActive ? "bg-emerald-500 animate-pulse" : "bg-slate-400"
                        }`}
                      />
                      <span>{q.isActive ? "Active" : "Disabled"}</span>
                    </button>

                    <button
                      onClick={() => handleDelete(q.id, q.questionText)}
                      disabled={isPending}
                      className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      title="Remove question"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: Form Header, Guidance & Prompts */}
        {activeTab === "content" && (
          <div className="bg-white/90 backdrop-blur-md rounded-3xl border border-white/60 p-6 sm:p-8 shadow-[0_4px_24px_rgba(15,23,42,0.04)] space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                  QR Form Branding & Custom Text
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Customize the titles, instructions, and feedback prompts shown to students.
                </p>
              </div>

              <button
                onClick={handleSaveConfig}
                disabled={isPending}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-slate-900 text-white font-bold text-xs hover:bg-black transition-all shadow-md disabled:opacity-50"
              >
                {isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                <span>Save All Changes</span>
              </button>
            </div>

            <div className="space-y-5 pt-2">
              {/* Form Title */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Standee Header Title
                </label>
                <input
                  type="text"
                  value={config.formTitle}
                  onChange={(e) => setConfig({ ...config, formTitle: e.target.value })}
                  placeholder="Official Trainer Evaluation"
                  className="w-full px-4 py-2.5 rounded-2xl bg-white border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Form Subtitle */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Instruction Subtitle
                </label>
                <input
                  type="text"
                  value={config.formSubtitle}
                  onChange={(e) => setConfig({ ...config, formSubtitle: e.target.value })}
                  placeholder="Please take 1 minute to share your honest class experience."
                  className="w-full px-4 py-2.5 rounded-2xl bg-white border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Improvement Prompt */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Improvement Areas Field Label
                </label>
                <input
                  type="text"
                  value={config.improvementPrompt}
                  onChange={(e) => setConfig({ ...config, improvementPrompt: e.target.value })}
                  placeholder="What could the trainer improve on?"
                  className="w-full px-4 py-2.5 rounded-2xl bg-white border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Appreciation Prompt */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  General Feedback Field Label
                </label>
                <input
                  type="text"
                  value={config.appreciationPrompt}
                  onChange={(e) => setConfig({ ...config, appreciationPrompt: e.target.value })}
                  placeholder="General Feedback / Appreciation"
                  className="w-full px-4 py-2.5 rounded-2xl bg-white border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Thank You Heading */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Submission Success Heading
                </label>
                <input
                  type="text"
                  value={config.thankYouHeading}
                  onChange={(e) => setConfig({ ...config, thankYouHeading: e.target.value })}
                  placeholder="Feedback Submitted!"
                  className="w-full px-4 py-2.5 rounded-2xl bg-white border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Thank You Message */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Submission Success Message
                </label>
                <textarea
                  rows={3}
                  value={config.thankYouMessage}
                  onChange={(e) => setConfig({ ...config, thankYouMessage: e.target.value })}
                  placeholder="Thank you for rating your trainer. Your honest evaluation directly empowers high-quality training standards at EdRealm."
                  className="w-full px-4 py-2.5 rounded-2xl bg-white border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={handleSaveConfig}
                  disabled={isPending}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-slate-900 text-white font-bold text-xs hover:bg-black transition-all shadow-md disabled:opacity-50"
                >
                  {isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  <span>Save All Changes</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Right Column: Live Smartphone Preview (5 cols) */}
      <div className="lg:col-span-5 sticky top-24 space-y-4">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-indigo-600" />
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Live Standee Mobile Preview
            </span>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            Real-Time Sync
          </span>
        </div>

        {/* Mobile Device Frame Mockup */}
        <div className="mx-auto max-w-[340px] rounded-[40px] border-4 border-slate-800 bg-slate-900 p-2 shadow-2xl ring-1 ring-slate-900/10">
          {/* Speaker notch */}
          <div className="w-20 h-4 bg-slate-800 rounded-full mx-auto mb-2" />

          {/* Screen Content */}
          <div className="bg-[#FAFBFF] rounded-[32px] overflow-hidden max-h-[620px] overflow-y-auto text-slate-900 text-xs shadow-inner scrollbar-none">
            {/* Header */}
            <div className="bg-white/80 backdrop-blur-md border-b border-slate-100 p-3 flex items-center justify-between sticky top-0 z-10">
              <div className="flex items-center gap-1.5">
                <div className="w-5 h-5 rounded-lg bg-black text-white text-[9px] font-bold flex items-center justify-center">
                  ER
                </div>
                <span className="font-bold text-[11px] text-slate-900">EdRealm Feedback</span>
              </div>
              <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
                Verified
              </span>
            </div>

            {/* Simulated Form Body */}
            <div className="p-3.5 space-y-3">
              {/* Trainer Banner */}
              <div className="p-3 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs">
                    TR
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-indigo-600 uppercase">
                      {config.formTitle}
                    </div>
                    <div className="font-extrabold text-sm text-slate-900">
                      Sample Faculty Member
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {config.formSubtitle}
                    </div>
                  </div>
                </div>
              </div>

              {/* Student ID */}
              <div className="p-3 rounded-2xl bg-white border border-slate-200/80 space-y-2">
                <span className="text-[10px] font-bold text-slate-700 uppercase">
                  Roll Number / Student ID *
                </span>
                <div className="p-2 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-400 font-mono">
                  1RV22CS045
                </div>
              </div>

              {/* Dynamic Criteria List */}
              <div className="p-3 rounded-2xl bg-white border border-slate-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-700 uppercase">
                    Evaluation Criteria ({activeQuestions.length})
                  </span>
                  <span className="text-[9px] text-indigo-600 font-semibold">1-5 Stars</span>
                </div>

                <div className="space-y-2.5 divide-y divide-slate-100">
                  {activeQuestions.map((q, idx) => (
                    <div key={q.id} className={idx > 0 ? "pt-2" : ""}>
                      <div className="text-[11px] font-semibold text-slate-800 leading-tight">
                        {q.questionText} {q.isRequired && <span className="text-rose-500">*</span>}
                      </div>
                      <div className="flex items-center gap-1 mt-1 text-amber-400">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star key={s} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Prompts */}
              <div className="p-3 rounded-2xl bg-white border border-slate-200/80 space-y-2">
                <span className="text-[10px] font-bold text-slate-700 uppercase">
                  {config.improvementPrompt}
                </span>
                <div className="p-2 rounded-xl bg-slate-50 border border-slate-200 text-[10px] text-slate-400 italic">
                  Optional suggestions for the trainer...
                </div>
              </div>

              {/* Submit Button */}
              <div className="py-2">
                <div className="w-full py-2.5 rounded-full bg-slate-900 text-white text-center text-xs font-bold shadow-md">
                  Submit Verified Feedback
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
