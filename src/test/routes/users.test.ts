import {fastify} from '../../lib/fastify';
import {expect} from 'chai';
import {generateJWT} from "../../bin/json-web-token";
import {clearDB} from "../helpers/clear-database";
import {describe} from "mocha";
import {User} from "../../lib/models/types/user";

describe('users routes', () => {

	const EOA1 = '0xD692Ba892a902810a2EE3fA41C1D8DcD652D47Ab';
	const EOA2 = '0x742b9DcaBE38f05CE619002029251a00F5dd0c6d';

	const UP1_EOA1 = '0x65068D4024B0D8dD98a95B560D290BdDB765a03b';
	const UP2_EOA1 = '0x36eC763516259D4bE9EDe7cC2969969f201139dd';

	const UP1_EOA2 = '0x63385D6b52530e6b514f6b44713ECf315FfBEf21';
	const UP2_EOA2 = '0xb348cfeeF05c5AB30033ffD574D60cc57dDE2927';

	let JWT_EOA1: string = generateJWT(EOA1);
	let JWT_EOA2: string = generateJWT(EOA2);


	describe('POST /users', () => {

		beforeEach(async () => {
			await clearDB();
		});

		it('should return 400 if incorrect address', async () => {
			const postRes = await fastify.inject({method: 'POST', url: '/users', payload: {
					address: '0xD692Ba892a9810a2EEA41C1D8DcD652D47Ab',
					selectedProfile: UP1_EOA1
				},
				headers: {
					authorization: 'Bearer ' + JWT_EOA1
				}
			});

			expect(postRes.statusCode).to.equal(400);
		});

		it('should return 422 if user exists', async () => {
			await fastify.inject({method: 'POST', url: '/users', payload: {
					address: EOA1,
					selectedProfile: UP1_EOA1
				},
				headers: {
					authorization: 'Bearer ' + JWT_EOA1
				}});
			const postRes = await fastify.inject({method: 'POST', url: '/users', payload: {
					address: EOA1,
					selectedProfile: UP1_EOA1
				},
				headers: {
					authorization: 'Bearer ' + JWT_EOA1
				}});

			expect(postRes.statusCode).to.equal(422);
		});

		it('should accept correctly formed body', async () => {
			const postRes = await fastify.inject({method: 'POST', url: '/users', payload: {
					address: EOA1,
					selectedProfile: UP1_EOA1
				},
				headers: {
					authorization: 'Bearer ' + JWT_EOA1
				}});

			expect(postRes.statusCode).to.equal(200);
		});

		it('should return 401 if no jwt auth', async () => {
			const postRes = await fastify.inject({method: 'POST', url: '/users', payload: {
					address: EOA1,
					selectedProfile: UP1_EOA1
				}
			});

			expect(postRes.statusCode).to.equal(401);
		});

		it('should return 403 if jwt is for another address', async () => {
			const postRes = await fastify.inject({method: 'POST', url: '/users', payload: {
					address: EOA2,
					selectedProfile: UP1_EOA1
				},
				headers: {
					authorization: 'Bearer ' + JWT_EOA1
				}
			});

			expect(postRes.statusCode).to.equal(403);
		});

		it('should return 403 if no permissions on the profile', async () => {
			const postRes = await fastify.inject({method: 'POST', url: '/users', payload: {
					address: EOA2,
					selectedProfile: UP1_EOA1
				},
				headers: {
					authorization: 'Bearer ' + JWT_EOA2
				}
			});

			expect(postRes.statusCode).to.equal(403);
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
			const postRes = await fastify.inject({method: 'GET', url: '/users/' + EOA1 + 'a'});

			expect(postRes.statusCode).to.equal(400);
		});

		it('should return 404 if user do not exist', async () => {
			const postRes = await fastify.inject({method: 'GET', url: '/users/' + EOA2});

			expect(postRes.statusCode).to.equal(404);
		});

		it('should return 200 if user exist', async () => {
			const postRes = await fastify.inject({method: 'GET', url: '/users/' + EOA1});

			expect(postRes.statusCode).to.equal(200);
		});

		it('should return selectedProfile if user exist', async () => {
			const postRes = await fastify.inject({method: 'GET', url: '/users/' + EOA1});

			const body: User = JSON.parse(postRes.body);
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
			const postRes = await fastify.inject({method: 'PUT', url: '/users/' + EOA1 + 'a', payload: {
					address: EOA1,
					selectedProfile: UP2_EOA1
				},
				headers: {
					authorization: 'Bearer ' + JWT_EOA1
				}
			});

			expect(postRes.statusCode).to.equal(400);
		});

		it('should return 400 if incorrect body address', async () => {
			const postRes = await fastify.inject({method: 'PUT', url: '/users/' + EOA1, payload: {
					address: EOA1 + 'a',
					selectedProfile: UP2_EOA1
				},
				headers: {
					authorization: 'Bearer ' + JWT_EOA1
				}
			});

			expect(postRes.statusCode).to.equal(400);
		});

		it('should return 400 if body & param address do not match', async () => {
			const postRes = await fastify.inject({method: 'PUT', url: '/users/' + EOA1, payload: {
					address: EOA2,
					selectedProfile: UP2_EOA1
				},
				headers: {
					authorization: 'Bearer ' + JWT_EOA1
				}
			});

			expect(postRes.statusCode).to.equal(400);
		});

		it('should return 404 if user do not exists', async () => {
			const postRes = await fastify.inject({method: 'PUT', url: '/users/' + EOA2, payload: {
					address: EOA2,
					selectedProfile: UP1_EOA2
				},
				headers: {
					authorization: 'Bearer ' + JWT_EOA2
				}});

			expect(postRes.statusCode).to.equal(404);
		});

		it('should return 200 when correctly formed body', async () => {
			const postRes = await fastify.inject({method: 'PUT', url: '/users/' + EOA1, payload: {
					address: EOA1,
					selectedProfile: UP2_EOA1
				},
				headers: {
					authorization: 'Bearer ' + JWT_EOA1
				}});

			expect(postRes.statusCode).to.equal(200);
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
			const postRes = await fastify.inject({method: 'PUT', url: '/users/' + EOA1, payload: {
					address: EOA1,
					selectedProfile: UP2_EOA1
				}
			});

			expect(postRes.statusCode).to.equal(401);
		});

		it('should return 403 if jwt is for another address', async () => {
			const postRes = await fastify.inject({method: 'PUT', url: '/users/' + EOA1, payload: {
					address: EOA1,
					selectedProfile: UP2_EOA1
				},
				headers: {
					authorization: 'Bearer ' + JWT_EOA2
				}
			});

			expect(postRes.statusCode).to.equal(403);
		});

		it('should return 403 if no permissions on the profile', async () => {
			const postRes = await fastify.inject({method: 'PUT', url: '/users/' + EOA1, payload: {
					address: EOA1,
					selectedProfile: UP1_EOA2
				},
				headers: {
					authorization: 'Bearer ' + JWT_EOA1
				}
			});

			expect(postRes.statusCode).to.equal(403);
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
			const postRes = await fastify.inject({method: 'POST', url: '/users/' + EOA1 + '/profiles', payload: {
					userAddress: EOA1 + 'a',
					profileAddress: UP1_EOA1,
					archived: false
				},
				headers: {
					authorization: 'Bearer ' + JWT_EOA1
				}});

			expect(postRes.statusCode).to.equal(400);
		});

		it('should return 400 if body & param address do not match', async () => {
			const postRes = await fastify.inject({method: 'POST', url: '/users/' + EOA1 + '/profiles', payload: {
					userAddress: EOA2,
					profileAddress: UP1_EOA1,
					archived: false
				},
				headers: {
					authorization: 'Bearer ' + JWT_EOA1
				}});

			expect(postRes.statusCode).to.equal(400);
		});

		it('should return 404 if user do not exists', async () => {
			const postRes = await fastify.inject({method: 'POST', url: '/users/' + EOA2 + '/profiles', payload: {
					userAddress: EOA2,
					profileAddress: UP1_EOA2,
					archived: false
				},
				headers: {
					authorization: 'Bearer ' + JWT_EOA2
				}});

			expect(postRes.statusCode).to.equal(404);
		});

		it('should return 200 if correct request', async () => {
			const postRes = await fastify.inject({method: 'POST', url: '/users/' + EOA1 + '/profiles', payload: {
					userAddress: EOA1,
					profileAddress: UP1_EOA1,
					archived: false
				},
				headers: {
					authorization: 'Bearer ' + JWT_EOA1
				}});

			expect(postRes.statusCode).to.equal(200);
		});

		it('should return 401 if no jwt auth', async () => {
			const postRes = await fastify.inject({method: 'POST', url: '/users/' + EOA1 + '/profiles', payload: {
					userAddress: EOA1,
					profileAddress: UP1_EOA1,
					archived: false
				}});

			expect(postRes.statusCode).to.equal(401);
		});

		it('should return 403 if jwt is for another address', async () => {
			const postRes = await fastify.inject({method: 'POST', url: '/users/' + EOA1 + '/profiles', payload: {
					userAddress: EOA1,
					profileAddress: UP1_EOA1,
					archived: false
				},
				headers: {
					authorization: 'Bearer ' + JWT_EOA2
				}});

			expect(postRes.statusCode).to.equal(403);
		});

		it('should return 403 if no permissions on the profile', async () => {
			const postRes = await fastify.inject({method: 'POST', url: '/users/' + EOA1 + '/profiles', payload: {
					userAddress: EOA1,
					profileAddress: UP1_EOA2,
					archived: false
				},
				headers: {
					authorization: 'Bearer ' + JWT_EOA1
				}});

			expect(postRes.statusCode).to.equal(403);
		});
	});
});


