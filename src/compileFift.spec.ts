import { compileFift } from "./compileFift";
import fs from 'node:fs';

describe('fift compiler', () => {
    it('should compile correct code for tact', async () => {
        const result = await compileFift(fs.readFileSync(`${__dirname}/__testdata__/tact_Counter.fif`).toString('utf8'));
        expect(result).toMatchSnapshot();
    });

    it('should compile correct code for func', async () => {
        const result = await compileFift(fs.readFileSync(`${__dirname}/__testdata__/func_Counter.fif`).toString('utf8'));
        expect(result).toMatchSnapshot();
    });

    it('should correctly fail', async () => {
        const result = await compileFift("definitely not compilable fift code");
        expect(result.status).toBe('error');
        expect(result.message).toBe('main.fif:1:\tdefinitely:-?');
    })
});