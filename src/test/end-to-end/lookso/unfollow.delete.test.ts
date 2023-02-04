import {describe} from "mocha";
import {clearDB} from "../../helpers/database-helper";
import {insertContractInterface} from "../../../lib/db/queries/contract-interface.table";
import {insertContract} from "../../../lib/db/queries/contract.table";
import {fastify} from "../../../api/fastify";
import {expect} from "chai";
import {MAX_OFFCHAIN_REGISTRY_CHANGES} from "../../../environment/config";
import {executeQuery} from "../../../lib/db/queries/database";
import {queryFollow} from "../../../lib/db/queries/follow.table";
import {queryRegistryChangesOfAddress} from "../../../lib/db/queries/registry-change.table";
import {HACKER_MAN_JWT, HACKER_MAN_UP, SERIOUS_MAN_JWT, SERIOUS_MAN_UP} from "../../helpers/constants";

export const UnfollowDELETERouteTests = () => {

  describe('DELETE lookso/unfollow', () => {

    beforeEach(async () => {
      await clearDB();
      await insertContractInterface('LSP0', '0xid', 'Universal Profile');
      await insertContract(HACKER_MAN_UP, 'LSP0');
      await insertContract(SERIOUS_MAN_UP, 'LSP0');

      await fastify.inject({method: 'POST', url: '/lookso/follow' , payload: {
          following: SERIOUS_MAN_UP,
          follower: HACKER_MAN_UP
        },
        headers: {
          authorization: 'Bearer ' + HACKER_MAN_JWT
        }
      });
    });

    it('should return 400 if incorrect address', async () => {
      const res = await fastify.inject({method: 'DELETE', url: '/lookso/unfollow' , payload: {
          following: SERIOUS_MAN_UP + 'c',
          follower: HACKER_MAN_UP
        },
        headers: {
          authorization: 'Bearer ' + HACKER_MAN_JWT
        }
      });

      expect(res.statusCode).to.equal(400);
    });

    it('should return 403 if wrong JWT', async () => {
      const res = await fastify.inject({method: 'DELETE', url: '/lookso/unfollow' , payload: {
          following: SERIOUS_MAN_UP,
          follower: HACKER_MAN_UP
        },
        headers: {
          authorization: 'Bearer ' + SERIOUS_MAN_JWT
        }
      });

      expect(res.statusCode).to.equal(403);
    });

    it('should return 409 if changes count exceed limit', async () => {
      let query = 'INSERT INTO "registry_change" VALUES (\'' + HACKER_MAN_UP + '\', \'follow\', \'' + Math.random().toString() + '\', \'\', \'' + new Date().toDateString() + '\')';
      for (let i = 0 ; i < MAX_OFFCHAIN_REGISTRY_CHANGES - 2 ; i++) query += ', (\'' + HACKER_MAN_UP + '\', \'follow\', \'' + Math.random().toString() + '\', \'\', \'' + new Date().toDateString() + '\')';
      await executeQuery(query);

      const res = await fastify.inject({method: 'DELETE', url: '/lookso/unfollow' , payload: {
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
      for (let i = 0 ; i < MAX_OFFCHAIN_REGISTRY_CHANGES - 3 ; i++) query += ', (\'' + HACKER_MAN_UP + '\', \'follow\', \'' + Math.random().toString() + '\', \'\', \'' + new Date().toDateString() + '\')';
      await executeQuery(query);

      const res = await fastify.inject({method: 'DELETE', url: '/lookso/unfollow' , payload: {
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
      const res = await fastify.inject({method: 'DELETE', url: '/lookso/unfollow' , payload: {
          following: SERIOUS_MAN_UP,
          follower: HACKER_MAN_UP
        },
        headers: {
          authorization: 'Bearer ' + HACKER_MAN_JWT
        }
      });

      expect(res.statusCode).to.equal(200);
    });

    it('should properly update the database', async () => {
      await fastify.inject({method: 'DELETE', url: '/lookso/unfollow' , payload: {
          following: SERIOUS_MAN_UP,
          follower: HACKER_MAN_UP
        },
        headers: {
          authorization: 'Bearer ' + HACKER_MAN_JWT
        }
      });

      const res = await queryFollow(HACKER_MAN_UP, SERIOUS_MAN_UP);

      expect(res).to.equal(false);
    });

    it('should properly create a registry change entry', async () => {
      await executeQuery('DELETE FROM "registry_change"');
      await fastify.inject({method: 'DELETE', url: '/lookso/unfollow' , payload: {
          following: SERIOUS_MAN_UP,
          follower: HACKER_MAN_UP
        },
        headers: {
          authorization: 'Bearer ' + HACKER_MAN_JWT
        }
      });

      const res = await queryRegistryChangesOfAddress(HACKER_MAN_UP);

      expect(res[0].address).to.equal(HACKER_MAN_UP);
      expect(res[0].type).to.equal('follow');
      expect(res[0].action).to.equal('remove');
      expect(res[0].value).to.equal(SERIOUS_MAN_UP);
    });

  });
}