import {
    DisplayCharCommand,
    DisplayClearCommand,
    DisplayPrintMulColumnCommand,
    DisplaySetCursorCommand,
    DisplayTextCommand,
    LCDCommand,
    DebugNumberCommand,
    DebugTextCommand
} from ".";
import { DebugNumberModes, DebugTextModes } from "./DebugCommands";
import { DisplayClearRowCommand } from "./DisplayCommands";

const CommandEnum = {
    "DEBUG": 68,
    "DISPLAY": 76,
};

/*
const DisplayCommandEnum = {
    DISPLAY_CHARS: 1,
    SET_TEXT_CURSOR: 2,
    SET_ROW: 3,
    SET_COLUMN: 4,
    PRINT_COLUMN: 5,
    PRINT_MUL_COLUMN: 6,
    PRINT_TEXT_NORMAL: 7,
    PRINT_TEXT_INVERSE: 8,
    PRINT_CHAR_NORMAL: 9,
    PRINT_CHAR_INVERSE: 10,
    PRINT_BIG_CHAR: null,
    PRINT_BIG_TEXT: null,
    PRINT_GRAFIK_LINE: 12,
    CLEAR_ROW: 13,
    CLEAR_LCD: 14
}

const DebugCommandEnum = {
    TEXT: 1,
    NUMBER: 2
}
*/

export class CommandParser {
    currentCommand: Uint8Array = new Uint8Array(0);
    newCommand: boolean = false;
    commandBuffer: number[] = [];
    debugNumberModes: DebugNumberModes[] = ["u8hex", "u16hex", "u32hex", "u8dez", "u16dez", "u8bin", "u16bin", "u32bin"];
    debugTextModes: DebugTextModes[] = ["normal", "error", "ok"];
    _onNewCommand: (command: LCDCommand) => void = () => { };

    parseValue(buffer: Uint8Array) {
        for (let i = 0; i < buffer.length; i++) {
            if (buffer[i] === 35) {
                this.newCommand = true;
                if (this.commandBuffer.length !== 0) {
                    const command = this.parseCommand();
                    if (command) this._onNewCommand(command);
                }
                this.commandBuffer.length = 0;
                continue;
            }
            if (this.newCommand) {
                if (this.commandBuffer[2]) {
                    if (this.commandBuffer.length === this.commandBuffer[2] + 2) {
                        this.commandBuffer.push(buffer[i]);
                        const command = this.parseCommand();
                        if (command) this._onNewCommand(command);
                        this.commandBuffer.length = 0;
                        this.newCommand = false;
                        continue;
                    }
                }
                this.commandBuffer.push(buffer[i]);
            }
        }
    }

    set onNewCommand(handle: (command: LCDCommand) => void) {
        this._onNewCommand = handle;
    }

