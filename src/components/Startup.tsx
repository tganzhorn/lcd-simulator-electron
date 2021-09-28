import { FC, useEffect, useState } from "react";

export const Startup: FC<{}> = () => {
    const [open, setOpen] = useState(true);
    const [transition, setTransition] = useState(true);
    useEffect(() => {
        if (process.env.NODE_ENV === "development") {
            setOpen(false);

            return () => {};
        }
        
        const handle = window.setTimeout(() => {
            setTransition(false);
        }, 2000);

        const handle2 = window.setTimeout(() => {
            setOpen(false);
        }, 3000);

        return () => {
            window.clearTimeout(handle);
            window.clearTimeout(handle2);
        }
    }, []);

    if (!open) return null;

    return (
        <div style={{
            width: "100vw",
            height: "100vh",
            zIndex: 9999,
            position: "absolute",
            transition: "all 0.75s ease",
            pointerEvents: transition ? "all" : "none"
        }}>
            <svg width={484} height={611} style={{ opacity: transition ? 1 : 0, transition: "all 0.75s ease" }}>
                <circle cx={484 / 2} cy={611 / 2} r={900} fill="white">
                    <animate
                        attributeName="fill"
                        begin=".7s"
                        from="transparent"
                        dur="0s"
                        to="transparent"
                        fill="freeze"
                    />
                </circle>
                <circle cx={484 / 2} cy={611 / 2} r={0} fill="rgb(16, 110, 190)">
                    <animate
                        attributeName="r"
                        begin="0.3s"
                        dur="0.7s"
                        keyTimes="0; 0.15; 0.3; 0.45; 0.6; 0.75; 0.9; 1"
                        keySplines=".42 0 1 1;0 0 .59 1;.42 0 1 1;0 0 .59 1;.42 0 1 1;0 0 .59 1;.42 0 1 1;0 0 .59 1;"
                        from="0"
                        to="900"
                        fill="freeze"
                    />
                </circle>
                <text x={484 / 2} y={611 / 2} textAnchor="middle" fontFamily="Roboto Mono" fill="white" fontSize="40" offset={100}>
                    LCD-Simulator
                </text>
            </svg>
        </div>
    )
};