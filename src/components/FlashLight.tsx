import { DetailedHTMLProps, forwardRef, HTMLAttributes } from "react";

export const FlashLight = forwardRef<HTMLDivElement, DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>>((props, ref) => {
    return (
        <div
            ref={ref}
            style={{
                transition: "all ease 0.1s",
                marginLeft: 4,
                backgroundColor: "#aaa",
                borderRadius: "50%",
                width: 16,
                height: 16,
                backgroundImage: "radial-gradient(circle, rgba(0,0,0,0) 0%, rgba(0,0,0,0.3) 100%)",
            }}
            {...props}
        />
    )
});