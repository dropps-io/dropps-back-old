import axios from 'axios';

import { textMethodSignatureExtraction } from '../../apps/api/src/lib/utils/text-signature-extraction';
import { insertMethodInterface } from '../../apps/api/src/lib/db/queries/method-interface.table';
import { insertMethodParameter } from '../../apps/api/src/lib/db/queries/method-parameter.table';
import { executeQuery } from '../../apps/api/src/lib/db/queries/database';
import { sleep } from '../../apps/indexing/src/utils/sleep';

export async function fourBytesDictionaryFetch(_n: number, _next?: string) {
  let next = _next,
    n = _n;
  try {
    do {
      const methodInterfaces: any = await axios.get(
        next ? next : 'https://www.4byte.directory/api/v1/signatures/?ordering=created_at',
      );
      next = methodInterfaces.data.next;
      for (const result of methodInterfaces.data.results as any[]) {
        try {
          await executeQuery('DELETE FROM method_parameter WHERE "methodId" = $1', [
            result.hex_signature,
          ]);
          const extractedMethod = textMethodSignatureExtraction(result.text_signature);
          await insertMethodInterface(result.hex_signature, '', extractedMethod.name, 'function');
          let n = 0;
          for (const param of extractedMethod.params) {
            await insertMethodParameter(result.hex_signature, '', param, n);
            n++;
          }
        } catch (e) {
          console.error(e);
        }
      }
      console.log('Page ' + n + ' extracted');
      console.log(next);
      n++;
    } while (next);
  } catch (e) {
    await sleep(5000);
    fourBytesDictionaryFetch(n, next);
  }
}

fourBytesDictionaryFetch(0);
