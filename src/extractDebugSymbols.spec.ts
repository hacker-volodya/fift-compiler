import fs from 'node:fs';
import { extractDebugSymbols } from "./extractDebugSymbols";

describe('fift symbols extractor', () => {
    it('should extract symbols from tact fift-asm', async () => {
        const result = await extractDebugSymbols(fs.readFileSync(`${__dirname}/__testdata__/tact_Counter.fif`).toString('utf8'));
        expect(result).toMatchSnapshot();
    });

    it('should extract symbols from func fift-asm', async () => {
        const result = await extractDebugSymbols(fs.readFileSync(`${__dirname}/__testdata__/func_Counter.fif`).toString('utf8'));
        expect(result).toMatchSnapshot();
    });
});