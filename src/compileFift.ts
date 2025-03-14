import fs from 'node:fs';
const CompilerModule = require("./funcfiftlib.js");

type Pointer = unknown;

export interface CompilationError {
    status: "error",
    codeHashHex?: string,
    message: string,
    output?: string,
    stdout: string,
    stderr: string,
}

export interface CompilationOk {
    status: "ok",
    codeBoc: string,
    codeHashHex: string,
    message: string,
    warnings: string,
    output: string,
    stdout: string,
    stderr: string,
}

export type CompileResult = CompilationError | CompilationOk;

const writeToCString = (mod: any, data: string): Pointer => {
    const len = mod.lengthBytesUTF8(data) + 1;
    const ptr = mod._malloc(len);
    mod.stringToUTF8(data, ptr, len);
    return ptr;
}
const writeToCStringPtr = (mod: any, str: string, ptr: any) => {
    const allocated = writeToCString(mod, str);
    mod.setValue(ptr, allocated, "*");
    return allocated;
}

const readFromCString = (mod: any, pointer: Pointer): string => mod.UTF8ToString(pointer);

export async function compileFift(fiftAsmCode: string, customCompilerCode?: string): Promise<CompileResult> {
    const stderr: string[] = [];
    const stdout: string[] = [];
    const allocatedPointers: Pointer[] = [];
    const allocatedFunctions: Pointer[] = [];
    const trackPointer = (pointer: Pointer): Pointer => {
        allocatedPointers.push(pointer);
        return pointer;
    };
    const trackFunctionPointer = (pointer: Pointer): Pointer => {
        allocatedFunctions.push(pointer)
        return pointer
    };
    const mod = await CompilerModule({
        wasmBinary: fs.readFileSync(`${__dirname}/funcfiftlib.wasm`),
        printErr: (s: string) => {
            stderr.push(s);
        },
        print: (s: any) => {
            stdout.push(s);
        },
    });
    if (customCompilerCode != undefined) {
        mod.FS.writeFile('/fiftlib/Asm.fif', customCompilerCode);
    }
    let result: CompileResult;
    try {
        const callbackPtr = trackFunctionPointer(mod.addFunction((_kind: any, _data: any, contents: any, error: any) => {
            const kind = readFromCString(mod, _kind)
            const data = readFromCString(mod, _data)
            if (kind === "realpath") {
                trackPointer(writeToCStringPtr(mod, data, contents));
            } else if (kind === "source") {
                // do nothing
            } else {
                allocatedPointers.push(
                    writeToCStringPtr(mod, "Unknown callback kind " + kind, error),
                );
            }
        }, "viiii"));
        const contentCString = trackPointer(writeToCString(mod, fiftAsmCode));
        const resultPointer = trackPointer(mod._fift_compile(contentCString, callbackPtr));
        const retJson = readFromCString(mod, resultPointer);
        result = JSON.parse(retJson) as CompileResult;
    } catch (e) {
        result = {
            status: 'error',
            message: `Unhandled wasm exception: ${e}`,
            stdout: '',
            stderr: '',
        };
    } finally {
        allocatedPointers.forEach(ptr => mod._free(ptr));
        allocatedFunctions.forEach(ptr => mod.removeFunction(ptr));
    }
    result.stderr = stderr.join("\n");
    result.stdout = stdout.join("\n");
    return result;
}
