import { CommandBar, DetailsList, IColumn, ICommandBarItemProps, ScrollablePane, SelectionMode } from "@fluentui/react";
import { useEffect } from "react";
import { FunctionComponent, useState } from "react";
import { LCDCommand } from "../classes/CommandParser";
import { printTime } from "../utils";
import { Card } from "./Card";

export const DisplayCommandView: FunctionComponent<{ commands: LCDCommand[], clear: () => void, clearAll: () => void }> = ({ commands, clear, clearAll }) => {
    const [reverse, setReverse] = useState<boolean>(false);
    const [commandsCopy, setCommandsCopy] = useState<LCDCommand[]>([]);

    useEffect(() => {
        setCommandsCopy(commands.slice());
    }, []);

    const commandBardItems: ICommandBarItemProps[] = [
        {
            key: "clearDisplay",
            text: "Clear log",
            iconProps: {
                iconName: "Clear"
            },
            onClick: () => {
                clear();
                commands.length = 0;
                setCommandsCopy(reverse ? commands.slice().reverse() : commands.slice())
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
                setCommandsCopy(reverse ? commands.slice().reverse() : commands.slice())
            }
        },
        {
            key: "sync",
            text: "Sync",
            iconProps: {
                iconName: "Sync"
            },
            onClick: () => setCommandsCopy(commands.slice())
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
            isSortedDescending: true,
            onRender: (command: LCDCommand) => printTime(command.timestamp),
            onColumnClick: () => setReverse(state => !state)
        },
        {
            key: "type",
            name: "Type",
            minWidth: 50,
            maxWidth: 150,
            data: "string",
            fieldName: "text",
            isMultiline: true
        },
    ]

    return (
        <Card>
            <div style={{height: 200, overflowY: "scroll", resize: "vertical"}}>
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
