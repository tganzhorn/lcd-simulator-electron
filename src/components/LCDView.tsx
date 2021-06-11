import { forwardRef, ForwardRefExoticComponent, useEffect, useImperativeHandle, useRef, useState } from "react";
import { Button } from "react-bootstrap";

class LCDFrameBuffer extends ImageData {
    constructor(width: number, height: number, data?: Uint8ClampedArray) {
        super(data ?? new Uint8ClampedArray(width * height * 4), width, height);
    }

    setRGB(rgba: [number, number, number, number], x: number, y: number) {
        if (x > this.width - 1 || y > this.height - 1 || x < 0 || y < 0) return;
        const index = (y * this.width + x) * 4;
        this.data[index] = rgba[0];
        this.data[index + 1] = rgba[1];
        this.data[index + 2] = rgba[2];
        this.data[index + 3] = rgba[3];
    }

    getRGB(x: number, y: number): [number, number, number, number] {
        const index = (y * this.width + x) * 4;
        return [this.data[index], this.data[index + 1], this.data[index + 2], this.data[index + 3]];
    }

    setBlockData(blockData: LCDFrameBuffer, dx: number, dy: number) {
        for (let x = dx; x < blockData.width + dx; x++) {
            for (let y = dy; y < blockData.height + dy; y++) {
                this.setRGB(blockData.getRGB(x - dx, y - dy), x, y);
            }
        }
    }
}

class LCDCharacter extends LCDFrameBuffer {
    constructor(data: Uint8ClampedArray) {
        super(5, 7, data);
    }
}

export class LCDManager {
    readonly width: number;
    readonly height: number;
    readonly context: CanvasRenderingContext2D;
    readonly lcdFrameBuffer: LCDFrameBuffer;

    cursorRow: number = 0;
    cursorColumn: number = 0;
    dirty: boolean = false;
    raf: number = -1;
    commandsReceived: number = 0;
    onReceiveCommand: () => void = () => {};

    constructor(width: number, height: number, context: CanvasRenderingContext2D) {
        this.width = width;
        this.height = height;
        this.context = context;

        this.lcdFrameBuffer = new LCDFrameBuffer(width, height);
    }

    setCursor(row: number | null, column: number | null) {
        this.cursorRow = row ?? this.cursorRow;
        this.cursorColumn = column ?? this.cursorColumn;

        this.onReceiveCommand();
        this.commandsReceived++;
    }

    insertTextAt(text: string, row: number, column: number) {
        const rowIndex = row * 8 + 1;
        for (let i = 0; i < text.length; i++) {
            const columnIndex = (column + i) * 6 + 2;
            this.lcdFrameBuffer.setBlockData(generateChar(text[i]), columnIndex, rowIndex)
        }
        this.cursorRow = row;
        this.cursorColumn = column + text.length;

        this.dirty = true;

        this.onReceiveCommand();
        this.commandsReceived++;
    }

    insertText(text: string) {
        this.insertTextAt(text, this.cursorRow, this.cursorColumn);
    }

    clearLines() {
        for (let i = 0; i < this.lcdFrameBuffer.data.length; i++) {
            this.lcdFrameBuffer.data[i] = 0;
        }

        this.dirty = true;

        this.onReceiveCommand();
        this.commandsReceived++;
    }

    clearRow(row: number) {
        this.dirty = true;

        this.onReceiveCommand();
        this.commandsReceived++;
    }

    startTicker() {
        this.draw();
        this.raf = window.requestAnimationFrame(() => this.startTicker());
    }

    stopTicker() {
        window.cancelAnimationFrame(this.raf);
        this.raf = -1;
    }

    draw() {
        if (!this.dirty) return;
        this.context.putImageData(this.lcdFrameBuffer, 0, 0);
        this.context.stroke();
        this.dirty = false;
    }
}

