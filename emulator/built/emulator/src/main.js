"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const Emulator_1 = require("./Emulator");
// Emulate Current File
const inFileName = process.argv[2];
if (!inFileName.endsWith('.bin'))
    throw new Emulator_1.RuntimeError('Can only emulate .bin files');
let lines = fs_1.default.readFileSync(inFileName);
const cpu = new Emulator_1.Emu6502();
cpu.Storage = lines;
cpu.Execute();
