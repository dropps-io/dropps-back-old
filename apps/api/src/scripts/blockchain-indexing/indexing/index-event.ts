import keccak256 from 'keccak256';

import { insertEvent } from '../../../lib/db/queries/event.table';
import { insertPost } from '../../../lib/db/queries/post.table';
import { web3 } from '../../../lib/web3';
import { insertDecodedEventParameter } from '../../../lib/db/queries/decoded-event-parameter.table';
import { Log } from '../../../models/types/log';
import { SolMethod } from '../../../models/types/sol-method';
import { tryExecuting } from '../../../lib/utils/try-executing';
import { reportIndexingScriptError } from '../index-logger';
import { INDEX_DATA } from '../config';

const trustedEvents = [
  '0x01c42bd7e97a66166063b02fce6924e6656b6c2c61966630165095c4fb0b7b2f',
  '0x4810874456b8e6487bd861375cf6abd8e1c8bb5858c8ce36a86a04dabfac199e',
  '0xcdf4e344c0d23d4cdd0474039d176c55b19d531070dbe17856bfb993a5b5720b',
  '0xece574603820d07bc9b91f2a932baadf4628aabcb8afba49776529c14a6104b2',
  '0x9c3ba68eb5742b8e3961aea0afc7371a71bf433c8a67a831803b64c064a178c2',
  '0x8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e0',
  '0x7e71433ddf847725166244795048ecf3e3f9f35628254ecbf736056664233493',
];

export async function indexEvent(
  log: Log,
  decodedParameters: { [p: string]: string },
  eventInterface?: SolMethod,
) {
  if (!INDEX_DATA || !log.id) return;
  let eventId: number;
  try {
    eventId = await insertEvent(
      log.address,
      log.transactionHash,
      (log.id as string).slice(4, 12),
      log.blockNumber,
      log.topics[0],
      eventInterface ? eventInterface.name : '',
    );
    const trusted = trustedEvents.includes(log.topics[0]);
    await insertPost(
      '0x' + keccak256(JSON.stringify(log)).toString('hex'),
      log.address,
      new Date(((await web3.eth.getBlock(log.blockNumber)).timestamp as number) * 1000),
      '',
      '',
      null,
      null,
      eventId,
      trusted,
    );
  } catch (e) {
    await reportIndexingScriptError('indexEvent', e);
    return;
  }
  if (eventInterface) {
    for (const parameter of eventInterface.parameters.map((x) => {
      return { ...x, value: decodedParameters[x.name] };
    })) {
      try {
        await tryExecuting(
          insertDecodedEventParameter(
            eventId,
            parameter.value ? parameter.value : '',
            parameter.name,
            parameter.type,
          ),
        );
      } catch (e) {
        await reportIndexingScriptError('indexEvent:params', e);
      }
    }
  }
}
