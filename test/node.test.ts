// import test, {Test} from "tape";
// import BlockchainManager from "../src/blockchain/BlockchainManager";
// import P2PNode from "../src/p2p/P2PNode";
// import Block from "../src/blockchain/Block";
// import BlockHeader, {GENESIS_HASH} from "../src/blockchain/BlockHeader";
// import Validator from "../src/blockchain/Validator";
//
// const manager1 = new BlockchainManager();
// const manager2 = new BlockchainManager();
// const node1 = new P2PNode(manager1, 3000);
// const node2 = new P2PNode(manager2, 3001);
// const v1 = new Validator();
// const v2 = new Validator();
//
// node1.init();
// node2.init();
//
// test("Create nodes", async (t: Test) => {
//     const b1 = await manager1.mine(v1);
//     const b2 = await manager1.mine(v1);
//
//     t.equal(manager1.length, 3, "Node1 chain is 3 blocks");
//     t.equal(manager2.length, 1, "Node2 chain has genesis");
//
//     await node1.connectTo(`ws://localhost:3001/`);
//
//     setTimeout(async () => {
//         t.equal(manager2.length, 3, "Node2 chain is synced");
//         const b3 = await manager2.mine(v2);
//         node2.broadcastBlock(b3);
//         setTimeout(() => {
//             t.equal(manager1.last, manager2.last, "Chain are synced");
//             t.end();
//         }, 500)
//     }, 500);
//
// })
