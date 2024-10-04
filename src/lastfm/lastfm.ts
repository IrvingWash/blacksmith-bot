import {
    AlbumInfo,
    RecentTrack,
    RequestAlbumInfoPayload,
    ScrobbleTrackPayload,
    TrackScrobblingResult,
} from "../domain/objects";
import { extractErrorMessage } from "../utils/error-message-extractor";
import { LastFmCallSigner } from "./call-signer";
import {
    convertAlbumInfoFromLastFm,
    convertRecentTrackFromLastFm,
    convertRequestAlbumInfoPayloadToLastFm,
    convertScrobbleTrackPayloadToLastFm,
    convertScrobblingResultFromLastFm,
} from "./converters";
import { LastFmRequestsEnvironment } from "./requests-environment";
import { LastFmTransport } from "./transport";

interface LastFmParams {
    baseUrl: string;
    apiKey: string;
    sharedSecret: string;
    sessionKey: string;
}

export class LastFm {
    private readonly _transport: LastFmTransport;

    public constructor(params: LastFmParams) {
        const callSigner = new LastFmCallSigner(params.sharedSecret);

        const requestsEnvironment = new LastFmRequestsEnvironment({
            apiKey: params.apiKey,
            baseUrl: params.baseUrl,
            sessionKey: params.sessionKey,
            callSigner,
        });

        this._transport = new LastFmTransport(requestsEnvironment);
    }

    public async recentTracks(username: string): Promise<RecentTrack[]> {
        const lastFmRecentTracks = await this._transport.getRecentTracks(
            username,
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
