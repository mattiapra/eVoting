import CLI, {commands} from "./io/CLI";
import consola from "consola";
import BlockchainManager from "./blockchain/BlockchainManager";
import HTTPServer from "./http/HTTPServer";
import Validator from "./blockchain/Validator";
import P2PNode from "./p2p/P2PNode";

    // two congress daughter foil drastic provide sport glare electric color luggage curtain

class Main {
    public static async run(): Promise<void> {
        console.clear();

        const blockchain = new BlockchainManager();

        const node = new P2PNode(blockchain, CLI.args.port);
        const http = new HTTPServer(node, blockchain, CLI.args.port + 1);

        node.init();
        http.init();

        // await blockchain.restore();

        let answers;
        do {
            answers = await CLI.prompt(node.address, !!answers);

            switch (answers) {
                case commands.NEW_PEER:
                    const addr = await CLI.getStringFromCLI("Inserisci l'indirizzo IP:");
                    if (addr.startsWith("ws://") && addr.includes(":"))
                        await node.connectTo(addr);
                    else
                        consola.warn("Idirizzo IP non valido");
                    break;
                case commands.LIST_CONNECTED:
                    const socketList = node.connectedSockets;
                    consola.info(`Sono connesso a: ${socketList.join(', ') || "nessuno"}`);
                    break;
                case commands.LIST_BLOCKS:
                    blockchain.print();
                    break;
                case commands.MINE:
                    const block = await blockchain.mine(node.validator);
                    consola.success(`Blocco "${block.hash}" creato e aggiunto correttamente alla blockchain, procedo a diffonderlo`);
                    node.broadcastBlock(block);
                    break;
                case commands.CHECK_INTEGRITY:
                    consola.info(`Blockchain integra: ${blockchain.checkIntegrity()}`);
                    break;
            }
        } while (answers !== commands.EXIT);
    }
}

Main.run().then(() => {
    process.exit(0);
})
