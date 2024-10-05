import { config } from "dotenv";
import { ScrobblerBot } from "../../scrobbler-bot/scrobbler-bot";
import { Firebase } from "../../firebase/firebase";
import { EnvExtractor } from "../../utils/env-extractor";
import { Telegram } from "../../telegram/telegram";
import { LastFm } from "../../lastfm/lastfm";
import { UserCredentials } from "../../domain/objects";
import { TelegramUpdate } from "../../telegram/telegram-objects";

// biome-ignore lint/style/noDefaultExport: <explanation>
export default async (req: Request): Promise<void> => {
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

    const webhookInfo = await scrobbleBot.getWebhookInfo();

    if (webhookInfo.url === "") {
        const result = await scrobbleBot.setWebhook(
            "blacksmith-bot.netlify.io/.functions/scrobble-bot"
        );

        if (result === false) {
            return;
        }
    }

    // Work
    const update = (await req.json()) as TelegramUpdate;

    // biome-ignore lint/suspicious/noConsoleLog: <explanation>
    // biome-ignore lint/suspicious/noConsole: <explanation>
    console.log(update.message);
};
