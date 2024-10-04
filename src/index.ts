import { config as configureEnvVars } from "dotenv";
import { EnvExtractor } from "./utils/env-extrctor";
import { Firebase } from "./firebase/firebase";

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
}
