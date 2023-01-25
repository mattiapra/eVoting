import test, {Test} from "tape";
import BlockchainManager from "../src/blockchain/BlockchainManager";
import Block from "../src/blockchain/Block";
import BlockHeader, {GENESIS_HASH} from "../src/blockchain/BlockHeader";
import Validator from "../src/blockchain/Validator";
import Transaction from "../src/blockchain/Transaction";
import Cryptography from "../src/utils/Cryptography";
import SHA256 from "crypto-js/sha256";


const manager = new BlockchainManager();
const v1 = new Validator();
const v2 = new Validator();

const h1 = new BlockHeader(GENESIS_HASH, "0", "0", 1, 0, 0);
const block1 = new Block(h1, [], {
    publicKey: v1.publicKey,
    signature: v1.sign(h1.blockHash)
});

const h2 = new BlockHeader(block1.hash, "0", "0", 2, 0, 0);
const block2 = new Block(h2, [], {
    publicKey: v1.publicKey,
    signature: v1.sign(h2.blockHash)
});

const h3 = new BlockHeader(block2.hash, "0", "0", 3, 0, 0);
const block3 = new Block(h3, [], {
    publicKey: v2.publicKey,
    signature: v2.sign(h3.blockHash)
});

const h4 = new BlockHeader(block3.hash, "0", "0", 4, 0, 0);
const block4 = new Block(h4, [], {
    publicKey: v1.publicKey,
    signature: v1.sign(h4.blockHash)
});

const h5 = new BlockHeader(block4.hash, "0", "0", 4, 0, 0);
const block5 = new Block(h5, [], {
    publicKey: v2.publicKey,
    signature: v1.sign(h5.blockHash)
});

test("Append block to chain", (t: Test) => {
    t.plan(1);
    manager.append(block1);
    t.equal(manager.last, block1, "Block1 appended");
});

test("Blockpool", (t: Test) => {
    t.plan(4);

    manager.append(block3);
    manager.append(block4);

    t.equal(manager.last, block1, "Last is still Block1");
    t.equal(manager.length, 2, "Length not changed");

    manager.append(block2);

    t.equal(manager.last, block4, "Block 3, 4 appended");
    t.equal(manager.length, 5, "Length is ok");
});

test("Integrity", (t: Test) => {
    t.plan(1);
    t.true(manager.checkIntegrity(), "Chain is ok");
});

test("Crypto", async (t: Test) => {
    t.plan(3);

    t.ok(block3.isValid(), "Block 3 is valid");
    t.notok(block5.isValid(), "Block 5 is not valid");

    const tBlock = await manager.mine(v1);
    t.ok(tBlock.isValid(), "Mined block is valid");
});

test("Transactions", async (t: Test) => {
    // t.plan(1);
    const voter = new Validator();

    const t1 = new Transaction({
        voterPublicKey: voter.publicKey,
        voterHash: SHA256(voter.publicKey).toString()
    }, v1.publicKey, null);
    t1.setSignature(v1.sign(t1.txHash));

    const t2 = new Transaction({
        choice: "SCELTA 1",
    }, voter.publicKey, null);
    t2.setSignature(voter.sign(t2.txHash));

    manager.addTransactionToPool(t1);
    manager.addTransactionToPool(t2);

    const b = await manager.mine(v2);

    console.dir(b, {
        depth: Infinity
    });

    t.end();
})
