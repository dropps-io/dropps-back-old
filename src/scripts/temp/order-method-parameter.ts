import {DB, executeQuery} from "../../bin/db/database";
import {queryMethodInterfacesByType} from "../../bin/db/method-interface.table";
import {queryMethodParameters} from "../../bin/db/method-parameter.table";

export async function orderMethodParameter() {
  await executeQuery('ALTER TABLE method_parameter ADD "position" integer');
  console.log(1)
  let interfaces = await queryMethodInterfacesByType('event');
  interfaces = interfaces.concat(await queryMethodInterfacesByType('function'));

  for (const methodInterface of interfaces) {
    const parameters = await queryMethodParameters(methodInterface.id);
    let n = 0;
    for (const param of parameters) {
      await executeQuery('UPDATE method_parameter SET position = $1 WHERE "methodId" = $2 AND name = $3', [n, param.methodId, param.name]);
      n++;
    }
  }

  await executeQuery('ALTER TABLE method_parameter ALTER COLUMN position SET NOT NULL');
  await DB.end();
}

orderMethodParameter();