export const LCDView: ForwardRefExoticComponent<{}> = forwardRef((props, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [lcdManager, setLcdManager] = useState<LCDManager>();
    const [size, setSize] = useState(3);
    const lightRef = useRef<HTMLDivElement>(null);
    const lightRaf = useRef<number>(-1);

    useEffect(() => {
        if (!canvasRef.current) return;

        const context = canvasRef.current.getContext('2d');

        if (!context) return;

        const lcdManagerRef = new LCDManager(128, 64, context);
        lcdManagerRef.startTicker();

        lcdManagerRef.onReceiveCommand = () => {
            if (!lightRef.current) return;

            lightRef.current.style.backgroundColor = "#5DFF00";
            lightRef.current.style.boxShadow = "0 0 20px #5DFF00";

            lightRaf.current = window.setTimeout(() => {
                if (!lightRef.current) return;
                lightRef.current.style.backgroundColor = "#aaa";
                lightRef.current.style.boxShadow = "0 0 0 #aaa";
            }, 300);
        };

        setLcdManager(lcdManagerRef);

        return () => {
            if (!lcdManager) return;
            lcdManager.stopTicker();
            window.clearTimeout(lightRaf.current);
            lcdManager.onReceiveCommand = () => {};
        }
    }, []);

    useImperativeHandle(ref, () => lcdManager);

    return (
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", backgroundColor: "#343a40", padding: 8, color: "white" }}>
            <div>
                <div style={{ display: "flex", alignItems: "center", marginBottom: 16 }}>
                    <span>RX:</span>
                    <div ref={lightRef} style={{ transition: "all 0.1s ease", marginLeft: 16, backgroundColor: "#aaa", borderRadius: "50%", width: 24, height: 24 }}></div>
                </div>
                <div style={{ display: "flex", alignItems: "center", marginBottom: 16 }}>
                    <span>CMD: <span style={{fontFamily: "Roboto Mono", color: "lightblue"}}>{lcdManager?.commandsReceived ?? 0}</span></span>
                </div>
                <label htmlFor="size" style={{ paddingRight: 8 }}>LCD-Size:</label>
                <div>
                    <Button onClick={() => {if (lcdManager) {lcdManager.clearLines(); lcdManager.commandsReceived = 0}}}>Reset Display</Button>
                </div>
            </div>
            <div style={{ position: "relative", display: "inline-block" }} className="lcd">
                <div style={{ position: "absolute", right: 0, top: 0 }}>
                    <span onClick={() => setSize(size => Math.min(5, size + 0.1))}>➕</span>
                    <span onClick={() => setSize(size => Math.max(2, size - 0.1))}>➖</span>
                </div>
                <canvas
                    ref={canvasRef}
                    width="128"
                    height="64"
                    style={{
                        width: 128 * size,
                        height: 64 * size,
                        border: "8px solid transparent",
                        imageRendering: "pixelated",
                        backgroundColor: "#5DFF00"
                    }}
                >
                </canvas>
            </div>
        </div>
    )
});

