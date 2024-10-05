import { RequestMetaInfo } from "../utils/request-meta-info";
import { TelegramResponse } from "./telegram-objects";

// biome-ignore lint/complexity/noBannedTypes: <explanation>
export async function telegramFetch<R, B = {}>(
    requestMetaInfo: RequestMetaInfo,
    body?: B
): Promise<TelegramResponse<R>> {
    const response = await fetch(requestMetaInfo.url, {
        method: requestMetaInfo.method,
        body: body !== undefined ? JSON.stringify(body) : undefined,
        headers: {
            "Content-Type": "application/json",
        },
    });

    return response.json() as unknown as TelegramResponse<R>;
}
