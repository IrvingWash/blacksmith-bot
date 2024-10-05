import { env } from "node:process";
import { ensureExists } from "./ensure-exists";

const enum EnvVars {
    FirebaseApiKey = "FirebaseApiKey",
    FirebaseAuthDomain = "FirebaseAuthDomain",
    FirebaseProjectId = "FirebaseProjectId",
    FirebaseStorageBucket = "FirebaseStorageBucket",
    FirebaseMessagingSenderId = "FirebaseMessagingSenderId",
    FirebaseAppId = "FirebaseAppId",
    LastFmApiKey = "LastFmApiKey",
    LastFmSharedSecret = "LastFmSharedSecret",
    TelegramBotToken = "TelegramBotToken",
}

export class EnvExtractor {
    public firebaseApiKey(): string {
        return this._envVariable(EnvVars.FirebaseApiKey);
    }

    public firebaseAuthDomain(): string {
        return this._envVariable(EnvVars.FirebaseAuthDomain);
    }

    public firebaseProjectId(): string {
        return this._envVariable(EnvVars.FirebaseProjectId);
    }

    public firebaseStorageBucket(): string {
        return this._envVariable(EnvVars.FirebaseStorageBucket);
    }

    public firebaseMessagingSenderId(): string {
        return this._envVariable(EnvVars.FirebaseMessagingSenderId);
    }

    public firebaseAppId(): string {
        return this._envVariable(EnvVars.FirebaseAppId);
    }

    public lastFmApiKey(): string {
        return this._envVariable(EnvVars.LastFmApiKey);
    }

    public lastFmSharedSecret(): string {
        return this._envVariable(EnvVars.LastFmSharedSecret);
    }

    public telegramBotToken(): string {
        return this._envVariable(EnvVars.TelegramBotToken);
    }

    private _envVariable(name: EnvVars): string {
        return ensureExists(env[name], name);
    }
}
