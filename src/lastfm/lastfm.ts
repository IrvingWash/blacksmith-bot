import { LastFmCallSigner } from "./call-signer";

export class LastFm {
    public constructor(sharedSecret: string) {
        const _callSigner = new LastFmCallSigner(sharedSecret);
    }
}
