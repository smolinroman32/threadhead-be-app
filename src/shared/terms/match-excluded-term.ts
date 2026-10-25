export function matchExcludedTerm(text: string, terms: string[]) {
    return terms.find((term) => termPattern(term).test(text)) ?? null;
}

function termPattern(term: string) {
    const body = term.trim().split(/\s+/).map(escapeRegExp).join('\\s+');

    return new RegExp(`(?<![\\p{L}\\p{N}])${body}(?![\\p{L}\\p{N}])`, 'iu');
}

function escapeRegExp(value: string) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
