import {Log} from "../../models/types/log";
import {queryContract} from "../../bin/db/contract.table";
import {extractContract} from "./extraction/extract-contract";
import {ContractFullMetadata} from "./models/contract-metadata.model";

export async function extractAndIndex(log: Log) {
  let contract: { metadata: ContractFullMetadata | null, interfaceCode: string };

  try {
    await queryContract(log.address);
  }
  catch (e) {
    contract = await extractContract(log.address);
  }
}