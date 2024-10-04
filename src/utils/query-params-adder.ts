export function addQueryParams(
    url: URL,
    params: Record<string, string | number | boolean | undefined | null>
): void {
    for (const [k, v] of Object.entries(params)) {
        if (v === undefined || v === null) {
            continue;
        }

        url.searchParams.append(k, String(v));
    }
}
