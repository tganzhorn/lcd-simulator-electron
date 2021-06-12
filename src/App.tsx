import { useEffect, useState, useRef } from 'react';
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
import { Navbar, Container, Tabs, Tab, Button, ButtonGroup } from 'react-bootstrap';
import { DisplayCommandView } from './components/DisplayCommandView';
import "./App.css";
import "./Fonts.css";
import "./bootstrap.min.css";
import { useToasts } from 'react-toast-notifications';
import { LCDView } from './components/LCDView';
import { WebGLLCDRenderer } from './classes/WebGLLCDRenderer';
import fullscreen_icon from './icons/fullscreen.png';
import fullscreen_close_icon from './icons/close_fullscreen.png';
import minmize_icon from './icons/minimize.png';
import close_icon from './icons/close.png';

declare global {
  interface Window {
    api: {
      close: () => {},
      minimize: () => {},
      maximize: () => {},
      restore: () => {}
    }
  }
}

const api = window.api;

function App() {
  const [serial, setSerial] = useState<Serial>();
  const [serialPort, setSerialPort] = useState<SerialPort>();
  const [debugCommands, setDebugCommands] = useState<(DebugNumberCommand | DebugTextCommand)[]>([]);
  const commands = useRef<LCDCommand[]>([]);
  const [connected, setConnected] = useState(false);
  const lcdRef = useRef<WebGLLCDRenderer | undefined>();

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
      addToast("No microcontroller found!", { appearance: 'error' });
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
          const lcdManager = lcdRef.current;
          if (isDebugNumberCommand(command) || isDebugTextCommand(command)) {
            if (debugCommands.length < 200) setDebugCommands(state => state.concat([command]));
          } else {
            commands.current.push(command);
          }
          if (isDisplayCharCommand(command)) {
            lcdManager.insertText(command.text);
          }
          if (isDisplayTextCommand(command)) {
            lcdManager.insertTextAt(command.text, command.row, command.column);
          }
          if (isDisplaySetCursorCommand(command)) {
            lcdManager.setCursor(command.row, command.column);
          }
          if (isDisplayClearCommand(command)) {
            lcdManager.clearLines();
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
          addToast("Lost connection to the microcontroller.", { appearance: 'error' });
        }
      }
    } catch (error) {
      serialPort.close();
      setSerialPort(undefined);
      setConnected(false);
      addToast("Could not establish a connection with the microcontroller.", { appearance: 'error' });
    }
  }

  const clearAll = () => {
    if (!lcdRef.current) return;
    const lcdManager = lcdRef.current;
    commands.current = [];
    setDebugCommands(() => []);
    lcdManager.commandsReceived = 0;
    lcdManager.clearLines();
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", border: "1px solid #343a40", borderRadius: "0.25rem", backgroundColor: "#e9ecef", overflow: "hidden"}}>
      <Navbar bg="dark" variant="dark" expand="lg" className="drag">
        <Container>
          <Navbar.Brand>
            LCD-Simulator
          </Navbar.Brand>
          <ButtonGroup>
          <Button onClick={() => api.minimize()} className="no-drag"><img src={minmize_icon} width="20" height="20" /></Button>
          <Button onClick={() => api.maximize()} className="no-drag"><img src={fullscreen_icon} width="20" height="20" /></Button>
          <Button onClick={() => api.restore()} className="no-drag"><img src={fullscreen_close_icon} width="20" height="20" /></Button>
          <Button onClick={() => api.close()} className="no-drag"><img src={close_icon} width="20" height="20" /></Button>
          </ButtonGroup>
        </Container>
      </Navbar>
      <Container>
        {
          connected ? (
            <>
              <LCDView ref={lcdRef} />
              <Tabs defaultActiveKey="debug" id="uncontrolled-tab-example" variant="tabs" style={{ marginTop: 8 }}>
                <Tab eventKey="debug" title="Debug Infos">
                  <DebugCommandView clear={() => setDebugCommands(() => [])} clearAll={clearAll} commands={debugCommands} />
                </Tab>
                <Tab eventKey="display" title="Display Commands">
                  <DisplayCommandView clear={() => commands.current = []} clearAll={clearAll} commands={commands.current} />
                </Tab>
              </Tabs>
            </>
          ) : (
            <div style={{ marginTop: 8, marginBottom: 16 }}>
              <h2>No device connected!</h2>
              <p>
                Please connect to a microcontroller by pressing the "Open COM Port" button.
                </p>
              <Button variant="primary" onClick={handleCOMPortSelection}>Open COM Port</Button>
            </div>
          )
        }
      </Container>
    </div>
  );
}

export default App;
