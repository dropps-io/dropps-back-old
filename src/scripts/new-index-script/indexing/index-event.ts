import {insertEvent} from "../../../bin/db/event.table";
import {insertPost} from "../../../bin/db/post.table";
import keccak256 from "keccak256";
import {web3} from "../../../bin/web3/web3";
import {insertDecodedEventParameter} from "../../../bin/db/decoded-event-parameter.table";
import {Log} from "../../../models/types/log";
import {SolMethod} from "../../../models/types/sol-method";
import {tryExecuting} from "../../../bin/utils/try-executing";
import {INDEX_DATA} from "../../blockchain-indexing/config";
import {reportIndexingScriptError} from "../index-logger";

export async function indexEvent(log: Log, decodedParameters: {[p: string]: string}, eventInterface?: SolMethod) {
  if (!INDEX_DATA || !log.id) return;
  let eventId: number;
  try {
    eventId = await insertEvent(log.address, log.transactionHash, (log.id as string).slice(4, 12), log.blockNumber, log.topics[0], eventInterface ? eventInterface.name : '');
    await insertPost('0x' + keccak256(JSON.stringify(log)).toString('hex'), log.address, new Date(((await web3.eth.getBlock(log.blockNumber)).timestamp as number) * 1000), '', '', null, null, eventId);
  } catch (e) {
    await reportIndexingScriptError('indexEvent', e);
    return;
  }
  if (eventInterface) {
    for (let parameter of eventInterface.parameters.map((x) => {return {...x, value: decodedParameters[x.name]}})) {
      try {
        await tryExecuting(insertDecodedEventParameter(eventId, parameter.value ? parameter.value : '' , parameter.name, parameter. type));
      }
      catch (e) {
        await reportIndexingScriptError('indexEvent:params', e);
      }
    }
  }
}