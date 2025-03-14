# Fift Compiler

Compiles fift-asm files to BOC. Also can collect debug symbols for:

- functions (original name, `method_id`, cell hash)
- globals (original name, index).

## Basic Usage

```typescript
import { compileFift, extractDebugSymbols } from 'fift-compiler';

// must contain `"Asm.fif" include`
const fiftSource = fs.readFileSync(`program.fif`).toString('utf8');
const compileResult = await compileFift(fiftSource);
if (compileResult.status == 'error') {
    throw new Error(`Compilation failed: ${JSON.stringify(result)}`);
}
console.log(`Code BOC base64: ${compileResult.codeBoc}`);
const debugSymbols = await extractDebugSymbols(fiftSource);
console.log(debugSymbols);
```

Example debug symbols output:

```json
{
  "globals": [
    {
      "index": 1,
      "name": "data::counter",
    },
  ],
  "procedures": [
    {
      "cellHash": "12c594cd44b75c218dd74be415be5b35d11481ccd3d6e7a26ba45e903d52edfa",
      "methodId": 0,
      "name": "main",
    },
    {
      "cellHash": "06c0e4431c841de3452704213cb23170922691e994cf98eb318c7fd409bfa957",
      "methodId": 1,
      "name": "load_data",
    },
    {
      "cellHash": "9f099c93b986b3c2508324139543e3ffb867125e18fe03bde5c86b113c5d751a",
      "methodId": 2,
      "name": "save_data",
    },
    {
      "cellHash": "c6e2185119d6c5553ec261b6ddd244e2fc2a37c9836578399c8be9759a8a3f24",
      "methodId": 127487,
      "name": "get_counter",
    },
  ],
}
```

## Caveats

* Compiler will throw a error if your .fif file does not contain `include "Asm.fif"` or inlined content of Asm.fif
* For debug symbol extraction from Tact, use `internalExternalReceiversOutsideMethodsMap: false`, __tact_selector_hack is not compatible with DebugAsm.fif

## Thanks to

- [Nick Nekilov](https://github.com/NickNekilov)
- [Skydev0h](https://github.com/skydev0h)
- [Petr Makhnev](https://github.com/i582)

## License

![MIT License](https://img.shields.io/badge/License-MIT-green)
