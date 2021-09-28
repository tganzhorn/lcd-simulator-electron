import { fillZeroes } from "../../utils";
import { LCDCommand } from "./LCDCommand";

export abstract class DisplayCommand extends LCDCommand {
    abstract print: () => string;
    view: Uint8ClampedArray = new Uint8ClampedArray();
    cursorRow: number = 0;
    cursorColumn: number = 0;
}

export const isDisplayCommand = (command: LCDCommand): command is DisplayCommand => {
    return (command as DisplayCommand).cursorColumn !== undefined;
}

export type DisplayCommandModes = "normal" | "inverse";

export class DisplayTextCommand extends DisplayCommand {
    mode: DisplayCommandModes;
    row: number;
    column: number;
    text: string;

    print = () => `text: ${this.text}\nposition: (${this.row}, ${this.column})`;

    constructor(text: string, row: number, column: number, mode: DisplayCommandModes, initialCommand: string) {
        super("DisplayTextCommand", initialCommand);
        this.text = text;
        this.row = row;
        this.column = column;
        this.mode = mode;
    }
}

export const isDisplayTextCommand = (command: LCDCommand): command is DisplayTextCommand => {
    return command.type === "DisplayTextCommand";
}

export class DisplayPrintMulColumnCommand extends DisplayCommand {
    row: number;
    column: number;
    data: number[];

    print = () => `data: [${this.data.map(d => fillZeroes(d.toString(16), 2)).join(", ")}]`;

    constructor(data: number[], row: number, column: number, initialCommand: string) {
        super("DisplayPrintMulColumnCommand", initialCommand)
        this.data = data;
        this.row = row;
        this.column = column;
    }
}

export const isDisplayPrintMulColumnCommand = (command: LCDCommand): command is DisplayPrintMulColumnCommand => {
    return command.type === "DisplayPrintMulColumnCommand";
}

export class DisplayPrintColumnCommand extends DisplayCommand {
    data: number[];

    print = () => `data: [${this.data.map(d => fillZeroes(d.toString(16), 2)).join(", ")}]`;

    constructor(data: number[], initialCommand: string) {
        super("DisplayPrintColumnCommand", initialCommand)
        this.data = data;
    }
}

export const isDisplayPrintColumnCommand = (command: LCDCommand): command is DisplayPrintMulColumnCommand => {
    return command.type === "DisplayPrintColumnCommand";
}

export class DisplaySetCursorCommand extends DisplayCommand {
    row: number | null;
    column: number | null;

    print = () => `position: (${this.row ?? "inherit"}, ${this.column ?? "inherit"})`;

    constructor(row: number | null, column: number | null, initialCommand: string) {
        super("DisplaySetCursorCommand", initialCommand);
        this.row = row;
        this.column = column;
    }
}

export const isDisplaySetCursorCommand = (command: LCDCommand): command is DisplaySetCursorCommand => {
    return command.type === "DisplaySetCursorCommand";
}

export class DisplayClearCommand extends DisplayCommand {
    print = () => "clear all";

    constructor(initialCommand: string) {
        super("DisplayClearCommand", initialCommand);
    }
}

export const isDisplayClearCommand = (command: LCDCommand): command is DisplayClearCommand => {
    return command.type === "DisplayClearCommand";
}

export class DisplayCharCommand extends DisplayCommand {
    mode: DisplayCommandModes;
    text: string;

    print = () => `text: ${this.text}`;

    constructor(text: string, mode: DisplayCommandModes, initialCommand: string) {
        super("DisplayCharCommand", initialCommand);
        this.text = text;
        this.mode = mode;
    }
}

export const isDisplayCharCommand = (command: LCDCommand): command is DisplayCharCommand => {
    return command.type === "DisplayCharCommand";
}

export class DisplayClearRowCommand extends DisplayCommand {
    row: number;

    print = () => `cleared row: ${this.row}`;

    constructor(row: number, initialCommand: string) {
        super("DisplayClearRowCommand", initialCommand);
        this.row = row;
    }
}

export const isDisplayClearRowCommand = (command: LCDCommand): command is DisplayClearRowCommand => {
    return command.type === "DisplayClearRowCommand";
};

export class DisplayGraphicLine extends DisplayCommand {
    colCount: number;
    data: number[];

    print = () => `data: [${this.data.map(d => d.toString(16)).join(", ")}]`;

    constructor(colCount: number, data: number[], initialCommand: string) {
        super("DisplayGraphicLine", initialCommand);

        this.colCount = colCount;
        this.data = data;
    };
};

export const isDisplayGraphicLine = (command: LCDCommand): command is DisplayGraphicLine => {
    return command.type === "DisplayGraphicLine";
};
