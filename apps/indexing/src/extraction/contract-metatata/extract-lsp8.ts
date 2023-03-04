import { extractLSP4Data } from './extract-lsp4';
import { ContractFullMetadata } from '../../../types/contract-metadata';

export async function extractLSP8Data(address: string): Promise<ContractFullMetadata> {
  const lsp4 = await extractLSP4Data(address);
  return {
    name: lsp4.name,
    description: lsp4.metadata ? lsp4.metadata.description : '',
    symbol: lsp4.symbol,
    images: lsp4.metadata ? lsp4.metadata.images.flat() : [],
    icon: lsp4.metadata ? lsp4.metadata.icon : [],
    assets: lsp4.metadata ? lsp4.metadata.assets : [],
    tags: [],
    backgroundImage: [],
    profileImage: [],
    links: [],
    isNFT: true,
  };
}
