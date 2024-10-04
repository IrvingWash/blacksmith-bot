import { lastFmFetch } from "./lastfm-fetch";
import {
    LastFmAlbumInfo,
    LastFmGetAlbumInfoPayload,
    LastFmRecentTracks,
    LastFmScrobblePayload,
    LastFmScrobbleResult,
} from "./objects";
import { LastFmRequestsEnvironment } from "./requests-environment";

export class LastFmTransport {
    private readonly _requestsEnvironment: LastFmRequestsEnvironment;

    public constructor(requestsEnvironment: LastFmRequestsEnvironment) {
        this._requestsEnvironment = requestsEnvironment;
    }

    public getRecentTracks(
        username: string,
        extended = false
    ): Promise<LastFmRecentTracks> {
        const requestMetaInfo = this._requestsEnvironment.getRecentTracks(
            username,
            extended ? "1" : "0"
        );

        return lastFmFetch(requestMetaInfo);
    }

    public scrobble(
        params: LastFmScrobblePayload
    ): Promise<LastFmScrobbleResult> {
        const requestMetaInfo = this._requestsEnvironment.scrobble(params);

        return lastFmFetch(requestMetaInfo);
    }

    public getAlbumInfo(
        params: LastFmGetAlbumInfoPayload
    ): Promise<LastFmAlbumInfo> {
        const requestMetaInfo = this._requestsEnvironment.getAlbumInfo(params);

        return lastFmFetch(requestMetaInfo);
    }
}
