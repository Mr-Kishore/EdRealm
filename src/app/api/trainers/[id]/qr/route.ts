import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { trainers } from "@/db/schema";
import { eq, and, isNull } from "drizzle-orm";
import QRCode from "qrcode";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const format = searchParams.get("format") || "svg";
    const download = searchParams.get("download") === "true";
    const size = parseInt(searchParams.get("size") || "512", 10);

    const trainer = await db.query.trainers.findFirst({
      where: and(eq(trainers.id, id), isNull(trainers.deletedAt)),
    });

    if (!trainer) {
      return new NextResponse("Trainer not found", { status: 404 });
    }

    const host = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const feedbackUrl = `${host}/feedback/${trainer.qrToken}`;

    const filename = `EdRealm-QR-${trainer.trainerCode}-${trainer.fullName.replace(/\s+/g, "_")}.${format}`;

    if (format === "png") {
      const pngBuffer = await QRCode.toBuffer(feedbackUrl, {
        type: "png",
        width: size,
        margin: 2,
        color: {
          dark: "#0F172A", // Slate 900
          light: "#FFFFFF",
        },
      });

      return new NextResponse(pngBuffer as unknown as BodyInit, {
        headers: {
          "Content-Type": "image/png",
          "Cache-Control": "public, max-age=3600, s-maxage=3600",
          ...(download && {
            "Content-Disposition": `attachment; filename="${filename}"`,
          }),
        },
      });
    }

    // Default: Vector SVG
    const svgString = await QRCode.toString(feedbackUrl, {
      type: "svg",
      width: size,
      margin: 2,
      color: {
        dark: "#0F172A",
        light: "#FFFFFF",
      },
    });

    return new NextResponse(svgString, {
      headers: {
        "Content-Type": "image/svg+xml",
        "Cache-Control": "public, max-age=3600, s-maxage=3600",
        ...(download && {
          "Content-Disposition": `attachment; filename="${filename}"`,
        }),
      },
    });
  } catch (error) {
    console.error("QR Code Generation Error:", error);
    return new NextResponse("Failed to generate QR code", { status: 500 });
  }
}
