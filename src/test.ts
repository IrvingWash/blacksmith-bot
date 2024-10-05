import { config } from "dotenv";
import { EnvExtractor } from "./utils/env-extractor";
import { Firebase } from "./firebase/firebase";
import { UserCredentials } from "./domain/objects";
import { Telegram } from "./telegram/telegram";
import { LastFm } from "./lastfm/lastfm";
import { ScrobblerBot } from "./scrobbler-bot/scrobbler-bot";

test().then();

async function test(): Promise<void> {
    // Setup
    config();

    const envExtractor = new EnvExtractor();

    const sessionStorage = new Firebase<UserCredentials>({
        apiKey: envExtractor.firebaseApiKey(),
        appId: envExtractor.firebaseAppId(),
        authDomain: envExtractor.firebaseAuthDomain(),
        messagingSenderId: envExtractor.firebaseMessagingSenderId(),
        projectId: envExtractor.firebaseProjectId(),
        storageBucket: envExtractor.firebaseStorageBucket(),
    });

    const telegram = new Telegram({
        baseUrl: "https://api.telegram.org/",
        botToken: envExtractor.telegramBotToken(),
    });

    const lastFm = new LastFm({
        apiKey: envExtractor.lastFmApiKey(),
        sharedSecret: envExtractor.lastFmSharedSecret(),
        baseUrl: "http://ws.audioscrobbler.com/2.0/",
    });

    const scrobbleBot = new ScrobblerBot(sessionStorage, telegram, lastFm);

    await scrobbleBot.parseUpdate({
        message: {
            chat: { id: "296396609" },
            from: { id: 296396609, username: "IrvingWash" },
            message_id: "1",
            text: '/request_auth',
        },
        update_id: "1",
    });
}
