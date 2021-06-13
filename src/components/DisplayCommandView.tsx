import { FunctionComponent, useEffect, useState } from "react";
import { Button, ButtonGroup, Table } from "react-bootstrap";
import { LCDCommand } from "../classes/CommandParser";
import { printTime } from "../utils";

export const DisplayCommandView: FunctionComponent<{ commands: LCDCommand[], clear: () => void, clearAll: () => void }> = ({ commands, clear, clearAll }) => {
    const  [reverse, setReverse] = useState<boolean>(false);
    const [commandsCopy, setCommandsCopy] = useState<LCDCommand[]>([]);
    
    return (
        <div style={{ backgroundColor: "#343a40" }}>
            <div style={{ height: 200, overflowY: "auto", resize: "vertical" }}>
                <Table striped bordered hover size="sm" variant="dark">
                    <thead>
                        <tr style={{ position: "sticky" }}>
                        <th>Time <span style={{cursor: "pointer"}} onClick={() => setReverse(!reverse)}>{reverse ? "🔽" : "🔼"}</span></th>
                            <th>Type</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            commandsCopy.length === 0 ? (
                                <tr>
                                    <td colSpan={2}>Press the "Query Displaycommands" button to show display commands.</td>
                                </tr>
                            ) : null
                        }
                        {
                            commandsCopy.map((command, index) => (
                                <tr key={index + command.timestamp.toTimeString()}>
                                    <td>{printTime(command.timestamp)}</td>
                                    <td>{command.type}</td>
                                </tr>
                            ))
                        }
                    </tbody>
                </Table>
            </div>
            <div style={{ padding: 8, backgroundColor: "rgba(255,255,255,.05)" }}>
                <ButtonGroup>
                    <Button onClick={() => {clear(); setCommandsCopy([]);}}>Clear Log</Button>
                    <Button onClick={() => {clearAll(); setCommandsCopy(commands);}}>Clear All</Button>
                    <Button onClick={() => setCommandsCopy(commands)}>Query</Button>
                </ButtonGroup>
            </div>

        </div>
    )
}
