import {
    AlbumInfo,
    GrantResult,
    RecentTrack,
    RequestAlbumInfoPayload,
    ScrobbleTrackPayload,
    TrackScrobblingResult,
    UserCredentials,
} from "../domain/objects";
import { extractErrorMessage } from "../utils/error-message-extractor";
import { LastFmAuthorizationProvider } from "./lastfm-authorization-provider";
import { LastFmCallSigner } from "./lastfm-call-signer";
import {
    convertAlbumInfoFromLastFm,
    convertRecentTrackFromLastFm,
    convertRequestAlbumInfoPayloadToLastFm,
    convertScrobbleTrackPayloadToLastFm,
    convertScrobblingResultFromLastFm,
} from "./lastfm-converters";
import { LastFmRequestsEnvironment } from "./lastfm-requests-environment";
import { LastFmTransport } from "./lastfm-transport";

interface LastFmParams {
    baseUrl: string;
    apiKey: string;
    sharedSecret: string;
    sessionKey?: string;
}

export class LastFm {
    private readonly _apiKey: string;
    private readonly _requestsEnvironment: LastFmRequestsEnvironment;
    private readonly _authProvider: LastFmAuthorizationProvider;
    private readonly _transport: LastFmTransport;

    public constructor(params: LastFmParams) {
        this._apiKey = params.apiKey;

        const callSigner = new LastFmCallSigner(params.sharedSecret);

        this._requestsEnvironment = new LastFmRequestsEnvironment({
            apiKey: this._apiKey,
            baseUrl: params.baseUrl,
            sessionKey: params.sessionKey,
            callSigner,
        });

        this._authProvider = new LastFmAuthorizationProvider(
            this._requestsEnvironment
        );

        this._transport = new LastFmTransport(this._requestsEnvironment);
    }

    public setSessionKey(value: string): void {
        this._requestsEnvironment.setSessionKey(value);
    }

    public async requestAccess(): Promise<GrantResult> {
        const token = await this._authProvider.getToken();

        return {
            url: `https://www.last.fm/api/auth/?api_key=${this._apiKey}&token=${token}`,
            grantToken: token,
        };
    }

    public async session(token: string): Promise<UserCredentials> {
        const lastFmSession = await this._authProvider.getSession(token);

        return {
            token: lastFmSession.key,
            username: lastFmSession.name,
        };
    }

    public async recentTracks(
        username: string,
        limit?: number
    ): Promise<RecentTrack[]> {
        const lastFmRecentTracks = await this._transport.getRecentTracks(
            username,
            limit,
            true
        );

        return lastFmRecentTracks.recenttracks.track.map(
            convertRecentTrackFromLastFm
        );
    }

    public async scrobbleTrack(
        params: ScrobbleTrackPayload
    ): Promise<TrackScrobblingResult> {
        const result = await this._transport.scrobble(
            convertScrobbleTrackPayloadToLastFm(params)
        );

        return convertScrobblingResultFromLastFm(result);
    }

    public async albumInfo(
        params: RequestAlbumInfoPayload
    ): Promise<AlbumInfo> {
        const result = await this._transport.getAlbumInfo(
            convertRequestAlbumInfoPayloadToLastFm(params)
        );

        return convertAlbumInfoFromLastFm(result);
    }

    public async scrobbleAlbum(
        artist: string,
        album: string,
        autoCorrect: boolean
    ): Promise<TrackScrobblingResult> {
        const albumInfo = await this.albumInfo({
            albumTitle: album,
            artistName: artist,
            autoCorrect,
        });

        const scrobblePromises: Promise<TrackScrobblingResult>[] = [];
        const timestamp = Date.now();

        for (const track of albumInfo.tracks) {
            scrobblePromises.push(
                this.scrobbleTrack({
                    artistName: track.artistName,
                    timestamp: timestamp + track.trackNumber,
                    trackName: track.title,
                    albumTitle: albumInfo.title,
                    trackNumber: track.trackNumber,
                })
            );
        }

        let scrobblingResults: TrackScrobblingResult[] = [];
        try {
            scrobblingResults = await Promise.all(scrobblePromises);
        } catch (error) {
            return {
                accepted: false,
                ignoringMessage: extractErrorMessage(error),
            };
        }

        for (const result of scrobblingResults) {
            if (!result.accepted || result.ignoringMessage !== undefined) {
                return result;
            }
        }

        return {
            accepted: true,
        };
    }
}
