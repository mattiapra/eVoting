import yargs from "yargs";
import inquirer from "inquirer";
import PressToContinuePrompt from 'inquirer-press-to-continue';
import type { KeyDescriptor } from 'inquirer-press-to-continue';

inquirer.registerPrompt('press-to-continue', PressToContinuePrompt);

interface ArgsOptions {
    port: number,
    peers: string[],
}

export enum commands {
    NEW_PEER = "Aggiungi peer",
    LIST_CONNECTED = "Elenco connessioni",
    LIST_BLOCKS = "Mostra blockchain",
    MINE = "Mina un blocco",
    CHECK_INTEGRITY = "Controlla integrità",
    EXIT = "Esci"
}

class CLI {
    public readonly args: ArgsOptions;
    constructor() {
        this.args = yargs(process.argv.slice(2))
            .options('port', {
                alias: 'p',
                describe: 'which port to use for server',
                default: 3000,
                type: 'number'
            })
            .options('peers', {
                alias: 's',
                describe: 'indicate peers',
                default: [],
                type: 'array'
            })
            .help()
            .argv as ArgsOptions;
    }

    public async prompt(localAddr: string, showPressToContinue = true): Promise<any> {
        console.log("\n");

        if (showPressToContinue) {
            await inquirer.prompt<{ key: KeyDescriptor }>([{
                name: 'Premi per continuare...',
                type: 'press-to-continue',
                enter: true,
                pressToContinueMessage: "Premi per continuare..."
            }]);
            console.clear();
        }

        return inquirer
            .prompt([{
                type: "list",
                name: "command",
                message: "Cosa vuoi fare?",
                choices: [
                    new inquirer.Separator("P2P - On IP " + localAddr),
                    commands.NEW_PEER,
                    commands.LIST_CONNECTED,
                    new inquirer.Separator("Blockchain"),
                    commands.LIST_BLOCKS,
                    commands.MINE,
                    commands.CHECK_INTEGRITY,
                    new inquirer.Separator(),
                    commands.EXIT,
                ],
            }])
            .then((answer) => answer.command)
    }

    public getStringFromCLI(message: string): Promise<string> {
        return inquirer
            .prompt([{
                type: "input",
                "name": "string",
                message
            }])
            .then((answer) => answer.string)
    }
}

export default new CLI();
