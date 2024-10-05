import {
    LastFmAlbumInfo,
    LastFmGetAlbumInfoPayload,
    LastFmImage,
    LastFmImageSize,
    LastFmRecentTrack,
    LastFmScrobblePayload,
    LastFmScrobbleResult,
} from "./lastfm-objects";
import {
    AlbumInfo,
    RecentTrack,
    RequestAlbumInfoPayload,
    ScrobbleTrackPayload,
    TrackScrobblingResult,
} from "../domain/objects";

export function convertAlbumInfoFromLastFm(
    lastFmAlbumInfo: LastFmAlbumInfo
): AlbumInfo {
    const lastFmAlbum = lastFmAlbumInfo.album;

    return {
        artistName: lastFmAlbum.artist,
        lastFmImageUrl: lastFmAlbum.image.find(findLargeImage)?.["#text"],
        lastFmUrl: lastFmAlbum.url,
        title: lastFmAlbum.name,
        tracks: lastFmAlbum.tracks.track.map((track) => {
            return {
                trackNumber: track["@attr"].rank,
                artistName: track.artist.name,
                lastFmUrl: track.url,
                title: track.name,
            };
        }),
    };
}

export function convertRequestAlbumInfoPayloadToLastFm(
    params: RequestAlbumInfoPayload
): LastFmGetAlbumInfoPayload {
    return {
        album: params.albumTitle,
        artist: params.artistName,
        autocorrect: params.autoCorrect ? "1" : "0",
    };
}

export function convertScrobblingResultFromLastFm(
    lastFmScrobblingResult: LastFmScrobbleResult
): TrackScrobblingResult {
    const result = lastFmScrobblingResult.scrobbles;

    return {
        accepted: result["@attr"].ignored === 0,
        ignoringMessage:
            result.scrobble.ignoredMessage["#text"] !== undefined
                ? result.scrobble.ignoredMessage["#text"]
                : undefined,
    };
}

export function convertScrobbleTrackPayloadToLastFm(
    params: ScrobbleTrackPayload
): LastFmScrobblePayload {
    return {
        artist: params.artistName,
        timestamp: params.timestamp / 1000 + (params.trackNumber ?? 0),
        track: params.trackName,
        album: params.albumTitle,
        mbid: params.mbid,
        trackNumber: params.trackNumber,
    };
}

export function convertRecentTrackFromLastFm(
    lastFmRecentTrack: LastFmRecentTrack
): RecentTrack {
    return {
        title: lastFmRecentTrack.name,
        albumTitle: lastFmRecentTrack.album["#text"],
        artistName: lastFmRecentTrack.artist.name,
        lastFmUrl: lastFmRecentTrack.url,
        timestamp: lastFmRecentTrack.date.uts,
        isLoved: lastFmRecentTrack.loved === "1",
        lastFmImageUrl: lastFmRecentTrack.image.find(findLargeImage)?.["#text"],
    };
}

function findLargeImage(image: LastFmImage): boolean {
    return image.size === LastFmImageSize.Large;
}
