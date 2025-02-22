// MAX31855 MakeCode Extension for micro:bit
// Author: ChatGPT
// License: MIT

namespace max31855 {
    let csPin: DigitalPin = DigitalPin.P0;

    /**
     * Initialize the MAX31855 sensor with a given Chip Select pin.
     * @param cs the chip select pin, eg: DigitalPin.P0
     */
    //% block="initialize MAX31855 on CS pin %cs"
    export function initialize(cs: DigitalPin): void {
        csPin = cs;
        pins.digitalWritePin(csPin, 1);
        pins.spiFrequency(1000000);
        pins.spiMode(0);
    }

    /**
     * Reads the raw 32-bit data from MAX31855
     */
    function readRaw(): number {
        pins.digitalWritePin(csPin, 0);
        let rawData = pins.spiTransfer(0) << 24;
        rawData |= pins.spiTransfer(0) << 16;
        rawData |= pins.spiTransfer(0) << 8;
        rawData |= pins.spiTransfer(0);
        pins.digitalWritePin(csPin, 1);
        return rawData;
    }

    /**
     * Reads the temperature in °C from MAX31855.
     */
    //% block="read temperature from MAX31855"
    export function readTemperature(): number {
        let rawData = readRaw();
        if (rawData & 0x7) return NaN; // Error detected

        let tempData = (rawData >> 18) & 0x3FFF;
        if (rawData & 0x80000000) {
            tempData -= 16384; // Handle negative values (2's complement)
        }
        return tempData * 0.25;
    }

    /**
     * Checks for errors and returns a message.
     */
    //% block="check MAX31855 errors"
    export function checkError(): string {
        let rawData = readRaw();
        if (rawData & 0x01) return "Thermocouple missing";
        if (rawData & 0x02) return "Short to GND";
        if (rawData & 0x04) return "Short to VCC";
        return "No error";
    }
}
