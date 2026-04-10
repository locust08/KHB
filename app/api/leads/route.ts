import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { submitLead } from "@/src/lib/backend/lead-pipeline";
import { sanitizeErrorMessage } from "@/src/lib/utils/format";

export const dynamic = "force-dynamic";

function buildFailureResponse(errors: string[], warnings: string[] = []) {
  return {
    success: false as const,
    leadSaved: false,
    leadId: "",
    orderNumber: "",
    emailConfigured: false,
    emailSent: false,
    sheetSynced: false,
    whatsappRedirectReady: false,
    trackingReady: false,
    processingComplete: false,
    warnings,
    errors,
    confirmationToken: "",
    confirmationUrl: "",
    whatsappMessage: "",
    whatsappUrl: "",
    error: errors[0] ?? "Lead submission failed.",
    syncStatus: {
      sheets: "failed" as const,
      email: "failed" as const
    }
  };
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = await submitLead(body);

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      const validationErrors = error.issues.map((issue) =>
        [issue.path.join("."), issue.message].filter(Boolean).join(": ")
      );

      return NextResponse.json(
        buildFailureResponse(validationErrors, ["Payload validation failed."]),
        { status: 400 }
      );
    }

    const message = sanitizeErrorMessage(error);

    return NextResponse.json(
      buildFailureResponse([message], ["Lead submission failed."]),
      { status: 500 }
    );
  }
}
