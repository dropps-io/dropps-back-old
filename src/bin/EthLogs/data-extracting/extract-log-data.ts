import Web3 from "web3";

import {
    ContractData, DataChangedData, ExecutedData, SolMethod, SolParameterWithValue
} from "../EthLog.models";

import {extractLSP7Data} from "./contract-created/extract-lsp7-data";
import {extractLSP4Data} from "./contract-created/extract-lsp4-data";
import {extractLSP3Data} from "./contract-created/extract-lsp3-data";
import {
    methodIdToInterface
} from "./utils/method-identification";
import {EthLogs} from "../EthLogs.class";
import {topicToEvent} from "./utils/event-identification";
import {keyToERC725YSchema} from "./utils/erc725YSchema-identification";
import {ERC725, ERC725JSONSchema} from "@erc725/erc725.js";
import {ContractInterface} from "../../../models/types/contract-interface";
import {tryIdentifyingContract} from "./utils/contract-identification/identify-contract";

export async function extractContractData(address: string, web3: Web3, contractInterface?: ContractInterface): Promise<ContractData> {
    const data: ContractData = {address};
    if (contractInterface) data.interface = contractInterface;
    else {
        data.interface = await tryIdentifyingContract(address, web3);
    }
    if (!data.interface) return data;

    switch (data.interface.code) {
        case 'LSP8':
            return {LSP8: await extractLSP4Data(data.address, web3), ...data};
        case 'LSP7':
            return {LSP7: await extractLSP7Data(data.address, web3), ...data};
        case 'LSP0':
            return {LSP0: await extractLSP3Data(data.address, web3), ...data};
        default:
            return data;
    }
}

export async function extractExecutedEventData(address: string, value: number, selector: string, transactionHash: string, web3: Web3): Promise<ExecutedData> {
    const data: ExecutedData = {address, value, contract: {}, logs: new EthLogs(topicToEvent, web3.currentProvider)};

    const methodInterface: SolMethod | undefined = methodIdToInterface.get(selector);
    if (methodInterface) {
        data.interface = methodInterface;
        const transaction = await web3.eth.getTransactionReceipt(transactionHash);
        for (const log of transaction.logs) {
            // We don't add the Executed events/logs, so we avoid infinite recursive loop
            if (!log.topics[0].includes('0x48108744') && !log.topics[0].includes('0x6b934045')) await data.logs.addLogAndExtract(log);
        }
    }

    const contractData: ContractData = await extractContractData(address, web3);
    data.contract = {...contractData};

    return data;
}

export async function extractDataChangedEventData(address: string, parameters: SolParameterWithValue[], web3: Web3): Promise<DataChangedData> {
    const data: DataChangedData = {key: parameters[0].value};
    data.schema = keyToERC725YSchema.get(data.key);

    if (data.schema) {
        const erc725y = new ERC725([data.schema as ERC725JSONSchema], address, web3.currentProvider, {ipfsGateway: 'https://2eff.lukso.dev/ipfs/'});
        try {
            data.currentValue = (await erc725y.getData())[0];
        } catch (e) {
            console.error('Failed to fetch data from key ' + data.key + ' from the address ' + address);
        }
    }

    return data;
}



