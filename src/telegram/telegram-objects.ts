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

// biome-ignore lint/complexity/noBannedTypes: <explanation>
export type TelegramResponse<T = {}> =
    | TelegramSuccessResponse<T>
    | TelegramFailResponse;

export interface TelegramWebhookInfo {
    url: string;
}

export interface TelegramSendMessagePayload {
    // biome-ignore lint/style/useNamingConvention: <explanation>
    chat_id: string;
    text: string;
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
    chat: TelegramChat;
    text: string;
}

export interface TelegramUser {
    id: number;
    username: string;
}

export interface TelegramChat {
    id: string;
}

export interface TelegramSetMyCommandsPayload {
    commands: TelegramBotCommand[];
}

export interface TelegramBotCommand {
    command: string;
    description: string;
}
