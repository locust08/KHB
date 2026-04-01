export function sanitizeErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message.slice(0, 400);
  }

  if (typeof error === "string") {
    return error.slice(0, 400);
  }

  return "Unknown error";
}

export function formatCurrency(value: number, currency = "MYR") {
  return new Intl.NumberFormat("en-MY", {
    style: "currency",
    currency,
    minimumFractionDigits: 2
  }).format(value);
}

export function compactJoin(parts: Array<string | undefined | null>, separator = ", ") {
  return parts.filter(Boolean).join(separator);
}

export function formatDeliveryDateLabel(date: string) {
  if (!date) {
    return "Not specified";
  }

  return new Date(date).toLocaleDateString("en-MY", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric"
  });
}
