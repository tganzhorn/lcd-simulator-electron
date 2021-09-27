import { useEffect, useState, useRef, useCallback } from 'react';
import {
  CommandParser,
  LCDCommand,
  isDisplayCommand,
  isDebugCommand,
  DebugCommand,
  DisplayCommand,
} from './classes/CommandParser';
import { DebugCommandView } from './components/DebugCommandView';
import { PrimaryButton, PivotItem, Pivot, Text, AnimationStyles, Icon } from '@fluentui/react';
import { DisplayCommandView } from './components/DisplayCommandView';
import "./App.css";
import "./Fonts.css";
import toast from 'react-hot-toast';
import { LCDView } from './components/LCDView';
import { WebGLLCDRenderer } from './classes/WebGLLCDRenderer';
import { Card } from './components/Card';
import { Container } from './components/Container';
import { Startup } from './components/Startup';

function App() {
  const [serialPort, setSerialPort] = useState<SerialPort>();
  const [debugCommands, setDebugCommands] = useState<DebugCommand[]>([]);
  const commands = useRef<DisplayCommand[]>([]);
  const [connected, setConnected] = useState(false);
  const lcdRef = useRef<WebGLLCDRenderer | undefined>();

  const readerRef = useRef<ReadableStreamDefaultReader<any>>();
  const writerRef = useRef<WritableStreamDefaultWriter<any>>();

  const handleCOMPortSelection = useCallback(async () => {
    try {
      const serialPort = await navigator.serial.requestPort();
      setConnected(true);
      setSerialPort(serialPort);
      toast.success("Connected to microcontroller!");
    } catch (error) {
      setConnected(false);
      toast.error("No microcontroller found!");
    }
  }, []);

  const openSerialPort = useCallback(async (serialPort: SerialPort) => {
    try {
      await serialPort.open({ baudRate: 460800, parity: "none", stopBits: 1, dataBits: 8, flowControl: "none" });
      while (serialPort.readable && serialPort.writable) {
        const commandParser = new CommandParser();
        const reader = serialPort.readable.getReader();
        const writer = serialPort.writable.getWriter();

        readerRef.current = reader;
        writerRef.current = writer;

        commandParser.onNewCommand = (command: LCDCommand) => {
          if (!lcdRef.current) return;
          const lcdManager = lcdRef.current;
          if (isDebugCommand(command)) {
            setDebugCommands(state => state.concat([command]));
          }
          if (isDisplayCommand(command)) {
            commands.current.push(command);
            lcdManager.executeCommand(command);
          }
        };

        const acknowledge = new Uint8Array([7]);

        try {
          while (true) {
            const { value, done } = await reader.read();
            if (done) {
              reader.releaseLock();
              writer.releaseLock();
              break;
            }
            if (value) {
              writer.write(acknowledge);
              commandParser.parseValue(value);
            }
          }
        } catch (error) {
          try {
            reader.releaseLock();
            writer.releaseLock();
            serialPort.close();
          } catch (error) { };
          setSerialPort(undefined);
          setConnected(false);
          toast.error("Lost connection to microcontroller!");
        }
      }
    } catch (error) {
      try {
        serialPort.close();
      } catch (error) { };
      setSerialPort(undefined);
      setConnected(false);
      toast.error("Could not establish a connection with the microcontroller.");
    }
  }, []);

  useEffect(() => {
    if (!serialPort) return;

    openSerialPort(serialPort);

    return () => { }
  }, [serialPort, openSerialPort]);

  const clearAll = useCallback(() => {
    if (!lcdRef.current) return;
    const lcdManager = lcdRef.current;
    commands.current.length = 0;
    setDebugCommands(() => []);
    lcdManager.clearLines();
    lcdManager.commandsReceived = 0;
  }, []);

  const handleHistory = useCallback((command: DisplayCommand | undefined) => {
    if(!lcdRef.current) return;
    if (command === undefined) return lcdRef.current.hideHistory();
    lcdRef.current.showHistory(command);
  }, []);

  return (
    <>
      <Startup />
      <Container style={{ position: "absolute", zIndex: connected ? -1 : 999 }} animationStyle={connected ? AnimationStyles.fadeOut400 : AnimationStyles.slideLeftIn400}>
        <Text variant="xLarge"><h1>No device connected!</h1></Text>
        <Card style={{ padding: 16 }}>
          <Text variant="medium">
            <p>
              Please connect to a microcontroller by pressing the "Open COM Port" button.
            </p>
          </Text>
          <PrimaryButton onClick={handleCOMPortSelection}>Open COM Port</PrimaryButton>
        </Card>
        <Card style={{ padding: 16, marginTop: "auto", display: "flex", justifyContent: "center", alignItems: "center" }}>
          <Icon iconName="Help" style={{padding: 8, marginRight: 16, color: "white", backgroundColor: "rgb(16, 110, 190)", borderRadius: "50%"}} />
          <Text variant="medium">
            <p>
              If you can't connect to the microcontroller at all you probably have to install the FTDI drivers which you can find by clicking this <a target="_blank" rel="noreferrer" href="https://ftdichip.com/drivers/">link</a>.
            </p>
          </Text>
        </Card>
      </Container>
      <Container animationStyle={connected ? AnimationStyles.slideLeftIn400 : AnimationStyles.fadeOut400}>
        <LCDView ref={lcdRef} reset={clearAll} />
        <Pivot style={{ marginTop: 8 }}>
          <PivotItem headerText="Debug Infos">
            <DebugCommandView commands={debugCommands} />
          </PivotItem>
          <PivotItem headerText="Display Command History">
            <DisplayCommandView showHistory={handleHistory} commands={commands.current} />
          </PivotItem>
        </Pivot>
      </Container>
    </>
  );
}

export default App;
