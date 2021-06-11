import { forwardRef, ForwardRefExoticComponent, useEffect, useImperativeHandle, useRef, useState } from "react";
import { Button } from "react-bootstrap";
import { WebGLLCDRenderer, font5x7, LCDCharBuffer } from "../classes/WebGLLCDRenderer";

export const LCDView: ForwardRefExoticComponent<{}> = forwardRef((_, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const lcdWebGLRenderer = useRef<WebGLLCDRenderer>();
    const [size, setSize] = useState(3);
    const lightRef = useRef<HTMLDivElement>(null);
    const lightRaf = useRef<number>(-1);
    const cmdRef = useRef<HTMLSpanElement>(null);

    useEffect(() => {
        if (!canvasRef.current) return;

        const gl = canvasRef.current.getContext("webgl2");

        if (!gl) return;

        const charBuffer = new LCDCharBuffer(font5x7, 7, 5, 32);

        const renderer = new WebGLLCDRenderer(gl, 128, 64, charBuffer);
        renderer.startTicker();

        renderer.onReceiveCommand = () => {
            if (!lightRef.current) return;

            window.clearTimeout(lightRaf.current);

            lightRef.current.style.backgroundColor = "#5DFF00";
            lightRef.current.style.boxShadow = "0 0 20px #5DFF00";

            lightRaf.current = window.setTimeout(() => {
                if (!lightRef.current) return;
                lightRef.current.style.backgroundColor = "#aaa";
                lightRef.current.style.boxShadow = "0 0 0 #aaa";
            }, 300);
        }

        renderer.onDraw = () => {
            if (!cmdRef.current) return;

            cmdRef.current.innerHTML = renderer.commandsReceived.toString();
        }

        lcdWebGLRenderer.current = renderer;

        return () => {
            renderer.stopTicker();
            window.clearTimeout(lightRaf.current);
        }
    }, []);

    useImperativeHandle(ref, () => lcdWebGLRenderer.current);

    return (
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", backgroundColor: "#343a40", padding: 8, color: "white" }}>
            <div>
                <div style={{ display: "flex", alignItems: "center", marginBottom: 16 }}>
                    <span>RX:</span>
                    <div ref={lightRef} style={{ transition: "all 0.1s ease", marginLeft: 16, backgroundColor: "#aaa", borderRadius: "50%", width: 24, height: 24 }}></div>
                </div>
                <div style={{ display: "flex", alignItems: "center", marginBottom: 16 }}>
                    <span>CMD: <span ref={cmdRef} style={{ fontFamily: "Roboto Mono", color: "lightblue" }}>0</span></span>
                </div>
                <label htmlFor="size" style={{ paddingRight: 8 }}>LCD-Size:</label>
                <div>
                    <Button onClick={() => {
                        if (lcdWebGLRenderer.current) {
                            lcdWebGLRenderer.current.clearLines(); lcdWebGLRenderer.current.commandsReceived = 0
                        }
                    }}>Reset Display</Button>
                </div>
            </div>
            <div style={{ position: "relative", display: "inline-block", backgroundColor: "#5DFF00" }} className="lcd">
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
                        opacity: 0.5
                    }}
                >
                </canvas>
            </div>
        </div>
    )
});