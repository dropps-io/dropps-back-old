import {LightMyRequestResponse} from "fastify";
import {clearDB} from "../../helpers/database-helper";
import {assert, expect} from "chai";
import {insertContract} from "../../../bin/db/contract.table";
import {extractTransaction} from "../../../scripts/blockchain-indexing/extraction/extract-transaction";
import {indexTransaction} from "../../../scripts/blockchain-indexing/indexing/index-transaction";
import {insertContractMetadata} from "../../../bin/db/contract-metadata.table";
import {insertImage} from "../../../bin/db/image.table";
import {fastify} from "../../../lib/fastify";
import {insertMethodInterface} from "../../../bin/db/method-interface.table";
import {insertMethodParameter} from "../../../bin/db/method-parameter.table";
import {GetTransactionResponse} from "../../../lib/routes/lookso/lookso-tx.route";

export const TxGetTests = () => {

  describe('GET lookso/tx/:hash', () => {

    const TX_HASH_KNOWN = '0x2ca290ebbb726586d998ccda69a7438b0ddeef4812e36073e44f291d1247e1a4';
    const TX_HASH_UNKNOWN = '0x6d710610a4ac6888885c7fa3463bbc70fc88e4a9b8c73a3be7a219f6601bdbf8';

    let res: LightMyRequestResponse;

    const expectedResponse: GetTransactionResponse ={
      hash: "0x2ca290ebbb726586d998ccda69a7438b0ddeef4812e36073e44f291d1247e1a4",
      from: "0x24b04685eFf4dBCc6382715c73f4a61566d4967e",
      to: "0x42d6fE6eb3Fc1E5585Ab958Fb77780327991781B",
      value: "0",
      input: "0x902d5fa00000000000000000000000000000000000000000000000000000000000000060000000000000000000000000000007e60000000000000000000000000000000900000000000000000000000000000000000000000000000000000000000000e0000000000000000000000000000000000000000000000000000000000000004178fe71934d531476f56699066184630033129e6c4ac3f9475c6e1c50f1a5ff87495f1e40bf0b50726504b3353311ea678abbdcd5ee5dcc96e97ab05fa967a6731b00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000016444c028fe0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000e557cbf347eef6575d04e412a052933f3bd84df80000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000000a4af255b61000000000000000000000000e905eacee9b020c8d024f25fcad60df0ed195064756e646566696e656400000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
      blockNumber: 1735565,
      methodId: "0x902d5fa0",
      decodedFunctionCallParts: [
        {
          contract: {
            address: "0x42d6fE6eb3Fc1E5585Ab958Fb77780327991781B"
          },
          methodInterface: {
            id: "0x902d5fa0",
            name: "executeRelayCall"
          },
          decodedParameters: [
            {
              name: "signature",
              type: "bytes",
              value: "0x78fe71934d531476f56699066184630033129e6c4ac3f9475c6e1c50f1a5ff87495f1e40bf0b50726504b3353311ea678abbdcd5ee5dcc96e97ab05fa967a6731b"
            },
            {
              name: "nonce",
              type: "uint256",
              value: "688050945914137573122943456227035323564041"
            },
            {
              name: "payload",
              type: "bytes",
              value: "0x44c028fe0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000e557cbf347eef6575d04e412a052933f3bd84df80000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000000a4af255b61000000000000000000000000e905eacee9b020c8d024f25fcad60df0ed195064756e646566696e6564000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000080000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000"
            }
          ]
        },
        {
          contract: {
            address: "0xE905EaceE9B020C8D024f25FCAd60Df0ED195064",
            standard: "LSP0",
            name: "Dennis",
            image: "ipfs://QmXojnbciwL1XVe23rFu59AHtqNZPgPMoSYqMtT3jCBHiz"
          },
          methodInterface: {
            id: "0x44c028fe",
            name: "execute"
          },
          decodedParameters: [
            {
              name: "operation",
              type: "uint256",
              value: "0"
            },
            {
              name: "to",
              type: "address",
              value: "0xe557CbF347EEF6575D04e412A052933F3bD84dF8"
            },
            {
              name: "value",
              type: "uint256",
              value: "0"
            },
            {
              name: "data",
              type: "bytes",
              value: "0xaf255b61000000000000000000000000e905eacee9b020c8d024f25fcad60df0ed195064756e646566696e65640000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000800000000000000000000000000000000000000000000000000000000000000000"
            }
          ]
        },
        {
          contract: {
            address: "0xe557CbF347EEF6575D04e412A052933F3bD84dF8",
            standard: "LSP8",
            name: "Collection with counter",
            image: "ipfs://Qmam5zvRwdWruVssnb7sYhJkrNVguVR7yTpAJcmpk9TXJo"
          },
          methodInterface: {
            id: "0xaf255b61",
            name: "mint",
          },
          decodedParameters: [
            {
              name: "to",
              type: "address",
              value: "0xE905EaceE9B020C8D024f25FCAd60Df0ED195064"
            },
            {
              name: "tokenId",
              type: "bytes32",
              value: "0x756e646566696e65640000000000000000000000000000000000000000000000"
            },
            {
              name: "force",
              type: "bool",
              value: 'false'
            },
            {
              name: "data",
              type: "bytes",
              value: 'null'
            }
          ]
        }
      ]
    }

    let payload: GetTransactionResponse;

    beforeEach(async () => {
      await clearDB();
      await insertMethodInterface('0xaf255b61', '0xaf255b61', 'mint', 'function');
      await insertMethodParameter('0xaf255b61', 'to', 'address', 0, false);
      await insertMethodParameter('0xaf255b61', 'tokenId', 'bytes32', 1, false)
      await insertMethodParameter('0xaf255b61', 'force', 'bool', 2, false);
      await insertMethodParameter('0xaf255b61', 'data', 'bytes', 3, false);
      await insertContract('0x42d6fE6eb3Fc1E5585Ab958Fb77780327991781B', null);
      await insertContract('0xE905EaceE9B020C8D024f25FCAd60Df0ED195064', 'LSP0');
      await insertContractMetadata('0xE905EaceE9B020C8D024f25FCAd60Df0ED195064', 'Dennis', '', '', false, '');
      await insertImage('0xE905EaceE9B020C8D024f25FCAd60Df0ED195064', 'ipfs://QmXojnbciwL1XVe23rFu59AHtqNZPgPMoSYqMtT3jCBHiz', 300, 300, 'profile', '0x00');
      await insertContract('0xe557CbF347EEF6575D04e412A052933F3bD84dF8', 'LSP8');
      await insertContractMetadata('0xe557CbF347EEF6575D04e412A052933F3bD84dF8', 'Collection with counter', '', '', false, '');
      await insertImage('0xe557CbF347EEF6575D04e412A052933F3bD84dF8', 'ipfs://Qmam5zvRwdWruVssnb7sYhJkrNVguVR7yTpAJcmpk9TXJo', 300, 300, '', '0x00');
      const tx = await extractTransaction(TX_HASH_KNOWN);
      await indexTransaction(tx.transaction, tx.params, tx.decodedParams);
      res = await fastify.inject({method: 'GET', url: `/lookso/tx/${TX_HASH_KNOWN}`});
      payload = JSON.parse(res.payload);
    });

    it('should return 200', async () => {
      expect(res.statusCode).to.equal(200);
    });

    it('should return the right tx data', async () => {
      expect(payload.hash).to.equal(expectedResponse.hash);
      expect(payload.value).to.equal(expectedResponse.value);
      expect(payload.blockNumber).to.equal(expectedResponse.blockNumber);
      expect(payload.from).to.equal(expectedResponse.from);
      expect(payload.to).to.equal(expectedResponse.to);
      expect(payload.input).to.equal(expectedResponse.input);
      expect(payload.methodId).to.equal(expectedResponse.methodId);
      expect(payload.decodedFunctionCallParts.length).to.equal(expectedResponse.decodedFunctionCallParts.length);
    });

    it('should return the right decodedFunctionCallParts', async () => {
      expectedResponse.decodedFunctionCallParts.forEach((fnCall, i) => {
        expect(fnCall.contract.address).to.equal(payload.decodedFunctionCallParts[i].contract.address);
        expect(fnCall.contract.image).to.equal(payload.decodedFunctionCallParts[i].contract.image);
        expect(fnCall.contract.name).to.equal(payload.decodedFunctionCallParts[i].contract.name);
        expect(fnCall.contract.standard).to.equal(payload.decodedFunctionCallParts[i].contract.standard);
        expect(fnCall.methodInterface.id).to.equal(payload.decodedFunctionCallParts[i].methodInterface.id);
        expect(fnCall.methodInterface.name).to.equal(payload.decodedFunctionCallParts[i].methodInterface.name);

        fnCall.decodedParameters.forEach((param, j) => {
          expect(param.value).to.equal(payload.decodedFunctionCallParts[i].decodedParameters[j].value);
          expect(param.type).to.equal(payload.decodedFunctionCallParts[i].decodedParameters[j].type);
          expect(param.value).to.equal(payload.decodedFunctionCallParts[i].decodedParameters[j].value);
        });
      });
    });

    it('should return unknown function if input can\'t be decoded', async () => {
      const tx = await extractTransaction(TX_HASH_UNKNOWN);
      await indexTransaction(tx.transaction, tx.params, tx.decodedParams);
      res = await fastify.inject({method: 'GET', url: `/lookso/tx/${TX_HASH_UNKNOWN}`});
      payload = JSON.parse(res.payload);

      assert(payload.decodedFunctionCallParts[2]);
      expect(payload.decodedFunctionCallParts[2].methodInterface.name).to.equal('Unknown Function');
      expect(payload.decodedFunctionCallParts[2].decodedParameters.length).to.equal(0);
    });

    it('should return 404 if tx not found', async () => {
      res = await fastify.inject({method: 'GET', url: `/lookso/tx/0xf000df1845cb8f5cdd78985049defa2571968d8302d39fa79e55fd6ed72b91c1`});
      expect(res.statusCode).to.equal(404);
    });

  });
}