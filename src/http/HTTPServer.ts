import express, {Express} from "express";
import BlockchainManager from "../blockchain/BlockchainManager";
import consola from "consola";
import P2PNode from "../p2p/P2PNode";
import Transaction from "../blockchain/Transaction";
import Cryptography from "../utils/Cryptography";

interface LoginBodyData {
    username?: string,
    password?: string
}

interface RegisterBodyData {
    hash?: string,
    publicKey?: string
}

interface VoteBodyData {
    transaction?: Transaction
}

export default class HTTPServer {
    private p2pNode: P2PNode;
    private server: Express;
    private blockchain: BlockchainManager;

    constructor(p2pNode: P2PNode, blockchain: BlockchainManager, port: number) {
        this.server = express();
        this.blockchain = blockchain;
        this.p2pNode = p2pNode;
        this.server.use(express.json());
        this.server.listen(port)
    }

    public init(): void {
        this.server.post('/login', (req, res) => {
            const body: LoginBodyData = req.body;

            if (body.username === "anna" && body.password === "stasi") {
                const id = "abcd123456789";
                const hashed = Cryptography.hash(id);
                res.send(hashed);
            } else return res.sendStatus(400);
        });

        this.server.post('/register', (req, res) => {
            const body: RegisterBodyData = req.body;

            if (!(body.hash && body.publicKey)) return res.sendStatus(400);

            const t = new Transaction({
                voterHash: body.hash,
                voterPublicKey: body.publicKey
            }, this.p2pNode.validator.publicKey, null);

            t.setSignature(this.p2pNode.validator.sign(t.txHash));
            this.p2pNode.broadcastTransaction(t);

        })

        this.server.post('/vote', (req, res) => {
            const body: VoteBodyData = req.body;
            if (!body.transaction) return res.sendStatus(400);
            if (body.transaction.isValid())
                this.p2pNode.broadcastTransaction(body.transaction);
            else return res.sendStatus(401);
        })
    }
}
