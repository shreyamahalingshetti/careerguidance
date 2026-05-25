import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET — download all skill gap records as CSV (admin only)
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const records = await prisma.skillGapRecord.findMany({
      orderBy: { createdAt: "desc" },
    });

    // Build CSV
    const headers = [
      "id",
      "user_name",
      "user_email",
      "pathway",
      "node_id",
      "score",
      "accuracy",
      "retry_count",
      "time_taken",
      "first_attempt_score",
      "ml_label",
      "ml_confidence",
      "created_at",
    ];

    const rows = records.map((r) =>
      [
        r.id,
        `"${(r.userName || "").replace(/"/g, '""')}"`,
        `"${(r.userEmail || "").replace(/"/g, '""')}"`,
        r.pathway || "",
        r.nodeId || "",
        r.score,
        r.accuracy,
        r.retryCount,
        r.timeTaken,
        r.firstAttemptScore,
        r.mlLabel,
        r.mlConfidence,
        r.createdAt.toISOString(),
      ].join(",")
    );

    const csv = [headers.join(","), ...rows].join("\n");

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename=skill_gap_records_${new Date().toISOString().split("T")[0]}.csv`,
      },
    });
  } catch (error) {
    console.error("CSV download error:", error);
    return NextResponse.json(
      { error: "Failed to generate CSV" },
      { status: 500 }
    );
  }
}
