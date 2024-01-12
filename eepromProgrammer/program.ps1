param(
    [string]$binaryFilePath = $(throw "Please provide the path to the binary file.")
)

# Specify the paths to your files
$arduinoFilePath = "C:\Users\gavin\Documents\Code\6502\eepromProgrammer\main.ino"
# $binaryFilePath = "eepromProgrammer\data.bin"

# Read the content of the binary file
$binaryData = [System.IO.File]::ReadAllBytes($binaryFilePath)

# Convert the byte array to a hex string array
$hexString = $binaryData | ForEach-Object { "0x" + $_.ToString("X2") }

# Convert the hex string array to a string of comma-separated values
$byteArrayString = [string]::Join(', ', $hexString)

# Read the content of the Arduino file
$arduinoCode = Get-Content -Path $arduinoFilePath -Raw

# Combine the binary data with Arduino code
$arduinoCode = $arduinoCode -replace "const byte data\[\] = \{\};", "const byte data[] = { $byteArrayString };"

# Save the modified Arduino code back to the file
$newArduinoFilePath = "C:\Users\gavin\Documents\Code\6502\eepromProgrammer\core\core.ino"
$arduinoCode | Set-Content -Path $newArduinoFilePath -Encoding ASCII

# Compile the modified Arduino code
arduino-cli compile --fqbn arduino:avr:uno C:\Users\gavin\Documents\Code\6502\eepromProgrammer\core\core.ino

# Upload the modified Arduino code
arduino-cli upload -p COM3 --fqbn arduino:avr:uno C:\Users\gavin\Documents\Code\6502\eepromProgrammer\core\core.ino

# Monitor the arduino serial port
arduino-cli monitor -p COM3 --config baudrate=57600