import { readFile, appendFile, writeFile } from "fs/promises";
// import { Writer } from 'steno'
import path from "path"

const filepath = path.resolve("block.chain");
class DB {
    // private file: Writer;
    //
    // constructor() {
    //     this.file = new Writer(filepath);
    // }

    public static clear(): Promise<void> {
        return writeFile(filepath, '');
    }
    public static append(data: string): Promise<void> {
        return appendFile(filepath, data + "\n");
    }

    public static write(data: string): Promise<void> {
        return writeFile(filepath, data);
    }

    public static read(): Promise<string | void> {
        return readFile(filepath).then((buffer) => buffer.toString('utf8')).catch(() => Promise.resolve());
    }
}

export default DB;
