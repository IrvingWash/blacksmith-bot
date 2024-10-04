import { config as configureEnvVars } from "dotenv";
import { EnvExtractor } from "./utils/env-extrctor";
import { Firebase } from "./firebase/firebase";
import { LastFm } from "./lastfm/lastfm";

main();

function main(): void {
    configureEnvVars();

    const envExtractor = new EnvExtractor();

    const _firebase = new Firebase({
        apiKey: envExtractor.firebaseApiKey(),
        appId: envExtractor.firebaseAppId(),
        authDomain: envExtractor.firebaseAuthDomain(),
        messagingSenderId: envExtractor.firebaseMessagingSenderId(),
        projectId: envExtractor.firebaseProjectId(),
        storageBucket: envExtractor.firebaseStorageBucket(),
    });

    const _lastFm = new LastFm({
        baseUrl: "http://ws.audioscrobbler.com/2.0/",
        apiKey: envExtractor.lastFmApiKey(),
        sharedSecret: envExtractor.lastFmSharedSecret(),
        sessionKey: "", // TODO
    });
}
