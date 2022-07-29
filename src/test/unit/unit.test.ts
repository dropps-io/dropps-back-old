import {describe} from "mocha";
import {ChainSyncTests} from "./db/chain-sync.test";
import {ContractTests} from "./db/contract.test";

export const UnitTests = () => {
    describe('Unit Tests', () => {
        describe('Database', () => {
            ChainSyncTests();
            ContractTests();
        });
    });
}
