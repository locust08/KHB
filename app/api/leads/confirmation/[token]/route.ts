import { NextResponse } from "next/server";

import { getLeadConfirmation } from "@/src/lib/backend/lead-pipeline";
import { sanitizeErrorMessage } from "@/src/lib/utils/format";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const lead = await getLeadConfirmation(token);
    return NextResponse.json({ success: true, lead });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: sanitizeErrorMessage(error)
      },
      { status: 404 }
    );
  }
}
