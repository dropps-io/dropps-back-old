import {queryContract} from "../../db/contract.table";
import {Contract} from "../../../models/types/contract";
import {queryContractName} from "../../db/contract-metadata.table";
import Web3 from "web3";
import {FeedDisplayParam} from "../../../models/types/feed-post";

export async function getDisplayParam(value: string, type: string): Promise<FeedDisplayParam> {
    switch (type) {
        case 'address':
            return {...await queryAddressDisplayParam(value)};
        case 'native':
            return {display: Web3.utils.fromWei(value, 'ether'), value, type, additionalProperties: {}};
        default:
            return {value, display: '', type, additionalProperties: {}};
    }
}

async function queryAddressDisplayParam(address:string): Promise<FeedDisplayParam> {
    let contract: Contract, name: string;
    try {
        contract = await queryContract(address);
    } catch (e) {
        return {value: address, display: '', type: 'address', additionalProperties: {interfaceCode: ''}};
    }

    if (!contract || !contract.interfaceCode) return {value: address, display: '', type: 'address', additionalProperties: {interfaceCode: ''}};

    try {
        name = await queryContractName(address);
    } catch (e) {
        return {value: address, display: '', type: 'address', additionalProperties: {interfaceCode: contract.interfaceCode}};
    }

    return  {value: address, display: name, type: 'address', additionalProperties: {interfaceCode: contract.interfaceCode}};
}