const font5x7 = new Uint8ClampedArray([
    0x00, 0x00, 0x00, 0x00, 0x00,// (space)
    0x00, 0x00, 0x5F, 0x00, 0x00,// !
    0x00, 0x07, 0x00, 0x07, 0x00,// "
    0x14, 0x7F, 0x14, 0x7F, 0x14,// #
    0x24, 0x2A, 0x7F, 0x2A, 0x12,// $
    0x23, 0x13, 0x08, 0x64, 0x62,// %
    0x36, 0x49, 0x55, 0x22, 0x50,// &
    0x00, 0x05, 0x03, 0x00, 0x00,// '
    0x00, 0x1C, 0x22, 0x41, 0x00,// (
    0x00, 0x41, 0x22, 0x1C, 0x00,// )
    0x08, 0x2A, 0x1C, 0x2A, 0x08,// *
    0x08, 0x08, 0x3E, 0x08, 0x08,// +
    0x00, 0x50, 0x30, 0x00, 0x00,// ,
    0x08, 0x08, 0x08, 0x08, 0x08,// -
    0x00, 0x60, 0x60, 0x00, 0x00,// .
    0x20, 0x10, 0x08, 0x04, 0x02,// /
    0x3E, 0x51, 0x49, 0x45, 0x3E,// 0
    0x00, 0x42, 0x7F, 0x40, 0x00,// 1
    0x42, 0x61, 0x51, 0x49, 0x46,// 2
    0x21, 0x41, 0x45, 0x4B, 0x31,// 3
    0x18, 0x14, 0x12, 0x7F, 0x10,// 4
    0x27, 0x45, 0x45, 0x45, 0x39,// 5
    0x3C, 0x4A, 0x49, 0x49, 0x30,// 6
    0x01, 0x71, 0x09, 0x05, 0x03,// 7
    0x36, 0x49, 0x49, 0x49, 0x36,// 8
    0x06, 0x49, 0x49, 0x29, 0x1E,// 9
    0x00, 0x36, 0x36, 0x00, 0x00,// :
    0x00, 0x56, 0x36, 0x00, 0x00,// ;
    0x00, 0x08, 0x14, 0x22, 0x41,// <
    0x14, 0x14, 0x14, 0x14, 0x14,// =
    0x41, 0x22, 0x14, 0x08, 0x00,// >
    0x02, 0x01, 0x51, 0x09, 0x06,// ?
    0x32, 0x49, 0x79, 0x41, 0x3E,// @
    0x7E, 0x11, 0x11, 0x11, 0x7E,// A
    0x7F, 0x49, 0x49, 0x49, 0x36,// B
    0x3E, 0x41, 0x41, 0x41, 0x22,// C
    0x7F, 0x41, 0x41, 0x22, 0x1C,// D
    0x7F, 0x49, 0x49, 0x49, 0x41,// E
    0x7F, 0x09, 0x09, 0x01, 0x01,// F
    0x3E, 0x41, 0x41, 0x51, 0x32,// G
    0x7F, 0x08, 0x08, 0x08, 0x7F,// H
    0x00, 0x41, 0x7F, 0x41, 0x00,// I
    0x20, 0x40, 0x41, 0x3F, 0x01,// J
    0x7F, 0x08, 0x14, 0x22, 0x41,// K
    0x7F, 0x40, 0x40, 0x40, 0x40,// L
    0x7F, 0x02, 0x04, 0x02, 0x7F,// M
    0x7F, 0x04, 0x08, 0x10, 0x7F,// N
    0x3E, 0x41, 0x41, 0x41, 0x3E,// O
    0x7F, 0x09, 0x09, 0x09, 0x06,// P
    0x3E, 0x41, 0x51, 0x21, 0x5E,// Q
    0x7F, 0x09, 0x19, 0x29, 0x46,// R
    0x46, 0x49, 0x49, 0x49, 0x31,// S
    0x01, 0x01, 0x7F, 0x01, 0x01,// T
    0x3F, 0x40, 0x40, 0x40, 0x3F,// U
    0x1F, 0x20, 0x40, 0x20, 0x1F,// V
    0x7F, 0x20, 0x18, 0x20, 0x7F,// W
    0x63, 0x14, 0x08, 0x14, 0x63,// X
    0x03, 0x04, 0x78, 0x04, 0x03,// Y
    0x61, 0x51, 0x49, 0x45, 0x43,// Z
    0x00, 0x00, 0x7F, 0x41, 0x41,// [
    0x02, 0x04, 0x08, 0x10, 0x20,// "\"
    0x41, 0x41, 0x7F, 0x00, 0x00,// ]
    0x04, 0x02, 0x01, 0x02, 0x04,// ^
    0x40, 0x40, 0x40, 0x40, 0x40,// _
    0x00, 0x01, 0x02, 0x04, 0x00,// `
    0x20, 0x54, 0x54, 0x54, 0x78,// a
    0x7F, 0x48, 0x44, 0x44, 0x38,// b
    0x38, 0x44, 0x44, 0x44, 0x20,// c
    0x38, 0x44, 0x44, 0x48, 0x7F,// d
    0x38, 0x54, 0x54, 0x54, 0x18,// e
    0x08, 0x7E, 0x09, 0x01, 0x02,// f
    0x08, 0x14, 0x54, 0x54, 0x3C,// g
    0x7F, 0x08, 0x04, 0x04, 0x78,// h
    0x00, 0x44, 0x7D, 0x40, 0x00,// i
    0x20, 0x40, 0x44, 0x3D, 0x00,// j
    0x00, 0x7F, 0x10, 0x28, 0x44,// k
    0x00, 0x41, 0x7F, 0x40, 0x00,// l
    0x7C, 0x04, 0x18, 0x04, 0x78,// m
    0x7C, 0x08, 0x04, 0x04, 0x78,// n
    0x38, 0x44, 0x44, 0x44, 0x38,// o
    0x7C, 0x14, 0x14, 0x14, 0x08,// p
    0x08, 0x14, 0x14, 0x18, 0x7C,// q
    0x7C, 0x08, 0x04, 0x04, 0x08,// r
    0x48, 0x54, 0x54, 0x54, 0x20,// s
    0x04, 0x3F, 0x44, 0x40, 0x20,// t
    0x3C, 0x40, 0x40, 0x20, 0x7C,// u
    0x1C, 0x20, 0x40, 0x20, 0x1C,// v
    0x3C, 0x40, 0x30, 0x40, 0x3C,// w
    0x44, 0x28, 0x10, 0x28, 0x44,// x
    0x0C, 0x50, 0x50, 0x50, 0x3C,// y
    0x44, 0x64, 0x54, 0x4C, 0x44,// z
    0x00, 0x08, 0x36, 0x41, 0x00,// {
    0x00, 0x00, 0x7F, 0x00, 0x00,// |
    0x00, 0x41, 0x36, 0x08, 0x00,// }
    0x08, 0x08, 0x2A, 0x1C, 0x08,// ->
    0x08, 0x1C, 0x2A, 0x08, 0x08 // <-
]);

const generateChar = (charcode: number | string) => {
    if (typeof charcode === "string") charcode = charcode.charCodeAt(0);
    charcode = Math.max(0, charcode - 32);
    let index = 0;
    const tmp = new Uint8ClampedArray(5 * 7 * 4);
    for (let j = 0; j < 8; j++) {
        for (let i = charcode * 5; i < charcode * 5 + 5; i++) {
            const val = (font5x7[i] >> j) & 0x01;
            tmp[index++] = 0;
            tmp[index++] = 0;
            tmp[index++] = 0;
            tmp[index++] = val * 170;
        }
    }
    return new LCDCharacter(tmp);
}