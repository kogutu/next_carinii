declare module 'input-mask' {
    export interface CreateMaskOptions {
        mask: string;
        definitions?: {
            [key: string]: RegExp | ((char: string) => boolean);
        };
    }

    export interface MaskResolveResult {
        value: string;
        skip?: boolean;
    }

    export interface MaskInstance {
        resolve(value: string): MaskResolveResult;
        // Add other methods if you encounter them
    }

    export function createMask(options: CreateMaskOptions): MaskInstance;

    export const Masks: any;
}
