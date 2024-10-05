import { RecentTrack, UserCredentials } from "../domain/objects";
import { ISessionStorage } from "../session-storage/isession-storage";
import { Telegram } from "../telegram/telegram";
import { LastFm } from "../lastfm/lastfm";

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

    public setWebhook(url: string): Promise<boolean> {
        return this._telegram.setWebhook(url);
    }

    public async requestAccess(telegramUsername: string): Promise<string> {
        const grantResult = await this._lastFm.requestAccess();

        this._sessionStorage.save("session", telegramUsername, {
            token: grantResult.grantToken,
            username: telegramUsername,
        });

        return grantResult.url;
    }

    public async getSession(telegramUsername: string): Promise<void> {
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

    public async listRecentTracks(
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
