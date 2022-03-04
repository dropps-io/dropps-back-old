import {describe} from "mocha";
import {fastify} from "../../lib/fastify";
import {expect} from "chai";
import {clearDB} from "../helpers/database-helper";
import {executeQuery} from "../../bin/db/mysql";
import jwt from 'jsonwebtoken';
import {JWTPayload} from "../../bin/json-web-token";
import {JWT_SECRET} from "../../environment/endpoints";
import {JWT_VALIDITY_TIME} from "../../environment/config";

describe('users routes', () => {

  const EOA1 = '0xD692Ba892a902810a2EE3fA41C1D8DcD652D47Ab';

  const NONCE = 251252;
  const SIGNED_NONCE = '0xc9fb72259eaafdda7070f2ae551b3e208e228721aa93179faa5df618c75015c11200a90e9704d26b7349f2c1c5c295d9c748f00e5949ea62becceb3125dacfde1b';
  const SIGNED_WRONG_NONCE = '0xc9fb92259eaafdda7070f2ae551b3e208e228721aa93179faa5df618c75015c11200a90e9704d26b7349f2c1c5c295d9c748f00e5949ea62becceb3125dacfde1b';


  describe('GET auth/:userAddress/nonce', () => {

    before(async () => {
      await clearDB();
    });

    it('should return 400 if incorrect address', async () => {
      const res = await fastify.inject({method: 'GET', url: '/auth/' + EOA1 + 'a/nonce'});

      expect(res.statusCode).to.equal(400);
    });

    it('should return 200 if user exist', async () => {
      const res = await fastify.inject({method: 'GET', url: '/auth/' + EOA1 + '/nonce'});

      expect(res.statusCode).to.equal(200);
    });
  });

  describe('POST auth/:userAddress/signature', () => {

    beforeEach(async () => {
      await clearDB();
      await executeQuery('INSERT INTO nonces VALUES (\'' + EOA1 + '\', \'' + NONCE +'\');')
    });

    it('should return 400 if incorrect address', async () => {
      const res = await fastify.inject({method: 'POST', url: '/auth/' + EOA1 + 'a/signature', payload: {
        signedNonce: SIGNED_NONCE
        }});

      expect(res.statusCode).to.equal(400);
    });

    it('should return 400 if missing body', async () => {
      const res = await fastify.inject({method: 'POST', url: '/auth/' + EOA1 + '/signature'});

      expect(res.statusCode).to.equal(400);
    });

    it('should return 403 if invalid signature', async () => {
      const res = await fastify.inject({method: 'POST', url: '/auth/' + EOA1 + '/signature', payload: {
          signedNonce: SIGNED_WRONG_NONCE
        }});

      expect(res.statusCode).to.equal(403);
    });

    it('should return 200 if valid signature', async () => {
      const res = await fastify.inject({method: 'POST', url: '/auth/' + EOA1 + '/signature', payload: {
          signedNonce: SIGNED_NONCE
        }});

      expect(res.statusCode).to.equal(200);
    });

    it('should update the nonce if valid signature', async () => {
      await fastify.inject({method: 'POST', url: '/auth/' + EOA1 + '/signature', payload: {
          signedNonce: SIGNED_NONCE
        }});
      const body = JSON.parse((await fastify.inject({method: 'POST', url: '/auth/' + EOA1 + '/nonce'})).body)
      expect(body.nonce).to.not.equal(NONCE);
    });

    it('should return a JWT if valid signature', async () => {
      const res = await fastify.inject({method: 'POST', url: '/auth/' + EOA1 + '/signature', payload: {
          signedNonce: SIGNED_NONCE
        }});

      const body = JSON.parse(res.body);
      const token: JWTPayload = jwt.verify(body.token, JWT_SECRET) as JWTPayload;

      expect(token.address).to.equal(EOA1);
      expect(token.exp).to.equal(token.iat + JWT_VALIDITY_TIME * 60 * 60);
    });
  });

});
