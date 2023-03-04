import { AbiInput, AbiItem } from 'web3-utils';
import keccak256 from 'keccak256';

import { insertMethodInterface } from '../../apps/api/src/lib/db/queries/method-interface.table';
import { insertMethodParameter } from '../../apps/api/src/lib/db/queries/method-parameter.table';
import { SolMethod } from '../../apps/api/src/models/types/sol-method';
import { tryExecuting } from '../../apps/api/src/lib/utils/try-executing';
import { logError } from '../../apps/api/src/lib/logger';

export async function generateAndPersistMethodInterfaces(
  contractAbis: AbiItem[][],
): Promise<SolMethod[]> {
  const interfaces: SolMethod[] = [];

  contractAbis.forEach((abis) => {
    abis.forEach((abi) => {
      if (
        abi.name &&
        (abi.type === 'event' || abi.type === 'function') &&
        abi.stateMutability !== 'pure' &&
        abi.stateMutability !== 'view'
      ) {
        const skeleton = generateMethodSkeleton(abi);
        const methodHash = '0x' + keccak256(skeleton).toString('hex');
        if (interfaces.filter((x) => x.hash === methodHash).length === 0)
          interfaces.push({
            name: abi.name,
            type: abi.type,
            hash: methodHash,
            id: methodHash.slice(0, 10),
            parameters: abi.inputs as AbiInput[],
          });
      }
    });
  });

  for (const methodInterface of interfaces) {
    try {
      await tryExecuting(
        insertMethodInterface(
          methodInterface.id,
          methodInterface.hash,
          methodInterface.name,
          methodInterface.type,
        ),
      );
      let n = 0;
      for (const parameter of methodInterface.parameters) {
        await tryExecuting(
          insertMethodParameter(
            methodInterface.id,
            parameter.name,
            parameter.type,
            n,
            parameter.indexed,
          ),
        );
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
