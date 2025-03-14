export type GlobalDescriptor = {
    index: number;
    name: string;
};

export type ProcedureDescriptor = {
    methodId: number;
    cellHash: string;
    name: string;
};

export type DebugSymbols = {
    procedures: ProcedureDescriptor[];
    globals: GlobalDescriptor[];
};
