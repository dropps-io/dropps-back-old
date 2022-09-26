import {describe} from "mocha";
import {clearDB} from "../../helpers/database-helper";
import {fastify} from "../../../lib/fastify";
import {generateJWT} from "../../../bin/json-web-token";
import {expect} from "chai";
import {insertContract} from "../../../bin/db/contract.table";
import {insertContractInterface} from "../../../bin/db/contract-interface.table";
import {MAX_OFFCHAIN_REGISTRY_CHANGES} from "../../../environment/config";
import {executeQuery} from "../../../bin/db/database";
import {queryFollow} from "../../../bin/db/follow.table";
import {insertPost} from "../../../bin/db/post.table";
import {queryPostLike} from "../../../bin/db/like.table";
import {queryNotificationsOfAddress} from "../../../bin/db/notification.table";
import {queryRegistryChangesOfAddress} from "../../../bin/db/registry-change.table";

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

      it('should return 403 if wrong JWT', async () => {
        const res = await fastify.inject({method: 'POST', url: '/lookso/follow' , payload: {
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

      it('should properly update the database', async () => {
        await fastify.inject({method: 'POST', url: '/lookso/follow' , payload: {
            following: SERIOUS_MAN_UP,
            follower: HACKER_MAN_UP
          },
          headers: {
            authorization: 'Bearer ' + HACKER_MAN_JWT
          }
        });

        const res = await queryFollow(HACKER_MAN_UP, SERIOUS_MAN_UP);

        expect(res).to.equal(true);
      });

      it('should properly create a notification', async () => {
        await fastify.inject({method: 'POST', url: '/lookso/follow' , payload: {
            following: SERIOUS_MAN_UP,
            follower: HACKER_MAN_UP
          },
          headers: {
            authorization: 'Bearer ' + HACKER_MAN_JWT
          }
        });

        const res = await queryNotificationsOfAddress(SERIOUS_MAN_UP, 1, 0);

        expect(res[0].sender).to.equal(HACKER_MAN_UP);
        expect(res[0].address).to.equal(SERIOUS_MAN_UP);
        expect(res[0].viewed).to.equal(false);
        expect(res[0].type).to.equal('follow');
      });

      it('should properly create a registry change entry', async () => {
        await fastify.inject({method: 'POST', url: '/lookso/follow' , payload: {
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
        expect(res[0].action).to.equal('add');
        expect(res[0].value).to.equal(SERIOUS_MAN_UP);
      });

    });




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




    describe('POST lookso/like', () => {

      const POST_HASH = '0xf1918e8562236eb17adc8502332f4c9c82bc14e19bfc0aa10ab674ff75b3d2f3';
      const POST_HASH2 = '0xf1918e8562236eb17adc8502332f4c9c82bc14e19bfc0aa10ab674ff75b3d2f2';

      beforeEach(async () => {
        await clearDB();
        await insertContractInterface('LSP0', '0xid', 'Universal Profile');
        await insertContract(HACKER_MAN_UP, 'LSP0');
        await insertContract(SERIOUS_MAN_UP, 'LSP0');
        await insertPost(POST_HASH, HACKER_MAN_UP, new Date(), '', '', null, null, null);
      });

      it('should return 400 if incorrect address', async () => {
        const res = await fastify.inject({method: 'POST', url: '/lookso/like' , payload: {
            sender: HACKER_MAN_UP + 'c',
            postHash: POST_HASH
          },
          headers: {
            authorization: 'Bearer ' + HACKER_MAN_JWT
          }
        });

        expect(res.statusCode).to.equal(400);
      });

      it('should return 404 if post doesn\'t exist', async () => {
        const res = await fastify.inject({method: 'POST', url: '/lookso/like' , payload: {
            sender: HACKER_MAN_UP,
            postHash: POST_HASH2
          },
          headers: {
            authorization: 'Bearer ' + HACKER_MAN_JWT
          }
        });

        expect(res.statusCode).to.equal(404);
      });

      it('should return 403 if wrong JWT', async () => {
        const res = await fastify.inject({method: 'POST', url: '/lookso/like' , payload: {
            sender: HACKER_MAN_UP,
            postHash: POST_HASH
          },
          headers: {
            authorization: 'Bearer ' + SERIOUS_MAN_JWT
          }
        });

        expect(res.statusCode).to.equal(403);
      });

      it('should return 409 if changes count exceed limit', async () => {
        let query = 'INSERT INTO "registry_change" VALUES (\'' + HACKER_MAN_UP + '\', \'follow\', \'' + Math.random().toString() + '\', \'\', \'' + new Date().toDateString() + '\')';
        for (let i = 0 ; i < MAX_OFFCHAIN_REGISTRY_CHANGES - 1 ; i++) query += ', (\'' + HACKER_MAN_UP + '\', \'follow\', \'' + Math.random().toString() + '\', \'\', \'' + new Date().toDateString() + '\')';
        await executeQuery(query);

        const res = await fastify.inject({method: 'POST', url: '/lookso/like' , payload: {
            sender: HACKER_MAN_UP,
            postHash: POST_HASH
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

        const res = await fastify.inject({method: 'POST', url: '/lookso/like' , payload: {
            sender: HACKER_MAN_UP,
            postHash: POST_HASH
          },
          headers: {
            authorization: 'Bearer ' + HACKER_MAN_JWT
          }
        });

        expect(res.statusCode).to.equal(200);
        expect(res.body).exist.not.null;
      });

      it('should return 200 if correct request', async () => {
        const res = await fastify.inject({method: 'POST', url: '/lookso/like' , payload: {
            sender: HACKER_MAN_UP,
            postHash: POST_HASH
          },
          headers: {
            authorization: 'Bearer ' + HACKER_MAN_JWT
          }
        });

        expect(res.statusCode).to.equal(200);
      });

      it('should properly update the database', async () => {
        await fastify.inject({method: 'POST', url: '/lookso/like' , payload: {
            sender: HACKER_MAN_UP,
            postHash: POST_HASH
          },
          headers: {
            authorization: 'Bearer ' + HACKER_MAN_JWT
          }
        });

        const res = await queryPostLike(HACKER_MAN_UP, POST_HASH);

        expect(res).to.equal(true);
      });

      it('should properly create a notification on like', async () => {
        await fastify.inject({method: 'POST', url: '/lookso/like' , payload: {
            sender: SERIOUS_MAN_UP,
            postHash: POST_HASH
          },
          headers: {
            authorization: 'Bearer ' + SERIOUS_MAN_JWT
          }
        });

        const res = await queryNotificationsOfAddress(HACKER_MAN_UP, 1, 0);

        expect(res[0].postHash).to.equal(POST_HASH);
        expect(res[0].sender).to.equal(SERIOUS_MAN_UP);
        expect(res[0].address).to.equal(HACKER_MAN_UP);
        expect(res[0].viewed).to.equal(false);
        expect(res[0].type).to.equal('like');
      });

      it('should properly create a registry change entry on like', async () => {
        await fastify.inject({method: 'POST', url: '/lookso/like' , payload: {
            sender: SERIOUS_MAN_UP,
            postHash: POST_HASH
          },
          headers: {
            authorization: 'Bearer ' + SERIOUS_MAN_JWT
          }
        });

        const res = await queryRegistryChangesOfAddress(SERIOUS_MAN_UP);

        expect(res[0].address).to.equal(SERIOUS_MAN_UP);
        expect(res[0].type).to.equal('like');
        expect(res[0].action).to.equal('add');
        expect(res[0].value).to.equal(POST_HASH);
      });

      it('should return 200 for unlike', async () => {
        await fastify.inject({method: 'POST', url: '/lookso/like' , payload: {
            sender: HACKER_MAN_UP,
            postHash: POST_HASH
          },
          headers: {
            authorization: 'Bearer ' + HACKER_MAN_JWT
          }
        });

        const res = await fastify.inject({method: 'POST', url: '/lookso/like' , payload: {
            sender: HACKER_MAN_UP,
            postHash: POST_HASH
          },
          headers: {
            authorization: 'Bearer ' + HACKER_MAN_JWT
          }
        });

        expect(res.statusCode).to.equal(200);
      });

      it('should properly update the database for unlike', async () => {
        await fastify.inject({method: 'POST', url: '/lookso/like' , payload: {
            sender: HACKER_MAN_UP,
            postHash: POST_HASH
          },
          headers: {
            authorization: 'Bearer ' + HACKER_MAN_JWT
          }
        });

        await fastify.inject({method: 'POST', url: '/lookso/like' , payload: {
            sender: HACKER_MAN_UP,
            postHash: POST_HASH
          },
          headers: {
            authorization: 'Bearer ' + HACKER_MAN_JWT
          }
        });

        const res = await queryPostLike(HACKER_MAN_UP, POST_HASH);

        expect(res).to.equal(false);
      });


      it('should properly create a registry change entry on unlike', async () => {
        await fastify.inject({method: 'POST', url: '/lookso/like' , payload: {
            sender: SERIOUS_MAN_UP,
            postHash: POST_HASH
          },
          headers: {
            authorization: 'Bearer ' + SERIOUS_MAN_JWT
          }
        });

        await executeQuery('DELETE FROM "registry_change"');

        await fastify.inject({method: 'POST', url: '/lookso/like' , payload: {
            sender: SERIOUS_MAN_UP,
            postHash: POST_HASH
          },
          headers: {
            authorization: 'Bearer ' + SERIOUS_MAN_JWT
          }
        });

        const res = await queryRegistryChangesOfAddress(SERIOUS_MAN_UP);

        expect(res[0].address).to.equal(SERIOUS_MAN_UP);
        expect(res[0].type).to.equal('like');
        expect(res[0].action).to.equal('remove');
        expect(res[0].value).to.equal(POST_HASH);
      });

    });


  });
}

