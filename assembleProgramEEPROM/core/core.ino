#define SHIFT_DATA 2
#define SHIFT_CLK 3
#define SHIFT_LATCH 4
#define EEPROM_D0 5
#define EEPROM_D7 12
#define WRITE_EN 13

/*
 * Output the address bits and outputEnable signal using shift registers.
 */
void setAddress(int address, bool outputEnable)
{
    shiftOut(SHIFT_DATA, SHIFT_CLK, MSBFIRST, (address >> 8) | (outputEnable ? 0x00 : 0x80));
    shiftOut(SHIFT_DATA, SHIFT_CLK, MSBFIRST, address);

    digitalWrite(SHIFT_LATCH, LOW);
    digitalWrite(SHIFT_LATCH, HIGH);
    digitalWrite(SHIFT_LATCH, LOW);
}

/*
 * Read a byte from the EEPROM at the specified address.
 */
byte readEEPROM(int address)
{
    for (int pin = EEPROM_D0; pin <= EEPROM_D7; pin += 1)
    {
        pinMode(pin, INPUT);
    }
    setAddress(address, /*outputEnable*/ true);

    byte readData = 0;
    for (int pin = EEPROM_D7; pin >= EEPROM_D0; pin -= 1)
    {
        readData = (readData << 1) + digitalRead(pin);
    }
    return readData;
}

/*
 * Write a byte to the EEPROM at the specified address.
 */
void writeEEPROM(int address, byte data)
{
    setAddress(address, /*outputEnable*/ false);
    for (int pin = EEPROM_D0; pin <= EEPROM_D7; pin += 1)
    {
        pinMode(pin, OUTPUT);
    }

    for (int pin = EEPROM_D0; pin <= EEPROM_D7; pin += 1)
    {
        digitalWrite(pin, data & 1);
        data = data >> 1;
    }
    digitalWrite(WRITE_EN, LOW);
    delayMicroseconds(1);
    digitalWrite(WRITE_EN, HIGH);
    delay(10);
}

void printBlock(int base)
{
    byte data[16];
    for (int offset = 0; offset <= 15; offset += 1)
    {
        data[offset] = readEEPROM(base + offset);
    }

    char buf[80];
    sprintf(buf, "%03x:  %02x %02x %02x %02x %02x %02x %02x %02x   %02x %02x %02x %02x %02x %02x %02x %02x",
            base, data[0], data[1], data[2], data[3], data[4], data[5], data[6], data[7],
            data[8], data[9], data[10], data[11], data[12], data[13], data[14], data[15]);

    Serial.println(buf);
}

/*
 * Read the contents of the EEPROM and print them to the serial monitor.
 */
void printContents()
{
    for (int base = 0; base <= 255; base += 16)
    {
        printBlock(base);
    }
    printBlock(0x7FF0);
}

//will by filled when running program.ps1
const byte data[] = { 0xa9,0xff,0x8d,0x2,0x60,0xa9,0x50,0x8d,0x0,0x60,0x6a,0x8d,0x0,0x60,0x4c,0xa,0x80 };
const short resetVector = 0x8000;

void setup()
{
    // put your setup code here, to run once:
    pinMode(SHIFT_DATA, OUTPUT);
    pinMode(SHIFT_CLK, OUTPUT);
    pinMode(SHIFT_LATCH, OUTPUT);
    digitalWrite(WRITE_EN, HIGH);
    pinMode(WRITE_EN, OUTPUT);
    Serial.begin(57600);
    Serial.println("Hello world");

    // Erase entire EEPROM
    Serial.print("Erasing EEPROM");
    for (int address = 0; address <= 2047; address += 1)
    {
        writeEEPROM(address, 0xea);

        if (address % 64 == 0)
        {
            Serial.print(".");
        }
    }
    Serial.println(" Done");

    // Program data bytes
    Serial.print("Programming EEPROM");
    for (int address = 0; address < sizeof(data); address += 1)
    {
        writeEEPROM(address, data[address]);

        if (address % 64 == 0)
        {
            Serial.print(".");
        }
    }

    writeEEPROM(0x8FFC, resetVector & 0xFF);
    writeEEPROM(0x8FFD, resetVector >> 8);

    Serial.println(" Done");

    // Read and print out the contents of the EERPROM
    Serial.println("Reading EEPROM");
    printContents();

    Serial.println("Finished");
}

void loop()
{
    
}

// void loop()
// {
//     Serial.println("Checking for data to read");
//     // Check if data is available to read
//     if (Serial.available() > 0)
//     {
//         // Read the incoming byte
//         char data = Serial.read();

//         // Print the received byte
//         Serial.print(data);
//     }
// }