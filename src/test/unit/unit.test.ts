import {describe} from "mocha";
import {ChainSyncTests} from "./db/chain-sync.test";
import {ContractTests} from "./db/contract.test";
import {TagTests} from "./db/tag.test";
import {ContractInterfaceTests} from "./db/contract-interface.test";
import {ContractMetadataTests} from "./db/contract-metadata.test";

export const UnitTests = () => {
    describe('Unit Tests', () => {
        describe('Database', () => {
            // ChainSyncTests();
            // ContractTests();
            // TagTests();
            // ContractInterfaceTests();
            ContractMetadataTests();
        });
    });
}
