import { useEffect, useState, useRef, useCallback } from 'react';
import {
  CommandParser,
  LCDCommand,
  isDebugNumberCommand,
  isDebugTextCommand,
  DebugNumberCommand,
  DebugTextCommand,
} from './classes/CommandParser';
import { DebugCommandView } from './components/DebugCommandView';
import { PrimaryButton, PivotItem, Pivot, Text } from '@fluentui/react';
import { DisplayCommandView } from './components/DisplayCommandView';
import "./App.css";
import "./Fonts.css";
import { useToasts } from 'react-toast-notifications';
import { LCDView } from './components/LCDView';
import { WebGLLCDRenderer } from './classes/WebGLLCDRenderer';
import { Card } from './components/Card';

function App() {
  const [serialPort, setSerialPort] = useState<SerialPort>();
  const [debugCommands, setDebugCommands] = useState<(DebugNumberCommand | DebugTextCommand)[]>([]);
  const commands = useRef<LCDCommand[]>([]);
  const [connected, setConnected] = useState(false);
  const lcdRef = useRef<WebGLLCDRenderer | undefined>();

  const { addToast } = useToasts();

  const readerRef = useRef<ReadableStreamDefaultReader<any>>();
  const writerRef = useRef<WritableStreamDefaultWriter<any>>();

  const handleCOMPortSelection = async () => {
    try {
      const serialPort = await navigator.serial.requestPort();
      setConnected(true);
      setSerialPort(serialPort);
    } catch (error) {
      setConnected(false);
      addToast("No microcontroller found!", { appearance: 'warning', autoDismiss: true });
    }
  }

  const openSerialPort = useCallback(async (serialPort: SerialPort) => {
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
            lcdManager.executeCommand(command);
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
              writer.write(ack);
              commandParser.parseValue(value);
            }
          }
        } catch (error) {
          reader.releaseLock();
          writer.releaseLock();
          try {
            serialPort.close();
          } catch (e) { };
          setSerialPort(undefined);
          setConnected(false);
          addToast("Lost connection to the microcontroller.", { appearance: 'error', autoDismiss: true });
        }
      }
    } catch (error) {
      serialPort.close();
      setSerialPort(undefined);
      setConnected(false);
      addToast("Could not establish a connection with the microcontroller.", { appearance: 'error', autoDismiss: true });
    }
  }, [addToast, debugCommands.length]);

  useEffect(() => {
    if (!serialPort) return;

    openSerialPort(serialPort);

    return () => { }
  }, [serialPort, openSerialPort]);

  const clearAll = () => {
    if (!lcdRef.current) return;
    const lcdManager = lcdRef.current;
    commands.current.length = 0;
    setDebugCommands(() => []);
    lcdManager.clearLines();
    lcdManager.commandsReceived = 0;
  }

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      height: "100vh",
      padding: 16,
      boxSizing: "border-box",
      overflowY: "auto",
      overflowX: "hidden",
      maxWidth: 800,
      margin: "0 auto"
    }}
    >
      {
        connected ? (
          <>
            <LCDView ref={lcdRef} />
            <Pivot style={{ marginTop: 8 }}>
              <PivotItem headerText="Debug Infos">
                <DebugCommandView clear={() => setDebugCommands(() => [])} clearAll={clearAll} commands={debugCommands} />
              </PivotItem>
              <PivotItem headerText="Display Commands">
                <DisplayCommandView clear={() => commands.current.length = 0} clearAll={clearAll} commands={commands.current} />
              </PivotItem>
            </Pivot>
          </>
        ) : (
          <Card style={{ padding: 8 }}>
            <Text variant="medium" ><h1>No device connected!</h1></Text>
            <Text variant="medium">
              <p>
                Please connect to a microcontroller by pressing the "Open COM Port" button.
              </p>
            </Text>
            <PrimaryButton onClick={handleCOMPortSelection}>Open COM Port</PrimaryButton>
          </Card>
        )
      }
    </div>
  );
}

export default App;
