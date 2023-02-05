"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const Emulator_1 = require("./Emulator");
// Emulate Current File
const inFileName = process.argv[2];
if (!inFileName.endsWith('.gbin'))
    throw new Emulator_1.RuntimeError('Can only emulate .gbin files');
let storage = fs_1.default.readFileSync(inFileName);
const cpu = new Emulator_1.Emu6502();
cpu.Storage = new Uint8Array(0x10000);
storage.copy(cpu.Storage);
cpu.Execute();
