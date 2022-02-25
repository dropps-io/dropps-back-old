import {Response} from "light-my-request";
import {fastify} from "../../lib/fastify";
import {expect} from "chai";

describe('POST /projects', () => {

  let postRes: Response;

  before(async () => {
    postRes = await fastify.inject({method: 'GET', url: '/universal-profiles'});
  });

  it('should accept correctly formed body', async () => {
    expect(postRes.statusCode).to.equal(200);
  });
});
