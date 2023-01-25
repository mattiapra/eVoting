import Cryptography, {HexString} from "../utils/Cryptography";

export interface ValidatorSignature {
    signature: HexString,
    publicKey: HexString
}

export default class Validator {

    private keys;

    constructor() {
        this.keys = Cryptography.EC.genKeyPair();
    }

    get publicKey(): HexString {
        return this.keys.getPublic().encode("hex", true);
    }

    public sign(data: HexString): HexString {
        return this.keys.sign(data).toDER("hex");
    }

    public verify(hash: HexString, signature: HexString): boolean {
        return this.keys.verify(hash, signature);
    }

    public static verify(publicKey: HexString, hash: HexString, signature: HexString): boolean {
        return Cryptography.EC.keyFromPublic(publicKey, "hex").verify(hash, signature);
    }
}
