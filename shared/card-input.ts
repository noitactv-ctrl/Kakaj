const cardEntryStartPattern = /^\s*[3456](?:[\s-]*\d){12,18}(?=\s*(?:[|,\t]|$))/;

export function startsWithCardNumber(value: string): boolean {
  return cardEntryStartPattern.test(value);
}

/**
 * Accept both the original blank-line format and one-card-per-line bulk
 * pastes. Lines after a card start stay attached so multiline delivery
 * details are preserved.
 */
export function splitCardEntries(value: string | null | undefined): string[] {
  const normalized = String(value ?? "").replace(/\r\n?/g, "\n").trim();
  if (!normalized) return [];

  return normalized
    .split(/\n\s*\n/)
    .flatMap((block) => {
      const entries: string[] = [];
      let current: string[] = [];

      for (const line of block.split("\n")) {
        if (current.length > 0 && startsWithCardNumber(line)) {
          const entry = current.join("\n").trim();
          if (entry) entries.push(entry);
          current = [];
        }
        if (line.trim()) current.push(line);
      }

      const entry = current.join("\n").trim();
      if (entry) entries.push(entry);
      return entries;
    });
}