import {
    RecentTrack,
    TrackScrobblingResult,
    UserCredentials,
    WebhookInfo,
} from "../domain/objects";
import { ISessionStorage } from "../session-storage/isession-storage";
import { Telegram } from "../telegram/telegram";
import { LastFm } from "../lastfm/lastfm";
import {
    TelegramBotCommand,
    TelegramUpdate,
} from "../telegram/telegram-objects";
import { commandsConfig } from "./commands-config";

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

    private _isWithCommand(
        botCommand: TelegramBotCommand,
        update: TelegramUpdate
    ): boolean {
        return update.message.text.startsWith(`/${botCommand.command}`);
    }

    public parseUpdate(update: TelegramUpdate): Promise<boolean> {
        if (this._isWithCommand(commandsConfig.RequestAuth, update)) {
            return this._handleRequestAuthCommand(update);
        }

        if (this._isWithCommand(commandsConfig.GetSession, update)) {
            return this._handleGetSessionCommand(update);
        }

        if (this._isWithCommand(commandsConfig.List, update)) {
            return this._handleListCommand(update);
        }

        if (this._isWithCommand(commandsConfig.ScrobbleAlbum, update)) {
            return this._handleScrobbleAlbumCommand(update);
        }

        if (this._isWithCommand(commandsConfig.ScrobbleTrack, update)) {
            return this._handleScrobbleTrackCommand(update);
        }

        if (this._isWithCommand(commandsConfig.Logout, update)) {
            return this._handleLogoutCommand(update);
        }

        if (this._isWithCommand(commandsConfig.Help, update)) {
            return this._handleHelpCommand(update);
        }

        if (update.message.text === "/start") {
            return this._handleHelpCommand(update);
        }

        return this.sendMessage(
            update.message.chat.id,
            `Unknown command: ${update.message.text}`
        );
    }

    private async _handleRequestAuthCommand(
        update: TelegramUpdate
    ): Promise<boolean> {
        const url = await this._requestAccess(update.message.from.username);

        return this.sendMessage(
            update.message.chat.id,
            `[grant access to lastfm](${url})`,
            "MarkdownV2"
        );
    }

    private async _handleGetSessionCommand(
        update: TelegramUpdate
    ): Promise<boolean> {
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

    private async _handleListCommand(update: TelegramUpdate): Promise<boolean> {
        const recentTracks = await this._listRecentTracks(
            update.message.from.username
        );

        return this.sendMessage(
            update.message.chat.id,
            this._printRecentTracks(recentTracks)
        );
    }

    private async _handleScrobbleTrackCommand(
        update: TelegramUpdate
    ): Promise<boolean> {
        const payload = update.message.text.split(
            `/${commandsConfig.ScrobbleTrack.command} `
        )[1];

        if (payload === undefined) {
            return this.sendMessage(
                update.message.chat.id,
                `Wrong payload: ${update.message.text}`
            );
        }

        const [artist, track] = payload.split("-___-");

        if (artist === undefined || track === undefined) {
            return this.sendMessage(
                update.message.chat.id,
                `Wrong payload: ${update.message.text}`
            );
        }

        const result = await this._scrobbleTrack(
            update.message.from.username,
            artist,
            track
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

    private async _handleScrobbleAlbumCommand(
        update: TelegramUpdate
    ): Promise<boolean> {
        const payload = update.message.text.split(
            `/${commandsConfig.ScrobbleAlbum.command} `
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

    private async _handleLogoutCommand(
        update: TelegramUpdate
    ): Promise<boolean> {
        await this._sessionStorage.clear(
            "session",
            update.message.from.username
        );

        return this.sendMessage(update.message.chat.id, "Logged out");
    }

    private _handleHelpCommand(update: TelegramUpdate): Promise<boolean> {
        return this.sendMessage(
            update.message.chat.id,
            "First call `/request_auth` and go to the generated lastfm auth url to grant access.\nThen use `/get_session` to let the bot receive a permanent token."
        );
    }

    public sendMessage(
        chatId: string,
        text: string,
        parseMode?: string
    ): Promise<boolean> {
        return this._telegram.sendMessage({
            chatId,
            text,
            parseMode,
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

    private async _scrobbleTrack(
        telegramUsername: string,
        artist: string,
        track: string
    ): Promise<TrackScrobblingResult> {
        const credentials = await this._isAuthorized(telegramUsername);

        if (credentials === undefined) {
            throw new Error("You need to authorize first");
        }

        return this._lastFm.scrobbleTrack({
            artistName: artist,
            trackName: track,
            timestamp: Date.now(),
        });
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
            result += `${recentTrack.artistName} - ${recentTrack.albumTitle} - ${recentTrack.title} at ${new Date(Number.parseInt(recentTrack.timestamp) * 1000).toISOString()}\n`;
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
