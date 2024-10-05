import { config as configureEnvVars } from "dotenv";

main();

// biome-ignore lint/suspicious/useAwait: <explanation>
async function main(): Promise<void> {
    configureEnvVars();
}
