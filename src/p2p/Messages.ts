import {SerializedBlock} from "../blockchain/Block";
import Transaction from "../blockchain/Transaction";

enum messages {
    HANDSHAKE_OPEN,
    HANDSHAKE_REPLY,
    HANDSHAKE_CONNECTED,
    GET_BLOCK,
    BLOCK,
    PING,
    PONG,
    TRANSACTION
}

interface HandshakeOpenData {
    chainLength: number,
    lastHash: string,
}

interface HandshakeReplyData {
    ip: string
}

interface GetBlockData {
    blockIndex: number
}

interface BlockData {
    block: SerializedBlock,
    lastHash: string
}

interface TransactionData {
    transaction: Transaction
}

type MessageData = HandshakeOpenData | HandshakeReplyData | GetBlockData | BlockData | TransactionData | null;

interface Message {
    type: string;
    data: MessageData;
}

export {
    messages,
    Message,
    MessageData,
    GetBlockData,
    BlockData,
    HandshakeOpenData,
    HandshakeReplyData
}
