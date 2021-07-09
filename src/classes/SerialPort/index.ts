export type SerialPortManagerErrorHandle = (error: SerialPortManagerError) => void;

export type SerialPortManagerError = {
    error: "NoMicrocontrollerFound" | "LostConnection" | "CouldNotEstablishConnection"
};

/**
 * Specialized class for dealing with the "µC Labor Board".
 */
export class SerialPortManager {
    private serialPort: SerialPort | undefined;
    public onError: SerialPortManagerErrorHandle = (error: SerialPortManagerError) => {};

    constructor() {

    }

    async openConnection() {
        try {
            this.serialPort = await navigator.serial.requestPort();
        } catch(e) {
            this.onError({
                error: "NoMicrocontrollerFound"
            });
        };
    }

    async onReceive() {
        if (!this.serialPort) {}
    }
}