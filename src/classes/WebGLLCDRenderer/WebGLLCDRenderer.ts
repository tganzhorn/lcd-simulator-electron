import { LCDCharBuffer } from "./LCDCharBuffer";

import toast from 'react-hot-toast';
import { frag } from './frag';
import { vert } from './vert';
import { isDisplayCharCommand, isDisplayClearCommand, isDisplayTextCommand, LCDCommand } from "../CommandParser";
import { isDisplayClearRowCommand, isDisplayGraphicLine, isDisplayPrintColumnCommand, isDisplayPrintMulColumnCommand, isDisplaySetCursorCommand } from "../CommandParser/DisplayCommands";

export class WebGLLCDRenderer {
    readonly gl: WebGL2RenderingContext;
    readonly view: Uint8ClampedArray;
    readonly texture: WebGLTexture | null;
    readonly width: number;
    readonly height: number;

    readonly charBuffer: LCDCharBuffer;
    vertexBuffer: WebGLBuffer | null = null;
    shaderProgram: WebGLProgram | null = null;

    cursorRow: number = 0;
    cursorColumn: number = 0;
    dirty: boolean = false;
    raf: number = -1;
    commandsReceived: number = 0;
    onReceiveCommand: () => void = () => { };
    onDraw: () => void = () => {};

    constructor(gl: WebGL2RenderingContext, width: number, height: number, charBuffer: LCDCharBuffer) {
        this.gl = gl;
        this.width = width;
        this.height = height;
        this.view = new Uint8ClampedArray(width * height);
        this.charBuffer = charBuffer;

        this.texture = gl.createTexture();

        gl.bindTexture(gl.TEXTURE_2D, this.texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.LUMINANCE, width, height, 0, gl.LUMINANCE, gl.UNSIGNED_BYTE, this.view);
        gl.generateMipmap(gl.TEXTURE_2D);

        const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
        const vertexShader = gl.createShader(gl.VERTEX_SHADER);
        if (!fragmentShader || !vertexShader) return;

        gl.shaderSource(fragmentShader, frag);
        gl.compileShader(fragmentShader);

        gl.shaderSource(vertexShader, vert);
        gl.compileShader(vertexShader);

        const shaderProgram = gl.createProgram();
        if (!shaderProgram) return;


        gl.attachShader(shaderProgram, fragmentShader);
        gl.attachShader(shaderProgram, vertexShader);

        gl.linkProgram(shaderProgram);

        if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
            throw new Error('Shader Program isnt valid!');
        }

        const vertexArray = new Float32Array([
            -1, 1, 1, 1, 1, -1,
            -1, 1, 1, -1, -1, -1
        ]);

        const vertexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, vertexArray, gl.STATIC_DRAW);

        gl.useProgram(shaderProgram);

        const aVertexPosition = gl.getAttribLocation(shaderProgram, "aVertexPosition");
        gl.enableVertexAttribArray(aVertexPosition);
        gl.vertexAttribPointer(aVertexPosition, 2, gl.FLOAT, false, 0, 0);

        this.vertexBuffer = vertexBuffer;
        this.shaderProgram = shaderProgram;
    }

    setCursor(row: number | null, column: number | null) {
        this.cursorRow = row ?? this.cursorRow;
        this.cursorColumn = column ?? this.cursorColumn;

        this.onReceiveCommand();
        this.commandsReceived++;
    }

    insertTextAt(text: string, row: number, column: number, mode: "normal" | "inverse" = "normal") {
        const rowIndex = row * 8 + 1;
        for (let i = 0; i < text.length; i++) {
            const columnIndex = (column + i) * 6 + 2;
            this.setBlockData(this.charBuffer.getChar(text.charAt(i)), rowIndex, columnIndex, this.charBuffer.charWidth, this.charBuffer.charHeight + 1, mode);
        }
        this.cursorRow = row;
        this.cursorColumn = column + text.length;

        this.dirty = true;

        this.onReceiveCommand();
        this.commandsReceived++;
    }

    /**
     * Each block consists of 6x8 pixels
     */
    setBlockData(block: Uint8ClampedArray, row: number, column: number, width: number, height: number, mode: "normal" | "inverse" = "normal") {
        let index = 0;
        for (let y = row; y < row + 8; y++) {
            for (let x = column; x < column + 6; x++) {
                let color = 0;
                if (x < width + column && y < height + row) {
                    color = block[index++] ?? 0;
                }
                const i = x + y * this.width;
                if (mode === "inverse") color = 255 - color;
                this.view[i] = color;
            }
        }
    }

    insertText(text: string, mode: "normal" | "inverse" = "normal") {
        this.insertTextAt(text, this.cursorRow, this.cursorColumn, mode);
    }

    clearLines() {
        for (let i = 0; i < this.view.length; i++) {
            this.view[i] = 0;
        }

        this.dirty = true;

        this.onReceiveCommand();
        this.commandsReceived++;
    }

    clearRow(row: number) {
        this.dirty = true;

        for (let j = 0; j < 8; j++) {
            for (let i = 0; i < this.width; i++) {
                this.view[row * 8 + 1 + i + j * this.width] = 0;
            }
        }

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
        const gl = this.gl;
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.LUMINANCE, this.width, this.height, 0, gl.LUMINANCE, gl.UNSIGNED_BYTE, this.view);
        gl.generateMipmap(gl.TEXTURE_2D);
        this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);
        this.onDraw();
        this.dirty = false;
    }

    executeCommand(command: LCDCommand): void {
        const type = command.type;
        if (isDisplayCharCommand(command)) {
            return this.insertText(command.text, command.mode ?? "normal");
        };
        if (isDisplayPrintColumnCommand(command)) {
            // NOT IMPLEMENTED
        };
        if (isDisplayPrintMulColumnCommand(command)) {
            // NOT IMPLEMENTED
        };
        if (isDisplaySetCursorCommand(command)) {
            return this.setCursor(command.row, command.column);
        };
        if (isDisplayTextCommand(command)) {
            return this.insertTextAt(command.text, command.row, command.column, command.mode ?? "normal");
        };
        if (isDisplayClearRowCommand(command)) {
            return this.clearRow(command.row);
        };
        if (isDisplayGraphicLine(command)) {
            // NOT IMPLEMENTED
        };
        if (isDisplayClearCommand(command)) {
            return this.clearLines();
        };
        
        toast.error(type + " not implented in WebGLLCDRenderer!");
        console.log(command);
        return;
    }

    destroy() {
        this.stopTicker();
        this.gl.deleteProgram(this.shaderProgram);
        this.gl.deleteTexture(this.texture);
        this.gl.deleteBuffer(this.vertexBuffer);
        this.onReceiveCommand = () => {};
        this.onDraw = () => {};
    }
}