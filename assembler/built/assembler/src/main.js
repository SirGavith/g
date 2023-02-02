"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const Assembler_1 = require("./Assembler");
// Assemble Current File
const inFileName = process.argv.at(-1);
if (!inFileName.endsWith('.s'))
    throw new Assembler_1.AssemblerError('Can only assemble .s files');
const outFileName = inFileName.slice(0, -1) + 'bin';
let lines = fs_1.default.readFileSync(inFileName, 'utf8')
    .replaceAll('\r', '');
const rom = (0, Assembler_1.Assemble)(lines);
fs_1.default.writeFile(outFileName, rom, err => { if (err)
    console.log(err); });
