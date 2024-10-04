import { env } from "node:process";
import { ensureExists } from "./ensure-exists";

const enum EnvVars {
    FirebaseApiKey = "FirebaseApiKey",
    FirebaseAuthDomain = "FirebaseAuthDomain",
    FirebaseProjectId = "FirebaseProjectId",
    FirebaseStorageBucket = "FirebaseStorageBucket",
    FirebaseMessagingSenderId = "FirebaseMessagingSenderId",
    FirebaseAppId = "FirebaseAppId",
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

    private _envVariable(name: EnvVars): string {
        return ensureExists(env[name], name);
    }
}
