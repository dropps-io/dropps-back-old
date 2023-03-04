import { ERC725JSONSchema } from '@erc725/erc725.js';

import { insertErc725ySchema } from '../../lib/db/queries/erc725y-schema.table';
import { tryExecuting } from '../../lib/utils/try-executing';

export async function insertInDbJsonSchemas(schemasList: ERC725JSONSchema[][]) {
  for (const schemaList of schemasList) {
    for (const schema of schemaList) {
      await tryExecuting(
        insertErc725ySchema(
          schema.key,
          schema.name,
          schema.keyType,
          schema.valueType,
          schema.valueContent,
        ),
      );
    }
  }
}
