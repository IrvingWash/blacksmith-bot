import { config } from "dotenv";
import { ScrobblerBot } from "../../scrobbler-bot/scrobbler-bot";
import { Firebase } from "../../firebase/firebase";
import { EnvExtractor } from "../../utils/env-extractor";
import { Telegram } from "../../telegram/telegram";
import { LastFm } from "../../lastfm/lastfm";
import { UserCredentials } from "../../domain/objects";
import { TelegramUpdate } from "../../telegram/telegram-objects";
import { extractErrorMessage } from "../../utils/error-message-extractor";

// biome-ignore lint/style/noDefaultExport: External API
export default async (req: Request): Promise<void> => {
    config();

    const update = (await req.json()) as TelegramUpdate;

    if ("edited_message" in update) {
        return;
    }

    // biome-ignore lint/suspicious/noConsole: Logging
    console.log(`Received update ${JSON.stringify(update)}`);

    const scrobbleBot = createScrobbleBot();

    try {
        await scrobbleBot.parseUpdate(update);
    } catch (error) {
        // biome-ignore lint/suspicious/noConsole: Logging
        console.log(error);

        await scrobbleBot.sendMessage(
            update.message.chat.id,
            `Something went wrong: ${extractErrorMessage(error)}`
        );
    }

    // biome-ignore lint/suspicious/noConsole: Logging
    console.log(`Finished with update with id ${update.update_id}`);

    return;
};

function createScrobbleBot(): ScrobblerBot {
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

    return new ScrobblerBot(sessionStorage, telegram, lastFm);
}
