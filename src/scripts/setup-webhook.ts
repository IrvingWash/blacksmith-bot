import { config } from "dotenv";
import { Telegram } from "./telegram/telegram";
import { EnvExtractor } from "./utils/env-extractor";

config();

const envExtractor = new EnvExtractor();

const telegram = new Telegram({
    baseUrl: "https://api.telegram.org/",
    botToken: envExtractor.telegramBotToken(),
});

telegram.setWebhook(
    "https://blacksmith-bot.netlify.app/.netlify/functions/scrobble-bot"
);
