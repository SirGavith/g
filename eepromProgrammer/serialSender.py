from serial import Serial
import time

# print(serial.__version__)
# Replace 'COM3' with the appropriate serial port of your Arduino
ser = Serial('COM3', 57600)

# Wait for the Arduino to initialize
time.sleep(2)

# Specify the path to the file you want to send
file_path = 'C:\\Users\\gavin\\Documents\\Code\\6502\\binaryWriter\\data.bin'

# Open the file for reading
with open(file_path, 'rb') as file:
    # Read and send each byte
    byte = file.read(1)
    while byte:
        ser.write(byte)
        print('sending byte')
        byte = file.read(1)

# Wait for the Arduino to process the file
time.sleep(1)

# Read and print responses from the Arduino
while ser.in_waiting:
    response = ser.readline().decode('utf-8').strip()
    print("Arduino Response:", response)

# Close the serial connection
ser.close()