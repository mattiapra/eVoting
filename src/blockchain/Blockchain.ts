import Block, {SerializedBlock} from "./Block";
import DB from "../io/DB";
import { MerkleTree } from "merkletreejs";
import SHA256 from "crypto-js/sha256";
import Transaction from "./Transaction";
import BlockHeader, {GENESIS_HASH} from "./BlockHeader";
import consola from "consola";
import Validator from "./Validator";
import {HexString} from "../utils/Cryptography";

export default class Blockchain {
    private genesis: Block;

    constructor() {
        const genesisHeader = new BlockHeader("0", "0", "0", 0, 0, 0, GENESIS_HASH);
        this.genesis = new Block(genesisHeader, [], {
            publicKey: "",
            signature: ""
        });
    }

    get length(): number {
        return this.genesis.count();
    }

    get last(): Block {
        return this.genesis.getLastBlock();
    }

    public print() {
        this.genesis.print();
    }

    public append(o: Block): boolean {
        return this.genesis.append(o);
    }

    public async serialize(): Promise<void> {
        await DB.clear();
        await this.genesis.serialize();
    }

    public async restore(): Promise<void> {
        const data = await DB.read();
        if (data) {
            const blocks = data.split('\n');
            for (let i = 0; i < blocks.length - 1; i++) {
                const b: SerializedBlock = JSON.parse(blocks[i]);
                const o = Block.fromObject(b)
                this.append(o);
            }
            consola.success("Blockchain ricreata dal DB locale")
        }
    }

    public checkIntegrity(): boolean {
        return this.genesis.checkIntegrity("0");
    }

    public toArray(): SerializedBlock[] {
        return this.genesis.toArray([]);
    }

    public async mine(validator: Validator, transactionsToInclude: Transaction[]): Promise<Block> {
        const last = this.last;

        const state = this.toArray();
        const stateRoot = new MerkleTree(state.map(b => b.header.blockHash), SHA256).getRoot().toString('hex');
        const parentHash = last.hash;
        const newBlockIndex = last.index + 1;

        const newBlockHeader = BlockHeader.build(parentHash, stateRoot, newBlockIndex, transactionsToInclude);
        const signature = validator.sign(newBlockHeader.blockHash);
        const newBlock = new Block(newBlockHeader, transactionsToInclude, {
            publicKey: validator.publicKey,
            signature
        });
        this.append(newBlock);

        // await newBlock.serialize();

        return newBlock;
    }

    public find(check: (h: BlockHeader) => boolean): Block | null {
        return this.genesis.find(check);
    }

    public findTransaction(check: (t: Transaction) => boolean): Transaction | null {
        return this.genesis.findTransaction(check);
    }
}
