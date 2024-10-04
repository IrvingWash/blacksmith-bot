import md5 from "md5";

export class LastFmCallSigner {
    private readonly _sharedSecret: string;

    public constructor(sharedSecret: string) {
        this._sharedSecret = sharedSecret;
    }

    public sign(queryParams: URLSearchParams): string {
        const sortedKeys = Array.from(queryParams.keys()).sort();

        const result: string[] = [];

        for (const key of sortedKeys) {
            result.push(`${key}${queryParams.get(key)}`);
        }

        return md5(`${result.join("")}${this._sharedSecret}`);
    }
}
