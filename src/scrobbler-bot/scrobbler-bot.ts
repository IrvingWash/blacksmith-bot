import {
    RecentTrack,
    TrackScrobblingResult,
    UserCredentials,
    WebhookInfo,
} from "../domain/objects";
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

            return this.sendMessage(update.message.chat.id, url);
        }

        if (
            update.message.text.startsWith(
                `/${telegramBotCommandsConfig.GetSession.command}`
            )
        ) {
            try {
                await this._getSession(update.message.from.username);
            } catch {
                return this.sendMessage(
                    update.message.chat.id,
                    "Failed to authorize"
                );
            }

            return this.sendMessage(update.message.chat.id, "Authorized");
        }

        if (
            update.message.text.startsWith(
                `/${telegramBotCommandsConfig.List.command}`
            )
        ) {
            const recentTracks = await this._listRecentTracks(
                update.message.from.username
            );

            return this.sendMessage(
                update.message.chat.id,
                this._printRecentTracks(recentTracks)
            );
        }

        if (
            update.message.text.startsWith(
                `/${telegramBotCommandsConfig.Scrobble.command}`
            )
        ) {
            const payload = update.message.text.split(
                `/${telegramBotCommandsConfig.Scrobble.command} `
            )[1];

            if (payload === undefined) {
                return this.sendMessage(
                    update.message.chat.id,
                    `Wrong payload: ${update.message.text}`
                );
            }

            const [artist, album] = payload.split("-___-");

            if (artist === undefined || album === undefined) {
                return this.sendMessage(
                    update.message.chat.id,
                    `Wrong payload: ${update.message.text}`
                );
            }

            const result = await this._scrobbleAlbum(
                update.message.from.username,
                artist,
                album
            );

            if (result.accepted) {
                return this.sendMessage(
                    update.message.chat.id,
                    "Scrobbled (maybe)"
                );
            }

            return this.sendMessage(
                update.message.chat.id,
                `Failed to scrobble: ${result.ignoringMessage}`
            );
        }

        if (
            update.message.text.startsWith(
                `/${telegramBotCommandsConfig.Logout.command}`
            )
        ) {
            await this._sessionStorage.clear(
                "session",
                update.message.from.username
            );

            return this.sendMessage(update.message.chat.id, "Logged out");
        }

        return this.sendMessage(
            update.message.chat.id,
            `Unknown command: ${update.message.text}`
        );
    }

    public sendMessage(chatId: string, text: string): Promise<boolean> {
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

    private async _scrobbleAlbum(
        telegramUsername: string,
        artist: string,
        album: string
    ): Promise<TrackScrobblingResult> {
        const credentials = await this._isAuthorized(telegramUsername);

        if (credentials === undefined) {
            throw new Error("You need to authorize first");
        }

        return this._lastFm.scrobbleAlbum(artist, album, true);
    }

    private _printRecentTracks(recentTracks: RecentTrack[]): string {
        let result = "";

        for (const recentTrack of recentTracks.reverse()) {
            result += `${recentTrack.artistName} - ${recentTrack.albumTitle} - ${recentTrack.title} at ${new Date(Number.parseInt(recentTrack.timestamp) * 1000).toLocaleString()}\n`;
        }

        return result;
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
