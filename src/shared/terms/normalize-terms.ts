export function normalizeTerms(terms: string[]) {
    const seen = new Set<string>();
    const result: string[] = [];

    for (const raw of terms) {
        const term = raw.trim();
        const key = term.toLowerCase();

        if (!term || seen.has(key)) continue;

        seen.add(key);
        result.push(term);
    }

    return result;
}
