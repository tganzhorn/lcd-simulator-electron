import { DetailedHTMLProps, FunctionComponent, HTMLAttributes } from "react";

export const Card: FunctionComponent<DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>> = ({ children, style = {}, ...props }) => {
    return <div
        style={{
            backgroundColor: "white",
            boxShadow: "0 1.6px 3.6px 0 rgb(0 0 0 / 13%), 0 0.3px 0.9px 0 rgb(0 0 0 / 11%)",
            borderRadius: 2,
            overflow: "hidden",
            ...style
        }}
        {...props}>
        {children}
    </div>
}