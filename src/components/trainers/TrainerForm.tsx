"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { 
  Plus, 
  Trash2, 
  ArrowLeft, 
  FileText, 
  Check, 
  Loader2, 
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { 
  CreateTrainerSchema, 
  type CreateTrainerInput 
} from "@/lib/validations/trainer";
import { createTrainer, updateTrainer } from "@/actions/trainers";
import type { SkillCategory, MasterSubject, Trainer, TrainerSkill } from "@/db/schema";

export interface TrainerFormProps {
  initialData?: Trainer & {
    skills: (TrainerSkill & {
      subject: MasterSubject & {
        category?: SkillCategory | null;
      };
    })[];
  };
  categories: (SkillCategory & { subjects: MasterSubject[] })[];
  isEditing?: boolean;
}

export function TrainerForm({ initialData, categories, isEditing = false }: TrainerFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [preferredLocInput, setPreferredLocInput] = useState("");

  const defaultValues: CreateTrainerInput = {
    fullName: initialData?.fullName || "",
    photoUrl: initialData?.photoUrl || "",
    phone: initialData?.phone || "",
    whatsapp: initialData?.whatsapp || "",
    email: initialData?.email || "",
    currentCity: initialData?.currentCity || "",
    currentState: initialData?.currentState || "",
    country: initialData?.country || "India",
    preferredLocations: initialData?.preferredLocations || [],
    willingToTravelAnywhere: initialData?.willingToTravelAnywhere || false,
    trainingModes: (initialData?.trainingModes as ("Offline" | "Online" | "Hybrid")[]) || ["Offline"],
    totalExperience: initialData ? parseFloat(initialData.totalExperience) : 0,
    trainingExperience: initialData ? parseFloat(initialData.trainingExperience) : 0,
    linkedinUrl: initialData?.linkedinUrl || "",
    resumeUrl: initialData?.resumeUrl || "",
    skills: initialData?.skills
      ? initialData.skills.map((s) => ({
          categoryId: s.subject?.category?.id,
          subjectId: s.subjectId,
          trainerType: s.trainerType as "Technical" | "Aptitude" | "Soft Skills" | "Domain Expert",
          expertiseLevel: s.expertiseLevel as "Beginner" | "Intermediate" | "Advanced" | "Expert",
          subjectExperience: parseFloat(s.subjectExperience),
          canHandleLargeBatches: s.canHandleLargeBatches,
          canConductMockInterviews: s.canConductMockInterviews,
          additionalSkills: s.additionalSkills || [],
          technicalSkills: s.technicalSkills || [],
        }))
      : [
          {
            categoryId: categories[0]?.id || "",
            subjectId: categories[0]?.subjects[0]?.id || "",
            trainerType: "Technical",
            expertiseLevel: "Intermediate",
            subjectExperience: 2,
            canHandleLargeBatches: true,
            canConductMockInterviews: true,
            additionalSkills: [],
            technicalSkills: [],
          },
        ],
  };

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CreateTrainerInput>({
    resolver: zodResolver(CreateTrainerSchema) as Resolver<CreateTrainerInput>,
    defaultValues,
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "skills",
  });

  const watchPreferredLocations = watch("preferredLocations") || [];
  const watchTrainingModes = watch("trainingModes") || [];
  const watchSkills = watch("skills");

  const addPreferredLocation = () => {
    if (!preferredLocInput.trim()) return;
    const clean = preferredLocInput.trim();
    if (!watchPreferredLocations.includes(clean)) {
      setValue("preferredLocations", [...watchPreferredLocations, clean]);
    }
    setPreferredLocInput("");
  };

  const removePreferredLocation = (loc: string) => {
    setValue(
      "preferredLocations",
      watchPreferredLocations.filter((l) => l !== loc)
    );
  };

  const toggleTrainingMode = (mode: "Offline" | "Online" | "Hybrid") => {
    const current = new Set(watchTrainingModes);
    if (current.has(mode)) {
      if (current.size > 1) {
        current.delete(mode);
      } else {
        toast.error("At least one training mode is required");
        return;
      }
    } else {
      current.add(mode);
    }
    setValue("trainingModes", Array.from(current));
  };

  const onSubmit = (data: CreateTrainerInput) => {
    startTransition(async () => {
      try {
        if (isEditing && initialData) {
          const res = await updateTrainer(initialData.id, data);
          if (res.success) {
            toast.success("Trainer updated successfully!");
            router.push(`/trainers/${initialData.id}`);
          }
        } else {
          const res = await createTrainer(data);
          if (res.success && res.trainerId) {
            toast.success("Trainer created successfully with unique QR code!");
            router.push(`/trainers/${res.trainerId}`);
          }
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to save trainer profile";
        toast.error(message);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 max-w-5xl mx-auto pb-16">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href={isEditing && initialData ? `/trainers/${initialData.id}` : "/trainers"}
            className="p-2.5 rounded-full bg-white border border-slate-200 text-slate-600 hover:text-black hover:bg-slate-50 transition-colors shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {isEditing ? `Edit Trainer Profile (${initialData?.trainerCode})` : "Add New Trainer"}
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">
              {isEditing
                ? "Update personal information, contact methods, and location availability."
                : "Create a verified trainer profile with skills, travel preferences, and instant QR generation."}
            </p>
          </div>
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="pill-button"
        >
          {isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Saving...</span>
            </>
          ) : (
            <>
              <Check className="w-4 h-4" />
              <span>{isEditing ? "Save Changes" : "Create Trainer"}</span>
            </>
          )}
        </button>
      </div>

      {/* SECTION 1: Personal & Contact Information */}
      <div className="bg-white/80 backdrop-blur-md rounded-3xl border border-white/60 p-6 sm:p-8 shadow-[0_4px_24px_rgba(15,23,42,0.04)]">
        <h2 className="text-lg font-extrabold text-slate-900 mb-6 flex items-center gap-2">
          <span>1. Personal & Contact Details</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Full Name */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Full Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Rahul Sharma"
              {...register("fullName")}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
            {errors.fullName && (
              <p className="text-xs text-rose-500 mt-1">{errors.fullName.message}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Email Address <span className="text-rose-500">*</span>
            </label>
            <input
              type="email"
              placeholder="rahul@example.com"
              {...register("email")}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
            {errors.email && (
              <p className="text-xs text-rose-500 mt-1">{errors.email.message}</p>
            )}
          </div>

          {/* Phone */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Phone Number <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="+91 98765 43210"
              {...register("phone")}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
            {errors.phone && (
              <p className="text-xs text-rose-500 mt-1">{errors.phone.message}</p>
            )}
          </div>

          {/* WhatsApp */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              WhatsApp Number <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="+91 98765 43210"
              {...register("whatsapp")}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
            {errors.whatsapp && (
              <p className="text-xs text-rose-500 mt-1">{errors.whatsapp.message}</p>
            )}
          </div>

          {/* Photo URL */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Profile Photo Link (Optional)
            </label>
            <input
              type="url"
              placeholder="https://example.com/photo.jpg or Google Drive image link"
              {...register("photoUrl")}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
            <span className="text-[11px] text-slate-400 mt-1 block">
              Direct public image URL. If omitted, initials avatar is generated automatically.
            </span>
          </div>

          {/* Resume Google Docs Link */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Resume Google Docs / Drive Link (Optional)
            </label>
            <div className="relative">
              <input
                type="url"
                placeholder="https://docs.google.com/document/d/..."
                {...register("resumeUrl")}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              />
              <FileText className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            </div>
            <span className="text-[11px] text-slate-400 mt-1 block">
              Live Google Doc link. Ensures resumes are always up to date with zero upload storage costs.
            </span>
          </div>

          {/* Current City */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Current City <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Hyderabad"
              {...register("currentCity")}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
            {errors.currentCity && (
              <p className="text-xs text-rose-500 mt-1">{errors.currentCity.message}</p>
            )}
          </div>

          {/* Current State */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Current State <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Telangana"
              {...register("currentState")}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
            {errors.currentState && (
              <p className="text-xs text-rose-500 mt-1">{errors.currentState.message}</p>
            )}
          </div>

          {/* Total Experience */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Total Industry Experience (Years)
            </label>
            <input
              type="number"
              step="0.5"
              min="0"
              {...register("totalExperience")}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
          </div>

          {/* Training Experience */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Teaching / Training Experience (Years)
            </label>
            <input
              type="number"
              step="0.5"
              min="0"
              {...register("trainingExperience")}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
          </div>

          {/* LinkedIn URL */}
          <div className="md:col-span-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              LinkedIn Profile URL
            </label>
            <input
              type="url"
              placeholder="https://linkedin.com/in/..."
              {...register("linkedinUrl")}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
          </div>
        </div>

        {/* Training Modes */}
        <div className="mt-6 pt-6 border-t border-slate-100">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
            Available Training Modes <span className="text-rose-500">*</span>
          </label>
          <div className="flex flex-wrap gap-2.5">
            {(["Offline", "Online", "Hybrid"] as const).map((mode) => {
              const isSelected = watchTrainingModes.includes(mode);
              return (
                <button
                  type="button"
                  key={mode}
                  onClick={() => toggleTrainingMode(mode)}
                  className={`px-4 py-2 rounded-full text-xs font-bold transition-all border ${
                    isSelected
                      ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                      : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  {mode}
                </button>
              );
            })}
          </div>
        </div>

        {/* Preferred Locations & Travel Scope */}
        <div className="mt-6 pt-6 border-t border-slate-100 space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Preferred Work Locations (Cities)
            </label>
            <div className="flex items-center gap-2 max-w-md">
              <input
                type="text"
                placeholder="Type city (e.g. Vijayawada) and press Add..."
                value={preferredLocInput}
                onChange={(e) => setPreferredLocInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addPreferredLocation();
                  }
                }}
                className="w-full px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
              <button
                type="button"
                onClick={addPreferredLocation}
                className="px-4 py-2 bg-slate-800 text-white rounded-xl text-xs font-bold hover:bg-black transition-colors"
              >
                Add
              </button>
            </div>

            {/* Tag Pills */}
            <div className="flex flex-wrap gap-2 mt-3">
              {watchPreferredLocations.map((loc) => (
                <span
                  key={loc}
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 text-indigo-700 border border-indigo-200/80 rounded-full text-xs font-semibold"
                >
                  <span>{loc}</span>
                  <button
                    type="button"
                    onClick={() => removePreferredLocation(loc)}
                    className="hover:text-rose-500 transition-colors"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Travel Anywhere Checkbox */}
          <label className="flex items-center gap-2.5 cursor-pointer select-none mt-2">
            <input
              type="checkbox"
              {...register("willingToTravelAnywhere")}
              className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
            />
            <span className="text-xs font-bold text-slate-800">
              Open to travel anywhere across India for offline project drives
            </span>
          </label>
        </div>
      </div>

      {/* SECTION 2: Subject Expertise & Skills (Dynamic List) */}
      {!isEditing && (
        <div className="bg-white/80 backdrop-blur-md rounded-3xl border border-white/60 p-6 sm:p-8 shadow-[0_4px_24px_rgba(15,23,42,0.04)]">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                <span>2. Subject Expertise & Skills</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Add one or more subjects taught by this trainer. You can select existing subjects or pick &quot;+ Other&quot; to add new ones.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                append({
                  categoryId: categories[0]?.id || "",
                  subjectId: categories[0]?.subjects[0]?.id || "",
                  trainerType: "Technical",
                  expertiseLevel: "Intermediate",
                  subjectExperience: 2,
                  canHandleLargeBatches: true,
                  canConductMockInterviews: true,
                  additionalSkills: [],
                  technicalSkills: [],
                })
              }
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-full text-xs font-bold hover:bg-indigo-100 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add Another Subject</span>
            </button>
          </div>

          <div className="space-y-6">
            {fields.map((field, index) => {
              const selectedCatId = watchSkills?.[index]?.categoryId;
              const selectedSubId = watchSkills?.[index]?.subjectId;

              const isOtherCategory = selectedCatId === "OTHER";
              const isOtherSubject = selectedSubId === "OTHER";

              // Filter subjects belonging to chosen category
              const availableSubjects =
                categories.find((c) => c.id === selectedCatId)?.subjects || [];

              return (
                <div
                  key={field.id}
                  className="p-5 rounded-2xl bg-slate-50/80 border border-slate-200/80 relative space-y-4"
                >
                  <div className="flex items-center justify-between border-b border-slate-200/60 pb-3">
                    <span className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
                      Subject #{index + 1}
                    </span>
                    {fields.length > 1 && (
                      <button
                        type="button"
                        onClick={() => remove(index)}
                        className="text-slate-400 hover:text-rose-500 transition-colors p-1"
                        title="Remove Subject"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Category Combobox */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Skill Category
                      </label>
                      <select
                        {...register(`skills.${index}.categoryId` as const)}
                        className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                      >
                        {categories.map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            {cat.name}
                          </option>
                        ))}
                        <option value="OTHER">+ Other (Add New Category)</option>
                      </select>

                      {/* Dynamic New Category Input */}
                      {isOtherCategory && (
                        <div className="mt-2">
                          <input
                            type="text"
                            placeholder="Type new category name..."
                            {...register(`skills.${index}.newCategoryName` as const)}
                            className="w-full px-3 py-1.5 rounded-lg bg-indigo-50/50 border border-indigo-200 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          />
                        </div>
                      )}
                    </div>

                    {/* Subject Combobox */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Subject Name
                      </label>
                      <select
                        {...register(`skills.${index}.subjectId` as const)}
                        className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                      >
                        {availableSubjects.map((sub) => (
                          <option key={sub.id} value={sub.id}>
                            {sub.name}
                          </option>
                        ))}
                        <option value="OTHER">+ Other (Add New Subject)</option>
                      </select>

                      {/* Dynamic New Subject Input */}
                      {isOtherSubject && (
                        <div className="mt-2">
                          <input
                            type="text"
                            placeholder="Type new subject name..."
                            {...register(`skills.${index}.newSubjectName` as const)}
                            className="w-full px-3 py-1.5 rounded-lg bg-indigo-50/50 border border-indigo-200 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          />
                        </div>
                      )}
                    </div>

                    {/* Trainer Type */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Trainer Type
                      </label>
                      <select
                        {...register(`skills.${index}.trainerType` as const)}
                        className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                      >
                        <option value="Technical">Technical</option>
                        <option value="Aptitude">Aptitude</option>
                        <option value="Soft Skills">Soft Skills</option>
                        <option value="Domain Expert">Domain Expert</option>
                      </select>
                    </div>

                    {/* Expertise Level */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Expertise Level
                      </label>
                      <select
                        {...register(`skills.${index}.expertiseLevel` as const)}
                        className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                      >
                        <option value="Beginner">Beginner</option>
                        <option value="Intermediate">Intermediate</option>
                        <option value="Advanced">Advanced</option>
                        <option value="Expert">Expert</option>
                      </select>
                    </div>

                    {/* Experience in Subject */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Subject Experience (Years)
                      </label>
                      <input
                        type="number"
                        step="0.5"
                        min="0"
                        {...register(`skills.${index}.subjectExperience` as const)}
                        className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                      />
                    </div>

                    {/* Batch & Interview Capabilities */}
                    <div className="flex flex-col justify-center gap-2 pt-2">
                      <label className="flex items-center gap-2 text-xs font-medium text-slate-800 cursor-pointer">
                        <input
                          type="checkbox"
                          {...register(`skills.${index}.canHandleLargeBatches` as const)}
                          className="rounded text-indigo-600 focus:ring-indigo-500"
                        />
                        <span>Can Handle Large Batches (100+)</span>
                      </label>
                      <label className="flex items-center gap-2 text-xs font-medium text-slate-800 cursor-pointer">
                        <input
                          type="checkbox"
                          {...register(`skills.${index}.canConductMockInterviews` as const)}
                          className="rounded text-indigo-600 focus:ring-indigo-500"
                        />
                        <span>Can Conduct Mock Interviews</span>
                      </label>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Bottom Save Action */}
      <div className="flex justify-end pt-4">
        <button
          type="submit"
          disabled={isPending}
          className="pill-button px-8 py-3 text-base"
        >
          {isPending ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Saving Profile...</span>
            </>
          ) : (
            <>
              <Check className="w-5 h-5" />
              <span>{isEditing ? "Update Profile" : "Save & Generate QR"}</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
