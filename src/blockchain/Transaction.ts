import SHA256 from "crypto-js/sha256";
import {HexString} from "../utils/Cryptography";
import Validator from "./Validator";

interface VoterRegister {
    voterPublicKey: string,
    voterHash: string
}

interface Vote {
    choice: string
}

type TransactionData = VoterRegister | Vote;

export default class Transaction {
    public readonly txHash: HexString;
    public readonly publicKey: HexString;
    public readonly data: TransactionData;
    private signature: HexString | null;

    constructor(data: TransactionData, publicKey: HexString, signature: HexString | null) {
        this.data = data;
        this.publicKey = publicKey;
        this.signature = signature;
        this.txHash = SHA256(JSON.stringify({
            publicKey,
            data,
        })).toString();
    }

    public setSignature(s: HexString): void {
        if (!this.signature) this.signature = s;
    }

    public isValid(): boolean {
        const hash = SHA256(JSON.stringify({
            publicKey: this.publicKey,
            data: this.data,
        })).toString();

        return this.signature !== null && this.txHash === hash && Validator.verify(this.publicKey, this.txHash, this.signature);
    }

    public toJSON(): string {
        return JSON.stringify(this);
    }
}
