const cardEntryStartPattern = /^\s*[3456](?:[\s-]*\d){12,18}(?=\s*(?:[|,\t]|$))/;
const cardNumberBoundaryPattern = /(?<!\d)[3456](?:[\s-]*\d){12,18}(?=\s*(?:[|,\t]|$))/g;

export function startsWithCardNumber(value: string): boolean {
  return cardEntryStartPattern.test(value);
}

/**
 * Find each card number as a record boundary so a whole stock block can be
 * pasted at once. Blank lines, newlines, and other separators are allowed;
 * everything between one card number and the next stays with that card.
 */
export function splitCardEntries(value: string | null | undefined): string[] {
  const normalized = String(value ?? "").replace(/\r\n?/g, "\n").trim();
  if (!normalized) return [];

  return normalized
    .split(/\n\s*\n/)
    .flatMap((block) => {
      const matches = Array.from(block.matchAll(cardNumberBoundaryPattern));
      if (matches.length <= 1) return [block.trim()].filter(Boolean);

      return matches.map((match, index) => {
        const start = index === 0 ? 0 : (match.index ?? 0);
        const end = index + 1 < matches.length
          ? (matches[index + 1].index ?? block.length)
          : block.length;
        return block.slice(start, end).trim();
      }).filter(Boolean);
    });
}