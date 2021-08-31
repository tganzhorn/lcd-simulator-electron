import { IRawStyle, IStyle, mergeStyles } from "@fluentui/react";
import { DetailedHTMLProps, FC, HTMLAttributes } from "react";

export const Container: FC<DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> & { animationStyle: IRawStyle | null }> = ({animationStyle = null, style = {}, children, ...props}) => {
    return (
        <div className={mergeStyles({
            display: "flex",
            flexDirection: "column",
            height: "100vh",
            padding: 16,
            boxSizing: "border-box",
            overflowY: "auto",
            overflowX: "hidden",
            maxWidth: 800,
            margin: "0 auto",
        }, (style as IStyle), animationStyle)}>
            {children}
        </div>
    )
};