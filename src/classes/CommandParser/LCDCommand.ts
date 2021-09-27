import { v4 as uuidv4 } from 'uuid';
import { fillZeroes } from '../../utils';

export class LCDCommand {
    type: CommandTypes;
    timestamp: Date;
    initialCommand: string;
    id: string;

    constructor(type: CommandTypes, initialCommand: string) {
        this.type = type;
        this.timestamp = new Date();
        this.initialCommand = initialCommand;
        this.id = uuidv4();
    }

    printTime() {
        return this.timestamp.toLocaleTimeString() + ":" + fillZeroes("" + this.timestamp.getMilliseconds(), 3);
    }

    getKey() {
        return this.id;
    }
}

export type CommandTypes = "DisplaySetCursorCommand" | "DisplayTextCommand" | "DisplayCharCommand" |
    "DisplayClearCommand" | "DebugNumberCommand" | "DebugTextCommand" | "DisplayPrintColumnCommand" | 
    "DisplayClearRowCommand" | "DisplayPrintMulColumnCommand" | "DisplayGraphicLine";