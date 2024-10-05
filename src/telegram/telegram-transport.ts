import { telegramFetch } from "./telegram-fetch";
import {
    TelegramResponse,
    TelegramSendMessagePayload,
    TelegramWebhookInfo,
} from "./telegram-objects";
import { TelegramRequestsEnvironment } from "./telegram-requests-environment";

export class TelegramTransport {
    private readonly _requestsEnvironment: TelegramRequestsEnvironment;

    public constructor(requestsEnvironment: TelegramRequestsEnvironment) {
        this._requestsEnvironment = requestsEnvironment;
    }

    public setWebhook(url: string): Promise<TelegramResponse<undefined>> {
        return telegramFetch(this._requestsEnvironment.setWebhook(), { url });
    }

    public getWebhookInfo(): Promise<TelegramResponse<TelegramWebhookInfo>> {
        return telegramFetch<TelegramWebhookInfo>(
            this._requestsEnvironment.getWebhookInfo()
        );
    }

    public sendMessage(
        message: TelegramSendMessagePayload
    ): Promise<TelegramResponse<undefined>> {
        return telegramFetch(this._requestsEnvironment.sendMessage(), message);
    }
}
