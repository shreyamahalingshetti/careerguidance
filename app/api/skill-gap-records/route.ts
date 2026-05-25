import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// POST — save a new skill gap record after ML prediction
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const record = await prisma.skillGapRecord.create({
      data: {
        userId: session.user.id,
        userName: session.user.name || null,
        userEmail: session.user.email,
        pathway: body.pathway || null,
        nodeId: body.nodeId || null,
        score: body.score,
        accuracy: body.accuracy,
        retryCount: body.retry_count,
        timeTaken: body.time_taken,
        firstAttemptScore: body.first_attempt_score,
        mlLabel: body.mlLabel,
        mlConfidence: body.mlConfidence,
      },
    });

    return NextResponse.json({ success: true, record });
  } catch (error) {
    console.error("Skill gap record save error:", error);
    return NextResponse.json(
      { error: "Failed to save record" },
      { status: 500 }
    );
  }
}

// GET — admin fetches all skill gap records
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only allow ADMIN role
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const records = await prisma.skillGapRecord.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: { name: true, email: true },
        },
      },
    });

    return NextResponse.json({ records });
  } catch (error) {
    console.error("Skill gap records fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch records" },
      { status: 500 }
    );
  }
}
