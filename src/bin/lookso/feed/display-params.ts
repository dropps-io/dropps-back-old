import {queryContract} from "../../db/contract.table";
import {Contract} from "../../../models/types/contract";
import {queryContractName} from "../../db/contract-metadata.table";
import Web3 from "web3";

export async function getDisplayParam(value: string, type: string) {
    switch (type) {
        case 'address':
            return {...await queryAddressDisplayParam(value), type};
        case 'native':
            return {value: Web3.utils.fromWei(value, 'ether'), type};
        default:
            return {value, type};
    }
}

async function queryAddressDisplayParam(address:string): Promise<{ address:string, interfaceCode: string | null, name: string }> {
    let contract: Contract, name: string;
    try {
        contract = await queryContract(address);
    } catch (e) {
        return {address, name: '', interfaceCode: ''};
    }

    if (!contract || !contract.interfaceCode) return {address, name: '', interfaceCode: ''};

    try {
        name = await queryContractName(address);
    } catch (e) {
        return {...contract, name: ''};
    }

    return  {...contract, name};
}