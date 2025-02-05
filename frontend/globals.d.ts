declare function addBot(): void;
declare function checkAuth(): Promise<boolean>;
declare function ui(action: string, value?: string): void | string;
declare class jsSHA {
    constructor(shaType: string, inputType: string, config: { numRounds: number });
    update(data: string): void;
    getHash(outputType: string): string;
}