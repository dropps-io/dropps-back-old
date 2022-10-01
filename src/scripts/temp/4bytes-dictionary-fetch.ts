import axios from "axios";
import {textMethodSignatureExtraction} from "../../bin/utils/text-signature-extraction";
import {insertMethodInterface} from "../../bin/db/method-interface.table";
import {insertMethodParameter} from "../../bin/db/method-parameter.table";
import {executeQuery} from "../../bin/db/database";

export async function fourBytesDictionaryFetch() {
  let next, n = 0;
  do {
    const methodInterfaces: any = await axios.get(next ? next : 'https://www.4byte.directory/api/v1/signatures/?ordering=created_at&page=0');
    next = methodInterfaces.data.next;
    for (const result of (methodInterfaces.data.results as any[])) {
      try {
        await executeQuery('DELETE FROM method_parameter WHERE "methodId" = $1', [result.hex_signature])
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
    console.log(next)
    n++;
  } while (next);
}

fourBytesDictionaryFetch();