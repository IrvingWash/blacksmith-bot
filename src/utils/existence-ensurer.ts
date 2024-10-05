const UNDEFINED_MESSAGE = "Value is undefined";
const NULL_MESSAGE = "Value is null";

export function ensureExists<T>(
    value: T | undefined | null,
    message?: string
): T {
    if (value === undefined) {
        throw new Error(message ?? UNDEFINED_MESSAGE);
    }

    if (value === null) {
        throw new Error(message ?? NULL_MESSAGE);
    }

    return value;
}
