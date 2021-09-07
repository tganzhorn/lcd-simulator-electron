import { ITooltipHostProps, TooltipHost } from "@fluentui/react";
import { useId } from "@fluentui/react-hooks";
import { FC } from "react";

export const Tooltip: FC<{content?: ITooltipHostProps["content"]}> = ({ children, content }) => {
    const tooltipId = useId();

    return (
        <TooltipHost
            content={content}
            id={tooltipId}
            calloutProps={{
                gapSpace: 0
            }}
            styles={{}}
        >
            {children}
        </TooltipHost>
    )
}