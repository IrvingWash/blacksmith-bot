import { RecentTrack, UserCredentials, WebhookInfo } from "../domain/objects";
import { ISessionStorage } from "../session-storage/isession-storage";
import { Telegram } from "../telegram/telegram";
import { LastFm } from "../lastfm/lastfm";
import { TelegramUpdate } from "../telegram/telegram-objects";
import { telegramBotCommandsConfig } from "../telegram/telegram-command-config";

export class ScrobblerBot {
    private readonly _sessionStorage: ISessionStorage<UserCredentials>;
    private readonly _telegram: Telegram;
    private readonly _lastFm: LastFm;

    public constructor(
        sessionStorage: ISessionStorage<UserCredentials>,
        telegram: Telegram,
        lastFm: LastFm
    ) {
        this._sessionStorage = sessionStorage;
        this._telegram = telegram;
        this._lastFm = lastFm;
    }

    public getWebhookInfo(): Promise<WebhookInfo> {
        return this._telegram.getWebhookInfo();
    }

    public setWebhook(url: string): Promise<boolean> {
        return this._telegram.setWebhook(url);
    }

    public async parseUpdate(update: TelegramUpdate): Promise<boolean> {
        if (
            update.message.text.startsWith(
                `/${telegramBotCommandsConfig.RequestAuth.command}`
            )
        ) {
            const url = await this._requestAccess(update.message.from.username);

            return this._sendMessage(update.message.chat.id, url);
        }

        if (
            update.message.text.startsWith(
                `/${telegramBotCommandsConfig.GetSession.command}`
            )
        ) {
            try {
                await this._getSession(update.message.from.username);
            } catch {
                return this._sendMessage(
                    update.message.chat.id,
                    "Failed to authorize"
                );
            }

            return this._sendMessage(update.message.chat.id, "Authorized");
        }

        if (
            update.message.text.startsWith(
                `${telegramBotCommandsConfig.List.command}`
            )
        ) {
            const recentTracks = await this._listRecentTracks(
                update.message.from.username
            );

            this._sendMessage(
                update.message.chat.id,
                JSON.stringify(recentTracks)
            );
        }

        return this._sendMessage(
            update.message.chat.id,
            `Unknown command: ${update.message.text}`
        );
    }

    private _sendMessage(chatId: string, text: string): Promise<boolean> {
        return this._telegram.sendMessage({
            chatId,
            text,
        });
    }

    private async _requestAccess(telegramUsername: string): Promise<string> {
        const grantResult = await this._lastFm.requestAccess();

        this._sessionStorage.save("session", telegramUsername, {
            token: grantResult.grantToken,
            username: telegramUsername,
        });

        return grantResult.url;
    }

    private async _getSession(telegramUsername: string): Promise<void> {
        const userSession = await this._sessionStorage.load(
            "session",
            telegramUsername
        );

        if (userSession === undefined) {
            throw new Error("You need to request access first");
        }

        const session = await this._lastFm.session(userSession.token);

        await this._sessionStorage.save("session", telegramUsername, session);
    }

    private async _listRecentTracks(
        telegramUsername: string
    ): Promise<RecentTrack[]> {
        const credentials = await this._isAuthorized(telegramUsername);

        if (credentials === undefined) {
            throw new Error("You need to authorize first");
        }

        return this._lastFm.recentTracks(credentials.username);
    }

    private async _isAuthorized(
        username: string
    ): Promise<UserCredentials | undefined> {
        const credentials = await this._sessionStorage.load(
            "session",
            username
        );

        if (credentials === undefined) {
            return undefined;
        }

        this._lastFm.setSessionKey(credentials.token);

        return credentials;
    }
}
