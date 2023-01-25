import WS, {Server as WSServer} from "ws";
import {networkInterfaces} from "os"
import CLI from "../io/CLI";
import consola from "consola"
import {BlockData, GetBlockData, HandshakeOpenData, HandshakeReplyData, MessageData, messages} from "./Messages";
import Block from "../blockchain/Block";
import BlockchainManager from "../blockchain/BlockchainManager";
import Transaction from "../blockchain/Transaction";
import Validator from "../blockchain/Validator";

export default class P2PNode {
    public readonly address: string;
    public readonly validator: Validator;
    protected server: WSServer;
    protected peers: Set<string>;
    protected connected: Map<string, WS>;
    protected blockchain: BlockchainManager;
    protected isReady: boolean;
    constructor(manager: BlockchainManager, port: number) {
        this.isReady = false;
        this.blockchain = manager;

        const ni = networkInterfaces();
        const i = 'Wi-Fi'
        let _addr: string | null = null;
        if (i in ni && Array.isArray(ni[i])) _addr = ni[i][0].address;
        this.address = `ws://${_addr ?? "127.0.0.1"}:${port}/`;

        this.server = new WSServer({
            port
        });
        this.peers = new Set<string>(CLI.args.peers);
        this.connected = new Map<string, WS>();
        this.validator = new Validator();

        consola.ready("In ascolto su:", this.address);
    }

    public init(): void {
        this.listen();
        this.connectToPeers();
    }

    public listen(): void {
        this.server.on("connection", async (socket, req) => {
            consola.info("Ho ricevuto una connessione, aspetto l'handshake");

            socket.send(P2PNode.produceMessage(messages.HANDSHAKE_OPEN, {
                chainLength: this.blockchain.length,
                lastHash: this.blockchain.last.hash
            }))

            socket.on("message", (_message: string) => this.handleMessage(_message, socket));
        });
    }

    public broadcastBlock(b: Block): void {
        if (!b.isValid()) return;

        this.broadcast(P2PNode.produceMessage(messages.BLOCK, {
            lastHash: b.hash,
            block: b.serialized
        }))
    }

    public broadcastTransaction(t: Transaction): void {
        if (!t.isValid()) return;

        this.blockchain.addTransactionToPool(t);

        this.broadcast(P2PNode.produceMessage(messages.TRANSACTION, {
            transaction: t
        }))
    }

    private broadcast(message: string): void {
        for (const ws of this.connected.values()) {
            ws.send(message);
        }
    }

    public connectToPeers(): void {
        for (const peer of this.peers) {
            this.connectTo(peer);
        }
    }

    private pushToConnected(ip: string, s: WS) {
        console.log(`Connessione con ${ip} stabilita`);
        this.connected.set(ip, s);
    }

    public connectTo(ip: string): Promise<void> {
        return new Promise((resolve) => {
            if (this.connected.has(ip)) return resolve();

            const socket = new WS(ip);

            socket.on("error", (e) => {
                console.log("Impossibile connettersi a", ip)
                resolve();
            });

            socket.on("open", () => {
                console.log("open")
                this.pushToConnected(ip, socket);
                resolve();
            });

            socket.on("message", (_message: string) => this.handleMessage(_message, socket));

            socket.on("close", () => {
                consola.info("Disconnesso da:", ip);
                this.connected.delete(ip);
            });
        })
    }

    private syncChain(socket: WS, networkChainLength: number): void {
        const localChainLength = this.blockchain.length;
        consola.warn(`Blockchain locale non sincronizzata, mancano ${networkChainLength - localChainLength} blocchi`);
        for (let i = localChainLength; i < networkChainLength; i++) {
            consola.info(`Richiedo il blocco ${i}`);
            socket.send(P2PNode.produceMessage(messages.GET_BLOCK, {
                blockIndex: i
            }));
        }
    }

    private handleMessage(_message: string, socket: WS): void {
        const message = JSON.parse(_message);

        switch (message.type) {
            case messages.HANDSHAKE_OPEN: {
                const data: HandshakeOpenData = message.data;
                if (data.chainLength > this.blockchain.length && data.lastHash !== this.blockchain.last.hash) {
                    this.syncChain(socket, data.chainLength);
                } else {
                    this.setReadyState(socket);
                }
                break;
            }
            case messages.HANDSHAKE_REPLY: {
                const data: HandshakeReplyData = message.data;
                this.pushToConnected(data.ip, socket);
                break;
            }
            case messages.PING:
                socket.send(P2PNode.produceMessage(messages.PONG))
                break;
            case messages.PONG:
                console.log("Received PONG");
                break;
            case messages.GET_BLOCK: {
                const data: GetBlockData = message.data;
                const block = this.blockchain.find(h => h.index === data.blockIndex);
                if (block) {
                    socket.send(P2PNode.produceMessage(messages.BLOCK, {
                        lastHash: this.blockchain.last.hash,
                        block: block.serialized,
                    }))
                }
                break;
            }
            case messages.BLOCK: {
                const data: BlockData = message.data;
                consola.info(`Ricevuto blocco ${data.block.header.index}`);
                const block = Block.fromObject(data.block);
                const append = this.blockchain.append(block);
                const isLast = data.lastHash === block.hash;
                if (append && isLast && !this.isReady) {
                    this.setReadyState(socket);
                }
                if (this.isReady) {
                    this.broadcastBlock(Block.fromObject(data.block));
                }
                break;
            }

            
        }
    }

    get connectedSockets(): string[] {
        return [...this.connected.keys()];
    }

    private setReadyState(socket: WS): void {
        this.isReady = true;
        socket.send(P2PNode.produceMessage(messages.HANDSHAKE_REPLY, {
            ip: this.address
        }));
        consola.ready("Blockchain sincronizzata con la rete");
    }

    private static produceMessage(type: messages, data: MessageData = null): string {
        return JSON.stringify({
            type,
            data
        })
    }
}
