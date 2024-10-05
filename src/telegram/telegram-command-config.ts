export const telegramBotCommandsConfig = {
    // biome-ignore lint/style/useNamingConvention: <explanation>
    RequestAuth: {
        command: "request_auth",
        description: "Request authorization from lastfm",
    },
    // biome-ignore lint/style/useNamingConvention: <explanation>
    GetSession: {
        command: "get_session",
        description: "Get lastfm session",
    },
    // biome-ignore lint/style/useNamingConvention: <explanation>
    List: {
        command: "list",
        description: "List recent tracks",
    },
    // biome-ignore lint/style/useNamingConvention: <explanation>
    Scrobble: {
        command: "scrobble",
        description:
            "Scrobble an album: `/scrobble Artist Name-___-Album Name`",
    },
    // biome-ignore lint/style/useNamingConvention: <explanation>
    Logout: {
        command: "logout",
        description: "Make the bot forget about your lastfm token",
    },
    // biome-ignore lint/style/useNamingConvention: <explanation>
    Help: {
        command: "help",
        description: "Learn how to use this bot",
    },
};
