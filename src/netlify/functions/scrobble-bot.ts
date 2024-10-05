import { config } from "dotenv";
import { ScrobblerBot } from "../../scrobbler-bot/scrobbler-bot";
import { Firebase } from "../../firebase/firebase";
import { EnvExtractor } from "../../utils/env-extractor";
import { Telegram } from "../../telegram/telegram";
import { LastFm } from "../../lastfm/lastfm";
import { UserCredentials } from "../../domain/objects";

// biome-ignore lint/style/noDefaultExport: <explanation>
export default async (_req: Request): Promise<void> => {
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

    await scrobbleBot.setWebhook(
        "blacksmith-bot.netflify.io/.functions/scrobble-bot"
    );
};
