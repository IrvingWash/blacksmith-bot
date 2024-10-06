export const commandsConfig = {
    // biome-ignore lint/style/useNamingConvention: Enum member
    RequestAuth: {
        command: "request_auth",
        description: "Request authorization from lastfm",
    },
    // biome-ignore lint/style/useNamingConvention: Enum member
    GetSession: {
        command: "get_session",
        description: "Get lastfm session",
    },
    // biome-ignore lint/style/useNamingConvention: Enum member
    List: {
        command: "list",
        description: "List recent tracks",
    },
    // biome-ignore lint/style/useNamingConvention: Enum member
    ScrobbleAlbum: {
        command: "scrobble_album",
        description:
            "Scrobble an album: `/scrobble_album Artist Name-___-Album Name`",
    },
    // biome-ignore lint/style/useNamingConvention: Enum member
    ScrobbleTrack: {
        command: "scrobble_track",
        description:
            "Scrobble an album: `/scrobble_track Artist Name-___-Track Name`",
    },
    // biome-ignore lint/style/useNamingConvention: Enum member
    Logout: {
        command: "logout",
        description: "Make the bot forget about your lastfm token",
    },
    // biome-ignore lint/style/useNamingConvention: Enum member
    Help: {
        command: "help",
        description: "Learn how to use this bot",
    },
};
