import { Card } from "./Card";
import { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef } from "react";
import { Icon, IconButton, Toggle } from '@fluentui/react';
import { WebGLLCDRenderer, font5x7, LCDCharBuffer } from "../classes/WebGLLCDRenderer";
import { Tooltip } from "./Tooltip";
import toast from 'react-hot-toast';
import { DisplayCommand, isDisplayClearCommand } from "../classes/CommandParser";
import { Cursor } from "./Cursor";
import { FlashLight } from "./FlashLight";
import { MonoNumber, MonoNumberRef } from "./MonoNumber";

export const LCDView = forwardRef<WebGLLCDRenderer | undefined, {reset: () => void}>(({reset}, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const lcdWebGLRenderer = useRef<WebGLLCDRenderer>();
    const lightRef = useRef<HTMLDivElement>(null);
    const lightRaf = useRef<number>(-1);
    const rowRef = useRef<MonoNumberRef>(null);
    const columnRef = useRef<MonoNumberRef>(null);
    const cmdRef = useRef<MonoNumberRef>(null);
    const rogcd = useRef<boolean>(false);
    const cursorRef = useRef<HTMLDivElement>(null);

    const handleReset = useCallback(() => {
        if (lcdWebGLRenderer.current) {
            lcdWebGLRenderer.current.reset();
            reset();
        };
    }, [reset]);

    const handleResetOnLCDClear = useCallback((_: any, checked: boolean = false) => {
        rogcd.current = checked;
    }, []);

    const handleCursorToggle = useCallback((_: any, checked: boolean = false) => {
        if(cursorRef.current) {
            cursorRef.current.style.visibility = checked ? "visible" : "hidden";
        }
    }, []);

    useEffect(() => {
        if (!canvasRef.current) return;

        const gl = canvasRef.current.getContext("webgl2");

        if (!gl) {
            toast.error("Congratulations! You are one of the lucky pals that can't use WebGL2, please talk to Mr. Reber!");
            return;
        }

        const charBuffer = new LCDCharBuffer(font5x7, 7, 5, 32);

        const renderer = new WebGLLCDRenderer(gl, 128, 64, charBuffer);
        renderer.startTicker();

        renderer.onReceiveCommand = (command: DisplayCommand) => {
            if (isDisplayClearCommand(command) && rogcd.current) {
                return handleReset();
            }

            if (!lightRef.current) return;

            window.clearTimeout(lightRaf.current);

            lightRef.current.style.backgroundColor = "#5DFF00";
            lightRef.current.style.boxShadow = "0 0 20px #5DFF00";

            lightRaf.current = window.setTimeout(() => {
                if (!lightRef.current) return;
                lightRef.current.style.backgroundColor = "#aaa";
                lightRef.current.style.boxShadow = "0 0 0 #aaa";
            }, 100);
        }

        renderer.onDraw = () => {
            if (rowRef.current && columnRef.current) {
                rowRef.current.setNumber(renderer.cursorRow);
                columnRef.current.setNumber(renderer.cursorColumn);
            };

            if (cmdRef.current) {
                cmdRef.current.setNumber(renderer.commandsReceived);
            };

            if (cursorRef.current) {
                cursorRef.current.style.left = 7 + renderer.cursorColumn * 21.1875 + 'px';
                cursorRef.current.style.top = 3.5 + renderer.cursorRow * 28.25 + 'px';
            }
        }

        lcdWebGLRenderer.current = renderer;

        return () => {
            renderer.destroy();
            window.clearTimeout(lightRaf.current);
        }
    }, [handleReset]);

    useImperativeHandle(ref, () => lcdWebGLRenderer.current);

    return useMemo(() => (
        <Card style={{ display: "flex", flexDirection: "column" }}>
            <Cursor ref={cursorRef} />
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
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", paddingLeft: 8 }}>
                <Tooltip content="Flashes green on receiving commands.">
                        <FlashLight ref={lightRef} />
                </Tooltip>
                <Tooltip content="Displays current row and column.">
                    <div style={{ display: "flex", alignItems: "center", columnGap: 4 }}>
                        <Icon iconName="LineThickness" />
                        <MonoNumber min={0} max={8} digits={2} defaultValue={0} ref={rowRef} />
                        <Icon iconName="TripleColumn" />
                        <MonoNumber min={0} max={20} digits={2} defaultValue={0} ref={columnRef} />
                    </div>
                </Tooltip>
                <Tooltip content="Shows the amount of received commands.">
                    <div style={{display: "flex", alignItems: "center", columnGap: 4}}>
                        <Icon iconName="Communications" />
                        <MonoNumber ref={cmdRef} min={0} max={999} digits={3} defaultValue={0} />
                    </div>
                </Tooltip>
                <Tooltip content="Reset LCD Simulator on GLCD_ClearDisplay.">
                    <Toggle onChange={handleResetOnLCDClear} onText="RoGCD" offText="RoGCD" />
                </Tooltip>
                <Tooltip content="Toggles cursor visibility.">
                    <Toggle onChange={handleCursorToggle} defaultChecked={true} onText="Cursor" offText="Cursor" />
                </Tooltip>
                <Tooltip content="Reset LCD Simulator with all its data.">
                    <IconButton iconProps={{iconName: "Refresh"}} style={{margin: 4}} onClick={handleReset} />
                </Tooltip>
            </div>
        </Card>
    ), [handleCursorToggle, handleReset, handleResetOnLCDClear]);
});