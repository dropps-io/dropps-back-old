import {describe} from "mocha";
import {fastify} from "../../lib/fastify";
import {generateJWT} from "../../bin/json-web-token";
import {expect} from "chai";
import {clearDB} from "../helpers/database-helper";
import {executeQuery} from "../../bin/db/database";

describe('users routes', () => {

  const EOA1 = '0xD692Ba892a902810a2EE3fA41C1D8DcD652D47Ab';
  const EOA2 = '0x742b9DcaBE38f05CE619002029251a00F5dd0c6d';

  const UP1_EOA1 = '0x65068D4024B0D8dD98a95B560D290BdDB765a03b';

  const UP1_EOA2 = '0x63385D6b52530e6b514f6b44713ECf315FfBEf21';

  let JWT_EOA1: string = generateJWT(EOA1);

  describe('GET /profiles/:profileAddress/users', () => {

    before(async () => {
      await clearDB();
      await fastify.inject({method: 'POST', url: '/users', payload: {
          address: EOA1,
          selectedProfile: UP1_EOA1
        },
        headers: {
          authorization: 'Bearer ' + generateJWT(EOA1)
        }});

      await fastify.inject({method: 'POST', url: '/users', payload: {
          address: EOA2,
          selectedProfile: UP1_EOA2
        },
        headers: {
          authorization: 'Bearer ' + generateJWT(EOA1)
        }});

      await fastify.inject({method: 'POST', url: '/users/' + EOA1 + '/profiles', payload: {
          userAddress: EOA1,
          profileAddress: UP1_EOA1,
          archived: false
        },
        headers: {
          authorization: 'Bearer ' + JWT_EOA1
        }});

      await executeQuery('INSERT INTO user_profile_relations VALUES (\'' + UP1_EOA1 +'\', \'' + EOA2 + '\', ' + false + ');');
    });

    it('should return 400 if incorrect address', async () => {
      const res = await fastify.inject({method: 'GET', url: '/profiles/' + UP1_EOA1 + 'a' + '/users'});

      expect(res.statusCode).to.equal(400);
    });

    it('should return 404 if profile do not exist', async () => {
      const res = await fastify.inject({method: 'GET', url: '/profiles/' + UP1_EOA2 + '/users'});

      expect(res.statusCode).to.equal(404);
    });

    it('should return 200 if user exist', async () => {
      const res = await fastify.inject({method: 'GET', url: '/profiles/' + UP1_EOA1 + '/users'});

      expect(res.statusCode).to.equal(200);
    });

    it('should return profiles if user exist', async () => {
      const res = await fastify.inject({method: 'GET', url: '/profiles/' + UP1_EOA1 + '/users'});

      const body: string[] = JSON.parse(res.body);
      expect(body[0].toUpperCase()).to.equal(EOA1.toUpperCase());
      expect(body[1].toUpperCase()).to.equal(EOA2.toUpperCase());
    });
  });


});
