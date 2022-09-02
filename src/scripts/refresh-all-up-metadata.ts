import {queryContracts} from "../bin/db/contract.table";
import {extractLSP3Data} from "./blockchain-indexing/data-extraction/contract-metatata/extract-lsp3";
import {extractLSP7Data} from "./blockchain-indexing/data-extraction/contract-metatata/extract-lsp7";
import {extractLSP8Data} from "./blockchain-indexing/data-extraction/contract-metatata/extract-lsp8";

async function refreshAllUpMetadata() {
  const universalProfiles = await queryContracts();
  for (const up of universalProfiles) {
    switch (up.interfaceCode) {
      case 'LSP0':
        await extractLSP3Data(up.address);
        break;
      case 'LSP7':
        await extractLSP7Data(up.address);
        break;
      case 'LSP8':
        await extractLSP8Data(up.address);
        break;
    }
  }
  console.log('Done');
}

refreshAllUpMetadata();