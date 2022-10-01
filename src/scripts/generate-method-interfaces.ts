import {AbiInput, AbiItem} from "web3-utils";
import keccak256 from "keccak256";
import {insertMethodInterface} from "../bin/db/method-interface.table";
import {insertMethodParameter} from "../bin/db/method-parameter.table";
import {SolMethod} from "../models/types/sol-method";
import {tryExecuting} from "../bin/utils/try-executing";
import {logError} from "../bin/logger";

export async function generateAndPersistMethodInterfaces(contractAbis: AbiItem[][]): Promise<SolMethod[]> {
    const interfaces: SolMethod[] = [];

    contractAbis.forEach(abis => {
        abis.forEach(abi => {
            if (abi.name && (abi.type === 'event' || abi.type === 'function') && (abi.stateMutability !== 'pure' && abi.stateMutability !== 'view')) {
                const skeleton = generateMethodSkeleton(abi);
                const methodHash = '0x' + keccak256(skeleton).toString('hex');
                if (interfaces.filter(x => x.hash === methodHash).length === 0)
                    interfaces.push({name: abi.name, type: abi.type, hash: methodHash, id: methodHash.slice(0, 10), parameters: abi.inputs as AbiInput[]});
            }
        });
    });

    for (let methodInterface of interfaces) {
        try {
            await tryExecuting(insertMethodInterface(methodInterface.id, methodInterface.hash, methodInterface.name, methodInterface.type));
            let n = 0;
            for (let parameter of methodInterface.parameters) {
                await tryExecuting(insertMethodParameter(methodInterface.id, parameter.name, parameter.type, n, parameter.indexed));
                n++;
            }
        } catch (e) {
            logError(e);
        }
    }

    return interfaces;
}

function generateMethodSkeleton(abi: AbiItem): string {
    let skeleton = abi.name + '(';

    if (abi.inputs && abi.inputs.length > 0) {
        for (let i = 0; i < abi.inputs?.length; i++) {
            skeleton += abi.inputs[i].type;
            if (i === abi.inputs.length - 1) skeleton += ')';
            else skeleton += ',';
        }
    } else skeleton += ')';

    return skeleton;
}