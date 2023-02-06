import { insertMethodDisplay } from '../../lib/db/queries/method-display.table';
import { executeQuery } from '../../lib/db/queries/database';
import { insertKeyDisplay } from '../../lib/db/queries/key-display.table';
import { insertMethodParameterDisplayType } from '../../lib/db/queries/method-parameter.table';
import { setErc725ySchemaValueDisplay } from '../../lib/db/queries/erc725y-schema.table';

export async function setDisplays() {
  await executeQuery('delete from "key_display"');
  await executeQuery('delete from "method_display"');
  await insertMethodDisplay(
    '0x4e71e0c8',
    'Claimed ownership on the {executionContract} contract',
    '',
    '',
    '',
  );
  await insertMethodDisplay(
    '0x715018a6',
    'Renounced ownership on the {executionContract} contract',
    '',
    '',
    '',
  );
  await insertMethodDisplay(
    '0x14a6e293',
    'Set the value {dataValue} for the key {dataKey} on {executionContract}',
    '',
    '',
    '',
  );
  await insertMethodDisplay(
    '0x7f23690c',
    'Set the value {dataValue} for the key {dataKey} on {executionContract}',
    '',
    '',
    '',
  );
  await insertMethodDisplay(
    '0xf2fde38b',
    'Transferred ownership of {executionContract} to {_newOwner}',
    '',
    '',
    '',
  );
  await insertMethodDisplay(
    '0xcf5182ba',
    'Authorized {operator} to manage {executionContract} {tokenId}',
    'executionContract',
    '',
    'executionContract',
  );
  await insertMethodDisplay(
    '0xaf255b61',
    'Minted token {tokenId} on {executionContract} ',
    'executionContract',
    '',
    'executionContract',
  );
  await insertMethodDisplay(
    '0x0b0c6d82',
    "Revoked {operator}'s authorization to manage {executionContract} {tokenId}",
    'executionContract',
    '',
    'executionContract',
  );
  await insertMethodDisplay(
    '0x511b6952',
    'Transferred token {tokenId} of {executionContract}  to {to}',
    'executionContract',
    '',
    'executionContract',
  );
  await insertMethodDisplay(
    '0x55908868',
    'Transferred token {tokenId} of {executionContract} to {to}',
    'executionContract',
    '',
    'executionContract',
  );
  await insertMethodDisplay(
    '0x47980aa3',
    'Authorized {operator} to manage {amount} {executionContract}',
    'executionContract',
    '',
    'executionContract',
  );
  await insertMethodDisplay(
    '0x7580d920',
    'Minted {amount} {executionContract} to {to}',
    'executionContract',
    '',
    'executionContract',
  );
  await insertMethodDisplay(
    '0xfad8b32a',
    "Revoked {operator}'s authorization to manage {executionContract}",
    'executionContract',
    '',
    'executionContract',
  );
  await insertMethodDisplay(
    '0x760d9bba',
    'Transferred {amount} {executionContract} to {to}',
    'executionContract',
    '',
    'executionContract',
  );
  await insertMethodDisplay(
    '0xa8a34e0a',
    'Transferred {amount} {executionContract} to {to}',
    'executionContract',
    '',
    'executionContract',
  );
  await insertMethodDisplay(
    '0xf5298aca',
    'Burned {value} {executionContract}',
    'executionContract',
    '',
    'executionContract',
  );
  await insertMethodDisplay(
    '0x2f2ff15d',
    'Granted {account} the following role: {role}',
    'executionContract',
    '',
    'executionContract',
  );
  await insertMethodDisplay(
    '0x8456cb59',
    'Paused the {executionContract} contract',
    'executionContract',
    '',
    'executionContract',
  );
  await insertMethodDisplay(
    '0x36568abe',
    'Renounced the {role} role for the {executionContract} contract',
    'executionContract',
    '',
    'executionContract',
  );
  await insertMethodDisplay(
    '0xd547741f',
    "Revoked {account}'s {role} role for the {executionContract} contract",
    'executionContract',
    '',
    'executionContract',
  );
  await insertMethodDisplay(
    '0x3f4ba83a',
    'Unpaused the {executionContract} contract',
    'executionContract',
    '',
    'executionContract',
  );
  await insertMethodDisplay(
    '0x095ea7b3',
    'Approved an expenditure of {value} {executionContract} by {spender}',
    'executionContract',
    '',
    'executionContract',
  );
  await insertMethodDisplay(
    '0xfc673c4f',
    'Authorized {account} to burn {amount} {executionContract}',
    'executionContract',
    '',
    'executionContract',
  );
  await insertMethodDisplay(
    '0x62ad1b83',
    'Authorized {account} to send {amount} {executionContract}',
    'executionContract',
    '',
    'executionContract',
  );
  await insertMethodDisplay(
    '0x9bd9bbc6',
    'Sent {amount} {executionContract} to {recipient}',
    'executionContract',
    '',
    'executionContract',
  );
  await insertMethodDisplay(
    '0xa9059cbb',
    'Transferred {amount} {executionContract} to {recipient}',
    'executionContract',
    '',
    'executionContract',
  );
  await insertMethodDisplay(
    '0x23b872dd',
    'Instructed a transfer of {amount} {executionContract} from {holder} to {recipient}',
    'executionContract',
    '',
    'executionContract',
  );
  await insertMethodDisplay(
    '0x42966c68',
    'Burned {executionContract} {tokenId}',
    'executionContract',
    '',
    'executionContract',
  );
  await insertMethodDisplay(
    '0x40c10f19',
    'Minted {amount} {executionContract}',
    'executionContract',
    '',
    'executionContract',
  );
  await insertMethodDisplay(
    '0x01c42bd7',
    'Created {contractAddress}',
    'contractAddress',
    '',
    'contractAddress',
  );
  await insertMethodDisplay('0xcdf4e344', 'Value of {dataKey} changed', '', '', '');
  await insertMethodDisplay('0xece57460', 'Value of {dataKey} changed to {dataValue}', '', '', '');
  await insertMethodDisplay('0x48108744', 'Executed {selector} on {to}', 'to', '', 'to');
  await insertMethodDisplay(
    '0x8be0079c',
    'Transferred ownership from {previousOwner} to {newOwner}',
    '',
    '',
    '',
  );
  await insertMethodDisplay(
    '0x7e71433d',
    'Received {value}{nativeToken} from {sender}',
    'sender',
    '',
    '',
  );
  await insertMethodDisplay('0x9c3ba68e', 'Received {from}', 'from', '', 'from');
  await insertKeyDisplay(
    '0x5ef83ad9559033e6e941db7d7c495acdce616347d28e90c7ce47cbfcfcad3bc5',
    'Profile metadata updated',
    'Profile metadata updated',
  );
  await insertKeyDisplay(
    '0x4b80742de2bf82acb3630000<address>',
    'Permissions of {address} set to {dataValue}',
    'Permissions set for {address}',
  );
  await insertMethodParameterDisplayType('0x7580d920', 'amount', 'tokenAmount');
  await insertMethodParameterDisplayType('0x760d9bba', 'amount', 'tokenAmount');
  await insertMethodParameterDisplayType('0x7e71433d', 'value', 'native');
  await insertMethodParameterDisplayType('0x48108744', 'selector', 'methodId');
  await insertMethodParameterDisplayType('0x6b934045', 'selector', 'methodId');
  await setErc725ySchemaValueDisplay('0x4b80742de2bf82acb3630000<address>', 'permissions');
}
