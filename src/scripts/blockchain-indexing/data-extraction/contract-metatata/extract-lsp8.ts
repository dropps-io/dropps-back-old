import {extractLSP4Data} from "./extract-lsp4";
import {indexLSP4Data} from "../../data-indexing/contract-metadata/index-lsp4";

export async function extractLSP8Data(address: string): Promise<void> {
  const lsp4 = await extractLSP4Data(address)

  indexLSP4Data(address, lsp4, true, '0');
}