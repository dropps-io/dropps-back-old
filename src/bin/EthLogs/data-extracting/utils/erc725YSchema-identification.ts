import {ERC725JSONSchema} from "@erc725/erc725.js";

const schemas: ERC725JSONSchema[] = [
    {
        name: "SupportedStandards:LSP4DigitalAsset",
        key: "0xeafec4d89fa9619884b60000a4d96624a38f7ac2d8d9a604ecf07c12c77e480c",
        keyType: "Mapping",
        valueType: "bytes4",
        valueContent: "0xa4d96624"
    },
    {
        name: "LSP4TokenName",
        key: "0xdeba1e292f8ba88238e10ab3c7f88bd4be4fac56cad5194b6ecceaf653468af1",
        keyType: "Singleton",
        valueType: "string",
        valueContent: "String"
    },
    {
        name: "LSP4TokenSymbol",
        key: "0x2f0a68ab07768e01943a599e73362a0e17a63a72e94dd2e384d2c1d4db932756",
        keyType: "Singleton",
        valueType: "string",
        valueContent: "String"
    },
    {
        name: "LSP4Metadata",
        key: "0x9afb95cacc9f95858ec44aa8c3b685511002e30ae54415823f406128b85b238e",
        keyType: "Singleton",
        valueType: "bytes",
        valueContent: "JSONURL"
    },
    {
        name: "LSP4Creators[]",
        key: "0x114bd03b3a46d48759680d81ebb2b414fda7d030a7105a851867accf1c2352e7",
        keyType: "Array",
        valueType: "address",
        valueContent: "Address"
    },
    {
        name: "LSP4CreatorsMap:<address>",
        key: "0x6de85eaf5d982b4e5da00000<address>",
        keyType: "Mapping",
        valueType: "(bytes4,bytes8)",
        valueContent: "(Bytes4,Number)"
    },
    {
        name: "SupportedStandards:LSP3UniversalProfile",
        key: "0xeafec4d89fa9619884b60000abe425d64acd861a49b8ddf5c0b6962110481f38",
        keyType: "Mapping",
        valueType: "bytes4",
        valueContent: "0xabe425d6"
    },
    {
        name: "LSP3Profile",
        key: "0x5ef83ad9559033e6e941db7d7c495acdce616347d28e90c7ce47cbfcfcad3bc5",
        keyType: "Singleton",
        valueType: "bytes",
        valueContent: "JSONURL"
    },
    {
        name: "LSP12IssuedAssets[]",
        key: "0x7c8c3416d6cda87cd42c71ea1843df28ac4850354f988d55ee2eaa47b6dc05cd",
        keyType: "Array",
        valueType: "address",
        valueContent: "Address"
    },
    {
        name: "LSP12IssuedAssetsMap:<address>",
        key: "0x74ac2555c10b9349e78f0000<address>",
        keyType: "Mapping",
        valueType: "(bytes4,bytes8)",
        valueContent: "(Bytes4,Number)"
    },
    {
        name: "LSP5ReceivedAssetsMap:<address>",
        key: "0x812c4334633eb816c80d0000<address>",
        keyType: "Mapping",
        valueType: "(bytes4,bytes8)",
        valueContent: "(Bytes4,Number)"
    },
    {
        name: "LSP5ReceivedAssets[]",
        key: "0x6460ee3c0aac563ccbf76d6e1d07bada78e3a9514e6382b736ed3f478ab7b90b",
        keyType: "Array",
        valueType: "address",
        valueContent: "Address"
    },
    {
        name: "LSP1UniversalReceiverDelegate",
        key: "0x0cfc51aec37c55a4d0b1a65c6255c4bf2fbdf6277f3cc0730c45b828b6db8b47",
        keyType: "Singleton",
        valueType: "address",
        valueContent: "Address"
    }
];

export const keyToERC725YSchema: Map<string, ERC725JSONSchema> = new Map(schemas.map(schema => {
    return [schema.key, schema];
}));