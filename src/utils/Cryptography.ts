import { ec } from "elliptic";
import SHA256 from "crypto-js/sha256";
const EC = new ec("secp256k1");

export type HexString = string;

export default class Cryptography {
    public static readonly EC = EC;

    public static toHex(s: string): HexString {
        return Buffer.from(s, "utf8").toString("hex");
    }

    public static hash(s: string): HexString {
        return SHA256(s).toString();
    }
}
