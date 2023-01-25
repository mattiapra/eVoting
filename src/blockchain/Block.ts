import BlockHeader from "./BlockHeader";
import Transaction from "./Transaction";
import DB from "../io/DB";
import Validator, {ValidatorSignature} from "./Validator";
import {HexString} from "../utils/Cryptography";

export interface SerializedBlock {
    header: BlockHeader,
    transactions: Transaction[],
    signature: ValidatorSignature,
    _next?: Block | null
}

export default class Block {
    private header: BlockHeader;
    public readonly transactions: Transaction[];
    private signature: ValidatorSignature;
    private _next: Block | null;
    constructor(header: BlockHeader, transactionsToInclude: Transaction[], signature: ValidatorSignature) {
        this.transactions = transactionsToInclude;
        this.header = header;
        this.signature = signature;
        this._next = null;
    }

    get hash(): string {
        return this.header.blockHash;
    }

    get index(): number {
        return this.header.index;
    }

    get next(): Block | null {
        return this._next;
    }

    public find(check: (h: BlockHeader) => boolean): Block | null {
        if (check(this.header)) return this;
        if (this._next) return this._next.find(check);

        return null;
    }

    public getLastBlock(): Block {
        if (this._next) return this._next.getLastBlock();
        else return this;
    }

    public count(): number {
        if (this._next === null) return 1;
        else return 1 + this._next.count();
    }

    get serialized(): SerializedBlock {
        return {
            ...this,
            _next: this._next?.hash ?? null
        }
    }

    public print(): void {
        console.dir(this.serialized, {
            depth: 1
        });
        if (this._next !== null) this._next.print();
    }

    public toJSON(): string {
        return JSON.stringify(this.serialized);
    }

    public checkIntegrity(previousHash: string): boolean {
        if (!this.header.integrityCheck(previousHash)) return false;

        if (this._next) {
            return this._next.checkIntegrity(this.header.blockHash);
        } else {
            return true;
        }
    }

    public append(o: Block): boolean {
        if (this._next === null) {
            if (this.header.blockHash === o.header.parentHash) {
                this._next = o;
                return true;
            } else return false;
        }

        return this._next.append(o)
    }

    public async serialize(): Promise<void> {
        if (this.header.parentHash !== "0") await DB.append(this.toJSON()) // Skip genesis serialization

        if (this._next !== null) await this._next.serialize();
    }

    public toArray(array: SerializedBlock[]): SerializedBlock[] {
        array.push(this.serialized);
        if (this._next !== null) this._next.toArray(array);

        return array;
    }

    public isValid(): boolean {
        return Validator.verify(this.signature.publicKey, this.header.blockHash, this.signature.signature) &&
            this.transactions.every(t => t.isValid());
    }

    public static fromObject(o: SerializedBlock): Block {
        const header = BlockHeader.fromObject(o.header);
        return new this(header, o.transactions, o.signature);
    }

    public findTransaction(check: (t: Transaction) => boolean): Transaction | null {
        const isHere = this.transactions.find(check);

        if (isHere) return isHere;
        else if (this._next) return this._next.findTransaction(check);
        else return null;
    }
}
