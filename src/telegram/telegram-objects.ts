interface TelegramSuccessResponse<T> {
    ok: true;
    result: T;
}

interface TelegramFailResponse {
    ok: false;
    // biome-ignore lint/style/useNamingConvention: <explanation>
    error_code: number;
    description: string;
}

export type TelegramResponse<T> =
    | TelegramSuccessResponse<T>
    | TelegramFailResponse;

export interface TelegramWebhookInfo {
    url: string;
}

export interface TelegramUpdate {
    // biome-ignore lint/style/useNamingConvention: <explanation>
    update_id: string;
    message: TelegramMessage;
}

export interface TelegramMessage {
    // biome-ignore lint/style/useNamingConvention: <explanation>
    message_id: string;
    from: TelegramUser;
    text: string;
}

export interface TelegramUser {
    id: number;
    username: string;
}
