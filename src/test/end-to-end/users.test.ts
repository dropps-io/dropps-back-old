import {fastify} from '../../lib/fastify';
import {expect} from 'chai';
import {generateJWT} from "../../bin/json-web-token";
import {clearDB} from "../helpers/database-helper";
import {describe} from "mocha";
import {User} from "../../models/types/user";
import {UserProfile} from "../../models/types/user-profile";

describe('users routes', () => {

	const EOA1 = '0xD692Ba892a902810a2EE3fA41C1D8DcD652D47Ab';
	const EOA2 = '0x7a1347322b9b0B635C36e15b3dE5e2Af99B1141a';

	const UP1_EOA1 = '0xB1a2B3518c30Eb82bb18Fe75456e83B692A75FFa';
	const UP2_EOA1 = '0xA5284665954a54d12737Da405824160cCE05B0B0';

	const UP1_EOA2 = '0xEb0Ef3F81d61f6eE16de26E541092824A6737dD1';

	let JWT_EOA1: string = generateJWT(EOA1);
	let JWT_EOA2: string = generateJWT(EOA2);


	describe('POST /users', () => {

		beforeEach(async () => {
			await clearDB();
		});

		it('should return 400 if incorrect address', async () => {
			const res = await fastify.inject({method: 'POST', url: '/users', payload: {
					address: '0xD692Ba892a9810a2EEA41C1D8DcD652D47Ab',
					selectedProfile: UP1_EOA1
				},
				headers: {
					authorization: 'Bearer ' + JWT_EOA1
				}
			});

			expect(res.statusCode).to.equal(400);
		});

		it('should return 422 if user exists', async () => {
			await fastify.inject({method: 'POST', url: '/users', payload: {
					address: EOA1,
					selectedProfile: UP1_EOA1
				},
				headers: {
					authorization: 'Bearer ' + JWT_EOA1
				}});
			const res = await fastify.inject({method: 'POST', url: '/users', payload: {
					address: EOA1,
					selectedProfile: UP1_EOA1
				},
				headers: {
					authorization: 'Bearer ' + JWT_EOA1
				}});

			expect(res.statusCode).to.equal(422);
		});

		it('should accept correctly formed body', async () => {
			const res = await fastify.inject({method: 'POST', url: '/users', payload: {
					address: EOA1,
					selectedProfile: UP1_EOA1
				},
				headers: {
					authorization: 'Bearer ' + JWT_EOA1
				}});

			expect(res.statusCode).to.equal(200);
		});

		it('should return 401 if no jwt auth', async () => {
			const res = await fastify.inject({method: 'POST', url: '/users', payload: {
					address: EOA1,
					selectedProfile: UP1_EOA1
				}
			});

			expect(res.statusCode).to.equal(401);
		});

		it('should return 403 if jwt is for another address', async () => {
			const res = await fastify.inject({method: 'POST', url: '/users', payload: {
					address: EOA2,
					selectedProfile: UP1_EOA1
				},
				headers: {
					authorization: 'Bearer ' + JWT_EOA1
				}
			});

			expect(res.statusCode).to.equal(403);
		});

		it('should return 403 if no permissions on the profile', async () => {
			const res = await fastify.inject({method: 'POST', url: '/users', payload: {
					address: EOA2,
					selectedProfile: UP1_EOA1
				},
				headers: {
					authorization: 'Bearer ' + JWT_EOA2
				}
			});

			expect(res.statusCode).to.equal(403);
		});
	});

	describe('GET /users/:userAddress', () => {

		before(async () => {
			await clearDB()
			await fastify.inject({method: 'POST', url: '/users', payload: {
					address: EOA1,
					selectedProfile: UP1_EOA1
				},
				headers: {
					authorization: 'Bearer ' + generateJWT(EOA1)
				}});
		});

		it('should return 400 if incorrect address', async () => {
			const res = await fastify.inject({method: 'GET', url: '/users/' + EOA1 + 'a'});

			expect(res.statusCode).to.equal(400);
		});

		it('should return 404 if user do not exist', async () => {
			const res = await fastify.inject({method: 'GET', url: '/users/' + EOA2});

			expect(res.statusCode).to.equal(404);
		});

		it('should return 200 if user exist', async () => {
			const res = await fastify.inject({method: 'GET', url: '/users/' + EOA1});

			expect(res.statusCode).to.equal(200);
		});

		it('should return selectedProfile if user exist', async () => {
			const res = await fastify.inject({method: 'GET', url: '/users/' + EOA1});
			const body: User = JSON.parse(res.body);

			expect(body.selectedProfile.toUpperCase()).to.equal(UP1_EOA1.toUpperCase());
		});
	});

	describe('PUT /users/:userAddress', () => {

		beforeEach(async () => {
			await clearDB();
			await fastify.inject({method: 'POST', url: '/users', payload: {
					address: EOA1,
					selectedProfile: UP1_EOA1
				},
				headers: {
					authorization: 'Bearer ' + JWT_EOA1
				}});
		});

		it('should return 400 if incorrect param address', async () => {
			const res = await fastify.inject({method: 'PUT', url: '/users/' + EOA1 + 'a', payload: {
					address: EOA1,
					selectedProfile: UP2_EOA1
				},
				headers: {
					authorization: 'Bearer ' + JWT_EOA1
				}
			});

			expect(res.statusCode).to.equal(400);
		});

		it('should return 400 if incorrect body address', async () => {
			const res = await fastify.inject({method: 'PUT', url: '/users/' + EOA1, payload: {
					address: EOA1 + 'a',
					selectedProfile: UP2_EOA1
				},
				headers: {
					authorization: 'Bearer ' + JWT_EOA1
				}
			});

			expect(res.statusCode).to.equal(400);
		});

		it('should return 400 if body & param address do not match', async () => {
			const res = await fastify.inject({method: 'PUT', url: '/users/' + EOA1, payload: {
					address: EOA2,
					selectedProfile: UP2_EOA1
				},
				headers: {
					authorization: 'Bearer ' + JWT_EOA1
				}
			});

			expect(res.statusCode).to.equal(400);
		});

		it('should return 404 if user do not exists', async () => {
			const res = await fastify.inject({method: 'PUT', url: '/users/' + EOA2, payload: {
					address: EOA2,
					selectedProfile: UP1_EOA2
				},
				headers: {
					authorization: 'Bearer ' + JWT_EOA2
				}});

			expect(res.statusCode).to.equal(404);
		});

		it('should return 200 when correctly formed body', async () => {
			const res = await fastify.inject({method: 'PUT', url: '/users/' + EOA1, payload: {
					address: EOA1,
					selectedProfile: UP2_EOA1
				},
				headers: {
					authorization: 'Bearer ' + JWT_EOA1
				}});

			expect(res.statusCode).to.equal(200);
		});

		it('should successfully change the selectedProfile', async () => {
			await fastify.inject({method: 'PUT', url: '/users/' + EOA1, payload: {
					address: EOA1,
					selectedProfile: UP2_EOA1
				},
				headers: {
					authorization: 'Bearer ' + JWT_EOA1
				}});

			const body: User = JSON.parse((await fastify.inject({method: 'GET', url: '/users/' + EOA1})).body);

			expect(body.selectedProfile.toUpperCase()).to.equal(UP2_EOA1.toUpperCase());
		});

		it('should return 401 if no jwt auth', async () => {
			const res = await fastify.inject({method: 'PUT', url: '/users/' + EOA1, payload: {
					address: EOA1,
					selectedProfile: UP2_EOA1
				}
			});

			expect(res.statusCode).to.equal(401);
		});

		it('should return 403 if jwt is for another address', async () => {
			const res = await fastify.inject({method: 'PUT', url: '/users/' + EOA1, payload: {
					address: EOA1,
					selectedProfile: UP2_EOA1
				},
				headers: {
					authorization: 'Bearer ' + JWT_EOA2
				}
			});

			expect(res.statusCode).to.equal(403);
		});

		it('should return 403 if no permissions on the profile', async () => {
			const res = await fastify.inject({method: 'PUT', url: '/users/' + EOA1, payload: {
					address: EOA1,
					selectedProfile: UP1_EOA2
				},
				headers: {
					authorization: 'Bearer ' + JWT_EOA1
				}
			});

			expect(res.statusCode).to.equal(403);
		});
	});

	describe('POST /users/:userAddress/profiles', () => {

		beforeEach(async () => {
			await clearDB();
			await fastify.inject({method: 'POST', url: '/users', payload: {
					address: EOA1,
					selectedProfile: UP1_EOA1
				},
				headers: {
					authorization: 'Bearer ' + JWT_EOA1
				}});
		});

		it('should return 400 if incorrect body address', async () => {
			const res = await fastify.inject({method: 'POST', url: '/users/' + EOA1 + '/profiles', payload: {
					userAddress: EOA1 + 'a',
					profileAddress: UP2_EOA1,
					archived: false
				},
				headers: {
					authorization: 'Bearer ' + JWT_EOA1
				}});

			expect(res.statusCode).to.equal(400);
		});

		it('should return 400 if body & param address do not match', async () => {
			const res = await fastify.inject({method: 'POST', url: '/users/' + EOA1 + '/profiles', payload: {
					userAddress: EOA2,
					profileAddress: UP2_EOA1,
					archived: false
				},
				headers: {
					authorization: 'Bearer ' + JWT_EOA1
				}});

			expect(res.statusCode).to.equal(400);
		});

		it('should return 404 if user do not exists', async () => {
			const res = await fastify.inject({method: 'POST', url: '/users/' + EOA2 + '/profiles', payload: {
					userAddress: EOA2,
					profileAddress: UP1_EOA2,
					archived: false
				},
				headers: {
					authorization: 'Bearer ' + JWT_EOA2
				}});

			expect(res.statusCode).to.equal(404);
		});

		it('should return 200 if correct request', async () => {
			const res = await fastify.inject({method: 'POST', url: '/users/' + EOA1 + '/profiles', payload: {
					userAddress: EOA1,
					profileAddress: UP2_EOA1,
					archived: false
				},
				headers: {
					authorization: 'Bearer ' + JWT_EOA1
				}});

			expect(res.statusCode).to.equal(200);
		});

		it('should return 401 if no jwt auth', async () => {
			const res = await fastify.inject({method: 'POST', url: '/users/' + EOA1 + '/profiles', payload: {
					userAddress: EOA1,
					profileAddress: UP2_EOA1,
					archived: false
				}});

			expect(res.statusCode).to.equal(401);
		});

		it('should return 403 if jwt is for another address', async () => {
			const res = await fastify.inject({method: 'POST', url: '/users/' + EOA1 + '/profiles', payload: {
					userAddress: EOA1,
					profileAddress: UP2_EOA1,
					archived: false
				},
				headers: {
					authorization: 'Bearer ' + JWT_EOA2
				}});

			expect(res.statusCode).to.equal(403);
		});

		it('should return 403 if no permissions on the profile', async () => {
			const res = await fastify.inject({method: 'POST', url: '/users/' + EOA1 + '/profiles', payload: {
					userAddress: EOA1,
					profileAddress: UP1_EOA2,
					archived: false
				},
				headers: {
					authorization: 'Bearer ' + JWT_EOA1
				}});

			expect(res.statusCode).to.equal(403);
		});
	});

	describe('GET /users/:userAddress/profiles', () => {

		before(async () => {
			await clearDB()
			await fastify.inject({method: 'POST', url: '/users', payload: {
					address: EOA1,
					selectedProfile: UP1_EOA1
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

			await fastify.inject({method: 'POST', url: '/users/' + EOA1 + '/profiles', payload: {
					userAddress: EOA1,
					profileAddress: UP2_EOA1,
					archived: false
				},
				headers: {
					authorization: 'Bearer ' + JWT_EOA1
				}});
		});

		it('should return 400 if incorrect address', async () => {
			const res = await fastify.inject({method: 'GET', url: '/users/' + EOA1 + 'a' + '/profiles'});

			expect(res.statusCode).to.equal(400);
		});

		it('should return 404 if user do not exist', async () => {
			const res = await fastify.inject({method: 'GET', url: '/users/' + EOA2 + '/profiles'});

			expect(res.statusCode).to.equal(404);
		});

		it('should return 200 if user exist', async () => {
			const res = await fastify.inject({method: 'GET', url: '/users/' + EOA1 + '/profiles'});

			expect(res.statusCode).to.equal(200);
		});

		it('should return profiles if user exist', async () => {
			const res = await fastify.inject({method: 'GET', url: '/users/' + EOA1 + '/profiles'});

			const body: UserProfile[] = JSON.parse(res.body);
			expect(body[0].profileAddress.toUpperCase()).to.equal(UP1_EOA1.toUpperCase());
			expect(body[1].profileAddress.toUpperCase()).to.equal(UP2_EOA1.toUpperCase());
		});
	});

	describe('PUT /users/:userAddress/profiles/:profileAddress', () => {

		beforeEach(async () => {
			await clearDB();
			await fastify.inject({method: 'POST', url: '/users', payload: {
					address: EOA1,
					selectedProfile: UP1_EOA1
				},
				headers: {
					authorization: 'Bearer ' + JWT_EOA1
				}});
			await fastify.inject({method: 'POST', url: '/users/' + EOA1 + '/profiles', payload: {
					userAddress: EOA1,
					profileAddress: UP1_EOA1,
					archived: false
				},
				headers: {
					authorization: 'Bearer ' + JWT_EOA1
				}});
		});

		it('should return 400 if incorrect param userAddress', async () => {
			const res = await fastify.inject({method: 'PUT', url: '/users/' + EOA1 + 'a/profiles/' + UP1_EOA1, payload: {
					archived: true
				},
				headers: {
					authorization: 'Bearer ' + JWT_EOA1
				}
			});

			expect(res.statusCode).to.equal(400);
		});

		it('should return 400 if incorrect param profileAddress', async () => {
			const res = await fastify.inject({method: 'PUT', url: '/users/' + EOA1 + '/profiles/' + UP1_EOA1 + 'a', payload: {
					archived: true
				},
				headers: {
					authorization: 'Bearer ' + JWT_EOA1
				}
			});

			expect(res.statusCode).to.equal(400);
		});

		it('should return 400 if missing body', async () => {
			const res = await fastify.inject({method: 'PUT', url: '/users/' + EOA1 + '/profiles/' + UP1_EOA1 + 'a',
				headers: {
					authorization: 'Bearer ' + JWT_EOA1
				}
			});

			expect(res.statusCode).to.equal(400);
		});


		it('should return 404 if user do not exists', async () => {
			const res = await fastify.inject({method: 'PUT', url: '/users/' + EOA2 + '/profiles/' + UP1_EOA2, payload: {
					archived: true
				},
				headers: {
					authorization: 'Bearer ' + JWT_EOA2
				}
			});

			expect(res.statusCode).to.equal(404);
		});

		it('should return 200 when correctly formed body', async () => {
			const res = await fastify.inject({method: 'PUT', url: '/users/' + EOA1 + '/profiles/' + UP1_EOA1, payload: {
					archived: true
				},
				headers: {
					authorization: 'Bearer ' + JWT_EOA1
				}
			});

			expect(res.statusCode).to.equal(200);
		});

		it('should successfully change the user profile relation', async () => {
			await fastify.inject({method: 'PUT', url: '/users/' + EOA1 + '/profiles/' + UP1_EOA1, payload: {
					archived: true
				},
				headers: {
					authorization: 'Bearer ' + JWT_EOA1
				}
			});

			const body: UserProfile[] = JSON.parse((await fastify.inject({method: 'GET', url: '/users/' + EOA1 + '/profiles'})).body);

			expect(body[0].archived).to.equal(true);
		});

		it('should return 401 if no jwt auth', async () => {
			const res = await fastify.inject({method: 'PUT', url: '/users/' + EOA1 + '/profiles/' + UP1_EOA1, payload: {
					archived: true
				}
			});

			expect(res.statusCode).to.equal(401);
		});

		it('should return 403 if jwt is for another address', async () => {
			const res = await fastify.inject({method: 'PUT', url: '/users/' + EOA1 + '/profiles/' + UP1_EOA1, payload: {
					archived: true
				},
				headers: {
					authorization: 'Bearer ' + JWT_EOA2
				}
			});

			expect(res.statusCode).to.equal(403);
		});
	});

	describe('DELETE /users/:userAddress/profiles/:profileAddress', () => {

		beforeEach(async () => {
			await clearDB();
			await fastify.inject({method: 'POST', url: '/users', payload: {
					address: EOA1,
					selectedProfile: UP1_EOA1
				},
				headers: {
					authorization: 'Bearer ' + JWT_EOA1
				}});
			await fastify.inject({method: 'POST', url: '/users/' + EOA1 + '/profiles', payload: {
					userAddress: EOA1,
					profileAddress: UP1_EOA1,
					archived: false
				},
				headers: {
					authorization: 'Bearer ' + JWT_EOA1
				}});
		});

		it('should return 400 if incorrect param userAddress', async () => {
			const res = await fastify.inject({method: 'DELETE', url: '/users/' + EOA1 + 'a/profiles/' + UP1_EOA1,
				headers: {
					authorization: 'Bearer ' + JWT_EOA1
				}
			});

			expect(res.statusCode).to.equal(400);
		});

		it('should return 400 if incorrect param profileAddress', async () => {
			const res = await fastify.inject({method: 'DELETE', url: '/users/' + EOA1 + '/profiles/' + UP1_EOA1 + 'a',
				headers: {
					authorization: 'Bearer ' + JWT_EOA1
				}
			});

			expect(res.statusCode).to.equal(400);
		});

		it('should return 404 if user do not exists', async () => {
			const res = await fastify.inject({method: 'DELETE', url: '/users/' + EOA2 + '/profiles/' + UP1_EOA2,
				headers: {
					authorization: 'Bearer ' + JWT_EOA2
				}
			});

			expect(res.statusCode).to.equal(404);
		});

		it('should return 200 when correctly formed body', async () => {
			const res = await fastify.inject({method: 'DELETE', url: '/users/' + EOA1 + '/profiles/' + UP1_EOA1,
				headers: {
					authorization: 'Bearer ' + JWT_EOA1
				}
			});

			expect(res.statusCode).to.equal(200);
		});

		it('should have successfully deleted the user profile relation', async () => {
			await fastify.inject({method: 'DELETE', url: '/users/' + EOA1 + '/profiles/' + UP1_EOA1,
				headers: {
					authorization: 'Bearer ' + JWT_EOA1
				}
			});

			const res = await fastify.inject({method: 'GET', url: '/users/' + EOA1 + '/profiles'});

			expect(res.statusCode).to.equal(404);
		});

		it('should return 401 if no jwt auth', async () => {
			const res = await fastify.inject({method: 'DELETE', url: '/users/' + EOA1 + '/profiles/' + UP1_EOA1});

			expect(res.statusCode).to.equal(401);
		});

		it('should return 403 if jwt is for another address', async () => {
			const res = await fastify.inject({method: 'DELETE', url: '/users/' + EOA1 + '/profiles/' + UP1_EOA1,
				headers: {
					authorization: 'Bearer ' + JWT_EOA2
				}
			});

			expect(res.statusCode).to.equal(403);
		});
	});

});


