import { DefaultEffects } from "@fluentui/react"
import { CSSProperties, FunctionComponent } from "react"

export const Card: FunctionComponent<{style?: CSSProperties}> = ({children, style = {}}) => {
    return <div style={{backgroundColor: "white", boxShadow: DefaultEffects.elevation4, ...style}}>{children}</div>
}