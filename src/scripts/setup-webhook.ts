import { config } from "dotenv";
import { Telegram } from "../telegram/telegram";
import { EnvExtractor } from "../utils/env-extractor";

setup().then();

async function setup(): Promise<void> {
    config();

    const envExtractor = new EnvExtractor();

    const telegram = new Telegram({
        baseUrl: "https://api.telegram.org/",
        botToken: envExtractor.telegramBotToken(),
    });

    await telegram.setWebhook(
        "https://blacksmith-bot.netlify.app/.netlify/functions/scrobble-bot"
    );

    await telegram.setMyCommands({
        commands: [
            {
                command: "request_auth",
                description: "Request authorization from lastfm",
            },
            {
                command: "get_session",
                description: "Get lastfm session",
            },
        ],
    });
}
