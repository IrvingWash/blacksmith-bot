import { HttpMethod } from "../utils/http-method";
import { RequestMetaInfo } from "../utils/request-meta-info";

interface TelegramRequestsEnvironmentParams {
    baseUrl: string;
    botToken: string;
}

export class TelegramRequestsEnvironment {
    private readonly _baseUrl: string;
    private readonly _botToken: string;

    public constructor(params: TelegramRequestsEnvironmentParams) {
        this._baseUrl = params.baseUrl;
        this._botToken = params.botToken;
    }

    public setWebhook(): RequestMetaInfo {
        const url = new URL(`/bot${this._botToken}/setWebhook`, this._baseUrl);

        return {
            url,
            method: HttpMethod.Post,
        };
    }

    public getWebhookInfo(): RequestMetaInfo {
        const url = new URL(
            `/bot${this._botToken}/getWebhookInfo`,
            this._baseUrl
        );

        return {
            url,
            method: HttpMethod.Get,
        };
    }

    public sendMessage(): RequestMetaInfo {
        const url = new URL(`/bot${this._botToken}/sendMessage`, this._baseUrl);

        return {
            url,
            method: HttpMethod.Post,
        };
    }

    public setMyCommands(): RequestMetaInfo {
        const url = new URL(
            `/bot${this._botToken}/setMyCommands`,
            this._baseUrl
        );

        return {
            url,
            method: HttpMethod.Post,
        };
    }
}
