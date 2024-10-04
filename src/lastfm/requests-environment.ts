import { LastFmCallSigner } from "./call-signer";
import { HttpMethod } from "../utils/http-method";
import { addQueryParams } from "../utils/query-params-adder";
import {
    LastFmBoolean,
    LastFmGetAlbumInfoPayload,
    LastFmScrobblePayload,
} from "./objects";

export interface RequestMetaInfo {
    url: URL;
    method: HttpMethod;
}

interface LastFmRequestsEnvironmentParams {
    baseUrl: string;
    apiKey: string;
    sessionKey: string;
    callSigner: LastFmCallSigner;
}

const formatQueryParams = ["format", "json"] as const;

const enum LastFmMethods {
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

    private _authUrl: URL = new URL("http://www.last.fm/api/auth/");

    public auth(cb: string): RequestMetaInfo {
        const url = new URL(this._authUrl);

        addQueryParams(url, {
            // biome-ignore lint/style/useNamingConvention: External API
            api_key: this._apiKey,
            cb,
        });

        return {
            method: HttpMethod.Get,
            url,
        };
    }

    public getSession(token: string): RequestMetaInfo {
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

    public getRecentTracks(
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

    public scrobble(params: LastFmScrobblePayload): RequestMetaInfo {
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

    public getAlbumInfo(params: LastFmGetAlbumInfoPayload): RequestMetaInfo {
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
