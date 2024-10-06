import { config } from "dotenv";
import { Telegram } from "../telegram/telegram";
import { EnvExtractor } from "../utils/env-extractor";
import { commandsConfig } from "../scrobbler-bot/commands-config";
import { extractErrorMessage } from "../utils/error-message-extractor";

setup().then();

async function setup(): Promise<void> {
    config();

    const envExtractor = new EnvExtractor();

    const telegram = new Telegram({
        baseUrl: "https://api.telegram.org/",
        botToken: envExtractor.telegramBotToken(),
    });

    try {
        await telegram.setWebhook(
            "https://blacksmith-bot.netlify.app/.netlify/functions/scrobble-bot"
        );
    } catch (e) {
        // biome-ignore lint/suspicious/noConsole: <explanation>
        console.log(extractErrorMessage(e));

        return;
    }

    try {
        await telegram.setMyCommands({
            commands: Object.values(commandsConfig),
        });
    } catch (e) {
        // biome-ignore lint/suspicious/noConsole: <explanation>
        console.log(extractErrorMessage(e));
    }
}
