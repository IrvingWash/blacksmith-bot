export function extractErrorMessage(error: unknown): string {
    if (error instanceof Error) {
        return error.message;
    }

    if (typeof error === "object") {
        return JSON.stringify(error);
    }

    if (error === null || error === undefined) {
        return "Unknown error";
    }

    return error.toString();
}
