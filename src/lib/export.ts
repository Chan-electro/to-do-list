export interface ExportData {
  tasks: unknown[];
  habits: unknown[];
  notes: unknown[];
  timeSessions: unknown[];
}

export interface ImportResult {
  imported: number;
  errors: string[];
}

export function exportToJSON(data: ExportData): string {
  return JSON.stringify(
    { version: "1.0", exportedAt: new Date().toISOString(), ...data },
    null,
    2
  );
}

export function downloadJSON(filename: string, data: string): void {
  const blob = new Blob([data], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export async function importFromJSON(
  jsonStr: string
): Promise<ImportResult> {
  const errors: string[] = [];
  let imported = 0;

  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonStr);
  } catch {
    return { imported: 0, errors: ["Invalid JSON: could not parse file."] };
  }

  if (typeof parsed !== "object" || parsed === null) {
    return { imported: 0, errors: ["Invalid format: expected a JSON object."] };
  }

  const data = parsed as Record<string, unknown>;

  // Count importable entities
  const collections: Array<keyof ExportData> = [
    "tasks",
    "habits",
    "notes",
    "timeSessions",
  ];

  for (const key of collections) {
    const items = data[key];
    if (Array.isArray(items)) {
      imported += items.length;
    } else if (items !== undefined) {
      errors.push(`"${key}" is not an array — skipped.`);
    }
  }

  return { imported, errors };
}
