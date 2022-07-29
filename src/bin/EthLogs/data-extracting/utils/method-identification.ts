interface SolMethodInterface {
    id: string,
    name: string,
}

const methodIdentification: SolMethodInterface[] = [
    {
        "name": "claimOwnership",
        "id": "0x4e71e0c8"
    },
    {
        "name": "execute",
        "id": "0x44c028fe"
    },
    {
        "name": "getData",
        "id": "0x4e3e6e9c"
    },
    {
        "name": "getData",
        "id": "0x54f6127f"
    },
    {
        "name": "isValidSignature",
        "id": "0x1626ba7e"
    },
    {
        "name": "owner",
        "id": "0x8da5cb5b"
    },
    {
        "name": "pendingOwner",
        "id": "0xe30c3978"
    },
    {
        "name": "renounceOwnership",
        "id": "0x715018a6"
    },
    {
        "name": "setData",
        "id": "0x14a6e293"
    },
    {
        "name": "setData",
        "id": "0x7f23690c"
    },
    {
        "name": "supportsInterface",
        "id": "0x01ffc9a7"
    },
    {
        "name": "transferOwnership",
        "id": "0xf2fde38b"
    },
    {
        "name": "universalReceiver",
        "id": "0x6bb56a14"
    },
    {
        "name": "authorizeOperator",
        "id": "0xcf5182ba"
    },
    {
        "name": "balanceOf",
        "id": "0x70a08231"
    },
    {
        "name": "getData",
        "id": "0x4e3e6e9c"
    },
    {
        "name": "getData",
        "id": "0x54f6127f"
    },
    {
        "name": "getOperatorsOf",
        "id": "0x49a6078d"
    },
    {
        "name": "isOperatorFor",
        "id": "0x2a3654a4"
    },
    {
        "name": "mint",
        "id": "0xaf255b61"
    },
    {
        "name": "owner",
        "id": "0x8da5cb5b"
    },
    {
        "name": "renounceOwnership",
        "id": "0x715018a6"
    },
    {
        "name": "revokeOperator",
        "id": "0x0b0c6d82"
    },
    {
        "name": "setData",
        "id": "0x14a6e293"
    },
    {
        "name": "setData",
        "id": "0x7f23690c"
    },
    {
        "name": "supportsInterface",
        "id": "0x01ffc9a7"
    },
    {
        "name": "tokenIdsOf",
        "id": "0xa3b261f2"
    },
    {
        "name": "tokenOwnerOf",
        "id": "0x217b2270"
    },
    {
        "name": "totalSupply",
        "id": "0x18160ddd"
    },
    {
        "name": "transfer",
        "id": "0x511b6952"
    },
    {
        "name": "transferBatch",
        "id": "0x55908868"
    },
    {
        "name": "transferOwnership",
        "id": "0xf2fde38b"
    },
    {
        "name": "authorizeOperator",
        "id": "0x47980aa3"
    },
    {
        "name": "balanceOf",
        "id": "0x70a08231"
    },
    {
        "name": "decimals",
        "id": "0x313ce567"
    },
    {
        "name": "getData",
        "id": "0x4e3e6e9c"
    },
    {
        "name": "getData",
        "id": "0x54f6127f"
    },
    {
        "name": "isOperatorFor",
        "id": "0xd95b6371"
    },
    {
        "name": "mint",
        "id": "0x7580d920"
    },
    {
        "name": "owner",
        "id": "0x8da5cb5b"
    },
    {
        "name": "renounceOwnership",
        "id": "0x715018a6"
    },
    {
        "name": "revokeOperator",
        "id": "0xfad8b32a"
    },
    {
        "name": "setData",
        "id": "0x14a6e293"
    },
    {
        "name": "setData",
        "id": "0x7f23690c"
    },
    {
        "name": "supportsInterface",
        "id": "0x01ffc9a7"
    },
    {
        "name": "totalSupply",
        "id": "0x18160ddd"
    },
    {
        "name": "transfer",
        "id": "0x760d9bba"
    },
    {
        "name": "transferBatch",
        "id": "0xa8a34e0a"
    },
    {
        "name": "transferOwnership",
        "id": "0xf2fde38b"
    }
];

const methodIdToInterface: Map<string, SolMethodInterface> = new Map(methodIdentification.map(methodInterface => {
    return [methodInterface.id, methodInterface];
}))

const UNKNOWN_METHOD_INTERFACE: SolMethodInterface = {id: '0x', name: 'Unknown'}

export {methodIdToInterface, UNKNOWN_METHOD_INTERFACE};
export type { SolMethodInterface };
