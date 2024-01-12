"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const data = new Uint8Array([
    0xa9, 0xff,
    0x8d, 0x02, 0x60,
    0xa9, 0x55,
    0x8d, 0x00, 0x60,
    0xa9, 0xaa,
    0x8d, 0x00, 0x60,
    0x4c, 0x05, 0x80, //JMP $8005
]);
fs_1.default.writeFile('data.bin', data, callback => { if (callback !== null)
    console.log(callback); });
