import { DetailsList, IColumn, SelectionMode, Text } from "@fluentui/react";
import { FunctionComponent, useState } from "react";
import { DebugCommand } from "../classes/CommandParser";
import { Card } from './Card';

export const DebugCommandView: FunctionComponent<{ commands: DebugCommand[]}> = ({ commands }) => {
    const [reverse, setReverse] = useState<boolean>(true);
    const commandsCopy = reverse ? [...commands].reverse() : [...commands];

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
            onRender: (command: DebugCommand) => command.printTime(),
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
            onRender: (command: DebugCommand) => command.printText()
        },
        {
            key: "number",
            name: "Number",
            data: "number",
            minWidth: 50,
            fieldName: "number",
            isMultiline: true,
            onRender: (command: DebugCommand) => command.printNumber()
        }
    ];

    return (
        <Card>
            <div style={{height: 254, overflowY: "scroll"}}>
                <DetailsList
                    columns={columns}
                    items={commandsCopy}
                    selectionMode={SelectionMode.single}
                    compact={true}
                    getKey={(item: any) => item.id}
                    setKey="id"
                    isPlaceholderData
                />
                {
                    commandsCopy.length === 0 ? (
                        <Text style={{textAlign: "center"}}><h4>We haven't received anything yet! 😢</h4></Text>
                    ) : null
                }
            </div>
        </Card>
    )
}