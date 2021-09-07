import { CommandBar, DetailsList, IColumn, ICommandBarItemProps, SelectionMode } from "@fluentui/react";
import { useEffect } from "react";
import { FunctionComponent, useState } from "react";
import { LCDCommand } from "../classes/CommandParser";
import { printTime } from "../utils";
import { Card } from "./Card";

export const DisplayCommandView: FunctionComponent<{ commands: LCDCommand[], clear: () => void, clearAll: () => void }> = ({ commands, clear, clearAll }) => {
    const [reverse, setReverse] = useState<boolean>(true);
    const [commandsCopy, setCommandsCopy] = useState<LCDCommand[]>([]);

    useEffect(() => {
        const handle = window.setInterval(() => {
            setCommandsCopy(() => reverse ? [...commands].reverse() : [...commands]);
        }, 500);

        return () => {
            window.clearInterval(handle);
        }
    }, [commands, reverse]);

    useEffect(() => {
        setCommandsCopy(() => reverse ? commands.slice().reverse() : commands.slice());
    }, [reverse, commands]);

    const commandBardItems: ICommandBarItemProps[] = [
        {
            key: "clearDisplay",
            text: "Clear display log",
            iconProps: {
                iconName: "Clear"
            },
            onClick: () => {
                clear();
                commands.length = 0;
                setCommandsCopy([...commands])
            }
        },
        {
            key: "clearAll",
            text: "Clear all",
            iconProps: {
                iconName: "Clear"
            },
            onClick: () => {
                clearAll();
                commands.length = 0;
                setCommandsCopy([...commands])
            }
        }
    ];

    const columns: IColumn[] = [
        {
            key: "time",
            name: "Time",
            minWidth: 70,
            maxWidth: 70,
            fieldName: "timestamp",
            data: "timestamp",
            isSorted: true,
            isSortedDescending: !reverse,
            onRender: (command: LCDCommand) => printTime(command.timestamp),
            onColumnClick: () => setReverse(state => !state)
        },
        {
            key: "type",
            name: "Type",
            minWidth: 50,
            maxWidth: 150,
            data: "string",
            fieldName: "type",
            isMultiline: true
        },
        {
            key: "text",
            name: "Text",
            minWidth: 50,
            maxWidth: 150,
            data: "string",
            fieldName: "text",
            isMultiline: true
        },
    ]

    return (
        <Card>
            <div style={{height: 210, overflowY: "scroll"}}>
                <DetailsList
                    columns={columns}
                    items={commandsCopy}
                    selectionMode={SelectionMode.none}
                    compact={true}
                />
            </div>
            <CommandBar items={commandBardItems} />
        </Card>
    )
}
