import React, { useEffect, useState, useRef } from 'react';
import {
  CommandParser,
  LCDCommand,
  isDebugNumberCommand,
  isDisplayCharCommand,
  isDebugTextCommand,
  DebugNumberCommand,
  DebugTextCommand,
  isDisplayTextCommand,
  isDisplaySetCursorCommand,
  isDisplayClearCommand
} from './classes/CommandParser';
import { DebugCommandView } from './components/DebugCommandView';
import { LCDView, LCDBuffer } from './components/LCDView';
import { Navbar, Container, Jumbotron, Tabs, Tab, Button } from 'react-bootstrap';
import { DisplayCommandView } from './components/DisplayCommandView';
import "./App.css";
import "./Fonts.css";
import "./bootstrap.min.css";
import { useToasts } from 'react-toast-notifications';

function App() {
  const [serial, setSerial] = useState<Serial>();
  const [serialPort, setSerialPort] = useState<SerialPort>();
  const [debugCommands, setDebugCommands] = useState<(DebugNumberCommand | DebugTextCommand)[]>([]);
  const [commands, setCommands] = useState<LCDCommand[]>([]);
  const [connected, setConnected] = useState(false);
  const lcdRef = useRef<[LCDBuffer, React.Dispatch<React.SetStateAction<LCDBuffer>>]>();

  const { addToast } = useToasts();

  const readerRef = useRef<ReadableStreamDefaultReader<any>>();
  const writerRef = useRef<WritableStreamDefaultWriter<any>>();

  useEffect(() => {
    if (navigator.serial) {
      setSerial(navigator.serial);
    }
  }, []);

  useEffect(() => {
    if (!serialPort) return;

    openSerialPort(serialPort);

    return () => { }
  }, [serialPort]);

  const handleCOMPortSelection = async () => {
    try {
      if (!serial) return;
      const serialPort = await serial.requestPort();
      setConnected(true);
      setSerialPort(serialPort);
    } catch (error) {
      setConnected(false);
      addToast("No microcontroller found!", { appearance: 'error'});
    }
  }

  const openSerialPort = async (serialPort: SerialPort) => {
    try {
      await serialPort.open({ baudRate: 460800, parity: "none", stopBits: 1, dataBits: 8, flowControl: "none" });
      while (serialPort.readable && serialPort.writable) {
        const commandParser = new CommandParser();
        const reader = await serialPort.readable.getReader();
        const writer = await serialPort.writable.getWriter();

        readerRef.current = reader;
        writerRef.current = writer;

        commandParser.onNewCommand = (command: LCDCommand) => {
          if (!lcdRef.current) return;
          const [buffer, setBuffer] = lcdRef.current;
          if (isDebugNumberCommand(command) || isDebugTextCommand(command)) {
            setDebugCommands(state => state.concat([command]));
          } else {
            setCommands(state => state.concat([command]));
          }
          if (isDisplayCharCommand(command)) {
            setBuffer(buffer.insertText(command.text));
          }
          if (isDisplayTextCommand(command)) {
            setBuffer(buffer.insertTextAt(command.text, command.row, command.column));
          }
          if (isDisplaySetCursorCommand(command)) {
            setBuffer(buffer.setCursor(command.row, command.column));
          }
          if (isDisplayClearCommand(command)) {
            setBuffer(buffer.clearLines());
          }

        };

        const ack = new Uint8Array([7]);

        try {
          while (true) {
            const { value, done } = await reader.read();
            if (done) {
              reader.releaseLock();
              writer.releaseLock();
              break;
            }
            if (value) {
              commandParser.parseValue(value);
              writer.write(ack);
            }
          }
        } catch (error) {
          reader.releaseLock();
          writer.releaseLock();
          serialPort.close();
          setSerialPort(undefined);
          setConnected(false);
          addToast("There was an error receiving data from the microcontroller.", { appearance: 'error'});
        }
      }
    } catch (error) {
      serialPort.close();
      setSerialPort(undefined);
      setConnected(false);
      addToast("Could not establish a connection with the microcontroller.", { appearance: 'error'});
    }
  }

  const clearAll = () => {
    if (!lcdRef.current) return;
    const [buffer, setBuffer] = lcdRef.current;
    setCommands([]);
    setDebugCommands([]);
    setBuffer(new LCDBuffer(buffer.rows, buffer.columns));
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      <Navbar bg="dark" variant="dark" expand="lg">
        <Container>
          <Navbar.Brand>
            LCD-Simulator
          </Navbar.Brand>
        </Container>
      </Navbar>
      <Jumbotron fluid style={{ flex: "1 1 auto", paddingTop: 16, marginBottom: 0, paddingBottom: 0 }}>
        <Container>
          {
            connected ? (
              <>
                <Tabs defaultActiveKey="lcd" id="uncontrolled-tab-example" variant="tabs" style={{ marginTop: 16 }}>
                  <Tab eventKey="lcd" title="LCD">
                    {
                      // TODO fix this ignore line!
                      //@ts-ignore
                      <LCDView ref={lcdRef} />
                    }
                  </Tab>
                </Tabs>
                <Tabs defaultActiveKey="debug" id="uncontrolled-tab-example" variant="tabs" style={{ marginTop: 16 }}>
                  <Tab eventKey="debug" title="Debug Infos">
                    <DebugCommandView clear={() => setDebugCommands([])} clearAll={clearAll} commands={debugCommands} />
                  </Tab>
                  <Tab eventKey="display" title="Display Commands">
                    <DisplayCommandView clear={() => setCommands([])} clearAll={clearAll} commands={commands} />
                  </Tab>
                </Tabs>
              </>
            ) : (
              <>
                <h1>No device connected!</h1>
                <p>
                  Please connect to a the microcontroller by pressing the "Open COM Port" button.
                </p>
                <Button variant="primary" onClick={handleCOMPortSelection}>Open COM Port</Button>
              </>
            )
          }
        </Container>
      </Jumbotron>
    </div>
  );
}

export default App;
