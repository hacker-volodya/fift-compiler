import fs from 'fs';
import path from 'path';

export const DEBUG_ASM_FIF_CONTENT = fs.readFileSync(path.join(__dirname, 'DebugAsm.fif')).toString('utf8');
export const DEBUG_MAGIC = 0xff4c;