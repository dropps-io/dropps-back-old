import { Log } from '../../../api/src/models/types/log';
import { SolMethod } from '../../../api/src/models/types/sol-method';
import { queryMethodInterfaceWithParameters } from '../../../api/src/lib/db/queries/method-interface.table';
import { web3 } from '../../../api/src/lib/web3';
import { incrementExtractedToLogOf, reportIndexingScriptError } from '../index-logger';

export async function extractLog(
  log: Log,
): Promise<{ eventInterface: SolMethod; params: { [p: string]: string } }> {
  let eventInterface: SolMethod | undefined;
  let decodedParameters: { [key: string]: string } = {};
  try {
    eventInterface = await queryMethodInterfaceWithParameters(log.topics[0].slice(0, 10));
    incrementExtractedToLogOf('knownEvent');
  } catch (e) {
    incrementExtractedToLogOf('unknownEvent');
    throw 'No method interface found';
  }

  try {
    if (eventInterface.parameters)
      decodedParameters = !eventInterface.name
        ? {}
        : web3.eth.abi.decodeLog(
            eventInterface.parameters,
            log.data,
            log.topics.filter((x, i) => i !== 0),
          );
  } catch (e) {
    await reportIndexingScriptError('extractLog:params', e);
    return { eventInterface, params: {} };
  }

  return { eventInterface, params: decodedParameters };
}
