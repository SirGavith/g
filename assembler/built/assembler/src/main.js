"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const Assembler_1 = require("./Assembler");
// Assemble Current File
const args = process.argv.slice(2);
const inFileName = args[0];
if (!inFileName.endsWith('.ga') && !inFileName.endsWith('.gassembly'))
    throw new Assembler_1.AssemblerError('Can only assemble .ga or .gassembly files');
const outFileName = inFileName.slice(0, -1) + 'bin';
let lines = fs_1.default.readFileSync(inFileName, 'utf8')
    .replaceAll('\r', '');
const rom = (0, Assembler_1.Assemble)(lines, args[1]);
fs_1.default.writeFile(outFileName, rom, err => { if (err)
    console.log(err); });
