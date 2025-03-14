import { compileFift } from "./compileFift";
import { DEBUG_ASM_FIF_CONTENT } from "./constants";
import { Cell, Dictionary, Slice } from '@ton/core';
import { DebugSymbols, GlobalDescriptor, ProcedureDescriptor } from './types';
import { DEBUG_MAGIC } from './constants';

export async function extractDebugSymbols(fiftAsmCode: string): Promise<DebugSymbols> {
    const result = await compileFift(fiftAsmCode, DEBUG_ASM_FIF_CONTENT);
    if (result.status == 'error') {
        throw new Error(`Extracting symbols from fift failed: ${JSON.stringify(result)}`);
    }
    return unpackDebugSymbols(Cell.fromBase64(result.codeBoc));
}

export function unpackDebugSymbols(rootCell: Cell): DebugSymbols {
    const root = rootCell.beginParse();

    if (root.loadUint(16) !== DEBUG_MAGIC) {
        throw new Error('Debug symbols malformed.');
    }

    const proceduresDict = root
        .loadRef()
        .asSlice()
        .loadDictDirect(Dictionary.Keys.Int(32), {
            serialize: () => { },
            parse: (src: Slice): Pick<ProcedureDescriptor, 'cellHash' | 'name'> => ({
                cellHash: src.loadBuffer(32).toString('hex'),
                name: src.loadStringTail(),
            }),
        });

    const procedures = [...proceduresDict].map(
        ([methodId, descriptor]): ProcedureDescriptor => ({
            methodId,
            ...descriptor,
        }),
    );

    const globals: GlobalDescriptor[] = [];
    const globalsDictRef = root.loadMaybeRef();

    if (globalsDictRef) {
        const globalsDict = globalsDictRef
            .beginParse()
            .loadDictDirect(Dictionary.Keys.Uint(32), {
                serialize: () => { },
                parse: (src: Slice): string => src.loadStringTail(),
            });

        for (const globalIndex of globalsDict.keys()) {
            const globalName = globalsDict.get(globalIndex)!;
            globals.push({ index: globalIndex, name: globalName });
        }
    }

    return {
        procedures,
        globals,
    };
}