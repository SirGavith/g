"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Assembler_1 = require("../../assembler/src/Assembler");
const Emulator_1 = require("../../emulator/src/Emulator");
const fs_1 = __importDefault(require("fs"));
//Assemble and run current file
const args = process.argv.slice(2);
const fileName = args[0];
if (!fileName.endsWith('.ga'))
    throw new Error('Can only assemble .ga or files');
let lines = fs_1.default.readFileSync(fileName, 'utf8')
    .replaceAll('\r', '');
const storage = (0, Assembler_1.Assemble)(lines, args[1]);
fs_1.default.writeFile(fileName.slice(0, -2) + 'gbin', storage, err => { if (err)
    console.log(err); });
const cpu = new Emulator_1.Emu6502();
cpu.Storage = storage;
cpu.Execute();
