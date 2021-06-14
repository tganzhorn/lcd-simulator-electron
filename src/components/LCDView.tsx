import { Card } from "./Card";
import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import { CommandBar, Text } from '@fluentui/react';
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
        <Card style={{ display: "flex", flexDirection: "column"}}>
            <div style={{ position: "relative", backgroundColor: "#5DFF00" }} className="lcd">
                <canvas
                    ref={canvasRef}
                    width={128}
                    height={64}
                    style={{
                        width: "100%",
                        imageRendering: "pixelated",
                        aspectRatio: "2 / 1",
                        opacity: 0.5,
                        resize: "vertical",
                        margin: 0
                    }}
                >
                </canvas>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingLeft: 8 }}>
                <div style={{ display: "flex", alignItems: "center" }}>
                    <Text>RX:</Text>
                    <div ref={lightRef} style={{ transition: "all 0.1s ease", marginLeft: 8, backgroundColor: "#aaa", borderRadius: "50%", width: 16, height: 16 }}></div>
                </div>
                <div>
                    <Text style={{fontSize: 14}}>CMD: <span ref={cmdRef} style={{ fontFamily: "Roboto Mono", color: "lightblue" }}>0</span></Text>
                </div>
                <CommandBar items={[
                    {
                        key: "reset",
                        text: "Reset",
                        iconProps: {
                            iconName: "RevToggleKey"
                        },
                        onClick: () => {
                            if (lcdWebGLRenderer.current) {
                                lcdWebGLRenderer.current.clearLines(); lcdWebGLRenderer.current.commandsReceived = 0
                            }
                        }
                    }
                ]} />
            </div>
        </Card>
    )
});