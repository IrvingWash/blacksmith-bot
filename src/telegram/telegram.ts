import { WebhookInfo } from "../domain/objects";
import { TelegramRequestsEnvironment } from "./telegram-requests-environment";
import { TelegramTransport } from "./telegram-transport";

interface TelegramParams {
    botToken: string;
    baseUrl: string;
}

export class Telegram {
    private readonly _transport: TelegramTransport;

    public constructor(params: TelegramParams) {
        const requestsEnvironment = new TelegramRequestsEnvironment({
            baseUrl: params.baseUrl,
            botToken: params.botToken,
        });

        this._transport = new TelegramTransport(requestsEnvironment);
    }

    public async setWebhook(url: string): Promise<boolean> {
        const response = await this._transport.setWebhook(url);

        return response.ok;
    }

    public async getWebhookInfo(): Promise<WebhookInfo> {
        const response = await this._transport.getWebhookInfo();

        if (!response.ok) {
            throw new Error(`${response.error_code}: ${response.description}`);
        }

        return { url: response.result.url };
    }
}
