import {describe} from "mocha";
import {clearDB} from "../../helpers/database-helper";
import {fastify} from "../../../lib/fastify";
import {generateJWT} from "../../../bin/json-web-token";
import {expect} from "chai";
import {insertContract} from "../../../bin/db/contract.table";
import {insertContractInterface} from "../../../bin/db/contract-interface.table";
import {MAX_OFFCHAIN_REGISTRY_CHANGES} from "../../../environment/config";
import {executeQuery} from "../../../bin/db/database";

export const LooksoTests = () => {
  describe('lookso routes', () => {

    const HACKER_MAN_UP = '0x8E3772C0f495953FdA17bb89e68f2a2da18556A4';
    const HACKER_MAN_JWT = generateJWT(HACKER_MAN_UP);

    const SERIOUS_MAN_UP = '0x7741002f573940488265c8b676EE236FC0dF2714';
    const SERIOUS_MAN_JWT = generateJWT(SERIOUS_MAN_UP);

    describe('POST lookso/follow', () => {

      beforeEach(async () => {
        await clearDB();
        await insertContractInterface('LSP0', '0xid', 'Universal Profile');
        await insertContract(HACKER_MAN_UP, 'LSP0');
        await insertContract(SERIOUS_MAN_UP, 'LSP0');
      });

      it('should return 400 if incorrect address', async () => {
        const res = await fastify.inject({method: 'POST', url: '/lookso/follow' , payload: {
            following: SERIOUS_MAN_UP + 'c',
            follower: HACKER_MAN_UP
          },
          headers: {
            authorization: 'Bearer ' + HACKER_MAN_JWT
          }
        });

        expect(res.statusCode).to.equal(400);
      });

      it('should return 409 if already following', async () => {
        await fastify.inject({method: 'POST', url: '/lookso/follow' , payload: {
            following: SERIOUS_MAN_UP,
            follower: HACKER_MAN_UP
          },
          headers: {
            authorization: 'Bearer ' + HACKER_MAN_JWT
          }
        });

        const res = await fastify.inject({method: 'POST', url: '/lookso/follow' , payload: {
            following: SERIOUS_MAN_UP,
            follower: HACKER_MAN_UP
          },
          headers: {
            authorization: 'Bearer ' + HACKER_MAN_JWT
          }
        });

        expect(res.statusCode).to.equal(409);
      });

      it('should return 409 if changes count exceed limit', async () => {
        let query = 'INSERT INTO "registry_change" VALUES (\'' + HACKER_MAN_UP + '\', \'follow\', \'' + Math.random().toString() + '\', \'\', \'' + new Date().toDateString() + '\')';
        for (let i = 0 ; i < MAX_OFFCHAIN_REGISTRY_CHANGES - 1 ; i++) query += ', (\'' + HACKER_MAN_UP + '\', \'follow\', \'' + Math.random().toString() + '\', \'\', \'' + new Date().toDateString() + '\')';
        await executeQuery(query);

        const res = await fastify.inject({method: 'POST', url: '/lookso/follow' , payload: {
            following: SERIOUS_MAN_UP,
            follower: HACKER_MAN_UP
          },
          headers: {
            authorization: 'Bearer ' + HACKER_MAN_JWT
          }
        });

        expect(res.statusCode).to.equal(409);
      });

      it('should return registry json url if reach limit of changes', async () => {
        let query = 'INSERT INTO "registry_change" VALUES (\'' + HACKER_MAN_UP + '\', \'follow\', \'' + Math.random().toString() + '\', \'\', \'' + new Date().toDateString() + '\')';
        for (let i = 0 ; i < MAX_OFFCHAIN_REGISTRY_CHANGES - 2 ; i++) query += ', (\'' + HACKER_MAN_UP + '\', \'follow\', \'' + Math.random().toString() + '\', \'\', \'' + new Date().toDateString() + '\')';
        await executeQuery(query);

        const res = await fastify.inject({method: 'POST', url: '/lookso/follow' , payload: {
            following: SERIOUS_MAN_UP,
            follower: HACKER_MAN_UP
          },
          headers: {
            authorization: 'Bearer ' + HACKER_MAN_JWT
          }
        });

        expect(res.statusCode).to.equal(200);
        expect(res.body).exist.not.null;
      });

      it('should return 200 if correct request', async () => {
        const res = await fastify.inject({method: 'POST', url: '/lookso/follow' , payload: {
            following: SERIOUS_MAN_UP,
            follower: HACKER_MAN_UP
          },
          headers: {
            authorization: 'Bearer ' + HACKER_MAN_JWT
          }
        });

        expect(res.statusCode).to.equal(200);
      });




    });

  });
}

