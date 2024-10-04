import { LastFmRequestsEnvironment } from "./lastfm-requests-environment";
import { lastFmFetch } from "./lastfm-fetch";
import {
    LastFmGetTokenResponse,
    LastFmSession,
    LastFmSessionResponse,
} from "./lastfm-objects";

export class LastFmAuthorizationProvider {
    private readonly _requestsEnvironment: LastFmRequestsEnvironment;
    private _token: string | null;

    public constructor(requestsEnvironment: LastFmRequestsEnvironment) {
        this._requestsEnvironment = requestsEnvironment;
        this._token = null;
    }

    public async getToken(): Promise<string> {
        const tokenResponse = await lastFmFetch<LastFmGetTokenResponse>(
            this._requestsEnvironment.authGetToken()
        );

        this._token = tokenResponse.token;

        return tokenResponse.token;
    }

    public async getSession(): Promise<LastFmSession> {
        if (this._token === null) {
            throw new Error("Unauthorized");
        }

        const session = await lastFmFetch<LastFmSessionResponse>(
            this._requestsEnvironment.authGetSession(this._token)
        );

        return session.session;
    }
}
