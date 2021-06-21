import { LCDCharBuffer } from "./LCDCharBuffer";

import { frag } from './frag';
import { vert } from './vert';
import { isDisplayCharCommand, isDisplayClearCommand, isDisplayTextCommand, LCDCommand } from "../CommandParser";
import { isDisplayClearRowCommand, isDisplayPrintMulColumnCommand, isDisplaySetCursorCommand } from "../CommandParser/DisplayCommands";

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

    insertTextAt(text: string, row: number, column: number) {
        const rowIndex = row * 8 + 1;
        for (let i = 0; i < text.length; i++) {
            const columnIndex = (column + i) * 6 + 2;
            this.setBlockData(this.charBuffer.chars[text[i]], rowIndex, columnIndex, this.charBuffer.charWidth, this.charBuffer.charHeight);
        }
        this.cursorRow = row;
        this.cursorColumn = column + text.length;

        this.dirty = true;

        this.onReceiveCommand();
        this.commandsReceived++;
    }

    setBlockData(block: Uint8ClampedArray, row: number, column: number, width: number, height: number, mode: "normal" | "invers" = "normal") {
        let index = 0;
        for (let y = row; y < row + height; y++) {
            for (let x = column; x < column + width; x++) {
                const i = x + y * this.width;
                let color = block[index++];
                if (mode === "invers") color = 255 - color;
                this.view[i] = color;
            }
        }
    }

    insertText(text: string) {
        this.insertTextAt(text, this.cursorRow, this.cursorColumn);
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
        if (isDisplayCharCommand(command)) {
            return this.insertText(command.text);
        };
        if (isDisplayTextCommand(command)) {
            return this.insertTextAt(command.text, command.row, command.column);
        };
        if (isDisplayClearRowCommand(command)) {
            return this.clearRow(command.row);
        };
        if (isDisplayPrintMulColumnCommand(command)) {
            return;
        };
        if (isDisplaySetCursorCommand(command)) {
            return this.setCursor(command.row, command.column);
        };
        if (isDisplayClearCommand(command)) {
            return this.clearLines();
        };
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