    parseCommand(): LCDCommand | false {
        // TODO: Implement switch case. (copy pasta)
        /*
        switch (this.commandBuffer[0]) {
            case CommandEnum.DISPLAY:
                switch (this.commandBuffer[1]) {
                    case DisplayCommandEnum.DISPLAY_CHARS:

                    case DisplayCommandEnum.SET_TEXT_CURSOR:

                    case DisplayCommandEnum.SET_ROW:

                    case DisplayCommandEnum.SET_COLUMN:

                    case DisplayCommandEnum.PRINT_MUL_COLUMN:

                    case DisplayCommandEnum.PRINT_TEXT_NORMAL:
                    case DisplayCommandEnum.PRINT_TEXT_INVERSE:

                    case DisplayCommandEnum.PRINT_CHAR_NORMAL:
                    case DisplayCommandEnum.PRINT_CHAR_INVERSE:

                    case DisplayCommandEnum.PRINT_BIG_CHAR:
                        console.log(this.commandBuffer);
                        return false;
                    case DisplayCommandEnum.PRINT_BIG_TEXT:
                        console.log(this.commandBuffer);
                        return false;
                    case DisplayCommandEnum.PRINT_GRAFIK_LINE:

                    case DisplayCommandEnum.CLEAR_ROW:

                    case DisplayCommandEnum.CLEAR_LCD:

                    default:
                        console.log(this.commandBuffer);
                        return false;
                }
            case CommandEnum.DEBUG:
                switch (this.commandBuffer[1]) {
                    case DebugCommandEnum.TEXT:

                    case DebugCommandEnum.NUMBER:

                    default:
                        console.log(this.commandBuffer);
                        return false;
                }
            default:
                console.log(this.commandBuffer);
                return false;
        }
        */
        // Display Commands
        if (this.commandBuffer[0] === CommandEnum.DISPLAY) {
            if (this.commandBuffer[1] === 1) { // chars
                let text = "";
                for (let i = 3; i < this.commandBuffer.length; i++) {
                    text += this.commandBuffer[i];
                }

                return new DisplayCharCommand(text, "normal");
            }
            if (this.commandBuffer[1] === 2) { // set row, column
                const row = this.commandBuffer[3];
                const column = this.commandBuffer[4];

                return new DisplaySetCursorCommand(row, column);
            }
            if (this.commandBuffer[1] === 3) { // set row
                const row = this.commandBuffer[3];

                return new DisplaySetCursorCommand(row, null);
            }
            if (this.commandBuffer[1] === 4) { // set column
                const column = this.commandBuffer[3];

                return new DisplaySetCursorCommand(null, column);
            }
            if (this.commandBuffer[1] === 5) { // print column
                let text = String.fromCharCode(this.commandBuffer[3]);

                return new DisplayCharCommand(text, "normal");
            }
            if (this.commandBuffer[1] === 6) { // print mulcolumn
                const row = this.commandBuffer[3];
                const column = this.commandBuffer[4];

                let text = "";
                for (let i = 5; i < this.commandBuffer.length; i++) {
                    text += String.fromCharCode(this.commandBuffer[i]);
                }

                return new DisplayPrintMulColumnCommand(text, row, column);
            }
            if (this.commandBuffer[1] === 7 || this.commandBuffer[1] === 8) { // text
                const mode = this.commandBuffer[1] === 7 ? "normal" : "inverse";
                const row = this.commandBuffer[3];
                const column = this.commandBuffer[4];

                let text = "";
                for (let i = 5; i < this.commandBuffer.length; i++) {
                    text += String.fromCharCode(this.commandBuffer[i]);
                }

                return new DisplayTextCommand(text, row, column, mode);
            }
            if (this.commandBuffer[1] === 9 || this.commandBuffer[1] === 10) { // char
                const mode = this.commandBuffer[1] === 9 ? "normal" : "inverse";
                const text = String.fromCharCode(this.commandBuffer[3]);

                return new DisplayCharCommand(text, mode);
            }
            if (this.commandBuffer[1] === 12) { // print line
                return false;
            }
            if (this.commandBuffer[1] === 13) { // clear row
                const row = this.commandBuffer[3];
                return new DisplayClearRowCommand(row);
            }
            if (this.commandBuffer[1] === 14) { // clear lcd
                return new DisplayClearCommand();
            }
        }
        // Debug commands
        if (this.commandBuffer[0] === CommandEnum.DEBUG) {
            if (this.commandBuffer[1] === 2) {
                const mode = this.debugNumberModes[this.commandBuffer[3] - 1];
                const number = (
                    this.commandBuffer[4] * 2 ** 0 +
                    this.commandBuffer[5] * 2 ** 8 +
                    this.commandBuffer[6] * 2 ** 16 +
                    this.commandBuffer[7] * 2 ** 24
                );

                let text = "";
                for (let i = 8; i < this.commandBuffer.length; i++) {
                    if (this.commandBuffer[i] === 0) break;
                    text += String.fromCharCode(this.commandBuffer[i]);
                }

                return new DebugNumberCommand(text, number, mode);
            }
            if (this.commandBuffer[1] === 1) {
                const mode = this.debugTextModes[this.commandBuffer[3] - 1];

                let text = "";
                for (let i = 4; i < this.commandBuffer.length; i++) {
                    text += String.fromCharCode(this.commandBuffer[i]);
                }

                return new DebugTextCommand(text, mode);
            }
        }
        console.log(this.commandBuffer);
        return false;
    }
}