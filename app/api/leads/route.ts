import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { submitLead } from "@/src/lib/backend/lead-pipeline";
import { sanitizeErrorMessage } from "@/src/lib/utils/format";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = await submitLead({
      ...body,
      context: {
        ...(body?.context ?? {}),
        userAgent: request.headers.get("user-agent") ?? "",
        pageUrl: body?.context?.pageUrl ?? request.headers.get("referer") ?? ""
      }
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed.",
          fields: error.flatten().fieldErrors
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: sanitizeErrorMessage(error)
      },
      { status: 500 }
    );
  }
}
