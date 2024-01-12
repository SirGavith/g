import fs from 'fs'

const data = new Uint8Array([
    0xa9, 0xff,         //LDA #$FF
    0x8d, 0x02, 0x60,   //STA $6002

    0xa9, 0x55,         //LDA #$55
    0x8d, 0x00, 0x60,   //STA $6000

    0xa9, 0xaa,         //LDA #$AA
    0x8d, 0x00, 0x60,   //STA $6000

    0x4c, 0x05, 0x80,   //JMP $8005
])


fs.writeFile('data.bin', data,
    callback => {if (callback !== null) console.log(callback)})