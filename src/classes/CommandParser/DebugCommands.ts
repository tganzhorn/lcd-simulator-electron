import { fillZeroes } from "../../utils";
import { LCDCommand } from "./LCDCommand";

export abstract class DebugCommand extends LCDCommand {
    abstract printText: () => string;
    abstract printNumber: () => string;
}

export const isDebugCommand = (command: LCDCommand): command is DebugCommand => {
    return (command as DebugCommand).printText !== undefined;
}

export type DebugTextModes = "normal" | "error" | "ok";

export class DebugTextCommand extends DebugCommand {
    mode: DebugTextModes;
    text: string;

    printText = () => {
        let icon = "";
        if (this.mode === "error") {
            icon = "❌ ";
        }
        if (this.mode === "ok") {
            icon = "✔ ";
        }
        return icon + this.text;
    };
    printNumber = () => "";

    constructor(text: string, mode: DebugTextModes) {
        super("DebugTextCommand", "DebugText");
        this.text = text;
        this.mode = mode;
    }
}

export const isDebugTextCommand = (command: LCDCommand): command is DebugTextCommand => {
    return command.type === "DebugTextCommand";
}

export type DebugNumberModes =
    "u8hex" | "u16hex" | "u32hex" |
    "u8bin" | "u16bin" | "u32bin" |
    "u8dez" | "u16dez";

export class DebugNumberCommand extends DebugCommand {
    mode: DebugNumberModes;
    text: string;
    number: number;

    printText = () => this.text;
    printNumber = () => {
        if (this.mode === "u8hex") {
            return `0x${fillZeroes(this.number.toString(16), 2)}`;
        }
        if (this.mode === "u16hex") {
            return `0x${fillZeroes(this.number.toString(16), 4)}`;
        }
        if (this.mode === "u32hex") {
            return `0x${fillZeroes(this.number.toString(16), 8)}`;
        }
        if (this.mode === "u8bin") {
            return `0b${fillZeroes(this.number.toString(2), 8)}`;
        }
        if (this.mode === "u16bin") {
            return `0b${fillZeroes(this.number.toString(2), 16)}`;
        }
        return this.number.toString();
    };

    constructor(text: string, number: number, mode: DebugNumberModes) {
        super("DebugNumberCommand", "DebugNumber");

        this.mode = mode;
        this.text = text;
        this.number = number;
    }
}

export const isDebugNumberCommand = (command: LCDCommand): command is DebugNumberCommand => {
    return command.type === "DebugNumberCommand";
}