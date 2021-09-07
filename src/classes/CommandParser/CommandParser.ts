import {
    DisplayCharCommand,
    DisplayClearCommand,
    DisplayPrintMulColumnCommand,
    DisplaySetCursorCommand,
    DisplayTextCommand,
    LCDCommand,
    DebugNumberCommand,
    DebugTextCommand,
    DisplayClearRowCommand,
    DisplayPrintColumnCommand,
    DebugNumberModes,
    DebugTextModes
} from ".";
import { DisplayCommandModes, DisplayGraphicLine } from "./DisplayCommands";
import toast from 'react-hot-toast';

enum COMMAND_TYPE {
    DEBUG = 68,
    DISPLAY = 76
};

enum DEBUG_COMMAND {
    TEXT = 1,
    NUMBER = 2,
};

enum DISPLAY_COMMAND {
    GLCD_DISPLAYCHARS = 1,
    GLCD_SETTEXTCURSOR = 2,
    GLCD_SETROW = 3,
    GLCD_SETCOLUMN = 4,
    GLCD_PRINTCOLUMN = 5,
    GLCD_PRINTMULCOLUMN = 6,
    GLCD_PRINTTEXT = 7,
    GLCD_PRINTTEXTINVERS = 8,
    GLCD_PRINTCHAR = 9,
    GLCD_PRINTCHARINVERS = 10,
    GLCD_PRINTGRAFIKLINE = 12,
    GLCD_CLEARROW = 13,
    GLCD_CLEARLCD = 14,
};

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
        if (this.commandBuffer[0] === COMMAND_TYPE.DISPLAY) {
            let text: string,
                row: number,
                column: number,
                data: string,
                mode: DisplayCommandModes;
            switch (this.commandBuffer[1]) {
                case DISPLAY_COMMAND.GLCD_DISPLAYCHARS:
                    text = "";
                    for (let i = 3; i < this.commandBuffer.length; i++) {
                        text += String.fromCharCode(this.commandBuffer[i]);
                    }

                    return new DisplayCharCommand(text, "normal");
                case DISPLAY_COMMAND.GLCD_SETTEXTCURSOR:
                    row = this.commandBuffer[3];
                    column = this.commandBuffer[4];

                    return new DisplaySetCursorCommand(row, column);
                case DISPLAY_COMMAND.GLCD_SETROW:
                    row = this.commandBuffer[3];

                    return new DisplaySetCursorCommand(row, null);
                case DISPLAY_COMMAND.GLCD_SETCOLUMN:
                    column = this.commandBuffer[3];

                    return new DisplaySetCursorCommand(null, column);
                case DISPLAY_COMMAND.GLCD_PRINTCOLUMN:
                    data = String.fromCharCode(this.commandBuffer[3]);

                    return new DisplayPrintColumnCommand(data);
                case DISPLAY_COMMAND.GLCD_PRINTMULCOLUMN:
                    row = this.commandBuffer[3];
                    column = this.commandBuffer[4];

                    data = "";
                    for (let i = 5; i < this.commandBuffer.length; i++) {
                        data += String.fromCharCode(this.commandBuffer[i]);
                    }

                    return new DisplayPrintMulColumnCommand(data, row, column);
                case DISPLAY_COMMAND.GLCD_PRINTTEXT: case DISPLAY_COMMAND.GLCD_PRINTTEXTINVERS:
                    mode = this.commandBuffer[1] === DISPLAY_COMMAND.GLCD_PRINTTEXT ? "normal" : "inverse";
                    row = this.commandBuffer[3];
                    column = this.commandBuffer[4];

                    text = "";
                    for (let i = 5; i < this.commandBuffer.length; i++) {
                        text += String.fromCharCode(this.commandBuffer[i]);
                    }

                    return new DisplayTextCommand(text, row, column, mode);
                case DISPLAY_COMMAND.GLCD_PRINTCHAR: case DISPLAY_COMMAND.GLCD_PRINTCHARINVERS:
                    mode = this.commandBuffer[1] === DISPLAY_COMMAND.GLCD_PRINTCHAR ? "normal" : "inverse";
                    text = String.fromCharCode(this.commandBuffer[3]);

                    return new DisplayCharCommand(text, mode);
                case DISPLAY_COMMAND.GLCD_PRINTGRAFIKLINE: // NOT IMPLEMENTED
                    return new DisplayGraphicLine(0, "");
                case DISPLAY_COMMAND.GLCD_CLEARROW:
                    row = this.commandBuffer[3];
                    return new DisplayClearRowCommand(row);
                case DISPLAY_COMMAND.GLCD_CLEARLCD:
                    return new DisplayClearCommand();
                default:
                    toast.error("Received command not recognized! (For more info check developer console)"); // DEBUG
                    console.log(this.commandBuffer);
                    return false;
            }
        }
        if (this.commandBuffer[0] === COMMAND_TYPE.DEBUG) {
            let text: string,
                mode: DebugTextModes | DebugNumberModes,
                number: number;
            switch (this.commandBuffer[1]) {
                case DEBUG_COMMAND.TEXT:
                    mode = this.debugTextModes[this.commandBuffer[3] - 1];

                    text = "";
                    for (let i = 4; i < this.commandBuffer.length; i++) {
                        text += String.fromCharCode(this.commandBuffer[i]);
                    }

                    return new DebugTextCommand(text, mode);
                case DEBUG_COMMAND.NUMBER:
                    mode =  this.debugNumberModes[this.commandBuffer[3] - 1];
                    number = (
                        this.commandBuffer[4] * 2 ** 0 +
                        this.commandBuffer[5] * 2 ** 8 +
                        this.commandBuffer[6] * 2 ** 16 +
                        this.commandBuffer[7] * 2 ** 24
                    );

                    text = "";
                    for (let i = 8; i < this.commandBuffer.length; i++) {
                        if (this.commandBuffer[i] === 0) break;
                        text += String.fromCharCode(this.commandBuffer[i]);
                    }

                    return new DebugNumberCommand(text, number, mode);
            }
        }
        return false;
    }
}