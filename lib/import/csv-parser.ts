export type ParsedCandidateRow = {
  rowNumber: number;
  name: string;
  email: string;
  phone: string | null;
  linkedinUrl: string | null;
  naukriUrl: string | null;
  notes: string | null;
};

export type CsvParseResult = {
  rows: ParsedCandidateRow[];
  errors: string[];
};

const HEADER_ALIASES: Record<
  string,
  keyof Omit<ParsedCandidateRow, "rowNumber">
> = {
  name: "name",
  "full name": "name",
  candidate: "name",
  "candidate name": "name",
  email: "email",
  "email id": "email",
  "email address": "email",
  phone: "phone",
  mobile: "phone",
  "phone number": "phone",
  contact: "phone",
  linkedin: "linkedinUrl",
  "linkedin url": "linkedinUrl",
  "linkedin profile": "linkedinUrl",
  naukri: "naukriUrl",
  "naukri url": "naukriUrl",
  "naukri profile": "naukriUrl",
  notes: "notes",
  comments: "notes",
  remark: "notes",
};

function normalizeHeader(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

function parseCsvLine(line: string): string[] {
  const values: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    const next = line[i + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === "," && !inQuotes) {
      values.push(current.trim());
      current = "";
      continue;
    }

    current += char;
  }

  values.push(current.trim());
  return values;
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function parseCandidateCsv(content: string): CsvParseResult {
  const lines = content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length < 2) {
    return {
      rows: [],
      errors: ["CSV must include a header row and at least one data row."],
    };
  }

  const headers = parseCsvLine(lines[0]).map(normalizeHeader);
  const columnMap = headers.map((header) => HEADER_ALIASES[header] ?? null);

  if (!columnMap.includes("name") || !columnMap.includes("email")) {
    return {
      rows: [],
      errors: [
        "CSV must include Name and Email columns (aliases like 'Full Name' and 'Email ID' are supported).",
      ],
    };
  }

  const rows: ParsedCandidateRow[] = [];
  const errors: string[] = [];

  for (let index = 1; index < lines.length; index += 1) {
    const values = parseCsvLine(lines[index]);
    const rowNumber = index + 1;
    const row: ParsedCandidateRow = {
      rowNumber,
      name: "",
      email: "",
      phone: null,
      linkedinUrl: null,
      naukriUrl: null,
      notes: null,
    };

    columnMap.forEach((field, columnIndex) => {
      if (!field) {
        return;
      }

      const value = values[columnIndex]?.trim();
      if (!value) {
        return;
      }

      if (field === "name" || field === "email") {
        row[field] = value;
        return;
      }

      row[field] = value;
    });

    if (!row.name || !row.email) {
      errors.push(`Row ${rowNumber}: name and email are required.`);
      continue;
    }

    if (!isValidEmail(row.email)) {
      errors.push(`Row ${rowNumber}: invalid email "${row.email}".`);
      continue;
    }

    rows.push(row);
  }

  return { rows, errors };
}
