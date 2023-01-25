import Transaction from "./Transaction";

export default class VotesPool {
    private pool: Transaction[];

    constructor() {
        this.pool = [];
    }

    public push(t: Transaction): boolean {
        if (this.pool.find(e => e.txHash === t.txHash)) return false;

        this.pool.push(t);
        return true;
    }

    get length(): number {
        return this.pool.length;
    }

    public get(howMany = Infinity): Transaction[] {
        return this.pool.slice(0, howMany);
    }
}
