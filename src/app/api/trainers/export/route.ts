import { NextRequest, NextResponse } from "next/server";
import { getTrainers } from "@/actions/trainers";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q") || undefined;
    const city = searchParams.get("city") || undefined;
    const state = searchParams.get("state") || undefined;
    const subjectId = searchParams.get("subjectId") || undefined;
    const trainingMode = searchParams.get("trainingMode") || undefined;
    const minExperience = searchParams.get("minExperience") ? parseFloat(searchParams.get("minExperience")!) : undefined;
    const minRating = searchParams.get("minRating") ? parseFloat(searchParams.get("minRating")!) : undefined;

    const { trainers } = await getTrainers({
      q,
      city,
      state,
      subjectId,
      trainingMode,
      minExperience,
      minRating,
      limit: 1000, // Export batch
    });

    // Generate CSV Content
    const headers = [
      "Trainer ID",
      "Full Name",
      "Email",
      "Phone",
      "WhatsApp",
      "City",
      "State",
      "Total Exp (Years)",
      "Training Exp (Years)",
      "Training Modes",
      "Average Rating",
      "Total Reviews",
      "Willing to Travel Anywhere",
      "Skills & Subjects",
      "Google Docs Resume",
    ];

    const escapeCsv = (str: string | number | null | undefined) => {
      if (str === null || str === undefined) return '""';
      const s = String(str).replace(/"/g, '""');
      return `"${s}"`;
    };

    const rows = trainers.map((t) => {
      const skillsSummary = t.skills
        .map((s) => `${s.subject?.name || "Subject"} (${s.expertiseLevel})`)
        .join("; ");

      return [
        escapeCsv(t.trainerCode),
        escapeCsv(t.fullName),
        escapeCsv(t.email),
        escapeCsv(t.phone),
        escapeCsv(t.whatsapp),
        escapeCsv(t.currentCity),
        escapeCsv(t.currentState),
        escapeCsv(t.totalExperience),
        escapeCsv(t.trainingExperience),
        escapeCsv(t.trainingModes.join(", ")),
        escapeCsv(t.cachedRating),
        escapeCsv(t.cachedReviewsCount),
        escapeCsv(t.willingToTravelAnywhere ? "Yes" : "No"),
        escapeCsv(skillsSummary),
        escapeCsv(t.resumeUrl || "N/A"),
      ].join(",");
    });

    const csvContent = [headers.join(","), ...rows].join("\n");

    const dateStr = new Date().toISOString().split("T")[0];
    const filename = `EdRealm_Trainers_${dateStr}.csv`;

    return new NextResponse(csvContent, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("CSV Export Error:", error);
    return new NextResponse("Failed to export CSV", { status: 500 });
  }
}
