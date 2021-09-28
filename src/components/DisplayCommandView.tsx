import { DetailsList, DetailsListLayoutMode, IColumn, SelectionMode, Selection, PrimaryButton, Text } from "@fluentui/react";
import { Fragment, useCallback, useEffect } from "react";
import { FunctionComponent, useState } from "react";
import { DisplayCommand } from "../classes/CommandParser";
import { Card } from "./Card";
import { Tooltip } from './Tooltip';

export const DisplayCommandView: FunctionComponent<{ commands: DisplayCommand[], showHistory: (command: DisplayCommand | undefined) => void }> = ({ commands, showHistory }) => {
    const [reverse, setReverse] = useState<boolean>(true);
    const [commandsCopy, setCommandsCopy] = useState<DisplayCommand[]>([]);
    const [freeze, setFreeze] = useState<boolean>(false);

    useEffect(() => {
        if (freeze) return;
        setCommandsCopy(() => reverse ? [...commands].reverse() : [...commands]);
        const handle = window.setInterval(() => {
            setCommandsCopy(() => reverse ? [...commands].reverse() : [...commands]);
        }, 1000);

        return () => {
            window.clearInterval(handle);
        }
    }, [commands, reverse, freeze]);

    const toggleFreeze = useCallback(() => {
        setFreeze(pause => !pause);
    }, []);

    const handleReverse = useCallback(() => {
        setReverse(state => !state);
    }, []);

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
            onRender: (command: DisplayCommand) => command.printTime(),
            onColumnClick: handleReverse
        },
        {
            key: "type",
            name: "Type",
            minWidth: 50,
            maxWidth: 100,
            data: "string",
            fieldName: "initialCommand",
            isMultiline: true,
        },
        {
            key: "info",
            name: "Info",
            minWidth: 50,
            data: "string",
            onRender: (command: DisplayCommand) => command.print().split('\n').map((s, i) => <Fragment key={i}>{s}<br /></Fragment>),
            isMultiline: true
        },
    ]

    const selection = new Selection({
        onSelectionChanged: () => {
            const selected = selection.getSelection()[0] as DisplayCommand | undefined;
            setFreeze(selected !== undefined);
            showHistory(selected);
        },
        getKey: (item: any) => (item as DisplayCommand).id
    });

    return (
        <Card>
            <div style={{ height: 214, overflowY: "scroll" }}>
                <DetailsList
                    columns={columns}
                    items={commandsCopy}
                    selectionMode={SelectionMode.single}
                    selection={selection}
                    layoutMode={DetailsListLayoutMode.justified}
                    compact={true}
                    setKey="id"
                    getKey={(item: any) => item.id}
                    getCellValueKey={(item: any) => item.id}
                />
                {
                    commandsCopy.length === 0 ? (
                        <Text style={{textAlign: "center"}}><h4>We haven't received anything yet! 😢</h4></Text>
                    ) : null
                }
            </div>
            <Tooltip content="Freezes and unfreezes the view. (No new data will appear)">
                <PrimaryButton
                    iconProps={{ iconName: freeze ? "Play" : "Pause" }}
                    text={freeze ? "Unfreeze" : "Freeze"}
                    onClick={toggleFreeze}
                    style={{ margin: 4 }}
                />
            </Tooltip>
        </Card>
    )
}
