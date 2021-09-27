import { forwardRef, useEffect, useState} from "react";

export const Cursor = forwardRef<HTMLDivElement, {}>((_, ref) => {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const handle = window.setInterval(() => {
            setVisible(state => !state)
        }, 500);

        return () => window.clearInterval(handle);
    }, []);

    return (
        <div ref={ref} style={{
            fontFamily: "Roboto Mono", 
            position: "absolute", 
            zIndex: 1,
            backgroundColor: "black",
            width: 7,
            height: 28.25,
            left: 7,
            top: 3.5,
            opacity: visible ? 1 : 0,
            fontSmooth: "never",
            transition: "0.1s all ease"
        }}>
        </div>
    )
});