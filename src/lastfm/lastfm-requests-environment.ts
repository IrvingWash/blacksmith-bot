import { LastFmCallSigner } from "./lastfm-call-signer";
import { HttpMethod } from "../utils/http-method";
import { addQueryParams } from "../utils/query-params-adder";
import {
    LastFmBoolean,
    LastFmGetAlbumInfoPayload,
    LastFmScrobblePayload,
} from "./lastfm-objects";
import { RequestMetaInfo } from "../utils/request-meta-info";

interface LastFmRequestsEnvironmentParams {
    baseUrl: string;
    apiKey: string;
    sessionKey: string;
    callSigner: LastFmCallSigner;
}

const formatQueryParams = ["format", "json"] as const;

const enum LastFmMethods {
    AuthGetToken = "auth.getToken",
    AuthGetSession = "auth.getSession",
    UserGetResentTracks = "user.getRecentTracks",
    TrackScrobble = "track.scrobble",
    AlbumGetInfo = "album.getInfo",
}

export class LastFmRequestsEnvironment {
    private _baseUrl: string;
    private _apiKey: string;
    private _sessionKey: string;
    private _callSigner: LastFmCallSigner;

    public constructor(params: LastFmRequestsEnvironmentParams) {
        this._baseUrl = params.baseUrl;
        this._apiKey = params.apiKey;
        this._sessionKey = params.sessionKey;
        this._callSigner = params.callSigner;
    }

    public authGetToken(): RequestMetaInfo {
        const url = new URL(this._baseUrl);

        addQueryParams(url, {
            method: LastFmMethods.AuthGetToken,
            // biome-ignore lint/style/useNamingConvention: <explanation>
            api_key: this._apiKey,
        });

        this._appendCommonQueryParams(url);

        return {
            url,
            method: HttpMethod.Get,
        };
    }

    public authGetSession(token: string): RequestMetaInfo {
        const url = new URL(this._baseUrl);

        addQueryParams(url, {
            // biome-ignore lint/style/useNamingConvention: External API
            api_key: this._apiKey,
            token,
            method: LastFmMethods.AuthGetSession,
        });

        this._appendCommonQueryParams(url);

        return {
            method: HttpMethod.Get,
            url,
        };
    }

    public userGetRecentTracks(
        user: string,
        extended: LastFmBoolean = "0"
    ): RequestMetaInfo {
        const url = new URL(this._baseUrl);

        addQueryParams(url, {
            user,
            extended,
            // biome-ignore lint/style/useNamingConvention: External API
            api_key: this._apiKey,
            method: LastFmMethods.UserGetResentTracks,
        });

        this._appendCommonQueryParams(url);

        return {
            url,
            method: HttpMethod.Get,
        };
    }

    public trackScrobble(params: LastFmScrobblePayload): RequestMetaInfo {
        const url = new URL(this._baseUrl);

        addQueryParams(url, {
            ...params,
            method: LastFmMethods.TrackScrobble,
            // biome-ignore lint/style/useNamingConvention: External API
            api_key: this._apiKey,
            sk: this._sessionKey,
        });

        this._appendCommonQueryParams(url);

        return {
            url,
            method: HttpMethod.Post,
        };
    }

    public albumGetInfo(params: LastFmGetAlbumInfoPayload): RequestMetaInfo {
        const url = new URL(this._baseUrl);

        addQueryParams(url, {
            ...params,
            method: LastFmMethods.AlbumGetInfo,
            // biome-ignore lint/style/useNamingConvention: External API
            api_key: this._apiKey,
        });

        this._appendCommonQueryParams(url);

        return {
            url,
            method: HttpMethod.Get,
        };
    }

    private _appendCommonQueryParams(url: URL): void {
        url.searchParams.append(
            "api_sig",
            this._callSigner.sign(url.searchParams)
        );

        url.searchParams.append(...formatQueryParams);
    }
}
