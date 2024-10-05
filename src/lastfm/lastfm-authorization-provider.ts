import { LastFmRequestsEnvironment } from "./lastfm-requests-environment";
import { lastFmFetch } from "./lastfm-fetch";
import {
    LastFmGetTokenResponse,
    LastFmSession,
    LastFmSessionResponse,
} from "./lastfm-objects";

export class LastFmAuthorizationProvider {
    private readonly _requestsEnvironment: LastFmRequestsEnvironment;

    public constructor(requestsEnvironment: LastFmRequestsEnvironment) {
        this._requestsEnvironment = requestsEnvironment;
    }

    public async getToken(): Promise<string> {
        const tokenResponse = await lastFmFetch<LastFmGetTokenResponse>(
            this._requestsEnvironment.authGetToken()
        );

        return tokenResponse.token;
    }

    public async getSession(token: string): Promise<LastFmSession> {
        const session = await lastFmFetch<LastFmSessionResponse>(
            this._requestsEnvironment.authGetSession(token)
        );

        return session.session;
    }
}
