import {MerkleTree} from "merkletreejs";
import SHA256 from "crypto-js/sha256";
import Transaction from "./Transaction";

export const GENESIS_HASH = "0x01";

export default class BlockHeader {
    public readonly parentHash: string; // hash of prev block
    public readonly stateRoot: string; // root of merkle hash of current chain state
    public readonly transactionsRoot: string; // root of merkle hash of transactions in block
    public readonly index: number;
    public readonly timestamp: number;
    public readonly nonce: number;
    private _blockHash: string;

    constructor(parentHash: string, stateRoot: string, transactionsRoot: string, index: number, timestamp = Date.now(), nonce = 0, hash = "") {
        this.parentHash = parentHash;
        this.stateRoot = stateRoot;
        this.transactionsRoot = transactionsRoot;
        this.index = index;
        this.timestamp = timestamp;
        this.nonce = nonce;
        this._blockHash = hash || this.computeHash();
    }

    get blockHash(): string {
        return this._blockHash;
    }
    set blockHash(h: string) {
        this._blockHash = h;
    }

    public integrityCheck(parentBlockHash: string) {
        if (this._blockHash === GENESIS_HASH) return true;
        else return parentBlockHash === this.parentHash && this._blockHash === this.computeHash();
    }

    private computeHash(): string {
        return SHA256(JSON.stringify({
            parentHash: this.parentHash,
            stateRoot: this.stateRoot,
            transactionsRoot: this.transactionsRoot,
            index: this.index,
            timestamp: this.timestamp
        })).toString(); // Hex
    }

    public static build(parentHash: string, stateRoot: string, index: number, transactions: Transaction[]) {
        const mtree = new MerkleTree(transactions.map(t => t.txHash), SHA256);
        return new this(parentHash, stateRoot, mtree.getRoot().toString('hex'), index);
    }

    public static fromObject(o: BlockHeader): BlockHeader {
        return new this(o.parentHash, o.stateRoot, o.transactionsRoot, o.index, o.timestamp, o.nonce, o.blockHash);
    }
}
