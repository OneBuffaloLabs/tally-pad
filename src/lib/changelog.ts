import fs from 'fs';
import path from 'path';

export type ChangeType = 'added' | 'changed' | 'fixed';

export interface ChangeLogEntry {
  version: string;
  date: string;
  isLatest?: boolean;
  changes: { type: ChangeType; items: string[] }[];
}

/**
 * Reads and parses the CHANGELOG.md file from the project root.
 * Returns a structured array of changelog entries.
 */
export async function getChangelogData(): Promise<ChangeLogEntry[]> {
  try {
    const filePath = path.join(process.cwd(), 'CHANGELOG.md');
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const lines = fileContent.split('\n');

    const entries: ChangeLogEntry[] = [];
    let currentEntry: Partial<ChangeLogEntry> | null = null;
    let currentType: ChangeType | null = null;

    // Regex matchers
    // Matches: ## [1.2.0] - 2026-02-10
    const versionRegex = /^## \[(.+?)\] - (.+)$/;
    // Matches: ### Added
    const typeRegex = /^### (.+)$/;
    // Matches: - Item text
    const itemRegex = /^- (.+)$/;

    for (const line of lines) {
      const versionMatch = line.match(versionRegex);
      if (versionMatch) {
        // Push previous entry if exists
        if (currentEntry) {
          entries.push(currentEntry as ChangeLogEntry);
        }

        // Start new entry
        currentEntry = { version: versionMatch[1], date: versionMatch[2], changes: [] };
        currentType = null;
        continue;
      }

      const typeMatch = line.match(typeRegex);
      if (typeMatch && currentEntry) {
        const typeStr = typeMatch[1].toLowerCase();
        if (['added', 'changed', 'fixed'].includes(typeStr)) {
          currentType = typeStr as ChangeType;
          // Initialize the change group if it doesn't exist
          if (!currentEntry.changes?.find((c) => c.type === currentType)) {
            currentEntry.changes?.push({ type: currentType, items: [] });
          }
        }
        continue;
      }

      const itemMatch = line.match(itemRegex);
      if (itemMatch && currentEntry && currentType) {
        const group = currentEntry.changes?.find((c) => c.type === currentType);
        if (group) {
          group.items.push(itemMatch[1]);
        }
      }
    }

    // Push the last entry
    if (currentEntry) {
      entries.push(currentEntry as ChangeLogEntry);
    }

    // Mark the first one as latest
    if (entries.length > 0) {
      entries[0].isLatest = true;
    }

    return entries;
  } catch (error) {
    console.error('Error parsing CHANGELOG.md:', error);
    return [];
  }
}
