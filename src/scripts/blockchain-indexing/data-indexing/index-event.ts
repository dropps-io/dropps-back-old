import {insertEvent, queryEventByTh} from "../../../bin/db/event.table";
import {insertPost} from "../../../bin/db/post.table";
import keccak256 from "keccak256";
import {web3} from "../../../bin/web3/web3";
import {insertDecodedEventParameter} from "../../../bin/db/decoded-event-parameter.table";
import {Log} from "../../../models/types/log";
import {SolMethod} from "../../../models/types/sol-method";
import {INDEX_DATA} from "../config";
import {logError} from "../../../bin/logger";

export async function indexEvent(log: Log, decodedParameters: {[p: string]: string}, eventInterface: SolMethod) {
  if (!INDEX_DATA || !log.id) return;
  try {
    const logIndexed = !!(await queryEventByTh(log.transactionHash, (log.id as string).slice(4, 12)));
    if (logIndexed) return;
    const eventId: number = await insertEvent(log.address, log.transactionHash, (log.id as string).slice(4, 12), log.blockNumber, log.topics[0], eventInterface.name ? eventInterface.name : '');
    await insertPost('0x' + keccak256(JSON.stringify(log)).toString('hex'), log.address, new Date(((await web3.eth.getBlock(log.blockNumber)).timestamp as number) * 1000), '', '', null, null, eventId);
    for (let parameter of eventInterface.parameters.map((x) => {return {...x, value: decodedParameters[x.name]}})) {
      await insertDecodedEventParameter(eventId, parameter.value ? parameter.value : '' , parameter.name, parameter. type);
    }
  } catch (e) {
    logError(e);
  }
}