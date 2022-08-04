import {describe} from "mocha";
import {fastify} from "../../lib/fastify";
import {generateJWT} from "../../bin/json-web-token";
import {expect} from "chai";
import {clearDB} from "../helpers/database-helper";
import {insertUserProfileRelation} from "../../bin/db/user-profile-relations.table";

export const ProfilesTest = () => {
  describe('profiles routes', () => {

    const EOA1 = '0xD692Ba892a902810a2EE3fA41C1D8DcD652D47Ab';
    const EOA2 = '0x7a1347322b9b0B635C36e15b3dE5e2Af99B1141a';

    const UP1_EOA1 = '0xB1a2B3518c30Eb82bb18Fe75456e83B692A75FFa';
    const UP2_EOA1 = '0xA5284665954a54d12737Da405824160cCE05B0B0';

    const UP1_EOA2 = '0xEb0Ef3F81d61f6eE16de26E541092824A6737dD1';

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
            authorization: 'Bearer ' + generateJWT(EOA2)
          }});
        await  insertUserProfileRelation(UP1_EOA1, EOA2, false);
      });

      it('should return 400 if incorrect address', async () => {
        const res = await fastify.inject({method: 'GET', url: '/profiles/' + UP1_EOA1 + 'a' + '/users'});

        expect(res.statusCode).to.equal(400);
      });

      it('should return 404 if profile do not exist', async () => {
        const res = await fastify.inject({method: 'GET', url: '/profiles/' + UP2_EOA1 + '/users'});
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
}