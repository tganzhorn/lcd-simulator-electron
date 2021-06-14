import { CommandBar, ICommandBarItemProps, DetailsList, IColumn, SelectionMode } from "@fluentui/react";
import { FunctionComponent, useState } from "react";
import { DebugNumberCommand, DebugNumberModes, DebugTextCommand, isDebugNumberCommand, isDebugTextCommand } from "../classes/CommandParser";
import { printTime, fillZeroes } from '../utils';
import { Card } from './Card';

const printNumber = (number: number, mode: DebugNumberModes) => {
    if (mode === "u8hex") {
        return `0x${fillZeroes(number.toString(16), 2)}`;
    }
    if (mode === "u16hex") {
        return `0x${fillZeroes(number.toString(16), 4)}`;
    }
    if (mode === "u32hex") {
        return `0x${fillZeroes(number.toString(16), 8)}`;
    }
    if (mode === "u8bin") {
        return `0b${fillZeroes(number.toString(2), 8)}`;
    }
    if (mode === "u16bin") {
        return `0b${fillZeroes(number.toString(2), 16)}`;
    }
    return number.toString();
}

export const DebugCommandView: FunctionComponent<{ commands: (DebugTextCommand | DebugNumberCommand)[], clear: () => void, clearAll: () => void }> = ({ commands, clear, clearAll }) => {
    const [reverse, setReverse] = useState<boolean>(false);
    const commandsCopy = reverse ? commands.slice().reverse() : commands;

    const commandBardItems: ICommandBarItemProps[] = [
        {
            key: "clearDebug",
            text: "Clear debug",
            iconProps: {
                iconName: "Clear"
            },
            onClick: clear
        },
        {
            key: "clearAll",
            text: "Clear all",
            iconProps: {
                iconName: "Clear"
            },
            onClick: clearAll
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
            onRender: (command: DebugTextCommand | DebugNumberCommand) => printTime(command.timestamp),
            onColumnClick: () => setReverse(state => !state)
        },
        {
            key: "message",
            name: "Message",
            minWidth: 50,
            maxWidth: 150,
            data: "string",
            fieldName: "text",
            isMultiline: true,
            onRender: (command: DebugTextCommand | DebugNumberCommand) => {
                if (isDebugTextCommand(command)) {
                    let color = "";
                    let icon = "";
                    if (command.mode === "error") {
                        icon = "❌ ";
                        color = "darkred";
                    }
                    if (command.mode === "ok") {
                        icon = "✔ ";
                        color = "darkgreen";
                    }
                    return <span style={{color}}>{icon + command.text}</span>
                }
            }
        },
        {
            key: "number",
            name: "Number",
            data: "number",
            minWidth: 50,
            fieldName: "number",
            onRender: (command: DebugTextCommand | DebugNumberCommand) => {
                if (isDebugNumberCommand(command)) {
                    return printNumber(command.number, command.mode);
                }
            }
        }
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