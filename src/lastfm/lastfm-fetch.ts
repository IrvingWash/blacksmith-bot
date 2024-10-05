import { RequestMetaInfo } from "../utils/request-meta-info";

export async function lastFmFetch<T>(
    requestMetaInfo: RequestMetaInfo
): Promise<T> {
    const response = await fetch(requestMetaInfo.url, {
        method: requestMetaInfo.method,
    });

    // biome-ignore lint/suspicious/noConsoleLog: <explanation>
    // biome-ignore lint/suspicious/noConsole: <explanation>
    console.log(await response.text());

    return response.json() as T;
}
