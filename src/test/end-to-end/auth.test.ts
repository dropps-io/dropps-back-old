import { describe } from 'mocha';
import { expect } from 'chai';

import { fastify } from '../../api/fastify';
import { clearDB } from '../helpers/database-helper';
import { executeQuery } from '../../lib/db/queries/database';
import { insertContract } from '../../lib/db/queries/contract.table';

export const AuthTests = () => {
  describe('auth routes', () => {
    const EOA1 = '0x1027Bea6FdAF8750bD3AA72b52C78A1E41EF5D48';
    const UP1 = '0xb09Ce58C06Bd4e7a282b8e7F6c93981B2c107D24';

    const NONCE = 63432784;
    const ISSUE_AT = '2022-10-22T16:47:21.032Z';
    const SIGNED_MESSAGE_CORRECT =
      '0xe36c58bf2ef5d33b57c0e1b2d6f32db84956a66fd04fd9fc98c0c450e5b4dfdc37a4a9ab63588edfd9f5d242022bface6d41d40005d534c9775f1d6c4d9b99a51c';
    const SIGNED_MESSAGE_WRONG =
      '0x7b38a9356b09e3fd7670f53fa6ac7669ed5d27fc932573643227a36ed9032b3749b6da952f44f75ff50f1e8c9d945e454764508c54da193013579e2b07083c291c';

    beforeEach(async () => {
      await clearDB();
      await executeQuery("INSERT INTO nonces VALUES ('" + UP1 + "', '" + NONCE + "');");
      await insertContract(UP1, 'LSP0');
    });

    describe('GET auth/:address/siwe', () => {
      it('should return 400 if incorrect address', async () => {
        const res = await fastify.inject({ method: 'GET', url: '/auth/' + UP1 + 'a/siwe' });

        expect(res.statusCode).to.equal(400);
      });

      it('should return 200 if user exist', async () => {
        const res = await fastify.inject({ method: 'GET', url: '/auth/' + UP1 + '/siwe' });

        expect(res.statusCode).to.equal(200);
      });
    });

    describe('POST auth/:address/signature', () => {
      it('should return 400 if incorrect address', async () => {
        const res = await fastify.inject({
          method: 'POST',
          url: '/auth/' + EOA1 + 'a/controller-signature',
          payload: {
            signedMessage: SIGNED_MESSAGE_CORRECT,
            issuedAt: ISSUE_AT,
          },
        });

        expect(res.statusCode).to.equal(400);
      });

      it('should return 400 if missing body', async () => {
        const res = await fastify.inject({
          method: 'POST',
          url: '/auth/' + UP1 + '/controller-signature',
        });

        expect(res.statusCode).to.equal(400);
      });

      it('should return 403 if invalid signature', async () => {
        const res = await fastify.inject({
          method: 'POST',
          url: '/auth/' + UP1 + '/controller-signature',
          payload: {
            signedMessage: SIGNED_MESSAGE_WRONG,
            issuedAt: ISSUE_AT,
          },
        });

        expect(res.statusCode).to.equal(403);
      });

      it('should return 403 if invalid issued date', async () => {
        const res = await fastify.inject({
          method: 'POST',
          url: '/auth/' + UP1 + '/controller-signature',
          payload: {
            signedMessage: SIGNED_MESSAGE_CORRECT,
            issuedAt: '2022-10-22T16:47:22.032Z',
          },
        });

        expect(res.statusCode).to.equal(403);
      });

      it('should return 200 if valid signature', async () => {
        const res = await fastify.inject({
          method: 'POST',
          url: '/auth/' + UP1 + '/controller-signature',
          payload: {
            signedMessage: SIGNED_MESSAGE_CORRECT,
            issuedAt: ISSUE_AT,
          },
        });

        expect(res.statusCode).to.equal(200);
      });

      it('should update the nonce if valid signature', async () => {
        await fastify.inject({
          method: 'POST',
          url: '/auth/' + UP1 + '/controller-signature',
          payload: {
            signedMessage: SIGNED_MESSAGE_WRONG,
            issuedAt: ISSUE_AT,
          },
        });
        const body = JSON.parse(
          (await fastify.inject({ method: 'POST', url: '/auth/' + UP1 + '/siwe' })).body,
        );
        expect(body.message).to.not.contain(NONCE);
      });
    });
  });
};
