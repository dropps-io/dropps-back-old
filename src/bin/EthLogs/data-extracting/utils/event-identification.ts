import {SolEvent} from "../../EthLog.models";

const eventsRepo: SolEvent[] = [
    {name: 'DataChanged', topic: '0xece574603820d07bc9b91f2a932baadf4628aabcb8afba49776529c14a6104b2', parameters:
            [
                {name: 'key', type: 'bytes32', indexed: true},
                {name: 'value', type: 'bytes', indexed: false},
            ]
    },
    {name: 'UniversalReceiver', topic: '0x8187df79ab47ad16102e7bc8760349a115b3ba9869b8cedd78996f930ac9cac3', parameters:
            [
                {name: 'from', type: 'address', indexed: true},
                {name: 'typeId', type: 'bytes32', indexed: true},
                {name: 'returnedValue', type: 'bytes', indexed: true},
                {name: 'receivedData', type: 'bytes', indexed: false},
            ]
    },
    {name: 'UniversalReceiver', topic: '0x54b98940949b5ac0325c889c84db302d4e18faec431b48bdc81706bfe482cfbd', parameters:
            [
                {name: 'from', type: 'address', indexed: true},
                {name: 'typeId', type: 'bytes32', indexed: true},
                {name: 'returnedValue', type: 'bytes32', indexed: true},
                {name: 'receivedData', type: 'bytes', indexed: false},
            ]
    },
    {name: 'ValueReceived', topic: '0x28dca09fe59e9b92384074cf93fb4789da55b0b2cc3ffa69274eb3c87b7391c6', parameters:
            [
                {name: 'sender', type: 'address', indexed: true},
                {name: 'value', type: 'uint256', indexed: true},
            ]
    },
    {
        "name": "ContractCreated",
        "topic": "0x01c42bd7e97a66166063b02fce6924e6656b6c2c61966630165095c4fb0b7b2f",
        "parameters": [
            {
                "indexed": true,
                "internalType": "uint256",
                "name": "operation",
                "type": "uint256"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "contractAddress",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "uint256",
                "name": "value",
                "type": "uint256"
            }
        ]
    },
    {
        "name": "Executed",
        "topic": "0x4810874456b8e6487bd861375cf6abd8e1c8bb5858c8ce36a86a04dabfac199e",
        "parameters": [
            {
                "indexed": true,
                "internalType": "uint256",
                "name": "operation",
                "type": "uint256"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "to",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "uint256",
                "name": "value",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "bytes4",
                "name": "selector",
                "type": "bytes4"
            }
        ]
    },
    {
        "name": "UniversalReceiver",
        "topic": "0x9c3ba68eb5742b8e3961aea0afc7371a71bf433c8a67a831803b64c064a178c2",
        "parameters": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "from",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "value",
                "type": "uint256"
            },
            {
                "indexed": true,
                "internalType": "bytes32",
                "name": "typeId",
                "type": "bytes32"
            },
            {
                "indexed": true,
                "internalType": "bytes",
                "name": "returnedValue",
                "type": "bytes"
            },
            {
                "indexed": false,
                "internalType": "bytes",
                "name": "receivedData",
                "type": "bytes"
            }
        ]
    },
    {
        "name": "ValueReceived",
        "topic": "0x7e71433ddf847725166244795048ecf3e3f9f35628254ecbf736056664233493",
        "parameters": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "sender",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "uint256",
                "name": "value",
                "type": "uint256"
            }
        ]
    },
    {
        "name": "AuthorizedOperator",
        "topic": "0x34b797fc5a526f7bf1d2b5de25f6564fd85ae364e3ee939aee7c1ac27871a988",
        "parameters": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "operator",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "tokenOwner",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "bytes32",
                "name": "tokenId",
                "type": "bytes32"
            }
        ]
    },
    {
        "name": "RevokedOperator",
        "topic": "0x17d5389f6ab6adb2647dfa0aa365c323d37adacc30b33a65310b6158ce1373d5",
        "parameters": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "operator",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "tokenOwner",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "bytes32",
                "name": "tokenId",
                "type": "bytes32"
            }
        ]
    },
    {
        "name": "Transfer",
        "topic": "0xb333c813a7426a7a11e2b190cad52c44119421594b47f6f32ace6d8c7207b2bf",
        "parameters": [
            {
                "indexed": false,
                "internalType": "address",
                "name": "operator",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "from",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "to",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "bytes32",
                "name": "tokenId",
                "type": "bytes32"
            },
            {
                "indexed": false,
                "internalType": "bool",
                "name": "force",
                "type": "bool"
            },
            {
                "indexed": false,
                "internalType": "bytes",
                "name": "data",
                "type": "bytes"
            }
        ]
    },
    {
        "name": "AuthorizedOperator",
        "topic": "0xd66aff874162a96578e919097b6f6d153dfd89a5cec41bb331fdb0c4aec16e2c",
        "parameters": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "operator",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "tokenOwner",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
            }
        ]
    },
    {
        "name": "DataChanged",
        "topic": "0xcdf4e344c0d23d4cdd0474039d176c55b19d531070dbe17856bfb993a5b5720b",
        "parameters": [
            {
                "indexed": true,
                "internalType": "bytes32",
                "name": "dataKey",
                "type": "bytes32"
            }
        ]
    },
    {
        "name": "OwnershipTransferred",
        "topic": "0x8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e0",
        "parameters": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "previousOwner",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "newOwner",
                "type": "address"
            }
        ]
    },
    {
        "name": "RevokedOperator",
        "topic": "0x50546e66e5f44d728365dc3908c63bc5cfeeab470722c1677e3073a6ac294aa1",
        "parameters": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "operator",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "tokenOwner",
                "type": "address"
            }
        ]
    },
    {
        "name": "Transfer",
        "topic": "0x3997e418d2cef0b3b0e907b1e39605c3f7d32dbd061e82ea5b4a770d46a160a6",
        "parameters": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "operator",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "from",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "to",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "bool",
                "name": "force",
                "type": "bool"
            },
            {
                "indexed": false,
                "internalType": "bytes",
                "name": "data",
                "type": "bytes"
            }
        ]
    }
];

export const topicToEvent: Map<string, SolEvent> = new Map(eventsRepo.map(event => {
    return [event.topic, event];
}));