import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import { Button } from "react-bootstrap";
import { WebGLLCDRenderer, font5x7, LCDCharBuffer } from "../classes/WebGLLCDRenderer";

export const LCDView = forwardRef<WebGLLCDRenderer | undefined, {}>((_, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const lcdWebGLRenderer = useRef<WebGLLCDRenderer>();
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
            renderer.destroy();
            window.clearTimeout(lightRaf.current);
        }
    }, []);

    useImperativeHandle(ref, () => lcdWebGLRenderer.current);

    return (
        <div style={{
            backgroundColor: "#343a40",
            padding: 8,
            color: "white",
            display: "grid",
            marginTop: 8
        }}>
            <div style={{ position: "relative", display: "inline-block", backgroundColor: "#5DFF00" }} className="lcd">
                <canvas
                    ref={canvasRef}
                    width={128}
                    height={64}
                    style={{
                        width: "100%",
                        border: "8px solid transparent",
                        imageRendering: "pixelated",
                        aspectRatio: "2 / 1",
                        opacity: 0.5
                    }}
                >
                </canvas>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: 8 }}>
                <div style={{ display: "flex", alignItems: "center" }}>
                    <span>RX:</span>
                    <div ref={lightRef} style={{ transition: "all 0.1s ease", marginLeft: 8, backgroundColor: "#aaa", borderRadius: "50%", width: 24, height: 24 }}></div>
                </div>
                <div style={{ display: "flex", alignItems: "center" }}>
                    <span>CMD: <span ref={cmdRef} style={{ fontFamily: "Roboto Mono", color: "lightblue" }}>0</span></span>
                </div>
                <div>
                    <Button onClick={() => {
                        if (lcdWebGLRenderer.current) {
                            lcdWebGLRenderer.current.clearLines(); lcdWebGLRenderer.current.commandsReceived = 0
                        }
                    }}>Reset</Button>
                </div>
            </div>
        </div>
    )
});