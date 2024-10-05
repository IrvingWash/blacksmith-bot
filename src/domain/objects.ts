interface TrackBase {
    artistName: string;
    title: string;
    lastFmUrl: string;
}

export interface Track extends TrackBase {
    trackNumber: number;
}

export interface RecentTrack extends TrackBase {
    albumTitle: string;
    timestamp: string;
    isLoved: boolean;
    lastFmImageUrl: string | undefined;
}

export interface GrantResult {
    url: string;
    grantToken: string;
}

export interface UserCredentials {
    username: string;
    token: string;
}

export interface ScrobbleTrackPayload {
    artistName: string;
    trackName: string;
    timestamp: number;
    trackNumber?: number;
    albumTitle?: string;
    mbid?: string;
}

export interface TrackScrobblingResult {
    accepted: boolean;
    ignoringMessage?: string;
}

export interface RequestAlbumInfoPayload {
    artistName: string;
    albumTitle: string;
    autoCorrect?: boolean;
}

export interface AlbumInfo {
    artistName: string;
    lastFmImageUrl?: string;
    title: string;
    tracks: Track[];
    lastFmUrl: string;
}

export interface WebhookInfo {
    url: string;
}
