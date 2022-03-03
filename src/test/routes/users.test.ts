import {fastify} from '../../lib/fastify';
import {expect} from 'chai';
import {generateJWT} from "../../bin/json-web-token";

describe('POST /users', () => {
	let jwt: string = '';

	before(async () => {
		jwt = generateJWT('0xD692Ba892a902810a2EE3fA41C1D8DcD652D47Ab');
	});

	it('should return 400 if incorrect address', async () => {
		const postRes = await fastify.inject({method: 'POST', url: '/users', payload: {
				address: '0xD692Ba892a9810a2EEA41C1D8DcD652D47Ab',
				selectedProfile: '0x65068D4024B0D8dD98a95B560D290BdDB765a03b'
			},
			headers: {
			 authorization: 'Bearer ' + jwt
			}
		});

		expect(postRes.statusCode).to.equal(400);
	});

	it('should accept correctly formed body', async () => {
		const postRes = await fastify.inject({method: 'POST', url: '/users', payload: {
				address: '0xD692Ba892a902810a2EE3fA41C1D8DcD652D47Ab',
				selectedProfile: '0x65068D4024B0D8dD98a95B560D290BdDB765a03b'
			},
			headers: {
				authorization: 'Bearer ' + jwt
			}});

		expect(postRes.statusCode).to.equal(200);
	});

	it('should return 422 if user exists', async () => {
		const postRes = await fastify.inject({method: 'POST', url: '/users', payload: {
				address: '0xD692Ba892a902810a2EE3fA41C1D8DcD652D47Ab',
				selectedProfile: '0x65068D4024B0D8dD98a95B560D290BdDB765a03b'
			},
			headers: {
				authorization: 'Bearer ' + jwt
			}});

		expect(postRes.statusCode).to.equal(422);
	});
});
