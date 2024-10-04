export type LastFmBoolean = "0" | "1";

export interface LastFmSession {
    session: {
        key: string;
        name: string;
        subscriber: unknown;
    };
}

export interface LastFmRecentTracks {
    recenttracks: {
        "@attr": {
            page: string;
            perPage: string;
            total: string;
            totalPages: string;
            user: string;
        };
        track: LastFmRecentTrack[];
    };
}

export interface LastFmRecentTrack {
    album: {
        "#text": string;
        mbid: string;
    };
    artist: {
        name: string;
        mbid: string;
    };
    date: {
        "#text": string;
        uts: string;
    };
    image: LastFmImage[];
    mbid: string;
    name: string;
    streamable: string;
    url: string;
    loved: LastFmBoolean;
}

export interface LastFmImage {
    "#text": string;
    size: LastFmImageSize;
}

export const enum LastFmImageSize {
    Small = "small",
    Medium = "medium",
    Large = "large",
    ExtraLarge = "extralarge",
    Mega = "mega",
}

export interface LastFmScrobblePayload {
    [key: string]: string | number | undefined;
    artist: string;
    track: string;
    timestamp: number;
    trackNumber?: number;
    mbid?: string;
    album?: string;
}

export interface LastFmScrobbleResult {
    scrobbles: {
        "@attr": {
            accepted: number;
            ignored: number;
        };
        scrobble: {
            album: {
                "#text"?: string;
                corrected: string;
            };
            albumArtist: {
                "#text": string;
                corrected: string;
            };
            artist: {
                "#text": string;
                corrected: string;
            };
            ignoredMessage: {
                "#text": string;
                corrected: string;
            };
            timestamp: string;
            track: {
                "#text": string;
                corrected: string;
            };
        };
    };
}

export interface LastFmGetAlbumInfoPayload {
    artist: string;
    album: string;
    autocorrect: LastFmBoolean;
}

export interface LastFmAlbumInfo {
    album: {
        artist: string;
        listeners: string;
        mbid: string;
        image: LastFmImage[];
        name: string;
        playcount: string;
        tracks: LastFmAlbumTracks;
        url: string;
    };
}

export interface LastFmAlbumTracks {
    track: LastFmAlbumTrack[];
}

export interface LastFmAlbumTrack {
    "@attr": {
        rank: number;
    };
    artist: {
        mbid: string;
        name: string;
        url: string;
    };
    duration: number;
    name: string;
    streamable: {
        "#text": string;
        fulltrack: string;
    };
    url: string;
}
