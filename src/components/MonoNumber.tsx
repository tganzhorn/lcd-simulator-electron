import { forwardRef, useCallback, useImperativeHandle, useRef } from "react";
import { Text } from "@fluentui/react";
import { fillZeroes } from "../utils";

export interface MonoNumberRef { setNumber: (number: number) => void };

const clamp = (number: number, min: number, max: number) => {
    return Math.min(Math.max(number, min), max);
}

export const MonoNumber = forwardRef<MonoNumberRef, { min: number, max: number, digits: number, defaultValue: number }>(({ min, max, defaultValue, digits }, ref) => {
    const numberRef = useRef<HTMLSpanElement>(null);

    useImperativeHandle(ref, () => ({
        setNumber: (number: number) => {
            if (numberRef.current) {
                setNumber(number);
            }
        }
    }));


    const setNumber = useCallback((number: number) => {
        const text = fillZeroes(clamp(number, 0, 10 ** digits).toString(), digits);
        if (numberRef.current) {
            if (number <= max && number >= min) {
                numberRef.current.style.color = "green";
                numberRef.current.innerHTML = text;
            } else {
                numberRef.current.style.color = "red";
                numberRef.current.innerHTML = text;
            }
        }

        return text;
    }, [max, min, digits]);

    return (
        <Text>
            <span style={{
                fontFamily: "Roboto Mono",
                color: "green"
            }}
                ref={numberRef}
            >
                {
                    setNumber(defaultValue)
                }
            </span>
        </Text>
    );
});