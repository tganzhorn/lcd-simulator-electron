import { FunctionComponent, useState } from "react";
import { Button, ButtonGroup, Table } from "react-bootstrap";
import { DebugNumberCommand, DebugNumberModes, DebugTextCommand, isDebugNumberCommand, isDebugTextCommand } from "../classes/CommandParser";
import { printTime, fillZeroes } from '../utils';

export const DebugCommandView: FunctionComponent<{ commands: (DebugTextCommand | DebugNumberCommand)[], clear: () => void, clearAll: () => void }> = ({ commands, clear, clearAll }) => {
    const  [reverse, setReverse] = useState<boolean>(false);
    const commandsCopy = commands.slice();

    if (reverse) commandsCopy.reverse();
    
    return (
        <div style={{flex: "1 1 auto", backgroundColor: "#343a40"}}>
            <div style={{height: 200, overflowY: "auto"}}>
                <Table striped bordered hover size="sm" variant="dark">
                    <thead>
                        <tr>
                            <th>Time <span style={{cursor: "pointer"}} onClick={() => setReverse(!reverse)}>{reverse ? "🔽" : "🔼"}</span></th>
                            <th>Message</th>
                            <th>Number</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            commands.length === 0 ? (
                                <tr>
                                    <td colSpan={3}>We did not receive any debug messages yet. 😢</td>
                                </tr>
                            ) : null
                        }
                        {
                            commandsCopy.map((command, index) => {
                                if (isDebugTextCommand(command)) {
                                    return <DebugText key={index + command.timestamp.getTime()} command={command} />;
                                }
                                if (isDebugNumberCommand(command)) {
                                    return <DebugNumber key={index + command.timestamp.getTime()} command={command} />;
                                }
                                return null;
                            })
                        }
                    </tbody>
                </Table>
            </div>
            <div style={{padding: 8, backgroundColor: "rgba(255,255,255,.05)"}}>
                <ButtonGroup>
                    <Button onClick={clear}>Clear Log</Button>
                    <Button onClick={clearAll}>Clear All</Button>
                </ButtonGroup>
            </div>
            
        </div>
    )
}

const DebugText: FunctionComponent<{ command: DebugTextCommand }> = ({ command }) => {
    const { timestamp, mode, text } = command;

    let color = "";
    let icon = "";
    if (mode === "error") {
        icon = "❌ ";
        color = "orangered";
    }
    if (mode === "ok") {
        icon = "✔ ";
        color = "lightgreen";
    }

    return (
        <tr>
            <td>{printTime(timestamp)}</td>
            <td style={{ color: color }} colSpan={2}>{icon + text}</td>
        </tr>
    )
}

const DebugNumber: FunctionComponent<{ command: DebugNumberCommand }> = ({ command }) => {
    const { timestamp, number, text, mode } = command;

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

    return (
        <tr>
            <td>{printTime(timestamp)}</td>
            <td>{text}</td>
            <td style={{fontFamily: "'Roboto Mono', monospace", color: "lightblue"}}>{printNumber(number, mode)}</td>
        </tr>
    )
}