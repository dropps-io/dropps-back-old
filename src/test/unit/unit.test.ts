import {describe} from "mocha";
import {ChainSyncTests} from "./db/chain-sync.test";
import {ContractTests} from "./db/contract.test";
import {TagTests} from "./db/tag.test";
import {ContractInterfaceTests} from "./db/contract-interface.test";
import {ContractMetadataTests} from "./db/contract-metadata.test";
import {PostTests} from "./db/post.test";
import {DecodedParametersTests} from "./db/decoded-parameters.test";
import {EventTests} from "./db/event.test";
import {LikeTests} from "./db/like.test";
import {FollowTests} from "./db/follow.test";
import {ImageTests} from "./db/image.test";
import {LinkTests} from "./db/link.test";
import {MethodInterfaceTests} from "./db/method-interface.test";
import {MethodParameterTest} from "./db/method-parameter.test";
import {TransactionTests} from "./db/transaction.test";
import {DataChangedTests} from "./db/data-changed.test";
import {AssetTests} from "./db/asset.test";

export const UnitTests = () => {
    describe('Unit Tests', () => {
        describe('Database', () => {
            ChainSyncTests();
            ContractTests();
            TagTests();
            ContractInterfaceTests();
            ContractMetadataTests();
            PostTests();
            DecodedParametersTests();
            EventTests();
            LikeTests();
            FollowTests();
            ImageTests();
            AssetTests();
            LinkTests();
            MethodInterfaceTests();
            MethodParameterTest();
            TransactionTests();
            DataChangedTests();
        });
    });
}
