export class LCDCharBuffer {
    chars: Record<string, Uint8ClampedArray> = {};
    emptyChar: Uint8ClampedArray;
    font: Uint8ClampedArray;
    charHeight: number;
    charWidth: number;

    constructor(font: Uint8ClampedArray, charHeight: number, charWidth: number, lowestCharCode?: number) {
        this.font = font;
        this.charHeight = charHeight;
        this.charWidth = charWidth;
        this.emptyChar = new Uint8ClampedArray(charHeight * charWidth);

        for (let i = 0; i < font.length / charWidth; i++) {
            this.chars[String.fromCharCode(i + (lowestCharCode ?? 0))] = this.generateChar(i);
        }
    }

    getChar(string: string) {
        if (!this.chars[string[0]]) return this.emptyChar;
        return this.chars[string[0]];
    }

    generateChar = (charcode: number | string) => {
        if (typeof charcode === "string") charcode = charcode.charCodeAt(0);
        let index = 0;
        const tmp = new Uint8ClampedArray(this.charWidth * this.charHeight);
        for (let j = 0; j < 8; j++) {
            for (let i = charcode * this.charWidth; i < charcode * this.charWidth + this.charWidth; i++) {
                const val = (this.font[i] >> j) & 0x01;
                tmp[index++] = val * 255;
            }
        }
        return tmp;
    }
}