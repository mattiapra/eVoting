import Blockchain from "./Blockchain";
import Block from "./Block";
import BlockHeader from "./BlockHeader";
import VotesPool from "./VotesPool";
import Validator from "./Validator";
import Transaction from "./Transaction";
import {HexString} from "../utils/Cryptography";

export default class BlockchainManager {
    private mainchain: Blockchain;
    private blockpool: Map<number, Block>;
    private votespool: VotesPool;

    constructor() {
        this.mainchain = new Blockchain();
        this.votespool = new VotesPool();
        this.blockpool = new Map<number, Block>();
    }

    get length(): number {
        return this.mainchain.length;
    }

    get last(): Block {
        return this.mainchain.last;
    }

    public print(): void {
        this.mainchain.print();
    }

    public append(b: Block): boolean {
        if (!b.isValid()) return false;

        if (this.mainchain.append(b)) {
            let lastIndex = b.index + 1;
            while (this.blockpool.has(lastIndex)) {
                const append = this.blockpool.get(lastIndex);
                if (append)
                    this.mainchain.append(append);
                lastIndex++;
            }
        } else {
            this.blockpool.set(b.index, b);
        }

        return this.blockpool.size === 0;
    }

    public checkIntegrity(): boolean {
        return this.mainchain.checkIntegrity();
    }

    public restore(): Promise<void> {
        return this.mainchain.restore();
    }

    public addTransactionToPool(t: Transaction): void {
        this.votespool.push(t);
    }

    public mine(validator: Validator): Promise<Block> {
        const transactionsToInclude = this.votespool.get();
        return this.mainchain.mine(validator, transactionsToInclude);
    }

    public find(check: (h: BlockHeader) => boolean): Block | null {
        return this.mainchain.find(check);
    }

    public findTransaction(check: (t: Transaction) => boolean): Transaction | null {
        return this.mainchain.findTransaction(check);
    }
}
