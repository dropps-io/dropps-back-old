import { ERC725JSONSchema } from '@erc725/erc725.js';
import Lsp3UniversalProfileSchema from '@erc725/erc725.js/schemas/LSP3UniversalProfileMetadata.json';
import Lsp4DigitalAssetSchema from '@erc725/erc725.js/schemas/LSP4DigitalAsset.json';

export const InterfaceToSchema: Map<string, ERC725JSONSchema[]> = new Map<string, ERC725JSONSchema[]>();

InterfaceToSchema.set('LSP0',
   Lsp3UniversalProfileSchema as ERC725JSONSchema[]
);
InterfaceToSchema.set('LSP7',
    Lsp4DigitalAssetSchema as ERC725JSONSchema[]
);
InterfaceToSchema.set('LSP8',
    Lsp4DigitalAssetSchema as ERC725JSONSchema[]
);